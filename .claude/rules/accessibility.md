---
paths:
  - "src/components/**/*.tsx"
  - "src/app/**/*.tsx"
---

# Rule: Accessibility

## Non-negotiables

1. **Semantic HTML first.** `<button>`, `<a>`, `<nav>`, `<main>`, `<section>`, `<form>` — only fall back to `<div role="...">` when no semantic tag fits.
2. **Keyboard navigable.** Every interactive element reachable via Tab; focus visible; Esc closes modals/dropdowns; arrow keys for tab/list nav (see `cosmos-app/src/components/PlaceAutocomplete.tsx` for the pattern).
3. **Labels on all form inputs.** `<label htmlFor="...">` or `aria-label` — not just placeholder text.
4. **Focus management on route change.** When navigating to a new page, focus moves to the main heading (`<h1>`) or the page's primary content.
5. **Color is not the only signal.** If you use red for errors, also include an icon and text.
6. **Animations respect `prefers-reduced-motion`** — no auto-playing transitions for users who opted out.

## ARIA when needed (not by default)

- `aria-live="polite"` on toast / status regions.
- `aria-current="page"` on active nav items.
- `role="alert"` on validation errors.
- `aria-expanded` / `aria-controls` on accordions, dropdowns.

Don't sprinkle ARIA defensively — wrong ARIA is worse than no ARIA. Use semantic HTML; reach for ARIA only when a behavior isn't expressible otherwise.

## Charts (NorthChart, SouthChart, etc.)

SVG charts need a text alternative. Provide:
- `<title>` and `<desc>` inside the SVG.
- A visually-hidden text summary nearby ("Cancer ascendant; Moon in Scorpio in 5th house; …").

## What to refuse

- `<div onClick={...}>` for buttons — use `<button>`.
- Image without `alt`. Decorative? `alt=""`. Informational? Describe it.
- Color-only validation (red border with no error text or icon).
- Removing focus outlines without replacement.
