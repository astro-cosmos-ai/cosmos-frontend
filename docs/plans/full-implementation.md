# Plan: cosmos-frontend full implementation

**Status:** scaffold done, implementation not started
**Estimated effort:** 4–7 days of focused work, depending on how many of the 18 backend endpoints you wire
**Reference repo:** `cosmos-app/` (read-only — port patterns, never copy files)
**Backend contract:** `cosmos-backend/docs/api-reference.md`

---

## What's already done (don't redo)

✅ Next.js 16.2.4 scaffolded with App Router, TypeScript, Tailwind v4, ESLint, src/ dir, `@/*` import alias
✅ Runtime deps installed: `next-intl`, `@supabase/ssr`, `@supabase/supabase-js`, `@tanstack/react-query`
✅ Dev deps installed: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`, `@vitejs/plugin-react`, `msw`
✅ Scripts: `npm run dev | build | start | lint | test | test:watch`
✅ `.claude/` setup: 10 subagents, 7 commands, 10 rules, hooks, settings.json
✅ TypeScript typecheck passes on the bare scaffold

## What's NOT done (this plan)

❌ Theme tokens, fonts
❌ next-intl wiring (no locales, no routing, no middleware)
❌ Supabase Auth (no clients, no middleware, no sign-in pages)
❌ React Query provider
❌ API client (`src/lib/api/`)
❌ Query hooks (`src/lib/query/`)
❌ All 18 backend integrations
❌ Component port from cosmos-app (NorthChart, SouthChart, DatePicker, etc.)
❌ Pages beyond the bare `/page.tsx`
❌ Tests (Vitest unit, Playwright E2E)
❌ MSW handlers
❌ Playwright install (browsers not downloaded)
❌ `.env.example` and `.env.local`

---

## Implementation order

Bottom-up. Each step has a subagent owner so you don't have to think about delegation.

### Phase 0 — Project foundation (1–2 hours)

**0.1. `.env.example` + `.env.local`**

Create `cosmos-frontend/.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```
Then `cp .env.example .env.local` and fill in real values.

**0.2. Theme tokens** — port from `cosmos-app/src/app/globals.css`
- Owner: `component-author`
- Read `cosmos-app/src/app/globals.css` for the canonical CSS custom property set (`--bg`, `--ink`, `--accent`, `--planet-*`, light/dark via `data-theme`).
- Adapt into `cosmos-frontend/src/app/globals.css`.

**0.3. Vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
```

Create `tests/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
```

Run `npm test -- --run` — should pass with zero tests.

**0.4. MSW init**

```bash
npx msw init public/ --save
```

Create `tests/msw/handlers.ts` (initially empty array `export const handlers = []`) and `tests/msw/server.ts` (`setupServer(...handlers)` from `msw/node`).

---

### Phase 1 — i18n foundation (2–3 hours)

Owner: `i18n-author`. Reference: `cosmos-app/messages/`, `cosmos-app/src/i18n/routing.ts`, `cosmos-app/src/proxy.ts`.

**1.1. Routing config**

`src/i18n/routing.ts`:
```ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'hi', 'te'],
  defaultLocale: 'en',
  localePrefix: 'always',
});
```

Plus `src/i18n/navigation.ts` and `src/i18n/request.ts` per next-intl v4 docs (Context7 first).

**1.2. Move app router under `[locale]`**

```bash
mkdir -p src/app/[locale]
git mv src/app/page.tsx src/app/[locale]/page.tsx
git mv src/app/layout.tsx src/app/[locale]/layout.tsx
```

Update `[locale]/layout.tsx` to wrap with `NextIntlClientProvider` and validate the locale.

**1.3. Locale files**

Port the 50-key set from `cosmos-app/messages/en.json`, `hi.json`, `te.json` into `cosmos-frontend/messages/`. Trim or expand as cosmos-frontend's needs evolve.

**1.4. Middleware (initial — i18n only)**

`src/proxy.ts`:
```ts
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
```
(Auth gets layered into this in Phase 2.)

**1.5. Verify**

```bash
npm run dev
```
Visit `http://localhost:3000` — should redirect to `/en`. Switching to `/hi` or `/te` shows the same page (translations not yet rendered, but routing works).

---

### Phase 2 — Supabase Auth (3–5 hours)

Owner: `auth-wirer`. Context7 `@supabase/ssr` BEFORE writing.

