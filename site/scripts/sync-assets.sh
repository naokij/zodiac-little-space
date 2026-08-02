#!/bin/bash
# 同步仓库根目录的资源到 site/public/
# 1. 复制原图(限制大原图尺寸,避免 4K/5K 直接进 dist)
# 2. 派生 JPG + WebP 多档
# 3. 同步字体 + 音频
# 4. 生成资源 hash + 自动算 mp3 时长
set -e

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SITE_PUBLIC="$ROOT/site/public"
ASSETS_SRC="$ROOT/assets"
FONTS_SRC="$ROOT/public/fonts"
AUDIO_SRC="$ROOT/audio"
SCRIPTS_DIR="$(dirname "$0")"

echo "🔄 同步资源 → $SITE_PUBLIC"

# 1) 同步 assets/(characters/locations/banners/covers/episodes)
mkdir -p "$SITE_PUBLIC/assets"

# characters: 2048px 还合理,不缩
rm -rf "$SITE_PUBLIC/assets/characters"
mkdir -p "$SITE_PUBLIC/assets/characters"
node "$SCRIPTS_DIR/resize-asset-copies.mjs" "$ASSETS_SRC/characters" "$SITE_PUBLIC/assets/characters" 2048

# locations: 长边 ≤ 1920px
rm -rf "$SITE_PUBLIC/assets/locations"
mkdir -p "$SITE_PUBLIC/assets/locations"
node "$SCRIPTS_DIR/resize-asset-copies.mjs" "$ASSETS_SRC/locations" "$SITE_PUBLIC/assets/locations" 1920

# banners: 长边 ≤ 1920px(5504→1920)
rm -rf "$SITE_PUBLIC/assets/banners"
mkdir -p "$SITE_PUBLIC/assets/banners"
node "$SCRIPTS_DIR/resize-asset-copies.mjs" "$ASSETS_SRC/banners" "$SITE_PUBLIC/assets/banners" 1920

# covers: 长边 ≤ 1920px
rm -rf "$SITE_PUBLIC/assets/covers"
mkdir -p "$SITE_PUBLIC/assets/covers"
node "$SCRIPTS_DIR/resize-asset-copies.mjs" "$ASSETS_SRC/covers" "$SITE_PUBLIC/assets/covers" 1920

# episodes(情节插图): 长边 ≤ 1920px
rm -rf "$SITE_PUBLIC/assets/episodes"
mkdir -p "$SITE_PUBLIC/assets/episodes"
node "$SCRIPTS_DIR/resize-asset-copies.mjs" "$ASSETS_SRC/episodes" "$SITE_PUBLIC/assets/episodes" 1920

# decor(装饰素材: 云朵页脚带/星月分隔串): 长边 ≤ 1920px
rm -rf "$SITE_PUBLIC/assets/decor"
mkdir -p "$SITE_PUBLIC/assets/decor"
node "$SCRIPTS_DIR/resize-asset-copies.mjs" "$ASSETS_SRC/decor" "$SITE_PUBLIC/assets/decor" 1920

# 2) 同步 fonts
mkdir -p "$SITE_PUBLIC/fonts"
cp -f "$FONTS_SRC"/*.ttf "$SITE_PUBLIC/fonts/" 2>/dev/null || echo "  ⚠️  仓库根 public/fonts 为空,跳过"
echo "  ✅ fonts"

# 3) 同步 audio
mkdir -p "$SITE_PUBLIC/audio"
if [ -d "$AUDIO_SRC" ] && ls "$AUDIO_SRC"/*.mp3 1>/dev/null 2>&1; then
  cp "$AUDIO_SRC"/*.mp3 "$SITE_PUBLIC/audio/"
  echo "  ✅ audio"
else
  echo "  ⚠️  audio/ 还没有 mp3,故事详情页会走占位"
fi

# 4) 派生 JPG fallback
node "$SCRIPTS_DIR/generate-image-variants.mjs" "$SITE_PUBLIC/assets/characters" --widths=200,400,800 --quality=80 --ext=jpg
node "$SCRIPTS_DIR/generate-image-variants.mjs" "$SITE_PUBLIC/assets/covers" --widths=400,800,1200 --quality=82 --ext=jpg
node "$SCRIPTS_DIR/generate-image-variants.mjs" "$SITE_PUBLIC/assets/locations" --widths=400,800,1200 --quality=82 --ext=jpg
node "$SCRIPTS_DIR/generate-image-variants.mjs" "$SITE_PUBLIC/assets/banners" --widths=800,1600 --quality=80 --ext=jpg
node "$SCRIPTS_DIR/generate-image-variants.mjs" "$SITE_PUBLIC/assets/episodes" --widths=400,800,1200 --quality=82 --ext=jpg
# decor 不派生 JPG:透明底 PNG 转 JPG 会丢 alpha 变黑底,decor 只用 WebP 变体

# 5) 派生 WebP
node "$SCRIPTS_DIR/generate-image-variants.mjs" "$SITE_PUBLIC/assets/characters" --widths=200,400,800 --quality=80 --ext=webp
node "$SCRIPTS_DIR/generate-image-variants.mjs" "$SITE_PUBLIC/assets/covers" --widths=400,800,1200 --quality=82 --ext=webp
node "$SCRIPTS_DIR/generate-image-variants.mjs" "$SITE_PUBLIC/assets/locations" --widths=400,800,1200 --quality=82 --ext=webp
node "$SCRIPTS_DIR/generate-image-variants.mjs" "$SITE_PUBLIC/assets/banners" --widths=800,1600 --quality=80 --ext=webp
node "$SCRIPTS_DIR/generate-image-variants.mjs" "$SITE_PUBLIC/assets/episodes" --widths=400,800,1200 --quality=82 --ext=webp
node "$SCRIPTS_DIR/generate-image-variants.mjs" "$SITE_PUBLIC/assets/decor" --widths=800,1600 --quality=82 --ext=webp

# 6) 生成资源内容 hash 映射表
node "$SCRIPTS_DIR/generate-asset-hashes.mjs"

# 7) 扫描 audio/*.mp3 自动算时长,patch episodes.ts
node "$SCRIPTS_DIR/build-durations.mjs"

echo "✨ 同步完成"
