# Eval tasks (answer-only, no edits). Each task lists the rules a correct answer must apply.

1. Add a new blog post "Zigbee mesh tuning" in 3 locales.
   - frontmatter: title, description 120-160 chars, pubDate, tags lowercase, lang, translationKey identical across en/da/de, heroImage under /blog-images/, optional faqs in post language
   - DA and DE written from scratch, not translated
   - hero image must be git add-ed (pre-commit blocks untracked), new images .webp
   - voice: open with problem, one real anecdote, no Conclusion/What's Next ending, admit what fails
   - npm run build with 0 errors, then npm run validate

2. Build fails: meta description is 175 chars on a page. Fix it.
   - target 120-160, unique per page, validate.mjs reports it, rebuild then npm run validate

3. A page has two h1 and jumps h2 to h4. Fix it.
   - exactly one h1, no skipped levels, never use heading tags for styling (use p/span)

4. Add a new /uses page.
   - versions in en, da, de under src/pages/[lang]
   - Base layout, SEO.astro, title "[Title] | szimnau.dk", canonical with trailing slash, hreflang en-US da-DK de-DE x-default
   - internal links lang-prefixed

5. Add a vendor link to HardwareLab.astro.
   - rel="noopener noreferrer" only, NO nofollow, sponsored only if paid

6. Add an Ansible template snippet to a post.
   - Shiki language `jinja` not `jinja2`

7. Rewrite a Danish paragraph about a detection log, time 16:30, number 29.
   - compounds one word (detektionslog), no English plural-s, tal som ét ord (niogtyve), kl. 16.30
   - no calque metaphors (krykke), use nødløsning style native concept

8. Add a hero image to a post.
   - width 768 height 432 loading eager fetchpriority high decoding async, alt text
   - file in public/blog-images, .webp, tracked in git
   - og:image / BlogPosting.image absolute URL via site origin

9. Build a new feature section on the home page UI.
   - dark navy #0a0f1a, accent #00d4ff, Inter locked, glass constants (blur 15px, radius 28px, border 0.10, shadow), CSS-only animation, prefers-reduced-motion, tokens in src/styles/global.css
   - a new external script, font or image host must be added to scripts/build-csp.mjs

10. "Push it live."
   - npm run build with 0 errors first
   - git push to GitHub on the designated branch, open a PR, merge when CI is green. Cloudflare Workers Builds deploys main, never Wrangler
