#!/usr/bin/env node
// 生成「十二星座小太空」站点图标
//  - app icon / nav logo / apple-touch-icon ← 十二星座贴纸全家福(assets/decor/十二星座贴纸全家福.jpg)
//  - favicon(浏览器标签/收藏夹)← 深靛蓝夜空圆形徽标 + 淡金弯月 + 小星星(内嵌 SVG)
// 换图标:替换贴纸全家福源图后重跑本脚本;月牙 favicon 想改就改内置 SVG。
// 产出: site/public/logo/zodiac-logo-64.png / favicon-32.png / app-icon-192/512.png
//       site/public/apple-touch-icon.png (180) / favicon.ico (16/32/48 多尺寸 ICO)

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const LOGO_DIR = path.join(PUBLIC, 'logo');
fs.mkdirSync(LOGO_DIR, { recursive: true });

// 1) 贴纸全家福源图(真值源在仓库根,正方形 → app icons / nav logo / apple-touch)
const appSrc = path.resolve(ROOT, '../assets/decor/十二星座贴纸全家福.jpg');
if (!fs.existsSync(appSrc)) {
  console.error('❌ 找不到 app icon 源图:', appSrc);
  process.exit(1);
}

// 2) favicon:深靛蓝 → 薰衣草紫渐变圆形徽标 + 淡金弯月 + 三颗小星星
const moonSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="sky" cx="38%" cy="30%" r="85%">
      <stop offset="0%" stop-color="#5a4f8f"/>
      <stop offset="55%" stop-color="#3a3365"/>
      <stop offset="100%" stop-color="#262040"/>
    </radialGradient>
  </defs>
  <circle cx="256" cy="256" r="256" fill="url(#sky)"/>
  <mask id="bite">
    <circle cx="256" cy="256" r="128" fill="#fff"/>
    <circle cx="310" cy="232" r="106" fill="#000"/>
  </mask>
  <circle cx="256" cy="256" r="128" fill="#f2df9e" mask="url(#bite)"/>
  <path d="M168 118 l7 20 20 7 -20 7 -7 20 -7 -20 -20 -7 20 -7 z" fill="#f7ecc4"/>
  <path d="M364 330 l5 15 15 5 -15 5 -5 -15 -15 -5 15-5 z" fill="#e6dcff"/>
  <circle cx="392" cy="160" r="7" fill="#f7ecc4"/>
</svg>`;
const moonBuf = Buffer.from(moonSvg);

// 3) PNG 各尺寸
const pngs = [
  // app icons — 贴纸全家福
  { out: path.join(LOGO_DIR, 'app-icon-192.png'), size: 192, src: appSrc },
  { out: path.join(LOGO_DIR, 'app-icon-512.png'), size: 512, src: appSrc },
  { out: path.join(PUBLIC, 'apple-touch-icon.png'), size: 180, src: appSrc },
  // nav logo / favicon — 月牙
  { out: path.join(LOGO_DIR, 'zodiac-logo-64.png'), size: 64, src: moonBuf },
  { out: path.join(LOGO_DIR, 'favicon-32.png'), size: 32, src: moonBuf },
];
for (const p of pngs) {
  await sharp(p.src).resize(p.size, p.size).png().toFile(p.out);
  console.log('  ✅', path.relative(ROOT, p.out));
}

// 4) favicon.ico (16/32/48 月牙 PNG 打包成 ICO)
const icoSizes = [16, 32, 48];
const bufs = await Promise.all(
  icoSizes.map((s) => sharp(moonBuf, { density: 384 }).resize(s, s).png().toBuffer()),
);
function buildIco(buffers, sizes) {
  const num = buffers.length;
  const dirSize = 6 + 16 * num;
  let dataOffset = dirSize;
  const dir = Buffer.alloc(dirSize);
  dir.writeUInt16LE(0, 0);
  dir.writeUInt16LE(1, 2);
  dir.writeUInt16LE(num, 4);
  for (let i = 0; i < num; i++) {
    const offset = 6 + i * 16;
    const size = buffers[i].length;
    dir.writeUInt8(sizes[i] === 256 ? 0 : sizes[i], offset + 0);
    dir.writeUInt8(sizes[i] === 256 ? 0 : sizes[i], offset + 1);
    dir.writeUInt8(0, offset + 2);
    dir.writeUInt8(0, offset + 3);
    dir.writeUInt16LE(1, offset + 4);
    dir.writeUInt16LE(32, offset + 6);
    dir.writeUInt32LE(size, offset + 8);
    dir.writeUInt32LE(dataOffset, offset + 12);
    dataOffset += size;
  }
  return Buffer.concat([dir, ...buffers]);
}
fs.writeFileSync(path.join(PUBLIC, 'favicon.ico'), buildIco(bufs, icoSizes));
console.log('  ✅ site/public/favicon.ico');
console.log('✨ 图标生成完成');
