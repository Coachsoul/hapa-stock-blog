import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://hapa-stock.vercel.app',
  integrations: [sitemap()],

  i18n: {
    defaultLocale: 'ko',
    locales: ['ko'],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});