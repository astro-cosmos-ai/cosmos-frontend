# Frontend agent rules

## This is NOT the Next.js you know

Next.js 16 has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (after `npm install`) or fetch live docs via Context7 MCP **before writing any code**. Heed deprecation notices.

Specifically suspicious areas where training data is likely stale:
- `params` and `searchParams` in dynamic routes are now `Promise<...>` — must `await` them.
- Route handler signatures.
- Caching defaults (segments, fetch, `cache()` semantics).
- Server vs client component boundaries with the new compiler.

If the code you're about to write touches any of those, **fetch docs first**.

## This frontend talks to a backend

`cosmos-backend/` is the source of truth for chart data. This frontend never computes astrology client-side. See `cosmos-backend/docs/api-reference.md` for the 18 endpoints, and `.claude/rules/backend-integration.md` for how to call them.

`cosmos-app/` (sibling repo) is a read-only reference — a friend's prototype that does compute locally. Use it for component patterns, theme tokens, and i18n examples, but **do not edit it and do not import from it**.
