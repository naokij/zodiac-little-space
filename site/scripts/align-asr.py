#!/usr/bin/env python3
"""
对齐 ASR 输出的（繁简混合、同音字错误）文本到故事原文的简体文本。

核心思路：拼音空间对齐。
TTS 音频清晰、发音正确，ASR 识别错误绝大多数是同音字错误（如「冰冰」->「兵兵」、
「仙子」->「先子」）。把原文和 ASR 都转成无声调拼音，在拼音空间用 difflib 对齐，
同音字错误自动消解为精确匹配，时间戳直接从 ASR 继承。

策略：
1. 用 OpenCC 将 ASR 输出从繁简混合转简体（原文已是简体）
2. 原文逐字转无声调拼音（pypinyin NORMAL）；非汉字（标点/字母/数字）保留原字符
3. ASR 逐字转无声调拼音，每个拼音带原 ASR 时间戳
4. 用 difflib.SequenceMatcher 在拼音字符串上对齐
   - equal  : 原文汉字 ← ASR 时间戳（同音字在此自动修正）
   - replace: 非同音字错误（少见），时间均分插值到各 ref 字，避免碰撞
   - delete : 原文有、ASR 没有（多为标点），标点零宽紧贴前字；漏识别汉字插值
   - insert : ASR 有、原文没有（如标题音频、ASR 多余字），自动跳过
5. 标点符号零时长（紧贴前字，不会被高亮二分查找命中）
"""
import sys
import json
import re
from difflib import SequenceMatcher
import opencc
from pypinyin import pinyin, Style

# 标点判断（与原逻辑一致）
def is_punct(c):
    return c in '，。！？、；：""''（）《》…-\n\r \t'


def to_pinyin(ch):
    """单个字符转无声调拼音；非汉字返回字符本身。返回 str（取第一读音）。"""
    r = pinyin(ch, style=Style.NORMAL)
    return r[0][0] if r and r[0] else ch


# 1. 繁简转换
cc_t2s = opencc.OpenCC('t2s')  # 繁体 -> 简体

# 2. 读取原文
md_path = sys.argv[1]
with open(md_path, 'r', encoding='utf-8') as f:
    md = f.read()

# 提取标题行（如「# 第二集：植物梦幻仙子」）和正文。
# 音频开头会朗读标题，而原正文已无标题文本。若直接对齐，正文开头的同音字
# （如正文「第二天」的「第」）会误匹配到 ASR 标题音频的「第」，导致念标题时
# 正文首字被高亮。解法：把标题行的字也纳入参考文本参与对齐，输出时再丢弃
# 标题部分对应的条目（仅保留正文）。
title_match = re.match(r'^# (.+)\n', md)
title_chars = []  # 标题行非空白、非标点字（纳入对齐，输出时丢弃）
if title_match:
    # 去掉「#」和全角冒号后的标题名，逐字取（去掉空白和冒号等分隔符）
    title_text = title_match.group(1)
    title_chars = [c for c in title_text if not c.isspace() and c not in '：:']

# 正文：去掉标题行；保留所有 --- 分隔的段落。
# 之前用 split('---')[0] 会丢掉第一个 --- 之后的所有内容，导致 ASR 对齐覆盖率不完整。
# 现在 --- 也作为段落分隔符纳入正文（ref_chars 收集所有非空白字，与 slug.astro 一致）。
# 同步去掉 markdown 加粗 **...** 标记，避免对齐出裸 * 字符。
body_text = re.sub(r'^# .+\n', '', md)
body_text = re.sub(r'\n---\n', '\n\n', body_text)
body_text = re.sub(r'\*\*', '', body_text)
body_chars = [c for c in body_text if not c.isspace()]

# 参考文本 = 标题字 + 正文字（标题在前，参与对齐；输出时按 title_len 截断丢弃）
ref_chars = title_chars + body_chars
title_len = len(title_chars)  # 标题部分字数，用于输出时丢弃

# 3. 读取 ASR 并转拼音（每个拼音带时间戳）
asr_path = sys.argv[2]
with open(asr_path, 'r', encoding='utf-8') as f:
    asr_words = json.load(f)
