// Width of the content in each 1200x630 hero, measured 2026-11-05. Phones crop the dark sides.
export const heroCrop: Record<string, 'square' | 'tall'> = {
  '/blog-images/energi-elpriser.jpg': 'square',               // content 38 % of width
  '/blog-images/fresh-intellivent-sky-ble-proxy.jpg': 'square', // 42 %
  '/blog-images/mailboxguard-installed.jpg': 'square',        // 46 %
  '/blog-images/klima-tado.jpg': 'tall',                      // 55 %
  '/blog-images/dmi-weather-alert-ticker-2026.jpg': 'tall',   // 57 %
  '/blog-images/google-find-my-home-assistant.jpg': 'tall',   // 58 %
};

// Full class strings so Tailwind sees them.
export const heroAspectClass = (src?: string): string => {
  const crop = src ? heroCrop[src] : undefined;
  if (crop === 'square') return 'aspect-square sm:aspect-video';
  if (crop === 'tall') return 'aspect-[6/5] sm:aspect-video';
  return 'aspect-video';
};