**2.1. Three Supabase clients**

```
src/lib/supabase/
├── browser.ts      # createBrowserClient
├── server.ts       # createServerClient (RSC + server actions)
└── middleware.ts   # createServerClient (middleware) + updateSession helper
```

**2.2. Compose middleware**

Update `src/proxy.ts` to chain Supabase session refresh + next-intl. The pattern depends on `@supabase/ssr` version — Context7 first.

**2.3. Auth pages**

```
src/app/[locale]/(auth)/
├── sign-in/page.tsx       # email + password form
├── sign-up/page.tsx       # email + password + confirm
├── callback/route.ts      # OAuth/magic-link callback handler
└── layout.tsx             # auth-shell layout (no nav)
```

Owner: `page-author` (with `auth-wirer` for the sign-in form details).

**2.4. Auth-aware layout**

Add a `useSession` hook (`src/lib/supabase/use-session.ts`) for client components and `getSession` helper for server components. Show signed-in state in the nav.

**2.5. Protected route pattern**

In any `src/app/[locale]/chart/...` page, the server component reads the session and redirects to `/{locale}/sign-in` if missing. Document this pattern in `src/app/[locale]/chart/layout.tsx` (single layout-level guard).

**2.6. Tests**

- Vitest unit: `useSession` hook (mock the Supabase client).
- Playwright E2E (deferred until Phase 6, but plan for it): "user signs in and lands on /chart".

---

### Phase 3 — API client + React Query foundation (4–6 hours)

Owner: `api-client-author` for `src/lib/api/`, `client-state-author` for `src/lib/query/`.

**3.1. Backend types** — `src/lib/api/types.ts`

Hand-roll TS types from `cosmos-backend/docs/api-reference.md` example payloads. Don't invent fields the backend doesn't return.

```ts
export type ChartId = string;
export type Section = 'personality' | 'mind' | 'career' | 'skills' | 'wealth' | 'foreign'
  | 'romance' | 'marriage' | 'business' | 'property' | 'health' | 'education'
  | 'parents' | 'siblings' | 'children' | 'spirituality';

export interface CreateChartInput { /* per api-reference */ }
export interface Chart { /* per api-reference */ }
export interface AnalysisResult { /* per api-reference */ }
// ... 12 more
```

**3.2. Wrapped client** — `src/lib/api/client.ts`

Single `api<T>(path, init)` function. Reads token from Supabase via the appropriate flavor (browser vs server). Throws `ApiError(status, detail)` from `errors.ts`.

**3.3. Per-resource modules**

```
src/lib/api/
├── client.ts
├── errors.ts
├── types.ts
├── chart.ts          # createChart, fetchChart, loadChart
├── analyses.ts       # runAnalysis, listAnalyses
├── chat.ts           # fetchChatHistory
├── chat-stream.ts    # SSE async generator
├── transits.ts       # fetchTransits, fetchDoubleTransit, fetchSadeSati
├── timeline.ts       # fetchTimeline
├── muhurta.ts        # findMuhurta
├── prediction.ts     # predict
├── varshaphal.ts     # fetchVarshaphal
├── compatibility.ts  # computeCompatibility, fetchCompatibility
└── report.ts         # downloadReport (returns Blob)
```

Each module: 1–3 functions, fully typed.

**3.4. React Query provider** — `src/app/providers.tsx`

```tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
  }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

Wrap in `src/app/[locale]/layout.tsx`.

**3.5. Query hooks** — `src/lib/query/`

One file per resource, mirroring `src/lib/api/`:
```
src/lib/query/
├── chart.ts          # useChart, useCreateChart, useLoadChart
├── analyses.ts       # useAnalysis, useAnalyses, useRunAnalysis
├── chat.ts           # useChatHistory
├── transits.ts       # useTransits, useDoubleTransit, useSadeSati
├── timeline.ts       # useTimeline
├── muhurta.ts        # useFindMuhurta
├── prediction.ts     # usePredict
├── varshaphal.ts     # useVarshaphal
└── compatibility.ts  # useCompatibility, useComputeCompatibility
```

Use the `staleTime` table from `.claude/rules/state.md`.

**3.6. Vitest coverage**

For each `src/lib/api/*.ts`, write a Vitest unit with MSW mocking the endpoint. Use `tests/fixtures/sample-chart.json` etc. seeded from api-reference.md examples.

Owner for tests: `test-author`.

---

### Phase 4 — Component port (3–5 hours)

Owner: `component-author`. Read freely from `cosmos-app/src/components/`.

Port these in priority order:

| Component | cosmos-app source | Notes |
|-----------|-------------------|-------|
| `Nav` | `src/components/Nav.tsx` | Top bar, logo, locale switcher, theme switcher |
| `ThemeSwitcher` | `src/components/ThemeSwitcher.tsx` | data-theme toggle |
| `LocaleSwitcher` | (split out from Nav) | Standalone for reuse |
| `DatePicker` | `src/components/DatePicker.tsx` | Custom 3-mode |
| `TimePicker` | `src/components/TimePicker.tsx` | TOB input |
| `PlaceAutocomplete` | `src/components/PlaceAutocomplete.tsx` | Nominatim debounced; **swap to Mapbox or backend-side place search later** for production |
| `BirthForm` | (assembled from cosmos-app's home page) | Submits to `useCreateChart` mutation |
| `NorthChart` | `src/components/NorthChart.tsx` | SVG diamond |
| `SouthChart` | `src/components/SouthChart.tsx` | CSS Grid 4×4 |
| `PlanetCard` | (extract from planets page) | Per-planet detail tile |
| `DashaTimeline` | (new, but reference cosmos-app overview page) | Visualizes Vimshottari MD/AD/PD |

**Critical port-don't-copy reminder:** these components in cosmos-app receive data from `lib/swiss.ts` (locally computed). In cosmos-frontend they receive data from React Query hooks (`useChart`, `useTransits`, etc.). Adapt the prop types accordingly.

Each component gets a Vitest unit (delegate to `test-author`).

---

### Phase 5 — Pages (5–7 hours)

Owner: `page-author`. Use `/add-page` slash command for the scaffold.

Routes to build (rough order — each is its own task):

| Route | Backend dep | Notes |
|-------|-------------|-------|
| `/[locale]` | none | Marketing/landing or redirect to /chart if signed in |
| `/[locale]/sign-in` | Supabase Auth | Phase 2 already covered |
| `/[locale]/sign-up` | Supabase Auth | Phase 2 |
| `/[locale]/chart` | `useChart` (or `useCreateChart` if user has none) | Form to create OR overview if exists |
| `/[locale]/chart/birthchart` | `useChart` | Full chart view (NorthChart or SouthChart) |
| `/[locale]/chart/planets` | `useChart` | Tabbed 9-planet view |
| `/[locale]/chart/dasha` | `useTimeline` | Vimshottari timeline visualization |
| `/[locale]/chart/transits` | `useTransits` + `useLoadChart` (warmup) | Today's transit snapshot |
| `/[locale]/chart/sadesati` | `useSadeSati` | Saturn phase status |
| `/[locale]/chart/varshaphal` | `useVarshaphal` + `useLoadChart?year=N` | Year selector |
| `/[locale]/chart/analyses` | `useAnalyses` (list) | Tab strip with 16 sections |
| `/[locale]/chart/analyses/[section]` | `useRunAnalysis` | Single analysis content |
| `/[locale]/chart/chat` | `chatStream` (SSE) | Streaming chat UI |
| `/[locale]/chart/predict` | `usePredict` | Ask "when will I X" |
| `/[locale]/chart/muhurta` | `useFindMuhurta` | Auspicious date finder |
| `/[locale]/chart/compatibility` | `useComputeCompatibility` | Two-chart Ashtakoot |
| `/[locale]/chart/report` | `downloadReport` | Trigger PDF download |

Each route: page.tsx (server component) + any required client components + i18n keys + at least one Playwright happy path.

---

### Phase 6 — Testing (continuous + dedicated phase)

Owner: `test-author`.

**6.1. Vitest unit coverage**

Should already exist alongside each module from Phase 3 and Phase 4. Verify by running `npm test` — should be at least 30 unit tests covering api client, query hooks, and key components.

**6.2. Playwright install + setup**

```bash
npm install --save-dev @playwright/test
npx playwright install --with-deps
```

(Defer the browser download until you're ready — it's ~300 MB.)

`playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

Add to `package.json`:
```json
"test:e2e": "playwright test"
```

**6.3. Happy-path E2E tests**

Minimum coverage:
- Sign in → land on /chart
- Create chart from form → redirected to /chart with overview
- Run an analysis → content streams or appears
- Sign out → redirected to /

Use a seeded test user in Supabase (or stub auth at the network layer with a custom Playwright fixture).

---

### Phase 7 — Polish & deploy (2–3 hours)

**7.1. Accessibility audit**

`/check-frontend` slash command runs the heuristic checks. For deeper review, delegate to `code-reviewer` with the `web-design-guidelines` skill loaded.

**7.2. Lighthouse / Core Web Vitals**

Build prod (`npm run build && npm start`) and run Lighthouse. Target: Performance ≥ 90, Accessibility = 100, Best Practices ≥ 95.

**7.3. Vercel deploy**

Use the `deploy-to-vercel` skill (installed):
```bash
npx vercel
```

Set env vars in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_BACKEND_URL` (production backend URL)

Update Supabase Auth → Site URL and redirect URLs to include the Vercel domain.

**7.4. Backend CORS**

Add the Vercel domain to `CORS_ORIGINS` in cosmos-backend's `.env`.

---

## Subagent / command cheat sheet

When you pick up this plan, you don't have to remember which subagent owns what — just delegate by file path (the PreToolUse hook will remind you):

| File you're touching | Subagent / command |
|----------------------|--------------------|
| `src/app/**/page.tsx` | `page-author` or `/add-page` |
| `src/components/**` | `component-author` or `/add-component` |
| `src/lib/api/**` | `api-client-author` or `/wire-endpoint <verb> <path>` |
| `src/lib/supabase/**`, `src/proxy.ts` | `auth-wirer` |
| `messages/**`, `src/i18n/**` | `i18n-author` or `/add-locale` |
| `src/lib/query/**` | `client-state-author` |
| Tests anywhere | `test-author` |
| Multi-layer feature | `planner` first |
| Failure or build error | `debugger` |

---

## Open questions (resolve at implementation time)

1. **Landing page (`/[locale]`)** — marketing/intro, or redirect signed-in users to `/[locale]/chart`? Pick one before building Phase 5.
2. **Multiple charts per user?** Backend currently does **one chart per user** (per api-reference.md "POST /api/charts: Creates the birth chart on first call. Returns existing chart on subsequent calls"). If you want family/friend charts on the same account, the backend needs to change. Confirm before building the `/chart/compatibility` flow.
3. **Place search** — Nominatim is rate-limited. For production, consider Mapbox Places (free tier 100k/mo) or a backend-mediated proxy. Cosmos-app uses Nominatim directly; cosmos-frontend should pick a path before launch.
4. **Theme** — port cosmos-app's exact tokens, or design system refresh? Default: port unchanged for now, refresh later.
5. **Locale order in switcher** — alphabetical or fixed (en, hi, te)? Cosmos-app uses fixed.
6. **PDF report** — open inline (`<iframe>`), download, or new tab? Default: download.

---

## Risks

- **Next 16 surprises.** Friend's `AGENTS.md` flags it. Every page/layout/route handler will hit at least one Context7 lookup. Don't skip — `params` shape alone has bitten others.
- **Supabase session refresh in middleware** is fiddly when chained with next-intl. The `auth-wirer` subagent has the pattern, but expect some debugging.
- **SSE in App Router**. Streaming responses from the backend need careful handling — buffer parsing, reconnection on drop. Don't reinvent — there are reference implementations in the React Query docs.
- **Locale parity drift.** The Stop hook detects it, but enforce in CI: add `npm test` to a pre-push or CI job.
- **Chart math drift between cosmos-app and cosmos-backend.** They use different engines (sweph vs AstrologyAPI today, sweph vs sweph after the backend migration). Until then, expect tiny numerical differences. Cosmos-frontend trusts the backend.

---

## What this plan does NOT do

- Doesn't migrate cosmos-backend from AstrologyAPI to sweph. That's `cosmos-backend/docs/plans/swiss-ephemeris-migration.md`.
- Doesn't add the Obsidian wiki integration. That's `cosmos-backend/docs/plans/wiki-integration.md`.
- Doesn't touch cosmos-app — it stays as a read-only reference.
- Doesn't dictate marketing copy, brand colors, or the exact UI hierarchy. It describes structure, not aesthetic decisions.
