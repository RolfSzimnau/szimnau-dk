import { ui, defaultLang, type Lang } from './ui';

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
    return (ui[lang] as Record<string, string>)[key] ?? ui[defaultLang][key] ?? key;
  };
}

export function getLocalePath(lang: Lang, path: string = ''): string {
  return `/${lang}${path ? `/${path}` : ''}`;
}

export function switchLocale(currentPath: string, targetLang: Lang): string {
  const parts = currentPath.split('/').filter(Boolean);
  // Tag slugs are translated per language (energy / energi / energie), so a tag
  // page has no counterpart URL. Send the switcher to the blog index instead.
  if (parts[1] === 'blog' && parts[2] === 'tag') {
    return `/${targetLang}/blog/`;
  }
  const knownLangs: Lang[] = ['en', 'da', 'de'];
  if (knownLangs.includes(parts[0] as Lang)) {
    parts[0] = targetLang;
  } else {
    parts.unshift(targetLang);
  }
  return '/' + parts.join('/');
}
