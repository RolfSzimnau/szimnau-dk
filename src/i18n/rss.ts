import { getCollection } from 'astro:content';
import type { Lang } from './ui';
import { feedPath, useTranslations } from './utils';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// English keeps its original channel description; DA/DE reuse the hero subheadline.
const channelDescription: Partial<Record<Lang, string>> = {
  en: 'Real-world Home Assistant guides, hardware reviews, and automation blueprints.',
};

export async function rssResponse(lang: Lang, site: URL | undefined): Promise<Response> {
  const origin = (site ?? new URL('https://szimnau.dk')).origin;
  const t = useTranslations(lang);
  const posts = (await getCollection('blog', (p) => p.data.lang === lang)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );

  const items = posts
    .map((p) => {
      const slug = p.data.translationKey;
      const url = `${origin}/${lang}/blog/${slug}/`;
      return `    <item>
      <title>${esc(p.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${p.data.pubDate.toUTCString()}</pubDate>
      <description>${esc(p.data.description)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>szimnau.dk: ${esc(t('blog.title'))}</title>
    <link>${origin}/${lang}/blog/</link>
    <atom:link href="${origin}${feedPath(lang)}" rel="self" type="application/rss+xml" />
    <description>${esc(channelDescription[lang] ?? t('hero.subheadline'))}</description>
    <language>${lang}</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
