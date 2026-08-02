#!/usr/bin/env node
// 遍历 site/public/{assets,audio,fonts},给每个文件计算 md5 前 8 位
// 输出 src/data/asset-hashes.json
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(import.meta.dirname, '../..');
const PUBLIC = path.join(ROOT, 'site/public');
const OUT = path.join(ROOT, 'site/src/data/asset-hashes.json');

const exts = new Set(['.jpg', '.jpeg', '.png', '.mp3', '.ttf', '.svg', '.webp']);
const hashes = {};

function walk(dir, prefix = '') {
  if (!fs.existsSync(dir)) {
    console.log(`  skip: ${dir} 不存在`);
    return;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    const url = prefix + '/' + entry.name;
    if (entry.isDirectory()) {
      walk(full, url);
    } else if (exts.has(path.extname(entry.name).toLowerCase())) {
      // 跳过派生变体(-200/-400/-800/-1200/-1600)只 hash 原图
      if (/-\d+\.(jpg|png)$/i.test(entry.name)) continue;
      try {
        const buf = fs.readFileSync(full);
        const hash = crypto.createHash('md5').update(buf).digest('hex').slice(0, 8);
        hashes[url] = hash;
      } catch (e) {
        console.warn(`  hash 失败: ${url} — ${e.message}`);
      }
    }
  }
}

walk(path.join(PUBLIC, 'assets'), '/assets');
walk(path.join(PUBLIC, 'audio'), '/audio');
walk(path.join(PUBLIC, 'fonts'), '/fonts');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(hashes, null, 2));

console.log(`  ✅ 写 ${Object.keys(hashes).length} 条 hash → ${path.relative(ROOT, OUT)}`);
