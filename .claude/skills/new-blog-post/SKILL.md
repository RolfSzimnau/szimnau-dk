---
name: new-blog-post
description: Checklist for adding a blog post to szimnau.dk in en, da and de. Use when asked to "write a new blog post", "add a post" or "create a post".
---

Frontmatter for each locale file in `content/blog/{en,da,de}/`:

```yaml
title: ""           # keyword-rich, unique
description: ""     # 120-160 chars, unique
pubDate: YYYY-MM-DD
tags: []            # relevant, lowercase
lang: en            # or da / de
translationKey: ""  # same slug across all language versions
heroImage: "/blog-images/filename.webp"  # must exist in public/blog-images/
faqs:               # optional, written in the post's language
  - question: ""
    answer: ""
```

1. Create matching `da/` and `de/` versions, written from scratch (see Blog Voice in CLAUDE.md).
2. Hero image: 768x432 minimum, `.webp` for new images, existing `.jpg` stay as-is.
3. `git add` the image. The pre-commit hook blocks a commit when an MDX file references an untracked `/blog-images/` file.
4. Run `./node_modules/.bin/astro build`, then `npm run validate`.
