# Plan: cosmos-frontend `.claude/` setup

**Status:** in progress
**Target repo:** `cosmos-frontend/` (where new code lives)
**Reference repo:** `cosmos-app/` (read-only — look here for examples of pages, components, sweph logic, i18n setup; do NOT edit)
**Backend integration target:** `cosmos-backend/` via REST/SSE per `cosmos-backend/docs/api-reference.md` (18 endpoints, JWT-auth'd)
**Mirrors:** `cosmos-backend/.claude/` conventions, adapted for Next.js 16 / React 19 / TypeScript / Tailwind v4 / next-intl

---

## Context

- `cosmos-frontend/` was an empty placeholder. This is where the production frontend will be built.
- `cosmos-app/` is a friend's prototype: a standalone Next.js calculator using local sweph + sessionStorage. **Use it as a reference for component patterns, i18n setup, theme tokens, and chart rendering — but do not call its endpoints or import its code directly.** The new frontend will be backend-integrated.
- Stack target for `cosmos-frontend/`: same as `cosmos-app/` (Next.js 16, React 19, TS, Tailwind v4, next-intl) — pick those because the reference code is in that stack and the friend's `cosmos-app/AGENTS.md` warns Next 16 has breaking changes vs training data.
- The setup below guides every subagent to produce backend-integrated code from day one — no local sweph in cosmos-frontend.

## Reference rules (how subagents should treat cosmos-app)

- **Read freely:** `cosmos-app/src/components/**`, `cosmos-app/src/app/**`, `cosmos-app/messages/**`, `cosmos-app/src/i18n/**`, `cosmos-app/src/lib/swiss.ts` (for the data shapes only — don't port the math).
- **Do not edit anything in `cosmos-app/`** — that's the friend's repo, read-only.
- **Port patterns, not files.** When a cosmos-frontend component is similar to a cosmos-app one, write it fresh adapted to backend integration. Don't `cp` files across.
- **Backend is the source of truth for chart data.** cosmos-app computes locally; cosmos-frontend never does.

## Stack target (greenfield — to be installed)

cosmos-frontend starts empty. Target stack matches cosmos-app for compatibility but is configured for backend-first from day one:

| Concern | Choice | Notes |
|---------|--------|-------|
| Routing | Next.js 16 App Router | Same major as cosmos-app — Next 16 has breaking changes vs training data, Context7 mandatory |
| Language | TypeScript 5+ | strict mode |
| Styling | Tailwind v4 | port theme tokens from cosmos-app (`--bg`, `--ink`, `--accent`, `--planet-*`) |
| i18n | next-intl | start with en/hi/te, port message keys from cosmos-app |
| Auth | Supabase Auth (`@supabase/ssr`) | per backend api-reference.md JWT contract |
| Server state | TanStack Query (React Query) v5 | cache layer for backend responses |
| Client state | useState / Zustand | Zustand only when React Query isn't enough |
| Backend integration | Wrapped fetch client at `src/lib/api/` | Single source of base URL + auth header injection |
| SSE | Custom consumer at `src/lib/api/chat-stream.ts` | for `POST /chat` per api-reference.md |
| Tests | Playwright (E2E) + Vitest (unit) | MSW for backend mocking |

## File layout to build

```
cosmos-frontend/
├── CLAUDE.md                          # backend-frontend orientation + @AGENTS.md import
├── AGENTS.md                          # Next.js 16 warning (mirror of friend's, expanded with cosmos-frontend specifics)
├── docs/
│   └── plans/
│       └── claude-setup.md            # this file
└── .claude/
    ├── settings.json                  # hooks + permissions
    ├── agents/                        # subagents (10)
    │   ├── page-author.md
    │   ├── component-author.md
    │   ├── api-client-author.md
    │   ├── auth-wirer.md
    │   ├── i18n-author.md
    │   ├── client-state-author.md
    │   ├── code-reviewer.md
    │   ├── test-author.md
    │   ├── debugger.md
    │   └── planner.md
    ├── commands/                      # slash commands (7)
    │   ├── add-page.md
    │   ├── add-component.md
    │   ├── add-locale.md
    │   ├── wire-endpoint.md
    │   ├── run-frontend.md
    │   ├── fetch-docs.md
    │   └── check-frontend.md
    ├── rules/                         # rules (10)
    │   ├── next-app-router.md
    │   ├── tailwind-tokens.md
    │   ├── i18n-discipline.md
    │   ├── backend-integration.md
    │   ├── auth.md
    │   ├── state.md
    │   ├── accessibility.md
    │   ├── testing.md
    │   ├── skills-and-subagents.md
    │   └── mcp-usage.md
    └── scripts/                       # hook scripts (2)
        ├── stop-nudge.sh
        └── npm-failure-hint.sh
```

---

## Subagents (10)

Each carries the relevant skills via `skills:` frontmatter so they auto-load when delegated.

### Building lanes (write code)

| Subagent | Owns | Skills auto-loaded |
|----------|------|--------------------|
| `page-author` | `src/app/[locale]/**/page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts` | `react-best-practices`, `context7-mcp` |
| `component-author` | `src/components/**` | `react-best-practices`, `composition-patterns`, `frontend-design`, `context7-mcp` |
| `api-client-author` | `src/lib/api/**` (wrapped fetch client, SSE consumer, type-generated request/response) | `context7-mcp` |
| `auth-wirer` | Supabase Auth integration: `src/lib/supabase/`, `src/proxy.ts`, sign-in pages | `context7-mcp` |
| `i18n-author` | `messages/*.json`, `src/i18n/`, anything with `useTranslations` | `context7-mcp` |
| `client-state-author` | React Query / Zustand wiring (when added): `src/lib/query/`, providers | `react-best-practices`, `context7-mcp` |

### Verifying / planning lanes

| Subagent | Owns | Skills auto-loaded |
|----------|------|--------------------|
| `code-reviewer` | Read-only review against frontend invariants | `web-design-guidelines`, `superpowers:receiving-code-review` |
| `test-author` | Playwright E2E + Vitest unit | `webapp-testing`, `superpowers:test-driven-development`, `superpowers:verification-before-completion` |
| `debugger` | Build errors, hydration mismatches, runtime issues | `superpowers:systematic-debugging`, `context7-mcp` |
| `planner` | Multi-layer feature plan | `superpowers:writing-plans`, `superpowers:dispatching-parallel-agents` |

### Why these specific lanes

- **page-author vs component-author**: pages are server components by default in App Router; components are usually leaf-level and often `'use client'`. Different rules apply (data fetching pattern, async/await, params/searchParams shape in Next 16). Splitting the lanes lets each subagent stay focused.
- **api-client-author**: the *only* place that knows backend URLs, JWT headers, SSE parsing. Pages and components import from this module — no bare `fetch()` calls scattered around.
- **auth-wirer**: Supabase Auth is non-trivial in App Router (server-side session, middleware refresh, RSC vs client component split). Needs its own focused subagent.
- **i18n-author**: every user-facing string must go through `useTranslations`. A dedicated subagent enforces that and keeps the 3 locale files in sync.

---

## Slash commands (7)

| Command | Purpose |
|---------|---------|
| `/add-page <route>` | Scaffold `src/app/[locale]/<route>/page.tsx` + optional `layout.tsx`/`loading.tsx`. Delegates to `page-author`. |
| `/add-component <name>` | Scaffold `src/components/<name>.tsx` with the project's component pattern. Delegates to `component-author`. |
| `/add-locale <code>` | Add a new locale (e.g. `ta`): copy `messages/en.json` → `messages/<code>.json`, update `src/i18n/routing.ts`, list all keys for translation. Delegates to `i18n-author`. |
| `/wire-endpoint <verb> <path>` | Generate a typed client function for a backend endpoint (e.g. `/wire-endpoint GET /api/charts/{id}/transits`). Delegates to `api-client-author`. |
| `/run-frontend` | Env preflight + `npm run dev`. |
| `/fetch-docs <lib> <topic>` | Context7 wrapper. **Especially important here because the friend's AGENTS.md flags Next.js 16 as breaking.** |
| `/check-frontend` | Invariants audit: no bare `fetch()` outside `lib/api/`, every user-facing string uses `useTranslations`, no inline SVGs > 100 lines, every `'use client'` is justified, etc. |

---

## Rules (10)

Loaded at session start. Several use `paths:` frontmatter to scope to specific directories.

| Rule | Scope (`paths:`) | Content |
|------|------------------|---------|
| `next-app-router.md` | `src/app/**` | Server vs client component split, params/searchParams as Promise in Next 16, layout caching, route handler conventions |
| `tailwind-tokens.md` | `src/**/*.{tsx,css}` | Theme CSS custom props (the friend's `--bg`, `--ink`, `--accent`, `--planet-*`); never hardcode colors; light/dark via theme switcher |
| `i18n-discipline.md` | `src/**/*.tsx` | Every user-facing string goes through `useTranslations(namespace)`; canonical keys for Vedic terms (sun, ashwini); 3 locale files must stay in sync |
| `backend-integration.md` | `src/lib/api/**`, `src/app/api/**` | Base URL from env; JWT from Supabase session; SSE consumer pattern; never compute astrology client-side once backend is wired |
| `auth.md` | `src/proxy.ts`, `src/lib/supabase/**` | Supabase Auth flow; middleware refresh; never store tokens in localStorage manually; RSC session reading |
| `state.md` | `src/**/*.tsx` | React Query for server state; useState for component-local; Zustand only with justification; no Redux |
| `accessibility.md` | `src/components/**` | Keyboard nav, ARIA roles, focus management, semantic HTML; check with `web-design-guidelines` skill |
| `testing.md` | `tests/**`, `src/**/*.test.tsx` | Playwright for E2E happy paths; Vitest for component logic; no live backend in tests (use MSW or fixture responses) |
| `skills-and-subagents.md` | (always loaded) | Lane → subagent routing table, skill inventory |
| `mcp-usage.md` | (always loaded) | Context7 MCP **mandatory** for Next.js 16, React 19, next-intl, Supabase JS SDK, TanStack Query (when added), Tailwind v4 |

---

## Hooks

### SessionStart
Load conventions cheatsheet + remind: "Next.js 16 = breaking changes vs training data, use Context7 MCP."

### UserPromptSubmit
Keyword routing for frontend lanes:
- `page|route|layout|server component|client component` → page-author
- `component|button|card|chart` → component-author
- `auth|sign in|sign up|supabase` → auth-wirer
- `i18n|locale|translation|message` → i18n-author
- `endpoint|api|backend|fetch` → api-client-author
- `react query|tanstack|zustand|state` → client-state-author
- `tailwind|theme|color|css` → component-author + tailwind-tokens rule
- `playwright|test|vitest` → test-author
- `bug|error|hydration|build fail` → debugger
- `plan|design|architect` → planner

### PreToolUse
- **Bash**: deny destructive commands (rm -rf, git push --force, etc.)
- **Write|Edit**: path-aware nudges for `src/app/`, `src/components/`, `src/lib/api/`, `messages/`, `src/proxy.ts`

### PostToolUse
- After editing `messages/en.json` → remind: "Sync the new keys to hi.json and te.json (or delegate to i18n-author)."
- After editing `src/lib/api/` → remind: "Regenerate types from `docs/api-reference.md` if shape changed."
- After editing `package.json` → remind: "Run `npm install` and Context7 the new lib before using it."

### PostToolUseFailure (Bash)
- `npm run dev` failed → check port 3000, .env.local present, node 20+
- `npm run build` failed → check tsc errors, missing env vars
- `npx playwright test` failed → check that backend is running, test fixtures fresh

### Stop
- Uncommitted TS changes + tests/ exists → "consider `npx vitest run` or delegate to test-author"
- Migration changes pending in package.json — "did you `npm install`?"

---

## Skill inventory (frontend-relevant)

Wired into subagents via `skills:` frontmatter. Auto-loads when delegated.

| Skill | Subagents |
|-------|-----------|
| `react-best-practices` | page-author, component-author, client-state-author, code-reviewer |
| `composition-patterns` | component-author, code-reviewer |
| `frontend-design` | component-author |
| `web-design-guidelines` | code-reviewer |
| `webapp-testing` | test-author |
| `context7-mcp` | page-author, component-author, api-client-author, auth-wirer, i18n-author, client-state-author, debugger |
| `react-view-transitions` | (invoke on demand if doing page transitions) |
| `gsap-react`, `gsap-core`, `gsap-scrolltrigger` | (invoke on demand if adding GSAP animations) |
| `superpowers:test-driven-development` | test-author |
| `superpowers:verification-before-completion` | test-author |
| `superpowers:systematic-debugging` | debugger |
| `superpowers:writing-plans` | planner |
| `superpowers:dispatching-parallel-agents` | planner |
| `superpowers:receiving-code-review` | code-reviewer |

---

## Open questions (defaults applied during implementation)

User confirmed defaults via "implement the changes" instruction:
1. ✅ cosmos-frontend is the target (cosmos-app stays as read-only reference)
2. ✅ AGENTS.md + CLAUDE.md both kept; CLAUDE.md imports AGENTS.md via `@AGENTS.md`
3. ✅ Playwright + Vitest test stack
4. ✅ React Query (TanStack Query) for server state
5. ✅ Supabase Auth (`@supabase/ssr` for App Router)
6. ✅ Backend integration plan deferred — this setup creates the lanes; the actual scaffold is a separate effort

---

## Implementation order (when approved)

1. **`cosmos-frontend/` cleanup** — delete the empty placeholder folder.
2. **CLAUDE.md** — at `cosmos-app/CLAUDE.md` (replacing the current one-liner). Include `@AGENTS.md` import + the orientation block.
3. **Rules** — write the 10 rule files first; they're the foundation.
4. **Subagents** — write the 10 subagent files.
5. **Commands** — write the 7 slash commands.
6. **Hook scripts** — `scripts/stop-nudge.sh` + `scripts/npm-failure-hint.sh`.
7. **settings.json** — wire all hooks + permissions.
8. **Smoke test** — validate JSON, run a sample SessionStart hook to verify the cheatsheet appears.

Estimated file count: 1 (CLAUDE.md replace) + 10 rules + 10 subagents + 7 commands + 2 scripts + 1 settings.json = **31 files**.

---

## What this setup explicitly does NOT do

- It does not migrate cosmos-app from local sweph to cosmos-backend. That's a separate plan (recommended: `docs/plans/backend-integration.md`).
- It does not add Supabase Auth, React Query, or Playwright. Those are implementation work; this setup just creates the lanes that will guide them when added.
- It does not touch the existing source code. Only `.claude/` config + `CLAUDE.md` + `docs/plans/`.
- It does not rewrite `AGENTS.md` (the friend's Next.js 16 warning stays).
