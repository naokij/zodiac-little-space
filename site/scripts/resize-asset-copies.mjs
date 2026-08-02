#!/usr/bin/env node
// 缩放 site/public/assets 下的原图副本,加长边尺寸上限
// 防止 4K/5K 大原图进 dist,减小部署包
//
// 用法: node resize-asset-copies.mjs <src-dir> <dst-dir> <max-edge>
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const [, , srcDir, dstDir, maxEdgeStr] = process.argv;
const maxEdge = Number(maxEdgeStr || 1920);

if (!srcDir || !dstDir) {
  console.error('usage: node resize-asset-copies.mjs <src-dir> <dst-dir> <max-edge>');
  process.exit(1);
}

if (!fs.existsSync(srcDir)) {
  console.error(`❌ ${srcDir} 不存在`);
  process.exit(1);
}

const files = fs.readdirSync(srcDir).filter((f) => /\.(png|jpg|jpeg)$/i.test(f));
let total = 0;
for (const f of files) {
  const src = path.join(srcDir, f);
  const dst = path.join(dstDir, f);
  try {
    const meta = await sharp(src).metadata();
    const needsResize = Math.max(meta.width || 0, meta.height || 0) > maxEdge;
    if (needsResize) {
      await sharp(src)
        .resize({
          width: maxEdge,
          height: maxEdge,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFile(dst);
      total++;
    } else {
      // 不需要缩放,直接复制
      fs.copyFileSync(src, dst);
    }
  } catch (e) {
    console.error(`  ⚠️  ${f}: ${e.message}`);
  }
}
console.log(`  ✅ ${path.basename(srcDir)} → ${path.basename(dstDir)} (cap ${maxEdge}px): ${files.length} files, ${total} resized`);
