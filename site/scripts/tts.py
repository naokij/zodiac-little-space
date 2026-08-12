#!/usr/bin/env python3
"""
TTS 配音 + 字级时间戳一步到位(MiniMax t2a_v2, subtitle_type=word)。

替代旧流程 mmx speech synthesize + asr.sh(whisper) + align-asr.py:
- 音频:API 返回 hex,解码存 audio/{slug}.mp3(128k,build-durations.mjs 可正确估算)
- 时间戳:API 的 timestamped_words 给出每个字在原文的偏移(word_begin/word_end)
  和时间窗(time_begin/time_end,毫秒),直接生成 site/data/asr/{slug}.aligned.json,
  输出格式与 align-asr.py 完全一致(标点零宽紧贴前字、标题字输出时丢弃、
  汉字最小高亮窗口 0.1s)
- 验收:单字时长 > MAX_CHAR_SEC 自动报警(TTS 拖尾/卡壳故障的直接信号)

用法:
  python3 site/scripts/tts.py stories/N-标题.md
  python3 site/scripts/tts.py stories/N-标题.md --out-audio /tmp/t.mp3 --out-aligned /tmp/t.json  # 测试
  默认输出已存在时需 --force 才覆盖(防误覆盖已验收的配音)

API key 读 ~/.mmx/config.json(与 mmx CLI 共用)。
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.request
from difflib import SequenceMatcher

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
API_URL = 'https://api.minimaxi.com/v1/t2a_v2'
VOICE = 'qiaopi_mengmei'
MAX_CHAR_SEC = 3.0   # 单字时长超过此值报警(正常 <1s,拖长音 ~0.8s)
MIN_SPAN = 0.1       # 汉字最小可高亮窗口(秒),与 align-asr.py 一致

# 与 align-asr.py 完全一致的标点表(注意:不含破折号 ——,破折号保留真实时间窗)
IS_PUNCT = set('，。！？、；：""''（）《》…-\n\r \t')


def is_hanzi(c):
    return '\u4e00' <= c <= '\u9fff'


def extract_ref(md):
    """从故事 md 提取参考字序列,返回 (chars, title_len)。
    前 title_len 个是标题字(参与对齐,输出丢弃)。
    规则与 align-asr.py 一致:标题行去 '#'/空白/冒号;正文去标题行、
    \\n---\\n 视为段落分隔(整段删除)、去 ** 标记、去空白。"""
    chars = []
    m = re.match(r'^# (.+)\n', md)
    body = md
    if m:
        chars.extend(c for c in m.group(1) if not c.isspace() and c not in '：:')
        body = md[m.end():]
    title_len = len(chars)
    body = re.sub(r'\n---\n', '\n\n', body)
    body = re.sub(r'\*\*', '', body)
    chars.extend(c for c in body if not c.isspace())
    return chars, title_len


def call_tts(text):
    """调 t2a_v2,返回 (audio_bytes, subtitle_segments)。失败重试一次。"""
    key = json.load(open(os.path.expanduser('~/.mmx/config.json')))['api_key']
    body = {
        'model': 'speech-2.8-hd',
        'text': text,
        'stream': False,
        'voice_setting': {'voice_id': VOICE, 'speed': 1, 'vol': 1, 'pitch': 1},
        'audio_setting': {'sample_rate': 32000, 'bitrate': 128000,
                          'format': 'mp3', 'channel': 1},
        'subtitle_enable': True,
        'subtitle_type': 'word',
    }
    data = json.dumps(body).encode()
    last_err = None
    for attempt in (1, 2):
        try:
            req = urllib.request.Request(
                API_URL, data=data,
                headers={'Authorization': f'Bearer {key}',
                         'Content-Type': 'application/json'})
            resp = json.load(urllib.request.urlopen(req, timeout=300))
            if resp.get('base_resp', {}).get('status_code') != 0:
                raise RuntimeError(f"API 错误: {resp.get('base_resp')}")
            audio_hex = resp['data']['audio']
            sub_url = resp['data'].get('subtitle_file')
            if not sub_url:
                raise RuntimeError('API 未返回 subtitle_file')
            subs = json.load(urllib.request.urlopen(sub_url, timeout=60))
            return bytes.fromhex(audio_hex), subs
        except Exception as e:  # noqa: BLE001
            last_err = e
            print(f'  第 {attempt} 次调用失败: {e}', file=sys.stderr)
            if attempt == 1:
                time.sleep(3)
    raise RuntimeError(f'TTS 调用失败: {last_err}')


def build_aligned(ref_chars, title_len, subs):
    """timestamped_words -> aligned.json 条目(格式同 align-asr.py 输出)。
    API 的 word_begin/word_end 是相对其内部归一化文本的,与原始 md 对不上,
    所以不用偏移:把 API 词序列逐字展开后与 ref 做 difflib 字符对齐——
    两边是同一份文本(API 只丢字符不会改字),equal 块即精确匹配。
    实测唯一差异:每个 —— 对被 API 丢掉一个 —(delete,零宽)。"""
    api_chars = []  # [(char, start, end)] 秒
    for seg in subs:
        for w in seg.get('timestamped_words', []):
            word = w['word']
            s, t = w['time_begin'] / 1000, w['time_end'] / 1000
            n = max(len(word), 1)
            step = (t - s) / n
            for k, c in enumerate(word):
                api_chars.append((c, s + step * k, s + step * (k + 1)))

    sm = SequenceMatcher(None, ref_chars, [c for c, _, _ in api_chars],
                         autojunk=False)
    result = []
    prev_end = 0.0
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal':
            for k in range(i2 - i1):
                ch = ref_chars[i1 + k]
                if ch in IS_PUNCT:
                    result.append({'char': ch, 'start': prev_end, 'end': prev_end,
                                   '_title': i1 + k < title_len})
                else:
                    s, t = api_chars[j1 + k][1], api_chars[j1 + k][2]
                    result.append({'char': ch, 'start': s, 'end': t,
                                   '_title': i1 + k < title_len})
                    prev_end = t
        elif tag == 'delete':
            # ref 有、API 没有(—— 被丢的那个 —):零宽紧贴前字
            for k in range(i2 - i1):
                result.append({'char': ref_chars[i1 + k], 'start': prev_end,
                               'end': prev_end, '_title': i1 + k < title_len})
        elif tag == 'insert':
            pass  # API 有、ref 没有:跳过
        else:  # replace: 理论上不该出现(同一份文本),兜底零宽并告警
            print(f'⚠️  非预期 replace 块: {ref_chars[i1:i2]!r}', file=sys.stderr)
            for k in range(i2 - i1):
                result.append({'char': ref_chars[i1 + k], 'start': prev_end,
                               'end': prev_end, '_title': i1 + k < title_len})
    return result


def refine_starts(entries, audio_path):
    """用音频能量包络把每个汉字的时间窗起点吸附到真实发声点。
    API 字级时间窗是连续无缝的,停顿会被算进后一个字的开头
    (段落停顿处高亮会抢跑,实测最多 ~1s)。这里对每个汉字,在它窗口内
    找第一个能量超过本底阈值的时刻作为新起点,并把前一个字/标点串的
    终点同步推到该时刻(停顿时保持前一个字高亮,不抢跑)。找不到
    有效起点(轻音字)就保持原窗口。"""
    import subprocess
    import numpy as np

    raw = subprocess.run(
        ['ffmpeg', '-v', 'error', '-i', audio_path,
         '-ac', '1', '-ar', '8000', '-f', 's16le', '-'],
        capture_output=True, check=True).stdout
    pcm = np.frombuffer(raw, dtype=np.int16).astype(np.float64) / 32768
    hop = int(0.02 * 8000)  # 20ms 帧
    n_frames = len(pcm) // hop
    if n_frames == 0:
        return entries
    rms = np.sqrt(np.convolve(pcm ** 2, np.ones(hop) / hop, 'same'))[::hop][:n_frames]
    floor = float(np.percentile(rms, 10))
    thr = max(floor * 4, 0.004)

    def onset_in(t0, t1):
        i0, i1 = int(t0 / 0.02), min(int(t1 / 0.02), n_frames - 1)
        if i1 <= i0:
            return None
        seg = rms[i0:i1]
        hit = int(np.argmax(seg > thr))
        return (i0 + hit) * 0.02 if seg[hit] > thr else None

    refined = 0
    for i, e in enumerate(entries):
        if not is_hanzi(e['char']) or e['start'] == e['end']:
            continue
        on = onset_in(e['start'], e['end'])
        if on is None or on <= e['start'] + 0.06:
            continue
        old_start = e['start']
        e['start'] = on
        # 把紧贴旧起点的连续尾部(前字终点 + 零宽标点串)一并推到新起点
        j = i - 1
        while j >= 0 and abs(entries[j]['end'] - old_start) < 1e-9:
            entries[j]['end'] = on
            if entries[j]['start'] == old_start:
                entries[j]['start'] = on  # 零宽标点保持零宽
            j -= 1
        refined += 1
    print(f'  能量吸附修正: {refined} 字')
    return entries


def ensure_min_span(entries):
    """汉字保证至少 MIN_SPAN 秒可高亮窗口(逻辑同 align-asr.py:先向后再向前借)。"""
    for i, e in enumerate(entries):
        if e['char'] in IS_PUNCT or not is_hanzi(e['char']):
            continue
        span = e['end'] - e['start']
        if span >= MIN_SPAN:
            continue
        need = MIN_SPAN - span
        nxt = next((entries[j] for j in range(i + 1, len(entries))
                    if is_hanzi(entries[j]['char'])), None)
        if nxt is not None:
            can = nxt['end'] - nxt['start'] - MIN_SPAN
            if can > 0:
                b = min(need, can)
                e['end'] += b
                nxt['start'] += b
                need = MIN_SPAN - (e['end'] - e['start'])
        if need > 0:
            prv = next((entries[j] for j in range(i - 1, -1, -1)
                        if is_hanzi(entries[j]['char'])), None)
            if prv is not None:
                can = prv['end'] - prv['start'] - MIN_SPAN
                if can > 0:
                    b = min(need, can)
                    e['start'] -= b
                    prv['end'] -= b
    return entries


def main():
    ap = argparse.ArgumentParser(description='TTS 配音 + 字级时间戳一步到位')
    ap.add_argument('story', help='stories/N-标题.md')
    ap.add_argument('--out-audio', help='默认 audio/{slug}.mp3')
    ap.add_argument('--out-aligned', help='默认 site/data/asr/{slug}.aligned.json')
    ap.add_argument('--force', action='store_true', help='允许覆盖已存在的输出')
    ap.add_argument('--save-subs', help='保存 API 原始字幕 json(调试用)')
    ap.add_argument('--load-subs', help='跳过合成,用已存字幕 json 重算对齐'
                    '(需配合 --out-audio 指向对应音频做能量吸附)')
    args = ap.parse_args()

    slug = os.path.splitext(os.path.basename(args.story))[0]
    out_audio = args.out_audio or os.path.join(ROOT, 'audio', f'{slug}.mp3')
    out_aligned = args.out_aligned or os.path.join(
        ROOT, 'site', 'data', 'asr', f'{slug}.aligned.json')
    for p in ([out_aligned] + ([] if args.load_subs else [out_audio])):
        if os.path.exists(p) and not args.force:
            sys.exit(f'❌ 已存在: {p}(用 --force 覆盖)')

    md = open(args.story, encoding='utf-8').read()
    ref_chars, title_len = extract_ref(md)
    print(f'▶ 参考字: {len(ref_chars) - title_len} 正文 + {title_len} 标题')

    tmp_audio = None
    if args.load_subs:
        subs = json.load(open(args.load_subs, encoding='utf-8'))
        audio = None
        refine_audio = out_audio  # --out-audio 指向该字幕对应的音频
        print(f'▶ 跳过合成,用 {args.load_subs} 重算对齐')
    else:
        print('▶ TTS 合成中(speech-2.8-hd, subtitle_type=word)...')
        audio, subs = call_tts(md)
        if args.save_subs:
            json.dump(subs, open(args.save_subs, 'w', encoding='utf-8'),
                      ensure_ascii=False)
        # 音频还没写盘,先写临时文件供能量吸附读取
        import tempfile
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tf:
            tf.write(audio)
            tmp_audio = tf.name
        refine_audio = tmp_audio

    result = build_aligned(ref_chars, title_len, subs)
    if os.path.exists(refine_audio):
        result = refine_starts(result, refine_audio)
    else:
        print(f'⚠️  找不到音频 {refine_audio},跳过能量吸附')
    if tmp_audio:
        os.unlink(tmp_audio)
    result = ensure_min_span(result)
    out = [r for r in result if r['char'].strip() and not r.get('_title')]

    # 验收:单字时长异常 = TTS 拖尾/卡壳信号
    long_chars = [(r['char'], round(r['end'] - r['start'], 2))
                  for r in out if r['end'] - r['start'] > MAX_CHAR_SEC]
    n_missing = sum(1 for r in out
                    if is_hanzi(r['char']) and r['start'] == r['end'])

    os.makedirs(os.path.dirname(out_aligned), exist_ok=True)
    if audio is not None:
        os.makedirs(os.path.dirname(out_audio), exist_ok=True)
        open(out_audio, 'wb').write(audio)
        print(f'✅ 音频: {out_audio}({len(audio) / 1024:.0f} KB)')
    with open(out_aligned, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))

    print(f'✅ 对齐: {out_aligned}({len(out)} 字)')
    if long_chars:
        print(f'⚠️  {len(long_chars)} 字时长 > {MAX_CHAR_SEC}s(可疑拖尾/卡壳):')
        for ch, d in long_chars[:20]:
            print(f'    {ch!r} {d}s')
        print('   请试听确认;若确有故障,考虑重跑或按 AGENTS.md 补录拼接')
    else:
        print(f'✅ 无单字时长 > {MAX_CHAR_SEC}s')
    if n_missing:
        print(f'⚠️  {n_missing} 个汉字未分配到时间戳(API 跳过),请试听确认')


if __name__ == '__main__':
    main()
