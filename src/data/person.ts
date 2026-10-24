// Single source for the Person entity in JSON-LD. Every page links to it by @id,
// so Google sees one Rolf Szimnau with one set of profiles.

export const PERSON_SAME_AS = [
  'https://www.linkedin.com/in/szimnau/',
  'https://github.com/RolfSzimnau',
];

export const personId = (origin: string) => `${origin}/#person`;

export const personUrl = (origin: string) => `${origin}/en/about/`;

// Full entity, emitted once per page by SEO.astro.
export const personJsonLd = (origin: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': personId(origin),
  name: 'Rolf Szimnau',
  url: personUrl(origin),
  jobTitle: 'CISO & Technical Advisor',
  description: 'Rolf Szimnau is a CISO and Technical Advisor with 29+ years of experience. By day he runs enterprise cloud infrastructure for a SaaS company. At home he runs Home Assistant on Proxmox and publishes in-depth guides on automation, hardware, and smart home engineering.',
  sameAs: PERSON_SAME_AS,
  knowsAbout: ['Home Assistant', 'Home Automation', 'Proxmox', 'Smart Home', 'ESPHome', 'Microsoft Azure', 'Information Security'],
  knowsLanguage: ['en', 'da', 'de'],
});

// Reference for author/publisher fields.
export const personRef = (origin: string) => ({
  '@type': 'Person',
  '@id': personId(origin),
  name: 'Rolf Szimnau',
  url: personUrl(origin),
});
