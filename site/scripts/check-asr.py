#!/usr/bin/env python3
"""
校验 ASR aligned JSON 的时间戳质量，检测会导致高亮异常的数据问题。

高亮播放器（[slug].astro 的 findWordIdx）在汉字 span 上做二分查找：
  start <= t < end  -> 命中该字
所有可见的高亮 bug 都源于时间戳数据异常，可静态检测，无需播放音频。

校验规则（仅对汉字检查；标点/字母/数字不参与高亮）：

  严重（ERROR，会导致明显跳字/卡死，对齐脚本可修）：
    DUP_COLLISION   多字共享同一 (start,end) 且非零宽 -> 同时高亮多字/跳字
    EARLY_START     首个汉字 start < 1.0s -> 标题音频误挂，念标题时正文就亮
    HUGE_SPAN       单字跨度 > 3.0s -> 该字长时间高亮卡住（正常 0.1-0.5s）

  轻微（WARN，源自 ASR 固有缺陷，对齐脚本无法修，供参考）：
    TIME_REVERSE    汉字 start 倒退（< 前字 end - 0.05）-> 可能短促跳字
    ZERO_SPAN_HANZI 汉字零宽（end <= start）-> 该字永远不亮（漏字）

用法：
  python3 scripts/check-asr.py                    # 扫描 data/asr/*.aligned.json
  python3 scripts/check-asr.py path/to/file.json  # 校验指定文件
退出码：有 ERROR 返回 1，仅 WARN 返回 2，全 OK 返回 0。
"""
import sys
import json
import glob
import os
from collections import Counter, defaultdict

# 汉字范围（与 [slug].astro 的 .w span 判定一致：U+4E00..U+9FFF）
def is_hanzi(c):
    return '\u4e00' <= c <= '\u9fff'

# 阈值
EARLY_START_THRESHOLD = 1.0    # 首字起始 < 1.0s 视为标题误挂
TIME_REVERSE_TOLERANCE = 0.05  # 浮点误差容差（秒）；超过此值才报 TIME_REVERSE
HUGE_SPAN_THRESHOLD = 3.0      # 单字跨度 > 3.0s 视为异常


def check(data):
    """校验一条 aligned JSON 数组，返回 (errors, warnings) 两个列表。
    每条 = (rule, idx, char, start, end, detail)"""
    errors = []
    warnings = []

    # 仅保留汉字条目及其在原数组中的索引（模拟播放器的 wordEls）
    hanzi = [(i, w) for i, w in enumerate(data) if is_hanzi(w.get('char', ''))]

    # --- ERROR: DUP_COLLISION - 多字共享同一 (start,end) 且非零宽 ---
    by_time = defaultdict(list)  # (start,end) -> [(idx,char)]
    for idx, w in hanzi:
        s, e = w['start'], w['end']
        if e - s > TIME_REVERSE_TOLERANCE:  # 非零宽
            by_time[(s, e)].append((idx, w['char']))
    for (s, e), items in by_time.items():
        if len(items) > 1:
            for idx, ch in items:
                errors.append(('DUP_COLLISION', idx, ch, s, e,
                               f'与 {len(items)-1} 字共享 {s:.2f}-{e:.2f}s'))

    # --- ERROR: EARLY_START - 首个汉字 start 过小 ---
    if hanzi:
        first_idx, first = hanzi[0]
        if first['start'] < EARLY_START_THRESHOLD:
            errors.append(('EARLY_START', first_idx, first['char'],
                           first['start'], first['end'],
                           f'首字起始 {first["start"]:.2f}s < {EARLY_START_THRESHOLD}s，疑似标题音频误挂'))

    # 逐字检查（在汉字序列上）
    prev_end = None
    for idx, w in hanzi:
        s, e, ch = w['start'], w['end'], w['char']

        # --- ERROR: HUGE_SPAN ---
        if e - s > HUGE_SPAN_THRESHOLD:
            errors.append(('HUGE_SPAN', idx, ch, s, e, f'跨度 {e-s:.2f}s > {HUGE_SPAN_THRESHOLD}s'))

        # --- WARN: ZERO_SPAN_HANZI ---
        if e - s <= TIME_REVERSE_TOLERANCE:
            warnings.append(('ZERO_SPAN_HANZI', idx, ch, s, e, '汉字零宽，该字不会被高亮'))

        # --- WARN: TIME_REVERSE ---
        if prev_end is not None and s < prev_end - TIME_REVERSE_TOLERANCE:
            warnings.append(('TIME_REVERSE', idx, ch, s, e,
                             f'start {s:.2f}s < 前字 end {prev_end:.2f}s（倒退 {prev_end-s:.2f}s）'))
        prev_end = e

    errors.sort(key=lambda x: (x[1], x[0]))
    warnings.sort(key=lambda x: (x[1], x[0]))
    return errors, warnings


def main():
    # 解析参数：无参数则扫描 data/asr/*.aligned.json
    if len(sys.argv) > 1:
        files = sys.argv[1:]
    else:
        asr_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'asr')
        files = sorted(glob.glob(os.path.join(asr_dir, '*.aligned.json')))

    if not files:
        print('没有找到 aligned JSON 文件')
        return 1

    total_errors = 0
    total_warnings = 0
    for path in files:
        name = os.path.basename(path)
        # 提取 EP 编号用于排序和显示
        ep_num = ''
        for ch in name:
            if ch.isdigit():
                ep_num += ch
            elif ep_num:
                break
        ep_label = f'EP{ep_num}' if ep_num else name

        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            print(f'{ep_label}: ❌ 读取失败 - {e}')
            total_errors += 1
            continue

        errors, warnings = check(data)
        total_errors += len(errors)
        total_warnings += len(warnings)

        if not errors and not warnings:
            print(f'{ep_label}: ✓ OK ({len(data)} 字)')
        else:
            parts = []
            if errors:
                by_rule = Counter(e[0] for e in errors)
                parts.append(f'{len(errors)} ERROR ({", ".join(f"{r}:{n}" for r,n in sorted(by_rule.items()))})')
            if warnings:
                by_rule = Counter(w[0] for w in warnings)
                parts.append(f'{len(warnings)} WARN ({", ".join(f"{r}:{n}" for r,n in sorted(by_rule.items()))})')
            symbol = '✗' if errors else '⚠'
            print(f'{ep_label}: {symbol} {"  ".join(parts)}')

            # ERROR 全部显示（严重问题不能漏）
            for rule, idx, ch, s, e, detail in errors:
                print(f'    [ERROR/{rule}] #{idx} {ch!r} {s:.2f}-{e:.2f}s  {detail}')
            # WARN 每集最多显示 5 条（轻微问题，多了淹没重点）
            for rule, idx, ch, s, e, detail in warnings[:5]:
                print(f'    [WARN/{rule}]  #{idx} {ch!r} {s:.2f}-{e:.2f}s  {detail}')
            if len(warnings) > 5:
                print(f'    ... 还有 {len(warnings)-5} 条 WARN')

    print()
    if total_errors == 0 and total_warnings == 0:
        print('✓ 全部通过')
        return 0
    elif total_errors == 0:
        print(f'⚠ 无严重问题，{total_warnings} 个轻微问题（源自 ASR 固有缺陷，仅供参考）')
        return 2
    else:
        print(f'✗ {total_errors} 个严重问题，{total_warnings} 个轻微问题')
        return 1


if __name__ == '__main__':
    sys.exit(main())
