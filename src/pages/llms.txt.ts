import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import type { Lang } from '../i18n/ui';

// Generated from frontmatter on every build so the post list cannot go stale.
const HEAD = `# szimnau.dk

> Real-world Home Assistant guides, hardware reviews, and automation blueprints by Rolf Szimnau — an IT advisor and home automation enthusiast based in Denmark. All content is based on personal, hands-on experience with actual hardware running in a live smart home setup.

Rolf Szimnau writes in-depth technical guides covering Home Assistant integrations, automation blueprints, dashboard design, and hardware reviews. The site is multilingual (English, Danish, German). Content is practical and specific — configurations, YAML, CSS, and real outcomes rather than theory.`;

const SITE = `## Site

- [About Rolf Szimnau](https://szimnau.dk/en/about/): Background, role, and the hardware stack behind the site.
- [Hardware Lab](https://szimnau.dk/en/#hardware-lab): Full list of devices actively running in the setup — Dell OptiPlex 7060, Home Assistant OS, Home Assistant Connect ZBT-2 (Thread Border Router), UniFi, Reolink CX810, Roborock S5 Max, Mammotion Luba Mini 2, Škoda Elroq, Tado, Sonos, WiZ, LEDVANCE, Govee, IKEA Home Smart (Thread), Bosch Home Connect, Miele, Mill Norway, ESPHome sensors.`;

const SECTIONS: Array<[Lang, string]> = [
  ['en', 'Blog'],
  ['da', 'Blog (Danish)'],
  ['de', 'Blog (German)'],
];

export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL('https://szimnau.dk')).origin;
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );

  const sections = SECTIONS.map(([lang, heading]) => {
    const lines = posts
      .filter((p) => p.data.lang === lang)
      .map((p) => `- [${p.data.title}](${origin}/${lang}/blog/${p.data.translationKey}/): ${p.data.description}`);
    return `## ${heading}\n\n${lines.join('\n')}`;
  });

  const body = [HEAD, ...sections, SITE].join('\n\n') + '\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
