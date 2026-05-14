// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://szimnau.dk',
  output: 'static',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [mdx()],

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'da', 'de'],
    routing: { prefixDefaultLocale: true },
  },

  adapter: cloudflare(),
});