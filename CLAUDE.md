@AGENTS.md

# cosmos-frontend — Quick Orientation

Loaded **on top of** `cosmos/CLAUDE.md` (parent monorepo file). This is frontend-only context.

## ABSOLUTE RULE — No inline code in protected lanes

**You MUST spawn the correct subagent before writing any code in these paths:**

| Path | Required subagent |
|------|------------------|
| `src/app/**` (pages, layouts, route handlers) | `page-author` |
| `src/components/**` | `component-author` |
| `src/lib/api/**` (backend client, SSE, types) | `api-client-author` |
| `src/lib/supabase/**`, `src/proxy.ts` | `auth-wirer` |
| `messages/**`, `src/i18n/**` | `i18n-author` |
| `src/lib/query/**`, query/mutation hooks | `client-state-author` |

The PreToolUse hook will surface a reminder when you try to edit these inline. Don't override it — spawn the subagent.

---

## Reference vs target

- **Target (where you write):** `cosmos-frontend/`
- **Reference (read freely, never edit):** `cosmos-app/` — a friend's prototype with similar stack. Look at it for component patterns, theme tokens, i18n setup.
- **Backend (what you call):** `cosmos-backend/` via REST/SSE per `cosmos-backend/docs/api-reference.md`.

## Lane → tool quick lookup

| Editing… | Delegate to | Or run |
|----------|-------------|--------|
| `src/app/**` | `page-author` | `/add-page <route>` |
| `src/components/**` | `component-author` | `/add-component <name>` |
| Backend client / endpoint wiring | `api-client-author` | `/wire-endpoint <verb> <path>` |
| Supabase Auth integration | `auth-wirer` | — |
| i18n keys / new locale | `i18n-author` | `/add-locale <code>` |
| Server-state hooks (React Query) | `client-state-author` | — |
| Reviewing your changes | `code-reviewer` | — |
| Tests (Playwright / Vitest) | `test-author` | — |
| Bug / hydration / build failure | `debugger` | — |
| Cross-layer feature plan | `planner` | — |

## Slash commands

`/add-page`, `/add-component`, `/add-locale`, `/wire-endpoint`, `/run-frontend`, `/fetch-docs <lib> <topic>`, `/check-frontend` — see `.claude/commands/`.

## Skills auto-loaded into subagents

| Subagent | Skills |
|----------|--------|
| `page-author` | `react-best-practices`, `context7-mcp` |
| `component-author` | `react-best-practices`, `composition-patterns`, `frontend-design`, `context7-mcp` |
| `api-client-author` | `context7-mcp` |
| `auth-wirer` | `context7-mcp` |
| `i18n-author` | `context7-mcp` |
| `client-state-author` | `react-best-practices`, `context7-mcp` |
| `code-reviewer` | `web-design-guidelines`, `superpowers:receiving-code-review` |
| `test-author` | `webapp-testing`, `superpowers:test-driven-development`, `superpowers:verification-before-completion` |
| `debugger` | `superpowers:systematic-debugging`, `context7-mcp` |
| `planner` | `superpowers:writing-plans`, `superpowers:dispatching-parallel-agents` |

## Run / dev / test

```bash
npm install                         # install deps (when package.json exists)
npm run dev                         # dev server (or: /run-frontend)
npm run build                       # production build
npx vitest run                      # unit tests
npx playwright test                 # E2E tests
```

Dev server: `http://localhost:3000`. Backend dev: `http://localhost:8000` (from `cosmos-backend/`).

## Hard checks before declaring done

1. `npm run build` succeeds (catches type errors and Next 16 deprecations).
2. If you touched `src/lib/api/**` → at least one Vitest unit covering the new client function.
3. If you touched a page → at least one Playwright happy-path test.
4. If you added i18n keys → all locales (en/hi/te) updated.
5. The Stop hook will remind you about uncommitted changes and unrun tests automatically.

## Environment variables (frontend)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_BACKEND_URL          # e.g. http://localhost:8000
```

`NEXT_PUBLIC_*` vars are exposed to the browser — never put secrets there. The Supabase service-role key stays in `cosmos-backend/.env` only.

## What's intentionally NOT here

- Next 16 deprecation warning — see `AGENTS.md` (loaded via `@AGENTS.md` import above).
- Hard rules — see `.claude/rules/` (path-scoped, split by topic).
- Backend API surface — see `cosmos-backend/docs/api-reference.md`.
- Reference patterns — read `cosmos-app/` directly when needed.
