#!/usr/bin/env node
// 扫描仓库根 audio/*.mp3,计算每个 mp3 真实时长,自动 patch site/src/data/episodes.ts
// 把 '约 X 分钟' 这样的硬编码 duration 改成 '约 N 分 NN 秒'
//
// 用法: node scripts/build-durations.mjs [--dry-run]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const AUDIO_DIR = path.join(ROOT, 'audio');
const EPISODES_FILE = path.join(ROOT, 'site/src/data/episodes.ts');
const dryRun = process.argv.includes('--dry-run');

// 纯 Node 读 mp3 时长(无需 ffprobe)
// 支持 ID3v2 头 + MPEG1 Layer3 帧大小估算
function getMp3DurationSec(filepath) {
  const buf = fs.readFileSync(filepath);
  let offset = 0;
  // 跳过 ID3v2 头
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {
    const tagSize =
      ((buf[6] & 0x7f) << 21) |
      ((buf[7] & 0x7f) << 14) |
      ((buf[8] & 0x7f) << 7) |
      (buf[9] & 0x7f);
    offset = 10 + tagSize;
  }
  // 找第一个 MPEG 同步字
  let frameOffset = -1;
  for (let i = offset; i < Math.min(buf.length - 4, offset + 65536); i++) {
    if (buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0) {
      frameOffset = i;
      break;
    }
  }
  if (frameOffset < 0) {
    return null;
  }

  const header = buf.readUInt32BE(frameOffset);
  const versionId = (header >> 19) & 0x3;
  const bitrateIdx = (header >> 12) & 0xf;
  const sampleRateIdx = (header >> 10) & 0x3;
  const padding = (header >> 9) & 0x1;

  // MPEG1 Layer3
  const bitrateTable = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
  const sampleRateTable = [44100, 48000, 32000, 0];
  if (bitrateIdx === 0 || bitrateIdx === 15) return null;
  if (sampleRateIdx === 3) return null;
  // MPEG 头:version bits 00=MPEG2.5, 10=MPEG2, 11=MPEG1(=decimal 3)
  if (versionId !== 3) return null;

  const bitrate = bitrateTable[bitrateIdx] * 1000;
  const sampleRate = sampleRateTable[sampleRateIdx];
  const frameSize = Math.floor((144 * bitrate) / sampleRate) + padding;
  const totalFrames = (buf.length - frameOffset) / frameSize;
  return (totalFrames * 1152) / sampleRate;
}

function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `约 ${m} 分 ${s.toString().padStart(2, '0')} 秒`;
}

// 1. 扫 audio/ 找 mp3,文件名匹配 slug
if (!fs.existsSync(AUDIO_DIR)) {
  console.log('  ℹ️  audio/ 目录不存在,跳过');
  process.exit(0);
}
const mp3Files = fs.readdirSync(AUDIO_DIR).filter((f) => f.endsWith('.mp3'));
if (mp3Files.length === 0) {
  console.log('  ℹ️  audio/ 没有 mp3,跳过');
  process.exit(0);
}

// 2. 读 episodes.ts
let episodesSrc = fs.readFileSync(EPISODES_FILE, 'utf-8');

let updated = 0;
for (const mp3File of mp3Files) {
  const slug = mp3File.replace(/\.mp3$/, '');
  const mp3Path = path.join(AUDIO_DIR, mp3File);
  const sec = getMp3DurationSec(mp3Path);
  if (!sec || sec < 1) {
    console.log(`  ⚠️  ${mp3File} · 无法读取时长,跳过`);
    continue;
  }
  const newDuration = formatDuration(sec);

  // 在 episodes.ts 里找这一集的 duration 字段并替换
  // 匹配模式:slug: '<slug>', ... duration: '<anything>',
  const slugEscaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `(slug:\\s*['"]${slugEscaped}['"]\\s*,[\\s\\S]*?duration:\\s*)['"][^'"]*['"]`,
  );
  if (!re.test(episodesSrc)) {
    console.log(`  ⚠️  ${mp3File} · 在 episodes.ts 找不到匹配的 slug,跳过`);
    continue;
  }
  const matched = episodesSrc.match(re);
  const oldDuration = matched?.[2];
  if (oldDuration === newDuration) {
    console.log(`  · ${mp3File} · 已是最新(${newDuration})`);
    continue;
  }
  episodesSrc = episodesSrc.replace(re, `$1'${newDuration}'`);
  console.log(`  ✅ ${mp3File} · ${sec.toFixed(1)}s → ${newDuration} (was ${oldDuration})`);
  updated++;
}

if (updated > 0 && !dryRun) {
  fs.writeFileSync(EPISODES_FILE, episodesSrc);
  console.log(`\n  ✏️  写回 episodes.ts(${updated} 处修改)`);
} else if (updated > 0 && dryRun) {
  console.log(`\n  🔍 dry-run 模式,未写回(${updated} 处待修改)`);
} else {
  console.log('\n  ✨ 无需更新');
}
