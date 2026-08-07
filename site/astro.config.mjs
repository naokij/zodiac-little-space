import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://zodiac-little-space.jiangle.name',
  vite: {
    server: {
      fs: {
        // 允许 Vite 从仓库根 ../stories、../assets、../audio、../public 读取文件
        allow: ['..'],
      },
    },
  },
});
