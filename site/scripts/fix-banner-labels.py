#!/usr/bin/env python3
"""修正 十二星座小太空首页banner.jpg 上 AI 生图写错的角色名牌。

策略:不重绘整个胶囊(会盖住上面角色搭下来的裙摆/蟹腿),
而是把胶囊中央的旧文字区域用胶囊底色抹掉,再用布丁体写上正确名字。
胶囊 bbox 为人工放大原图逐个量得(原图 6368x2592)。

原始图备份在 ~/Downloads/十二星座小太空/十二星座小太空首页banner.jpg
用法: python3 site/scripts/fix-banner-labels.py
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import statistics

IMG = 'assets/banners/十二星座小太空首页banner.jpg'
FONT = '/Users/jiangle/Library/Fonts/字魂布丁体.ttf'

# (正确文字, 胶囊 bbox x0,y0,x1,y1) —— 人工量测
LABELS = [
    ('白羊座', (950, 875, 1310, 987)),
    ('双子座', (2455, 858, 2848, 1002)),
    ('巨蟹座', (3210, 868, 3582, 992)),
    ('天秤座', (2475, 1593, 2847, 1707)),
    ('天蝎座', (3213, 1588, 3577, 1707)),
    ('水瓶座', (2473, 2318, 2842, 2432)),
    ('双鱼座', (3198, 2318, 3567, 2432)),
]

FG = (122, 73, 47)  # 与图上正确名牌统一的金棕色


def sample_bg(img, bbox):
    """取胶囊左右两侧内部(避开文字)的中位色,取较亮的作为底色。"""
    x0, y0, x1, y1 = bbox
    w, h = x1 - x0, y1 - y0
    px = img.convert('RGB').load()
    bands = []
    for xa, xb in ((0.04, 0.12), (0.88, 0.96)):
        pts = []
        for y in range(y0 + int(h * 0.3), y0 + int(h * 0.7), 2):
            for x in range(x0 + int(w * xa), x0 + int(w * xb), 2):
                pts.append(px[x, y])
        bands.append(tuple(int(statistics.median(c[i] for c in pts)) for i in range(3)))
    return max(bands, key=sum)


def fix_label(img, bbox, text):
    x0, y0, x1, y1 = bbox
    w, h = x1 - x0, y1 - y0
    bg = sample_bg(img, bbox)
    d = ImageDraw.Draw(img)

    # 抹掉旧文字:羽化边缘的填充层,只覆盖胶囊中央区域。
    # 逐行取样胶囊左缘内部颜色,保留纵向光影渐变;alpha 羽化消除接缝。
    ex0, ex1 = x0 + int(w * 0.12), x1 - int(w * 0.12)
    ey0, ey1 = y0 + int(h * 0.12), y0 + int(h * 0.80)
    px = img.convert('RGB').load()
    sx0, sx1 = x0 + int(w * 0.05), x0 + int(w * 0.11)
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for y in range(ey0, ey1):
        row = [px[x, y] for x in range(sx0, sx1, 2)]
        color = tuple(int(statistics.median(c[i] for c in row)) for i in range(3))
        od.line([(ex0, y), (ex1, y)], fill=color + (255,))
    mask = overlay.split()[3].filter(ImageFilter.GaussianBlur(6))
    img.paste(overlay, (0, 0), mask)

    # 写新文字:宽度对齐旧文字的视觉占比,按字形 bbox 精确居中
    size = int(h * 0.62)
    while size > 10:
        font = ImageFont.truetype(FONT, size)
        tb = d.textbbox((0, 0), text, font=font)
        tw, th = tb[2] - tb[0], tb[3] - tb[1]
        if tw <= w * 0.62 and th <= h * 0.58:
            break
        size -= 2
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    d.text((cx - tw / 2 - tb[0], cy - th / 2 - tb[1]), text, font=font, fill=FG)
    return bg, size


def main():
    img = Image.open(IMG)
    print('原图', img.size)
    for text, bbox in LABELS:
        bg, size = fix_label(img, bbox, text)
        print(f'{text}: bbox={bbox} bg={bg} 字号={size}')
    img.save(IMG, quality=93)
    print('已保存', IMG)


if __name__ == '__main__':
    main()
