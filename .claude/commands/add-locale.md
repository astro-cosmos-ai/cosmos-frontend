---
description: Add a new i18n locale — copies en.json, prefixes values with [NEEDS TRANSLATION], updates routing.ts. Delegates to i18n-author.
argument-hint: <locale-code> (e.g. "ta" for Tamil, "kn" for Kannada)
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Agent
model: inherit
---

Add locale **$1** to cosmos-frontend.

Steps (delegate to `i18n-author` subagent):

1. Confirm locale doesn't exist:
   ```
   !test -f messages/$1.json && echo "EXISTS" || echo "ok, new locale"
   ```

2. Copy `messages/en.json` → `messages/$1.json`, prefixing every value with `[NEEDS TRANSLATION] `:
   ```
   !node -e "
     const fs = require('fs');
     const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
     function prefix(o) {
       if (typeof o === 'string') return '[NEEDS TRANSLATION] ' + o;
       if (Array.isArray(o)) return o.map(prefix);
       if (o && typeof o === 'object') return Object.fromEntries(Object.entries(o).map(([k,v]) => [k, prefix(v)]));
       return o;
     }
     fs.writeFileSync('messages/$1.json', JSON.stringify(prefix(en), null, 2) + '\n');
   "
   ```

3. Update `src/i18n/routing.ts` — add `'$1'` to the `locales` array.

4. Check the `LocaleSwitcher` component (likely in `src/components/Nav.tsx` or similar) — if it has a hardcoded locale list, add `$1` there too.

5. Verify middleware matcher still matches the new locale (it usually does via the regex).

6. Print the count of strings needing translation:
   ```
   !grep -c "NEEDS TRANSLATION" messages/$1.json
   ```

Report:
- File created: `messages/$1.json`
- Routing updated: `src/i18n/routing.ts`
- LocaleSwitcher updated: yes/no
- Strings to translate: <count>
- URL: `http://localhost:3000/$1/` will now resolve.
