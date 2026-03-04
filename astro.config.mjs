import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://hapa-stock.vercel.app',
  output: 'static',
  adapter: vercel(),
  integrations: [sitemap()],

  i18n: {
    defaultLocale: 'ko',
    locales: ['ko'],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});