asr_chars = []  # [{py, start, end}]
for w in asr_words:
    text_s = cc_t2s.convert(w['text'])  # 繁->简
    for c in text_s:
        if c.isspace():
            continue
        asr_chars.append({'py': to_pinyin(c), 'start': w['start'], 'end': w['end']})

# 4. 拼音音节列表对齐（直接在 list 上跑 SequenceMatcher，避免 join 成字符串后
#    索引与字符数组错位）
ref_py = [to_pinyin(c) for c in ref_chars]
asr_py = [a['py'] for a in asr_chars]

sm = SequenceMatcher(None, ref_py, asr_py, autojunk=False)


def spread_times(t_start, t_end, n):
    """把 [t_start, t_end] 均分成 n 个不重叠的连续切片，返回 [(s_k, e_k), ...]。
    n<=0 返回空；n==1 返回整体。保证 s_0=t_start, e_{n-1}=t_end，内部不重叠。"""
    if n <= 0:
        return []
    if n == 1:
        return [(t_start, t_end)]
    step = (t_end - t_start) / n
    out = []
    for k in range(n):
        s = t_start + step * k
        e = t_start + step * (k + 1) if k < n - 1 else t_end
        out.append((s, e))
    return out


# 5. 输出：按 ref 顺序生成 {char, start, end}（标题部分带 _title 标记，输出时丢弃）
result = []


def emit(ref_pos, char, start, end):
    """追加一条对齐结果，标记是否属于标题部分（ref_pos < title_len）。"""
    result.append({'char': char, 'start': start, 'end': end,
                   '_title': ref_pos < title_len})


for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == 'equal':
        # ref[i1:i2] 与 asr[j1:j2] 拼音完全匹配 -> 直接继承 ASR 时间戳。
        # 注：ASR 词 token 可能覆盖多个字（如「爸爸」一个 token 给同一时间戳），
        # 1:1 复制会让多字共享同一窗口。此问题在下方 split_shared_times 后处理中统一修复。
        for k in range(i2 - i1):
            asr_pos = j1 + k
            if asr_pos < len(asr_chars):
                emit(i1 + k, ref_chars[i1 + k],
                     asr_chars[asr_pos]['start'], asr_chars[asr_pos]['end'])
    elif tag == 'replace':
        # 非同音字错误：把 ASR 段时间均分到各 ref 字
        if j2 > j1 and j1 < len(asr_chars):
            t_start = asr_chars[j1]['start']
            t_end = asr_chars[min(j2 - 1, len(asr_chars) - 1)]['end']
        else:
            t_start = result[-1]['end'] if result else 0
            t_end = t_start
        slots = spread_times(t_start, t_end, i2 - i1)
        for k in range(i2 - i1):
            s, e = slots[k]
            ch = ref_chars[i1 + k]
            if is_punct(ch):
                # 标点零宽紧贴前字
                pe = result[-1]['end'] if result else s
                emit(i1 + k, ch, pe, pe)
            else:
                emit(i1 + k, ch, s, e)
    elif tag == 'delete':
        # 原文有、ASR 没有：标点零宽；漏识别汉字用前后时间戳插值
        prev_end = result[-1]['end'] if result else 0
        next_start = asr_chars[j1]['start'] if j1 < len(asr_chars) else prev_end
        non_punct_idx = [k for k in range(i2 - i1) if not is_punct(ref_chars[i1 + k])]
        slots = spread_times(prev_end, next_start, len(non_punct_idx))
        slot_iter = iter(slots)
        for k in range(i2 - i1):
            ch = ref_chars[i1 + k]
            if is_punct(ch):
                emit(i1 + k, ch, prev_end, prev_end)
            else:
                s, e = next(slot_iter, (prev_end, next_start))
                emit(i1 + k, ch, s, e)
    elif tag == 'insert':
        # ASR 有、原文没有（标题音频、ASR 多余字）：跳过
        pass

