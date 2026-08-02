#!/usr/bin/env node
// 给原图派生多档 JPG + WebP 变体(供 srcset + <picture> 使用)
//
// 用法:
//   node generate-image-variants.mjs <input-dir> [options]
//
// 选项:
//   --widths=200,400,800   派生宽度列表(逗号分隔)
//   --quality=80            JPEG/WebP 质量
//   --ext=webp              输出扩展名 (jpg / webp),不区分大小写
//   --max-edge=4096         PNG 输入 flatten + 长边不超过此值(避免超大 PNG)
//
// 输出文件命名: <stem>-<width>.<ext>(与 srcset 期望一致)
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const [, , inputDir] = process.argv;
if (!inputDir) {
  console.error('usage: generate-image-variants.mjs <input-dir> [--widths=...] [--quality=...] [--ext=jpg|webp]');
  process.exit(1);
}

const opts = Object.fromEntries(
  process.argv
    .slice(3)
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [k, v] = a.replace(/^--/, '').split('=');
      return [k, v];
    }),
);

const widths = (opts.widths || '200,400,800').split(',').map(Number);
const quality = Number(opts.quality || 80);
const ext = (opts.ext || 'jpg').replace(/^\./, '').toLowerCase();
const maxEdge = opts['max-edge'] ? Number(opts['max-edge']) : null;

if (!['jpg', 'webp'].includes(ext)) {
  console.error(`不支持的扩展名: ${ext}(只支持 jpg / webp)`);
  process.exit(1);
}

if (!fs.existsSync(inputDir)) {
  console.error(`❌ ${inputDir} 不存在`);
  process.exit(1);
}

let generated = 0;
let skipped = 0;
const files = fs.readdirSync(inputDir).filter((f) => /\.(png|jpg|jpeg)$/i.test(f));

for (const file of files) {
  const filepath = path.join(inputDir, file);
  const fileExtname = path.extname(file).toLowerCase();
  const stem = path.basename(file, fileExtname);
  const isPng = fileExtname === '.png';

  for (const w of widths) {
    const outName = `${stem}-${w}.${ext}`;
    const outPath = path.join(inputDir, outName);
    if (fs.existsSync(outPath)) {
      const inStat = fs.statSync(filepath);
      const outStat = fs.statSync(outPath);
      if (outStat.mtimeMs >= inStat.mtimeMs) {
        skipped++;
        continue;
      }
    }
    try {
      let pipeline = sharp(filepath);
      if (maxEdge) {
        // 长边限制(主要给大 PNG flatten 用)
        pipeline = pipeline.resize({
          width: Math.min(w, maxEdge),
          height: Math.min(w, maxEdge),
          fit: 'inside',
          withoutEnlargement: true,
        });
      } else {
        pipeline = pipeline.resize({ width: w, withoutEnlargement: true });
      }

      if (ext === 'webp') {
        pipeline = pipeline.webp({ quality });
      } else {
        // JPG 路径
        if (isPng) {
          pipeline = pipeline.flatten({ background: { r: 255, g: 255, b: 255 } });
        }
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      }

      await pipeline.toFile(outPath);
      generated++;
    } catch (e) {
      console.warn(`  ⚠️  ${file} @ ${w}px 失败: ${e.message}`);
    }
  }
}

const widthStr = widths.join('/');
const fmt = (n) => `${(n / 1024).toFixed(0)} KiB`;
console.log(`  ✅ ${path.basename(inputDir)} · ${ext} 派生 ${generated} 个,跳过 ${skipped} 个 (${widthStr} px, q=${quality})`);
