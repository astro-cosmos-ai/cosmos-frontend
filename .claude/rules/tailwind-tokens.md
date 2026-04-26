---
paths:
  - "src/**/*.tsx"
  - "src/**/*.css"
---

# Rule: Tailwind v4 + theme tokens

**Reference:** `cosmos-app/src/app/globals.css` and `cosmos-app/src/components/ThemeSwitcher.tsx` for the canonical theme token set.

## Theme tokens (CSS custom properties)

Use semantic tokens, not raw colors. Defined in `globals.css`:

| Token | Purpose |
|-------|---------|
| `--bg`, `--bg-elev`, `--bg-card` | Background layers (page → elevated → card) |
| `--ink`, `--ink-muted` | Text colors |
| `--border`, `--border-subtle` | Borders / dividers |
| `--accent`, `--accent-fg` | Brand accent |
| `--planet-sun`, `--planet-moon`, `--planet-mars`, `--planet-mercury`, `--planet-jupiter`, `--planet-venus`, `--planet-saturn`, `--planet-rahu`, `--planet-ketu` | Per-planet colors (chart rendering) |

In Tailwind v4, reference these directly: `bg-[--bg]`, `text-[--ink]`, `border-[--border]`. Or define utility wrappers in `globals.css` `@theme` block.

## Light / dark mode

ThemeSwitcher toggles a `data-theme="dark"` attribute on `<html>`. CSS custom props redefine themselves under `[data-theme="dark"]`. **Don't write `dark:` Tailwind variants** — the token system handles it.

## What to refuse

- Hardcoded hex colors in components — use a token. If the token doesn't exist for what you need, add it to `globals.css` and document.
- Inline `style={{ color: '#fff' }}` for theming — defeats the token system.
- `dark:` variants — use the data-attribute + token approach instead.

## When to deviate

Charts (`NorthChart`, `SouthChart`) use planet-specific colors directly via `--planet-*` tokens. That's correct — those colors are semantic (planet identity), not theme.
