---
description: Scaffold a new React component under src/components/<name>.tsx. Delegates to component-author + i18n-author.
argument-hint: <ComponentName> [purpose]
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Agent
model: inherit
---

Scaffold a new component: **src/components/$1.tsx**
Purpose: $2

Steps:

1. Check it doesn't exist:
   ```
   !test -f src/components/$1.tsx && echo "EXISTS — open in editor instead" || echo "ok"
   ```

2. Look for similar reference patterns in `cosmos-app/src/components/`:
   ```
   !ls ../cosmos-app/src/components/ 2>/dev/null
   ```
   (cosmos-app is the friend's prototype — read freely, never edit.)

3. Delegate to `component-author` subagent with:
   - Name: `$1`
   - Purpose: `$2`
   - Reference component (if any from cosmos-app): identify by reading
   - Whether `'use client'` is needed (default: only if interactive)

4. If the component needs translated strings, delegate to `i18n-author` to add the keys to all three locale files.

5. Verify:
   ```
   !test -f src/components/$1.tsx && echo "component created"
   !grep -c "useTranslations\|getTranslations" src/components/$1.tsx
   ```

6. Recommend a Vitest unit test (delegate to `test-author` if user accepts).

Report the file path and any new i18n keys added.
