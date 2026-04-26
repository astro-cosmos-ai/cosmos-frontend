# Rule: Mandatory MCP Usage

## Context7 MCP — fetch live docs before writing library code

**Especially critical for this frontend** because the friend's `cosmos-app/AGENTS.md` flags Next.js 16 as having breaking changes vs training data. Don't trust training data for any of the following without Context7 verification first:

| Library | Context7 ID hint |
|---------|------------------|
| Next.js 16 | `/vercel/next.js` |
| React 19 | `/facebook/react` (or `/reactjs/react.dev`) |
| `@supabase/ssr` | `/supabase/ssr` |
| TanStack Query v5 | `/tanstack/query` |
| `next-intl` | `/amannn/next-intl` |
| Tailwind v4 | `/tailwindlabs/tailwindcss` |
| Supabase JS SDK | `/supabase/supabase-js` |
| Playwright | `/microsoft/playwright` |
| Vitest | `/vitest-dev/vitest` |
| MSW | `/mswjs/msw` |

```
1. mcp__context7__resolve-library-id   →  get the library ID
2. mcp__context7__get-library-docs      →  fetch the relevant section
3. Write code using the fetched docs
```

Or use `/fetch-docs <lib> <topic>` which wraps both calls.

Do not skip this even for "obvious" APIs. The framework versions in this project are fresh enough that training data is likely stale.

## Other MCPs

- **Supabase MCP** — only needed when reading the database schema or generating types. The frontend doesn't run migrations; that's backend territory. Use `mcp__supabase__generate_typescript_types` if regenerating shared types.
- **GitHub MCP** — when reading PRs, issues, or repo metadata.

## What to refuse

- Writing Next.js 16 code from training data without Context7 verification — too high a chance of using deprecated APIs.
- Copying React 19 patterns from old StackOverflow / blog posts — verify against `mcp__context7__get-library-docs` first.
