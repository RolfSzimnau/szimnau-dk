---
name: frontend-design
description: Build distinctive, production-grade frontend components, pages and layouts. Use when asked to build a web component, page, section or layout. For glass-surface UI use the glassmorphism skill.
---

Avoid generic "AI slop" aesthetics. Implement real working code with attention to detail.

## Project constraints (szimnau.dk)

Astro 7 SSG, Tailwind v4, MDX, no React/Vue. CSS tokens live in `src/styles/global.css` under `@theme {}`. The palette, Inter body font and glass card values are fixed. They are defined in the `glassmorphism` skill. Do not change them. Display/heading fonts are free to choose if they pair with Inter.

## Design thinking

Before coding, commit to one aesthetic direction:
- **Purpose**: what problem does this interface solve, and for whom?
- **Tone**: pick a clear direction (minimal, editorial, retro-futuristic, brutalist, soft, industrial, etc.) that fits the existing dark glass system.
- **Constraints**: framework, performance, accessibility.
- **Differentiation**: the one thing someone will remember.

Bold maximalism and refined minimalism both work. Intentionality matters, intensity does not. Match code complexity to the vision: maximalist needs elaborate effects, minimal needs precise spacing and typography.

## Aesthetics

- **Typography**: a distinctive display font paired with Inter. Avoid Arial, Roboto and system fonts for display text.
- **Color**: CSS variables. Dominant colors with sharp accents beat timid, evenly spread palettes. No purple gradients on white.
- **Motion**: CSS-only. One orchestrated page load with staggered reveals (`animation-delay`) beats scattered micro-interactions. Add hover states.
- **Layout**: asymmetry, overlap, grid-breaking elements, generous negative space or controlled density.
- **Depth**: gradient meshes, noise, layered transparencies, dramatic shadows. No flat solid backgrounds by default.

Do not converge on the same font or layout across generations.