# 6. 后处理：拆分共享同一 (start,end) 的连续字。
# ASR 词 token（如「爸爸」）展开后多字共享同一时间窗口，会导致高亮在窗口内同时命中
# 多个字（与「冰冰」bug 同类）。这里把同一窗口均分到各非标点字，标点保持零宽紧贴。
def split_shared_times(entries):
    out = []
    i = 0
    while i < len(entries):
        cur = entries[i]
        # 收集共享同一 (start,end) 且非零宽的连续条目
        if cur['start'] == cur['end']:
            out.append(cur)
            i += 1
            continue
        j = i + 1
        while (j < len(entries)
               and entries[j]['start'] == cur['start']
               and entries[j]['end'] == cur['end']):
            j += 1
        group = entries[i:j]
        non_punct = [e for e in group if not is_punct(e['char'])]
        if len(non_punct) <= 1:
            out.extend(group)
        else:
            slots = spread_times(cur['start'], cur['end'], len(non_punct))
            si = 0
            for e in group:
                if is_punct(e['char']):
                    pe = out[-1]['end'] if out else e['start']
                    out.append({'char': e['char'], 'start': pe, 'end': pe,
                                '_title': e.get('_title', False)})
                else:
                    s, en = slots[si]; si += 1
                    out.append({'char': e['char'], 'start': s, 'end': en,
                                '_title': e.get('_title', False)})
        i = j
    return out

result = split_shared_times(result)

# 7. 后处理：保证汉字最小可高亮窗口。
# whisper 给某些字的时间戳极短（如 0.02s）甚至零宽，rAF 每帧 ~16ms 会跳过这些窗口，
# 导致该字永远不被高亮。这里给 span < MIN_SPAN 的汉字从相邻汉字借时间，保证至少
# MIN_SPAN 秒的可高亮窗口。先从后邻借，不够再从前邻借；借出方仍 >= MIN_SPAN。
MIN_SPAN = 0.1  # 汉字最小可高亮窗口（秒）

def ensure_min_span(entries):
    for i, e in enumerate(entries):
        if is_punct(e['char']) or not is_hanzi_char(e['char']):
            continue
        span = e['end'] - e['start']
        if span >= MIN_SPAN:
            continue
        need = MIN_SPAN - span
        # 先从后邻汉字借（跳过中间的标点找下一个汉字）
        borrowed = 0
        nxt = None
        for j in range(i + 1, len(entries)):
            if is_hanzi_char(entries[j]['char']):
                nxt = entries[j]
                break
        if nxt is not None:
            nxt_span = nxt['end'] - nxt['start']
            can_lend = nxt_span - MIN_SPAN
            if can_lend > 0:
                b = min(need, can_lend)
                e['end'] = e['end'] + b
                nxt['start'] = nxt['start'] + b
                borrowed += b
                need = MIN_SPAN - (e['end'] - e['start'])
        # 不够再从前邻汉字借
        if need > 0:
            prv = None
            for j in range(i - 1, -1, -1):
                if is_hanzi_char(entries[j]['char']):
                    prv = entries[j]
                    break
            if prv is not None:
                prv_span = prv['end'] - prv['start']
                can_lend = prv_span - MIN_SPAN
                if can_lend > 0:
                    b = min(need, can_lend)
                    e['start'] = e['start'] - b
                    prv['end'] = prv['end'] - b
    return entries


def is_hanzi_char(c):
    return '\u4e00' <= c <= '\u9fff'


result = ensure_min_span(result)

# 8. 输出：丢弃标题部分（_title=True），仅保留正文；compact JSON
out = [r for r in result if r['char'].strip() and not r.get('_title')]
with open(sys.argv[3], 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, separators=(',', ':'))

# 报告（覆盖率按正文字数计算）
print(f"正文 chars: {len(body_chars)}, 对齐输出: {len(out)}")
print(f"覆盖率: {len(out) / max(len(body_chars), 1) * 100:.1f}%")
print(f"前 50 字: {''.join(r['char'] for r in out[:50])}")
print(f"前 5 条时间戳:")
for r in out[:5]:
    print(f"  {r['char']!r} {r['start']:.2f}-{r['end']:.2f}")
