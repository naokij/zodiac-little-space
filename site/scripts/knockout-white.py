#!/usr/bin/env python3
"""白底装饰图 → 透明底 PNG(水彩/贴纸素材抠白)

算法:近白像素(三通道 ≥ 阈值)取「边缘连通」区域作粗背景 →
腐蚀切断描边细缝(防洪水漏进白色云芯/星芯)→ 保留仍贴图像边缘的主背景 →
膨胀还原边缘 → alpha 羽化。
云/星的白色内核因不贴图像边缘而被保留。

用法: python3 scripts/knockout-white.py <src.jpg> <dst.png> [阈值=232]
依赖: PIL + numpy + scipy
"""
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage


def knock_out_white(src: str, dst: str, bg_thr: int = 232, open_it: int = 4, feather: float = 2.0):
    img = Image.open(src).convert('RGB')
    a = np.asarray(img)
    h, w, _ = a.shape
    near_white = (a[..., 0] >= bg_thr) & (a[..., 1] >= bg_thr) & (a[..., 2] >= bg_thr)

    # 1) 粗背景:与图像边缘连通的近白区域
    lab, _ = ndimage.label(near_white)
    border = np.unique(np.concatenate([lab[0, :], lab[-1, :], lab[:, 0], lab[:, -1]]))
    bg0 = np.isin(lab, border[border != 0])

    # 2) 腐蚀切断细漏缝;保留仍贴图像边缘(内缩框)的主背景;膨胀还原
    bg1 = ndimage.binary_erosion(bg0, iterations=open_it)
    lab1, n1 = ndimage.label(bg1)
    f = open_it * 2 + 2
    frame = np.zeros((h, w), bool)
    frame[:f, :] = frame[-f:, :] = frame[:, :f] = frame[:, -f:] = True
    keep = [i for i in range(1, n1 + 1) if (lab1 == i)[frame].any()]
    bg2 = np.isin(lab1, keep)
    bg3 = ndimage.binary_dilation(bg2, iterations=open_it) & near_white

    alpha = np.where(bg3, 0, 255).astype(np.uint8)
    alpha_img = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(feather))
    rgba = img.convert('RGBA')
    rgba.putalpha(alpha_img)
    rgba.save(dst)
    print(f'{dst}: 粗背景 {bg0.mean():.1%} → 最终透明 {bg3.mean():.1%}')


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    knock_out_white(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 232)
