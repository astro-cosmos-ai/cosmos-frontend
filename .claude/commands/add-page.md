---
description: Scaffold a new Next.js 16 page under src/app/[locale]/<route>/. Delegates to page-author + i18n-author.
argument-hint: <route> (e.g. "chart/[chartId]/transits")
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Agent
model: inherit
---

Scaffold a new page at: **src/app/[locale]/$1/page.tsx**

Steps:

1. Confirm the route doesn't already exist:
   ```
   !ls src/app/[locale]/$1/ 2>/dev/null && echo "EXISTS" || echo "ok, new route"
   ```

2. Decide auth:
   - Public (sign-in, sign-up, marketing)? Skip session check.
   - Protected (chart, analyses, etc.)? Server component reads session and redirects to `/{locale}/sign-in` if missing.

3. Decide data source:
   - Static? No data fetching, no React Query.
   - Backend-backed? Identify which `src/lib/query/` hook(s) it needs. If a hook is missing, delegate to `client-state-author` first to add it.

4. Delegate to `page-author` subagent. Brief it with:
   - Route: `$1`
   - Auth requirement: (public / protected)
   - i18n namespace: (suggest a name based on the route — e.g. `transits` for `chart/[id]/transits`)
   - Data hooks needed: (list them, or "none")

5. Delegate to `i18n-author` subagent to add the namespace + initial keys to `messages/{en,hi,te}.json`. Flag with `[NEEDS TRANSLATION]` for hi/te.

6. Verify:
   ```
   !test -f src/app/[locale]/$1/page.tsx && echo "page created"
   !grep -l "$1" messages/en.json messages/hi.json messages/te.json 2>/dev/null
   ```

7. Recommend a Playwright happy-path test (delegate to `test-author` if user accepts).

Report the files changed and the route URL: `http://localhost:3000/en/$1`.
