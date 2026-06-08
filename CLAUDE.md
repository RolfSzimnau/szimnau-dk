# szimnau.dk — Development Guide

Astro 6 + Tailwind CSS 4 static site deployed on Cloudflare. Three languages: `en` (default), `da`, `de`. All routes prefixed with locale (`/en/`, `/da/`, `/de/`).

## Build & Validate

```bash
npm install
./node_modules/.bin/astro build   # must complete with 0 errors before any commit
```

Build output goes to `dist/`. Always run a full build to validate before committing.

### Shiki language identifiers

Use the correct Shiki language name in code blocks — wrong names produce build warnings and disable syntax highlighting:

| Do NOT use | Use instead |
|------------|-------------|
| `jinja2`   | `jinja`     |

---

## SEO Standards — Non-Negotiable

Every change that touches pages, layouts, or components must satisfy all of the following. Run the build and verify in `dist/` output before committing.

### URL Consistency

- Site origin is always `https://szimnau.dk` — no `www`, no trailing inconsistency.
- `astro.config.mjs` `site` field must stay `https://szimnau.dk`.
- Never hardcode `https://szimnau.dk` in component code — always use `Astro.site?.origin ?? 'https://szimnau.dk'`.
- `public/robots.txt` sitemap URL must match: `Sitemap: https://szimnau.dk/sitemap-index.xml`.

### Every Page Must Have

- `<title>` — format: `[Page Title] | szimnau.dk`
- `<meta name="description">` — unique per page, 120–160 characters
- `<meta name="robots" content="index, follow">`
- `<link rel="canonical">` — correct URL with trailing slash
- hreflang links for all 3 locales with full locale codes: `en-US`, `da-DK`, `de-DE`, plus `x-default`
- hreflang URLs must have trailing slashes and match canonical format
- OG tags: `og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:site_name`, `og:locale`
- `og:image` must point to a file that physically exists in `public/`
- Twitter cards: `twitter:card`, `twitter:site`, `twitter:creator`, `twitter:title`, `twitter:description`, `twitter:image`

### Schema Markup

Every page renders (via `SEO.astro`):
- `WebSite` schema — no `potentialAction` unless a real search endpoint exists
- `Person` schema — Rolf Szimnau, url = `https://szimnau.dk`

Every blog post renders (via `BlogPost.astro`):
- `BlogPosting` schema — headline, description, datePublished, dateModified, author, publisher, image (full URL), keywords, inLanguage
- `BreadcrumbList` schema — three levels: Home → Blog → Post, all URLs with lang prefix and trailing slash
- `FAQPage` schema (if `faqs` frontmatter present) — must include `inLanguage: lang`

About pages have their own `Person` schema with `jobTitle`.

### Heading Structure

- Exactly **one `<h1>`** per page
- Hierarchy must not skip levels: h1 → h2 → h3
- Never use a heading tag for visual styling — use a `<p>` or `<span>` instead

### Images

Hero images (blog posts) must have:
```html
width="768" height="432" loading="eager" fetchpriority="high" decoding="async"
```
Blog card thumbnails: `loading="lazy" decoding="async"` with explicit `width` and `height`.

All `og:image` and `BlogPosting.image` values must be absolute URLs (prepend `siteOrigin`).

### Links

- Internal nav links: always use lang-prefixed paths (`/en/blog/`, not `/blog/`)
- External links to genuine, editorially recommended sites: `rel="noopener noreferrer"` only — do NOT add `nofollow`
- External links that are paid/sponsored: add `rel="sponsored"`
- Never add `nofollow` to hardware vendor links in `HardwareLab.astro` — these are editorial endorsements

### i18n

- Every new page needs versions in all 3 locales (`en/`, `da/`, `de/`)
- Blog post frontmatter must include `lang`, `translationKey`, and locale-appropriate `title`, `description`, `faqs`
- `faqs` content must be written in the same language as the post

### New Files in `public/`

- `og-default.png` must remain at `public/og-default.png` (1200×630 px) — replace with branded version when possible
- `robots.txt`, `ai.txt`, `llms.txt` must not be deleted

### When Adding a New Blog Post

Frontmatter checklist:
```yaml
title: ""           # keyword-rich, unique
description: ""     # 120-160 chars, unique
pubDate: YYYY-MM-DD
tags: []            # relevant, lowercase
lang: en            # or da / de
translationKey: ""  # same slug across all language versions
heroImage: "/blog-images/filename.jpg"  # must exist in public/blog-images/
faqs:               # optional, but write in the post's language
  - question: ""
    answer: ""
```
Create matching versions in `da/` and `de/` with translated content.

---

## Architecture

```
src/
  components/
    SEO.astro          # All meta tags, hreflang, JSON-LD WebSite + Person
    BlogCard.astro
    HardwareLab.astro
    Header.astro
    Footer.astro
  layouts/
    Base.astro         # HTML shell, imports SEO.astro
    BlogPost.astro     # BlogPosting + BreadcrumbList + FAQPage schema
  pages/
    [lang]/
      index.astro
      about.astro
      blog/
        index.astro
        [...slug].astro
  i18n/
    ui.ts              # Translation strings
    utils.ts
content/
  blog/
    en/ da/ de/        # MDX blog posts
public/
  blog-images/         # Hero images (768x432 minimum)
  og-default.png       # 1200x630 OG fallback
  robots.txt
  ai.txt
  llms.txt
```

## Deployment

Cloudflare Pages via Wrangler. Build output: `dist/`. Static output mode.
