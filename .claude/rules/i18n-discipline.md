---
paths:
  - "src/**/*.tsx"
  - "messages/**/*.json"
  - "src/i18n/**"
---

# Rule: i18n discipline (next-intl)

**Locales:** `en` (default), `hi`, `te`. Configured in `src/i18n/routing.ts`.

## Hard rules

1. **Every user-facing string goes through `useTranslations(namespace)`.** No exceptions for "it's just a label" or "I'll translate it later."
2. **All three locale files stay in sync.** Adding a key to `messages/en.json` without adding it to `hi.json` and `te.json` is a bug. The `i18n-author` subagent enforces this.
3. **Canonical English keys for Vedic terms.** Sun = `"sun"`, Ashwini = `"ashwini"`, Cancer = `"cancer"`. The Sanskrit/Hindi rendering happens via translation, not by hardcoding the Devanagari in code.
4. **Namespace per page or section.** `nav`, `form`, `overview`, `planets`, `signs`, `nakshatras`, `common`. Don't dump everything in one namespace.

## Pattern

```tsx
'use client';
import { useTranslations } from 'next-intl';

export function PlanetCard({ name }: { name: string }) {
  const t = useTranslations('planets');
  return <h3>{t(name)}</h3>;  // t('sun'), t('moon'), etc.
}
```

For server components:

```tsx
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('overview');
  return <h1>{t('title')}</h1>;
}
```

## Adding a new locale

Use `/add-locale <code>` — copies en.json → new locale file with all keys flagged for translation, updates `src/i18n/routing.ts`.

## What to refuse

- String literals in JSX user-visible positions: `<button>Submit</button>` → must be `t('submit')`.
- Translation keys with English fallback hardcoded in the component.
- Adding a key to one locale file without updating all three.
