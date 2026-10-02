// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readFileSync, readdirSync } from 'node:fs';

// lastmod for blog posts: updatedDate, else pubDate. Pages without a
// real content date get no lastmod rather than a guessed one.
const postDates = new Map();
for (const lang of ['en', 'da', 'de']) {
  const dir = `./src/content/blog/${lang}`;
  for (const file of readdirSync(dir).filter((f) => /\.mdx?$/.test(f))) {
    const front = readFileSync(`${dir}/${file}`, 'utf8').split(/\r?\n---/)[0];
    const field = (name) => front.match(new RegExp(`^${name}:\\s*["']?([^"'\\s]+)`, 'm'))?.[1];
    const date = field('updatedDate') ?? field('pubDate');
    const key = field('translationKey');
    if (date && key) postDates.set(`/${lang}/blog/${key}/`, new Date(date));
  }
}

export default defineConfig({
  site: 'https://szimnau.dk',
  trailingSlash: 'always',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    mdx(),
    sitemap({
      serialize(item) {
        const lastmod = postDates.get(new URL(item.url).pathname);
        if (lastmod) item.lastmod = lastmod.toISOString();
        return item;
      },
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          da: 'da-DK',
          de: 'de-DE',
        },
      },
    }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'da', 'de'],
    routing: { prefixDefaultLocale: true },
  },
});