---
name: glassmorphism
description: Create distinctive glassmorphism interfaces with frosted-glass surfaces, backdrop blur, layered depth, and WCAG AA accessibility. Use this skill when building UI components, pages, or sections for szimnau.dk. Source: typeui.sh/design-skills/glassmorphism
---

A modern design system featuring liquid glass effects and glassmorphism. Produces UIs where panels and cards feel like panes of frosted glass floating over rich backgrounds, creating depth and spatial hierarchy.

## Project Context (szimnau.dk)

This project has an established design system — work within it:

- **Background**: dark navy `#0a0f1a` (NOT white — this is a dark glassmorphism variant)
- **Primary accent**: `#00d4ff` (cyan electric blue, NOT `#1856FF`)
- **Body font**: Inter — already locked in, do NOT change it
- **Display/heading font**: Plus Jakarta Sans or another distinctive pairing with Inter
- **Monospace**: JetBrains Mono (already in use for code blocks)
- **Stack**: Astro 6, Tailwind v4, no React/Vue — CSS-only animations preferred
- **Glass constants** (already established — use these exact values):
  ```css
  background: rgba(255,255,255,0.05)
  backdrop-filter: blur(15px)
  -webkit-backdrop-filter: blur(15px)
  border-radius: 28px
  border: 1px solid rgba(255,255,255,0.10)
  box-shadow: 0 8px 32px rgba(0,0,0,0.3)
  ```
- **Inner cards** (inside stack-in-card): `background: transparent; box-shadow: none; border: none`
- **Dividers**: `border-bottom: 1px solid rgba(255,255,255,0.06)`
- Always add `ha-card::before { display: none !important; }` when targeting HA cards

## Design Tokens

### Color Palette (szimnau.dk adapted)
- **Primary**: `#00d4ff` — primary actions, links, key interactive elements
- **Primary dim**: `#0090b3` — hover states, secondary actions
- **Navy**: `#0a0f1a` — base background
- **Navy light**: `#111827` — slightly elevated surfaces
- **Success**: `#07CA6B` — confirmations, positive states
- **Warning**: `#E89558` — caution, pending
- **Danger**: `#EA2143` — errors, destructive actions
- **Text**: `rgba(255,255,255,0.90)` — primary text on dark glass
- **Text muted**: `rgba(255,255,255,0.55)` — secondary text

### Glass Effect Specifications

Three intensity levels — choose based on layer depth:

| Level | blur | fill opacity | Use for |
|-------|------|-------------|---------|
| Subtle | `blur(8px)` | 3–5% white | Background cards, large surfaces |
| Medium | `blur(15px)` | 5–8% white | Standard cards (site default) |
| Heavy | `blur(24px)` | 10–15% white | Modals, focused overlays, CTAs |

**On dark backgrounds**, surfaces use `rgba(255,255,255,X)` fills. Higher opacity = more visible glass edge.

**Border**: always `1px solid rgba(255,255,255,0.10)` — the edge-light effect that makes glass feel 3D.

**Shadow**: `0 8px 32px rgba(0,0,0,0.3)` standard; increase to `0 16px 48px rgba(0,0,0,0.5)` for heavy/elevated.

### Typography

- **Display/headings**: Plus Jakarta Sans — geometric, modern, pairs well with Inter. Load from Google Fonts.
- **Body**: Inter (established, locked)
- **Code/mono**: JetBrains Mono (established)
- Scale: mobile-first compact — headings that work on 390px before scaling up

### Spacing

Comfortable density — glass surfaces need internal padding so text doesn't crowd translucent edges:
- Card padding: `1.5rem` (24px) standard, `2rem` (32px) for hero/featured cards
- Gap between stacked glass surfaces: `1rem` minimum so blur boundaries don't merge
- Touch targets: minimum 44×44px on interactive elements

## Design Thinking

Before coding, commit to answers for:
1. **Layer depth**: What sits below this surface? (background image, gradient, content)
2. **Intensity**: Subtle ambient card or focal point that demands attention?
3. **Motion**: Entrance (fade+translateY), hover (subtle glow on border), or none?
4. **Differentiation**: What is the one thing someone remembers about this component?

Glass is **structural, not decorative** — every translucent surface communicates layer hierarchy. Do not use glass as decoration on a flat background with nothing to blur.

## Component Patterns

### Standard glass card
```css
.glass-card {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 28px;
  border: 1px solid rgba(255,255,255,0.10);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  padding: 1.5rem;
}
```

### Hover state (CSS only)
```css
.glass-card:hover {
  border-color: rgba(0,212,255,0.3);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,212,255,0.15);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
```

### Progress bar (via ::after, never ::before)
```css
ha-card { overflow: hidden !important; position: relative !important; }
ha-card::after {
  content: '' !important; position: absolute !important;
  left: 0; top: 0;
  width: Xpct; height: 100% !important;
  background: linear-gradient(90deg, rgba(76,175,80,0.18), rgba(129,199,132,0.05)) !important;
  pointer-events: none !important;
}
```

### Entrance animation (CSS only, Astro compatible)
```css
@keyframes glass-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.glass-card { animation: glass-in 0.4s ease both; }
/* Stagger with animation-delay on siblings */
```

## Accessibility Rules

Glassmorphism has unique contrast risks — enforce these:

1. **Text on glass must pass WCAG AA** (4.5:1 body, 3:1 large). On dark glass: white text at 90% opacity over `rgba(255,255,255,0.05)` on `#0a0f1a` passes. Verify at blur boundaries.
2. **Focus states**: use solid `outline: 2px solid #00d4ff` — never translucent outlines that disappear against backgrounds.
3. **Respect `prefers-reduced-motion`**: wrap all animations in `@media (prefers-reduced-motion: no-preference)`.
4. **Minimum blur**: always at least `blur(8px)` — below this the background text bleeds through and destroys readability.
5. **Fallback for no-backdrop-filter**: add `background: rgba(17,24,39,0.85)` as fallback for browsers without backdrop-filter support.

## What to Avoid

- Glass on plain flat backgrounds with nothing to blur — it just looks grey
- Mixing glassmorphism with flat/material or neobrutalist components in the same view
- `overflow: visible` on glass containers with `backdrop-filter` — breaks the blur in most browsers
- `::before` for progress bars or overlays — reserved for theme suppression
- Opacity so low (< 3%) that the glass surface is invisible — glass needs to be perceptible
- Opacity so high (> 20% on dark) that it becomes an opaque card with a blur prop

## Design Philosophy

1. **Glass is spatial hierarchy** — each layer communicates depth. Use it purposefully.
2. **Clarity through blur** — blur softens the background behind content, improving focus. Every blur must serve readability.
3. **Accessibility first** — the frosted look only works if users can read text and navigate with a keyboard. When in doubt, increase opacity or darken the background.
