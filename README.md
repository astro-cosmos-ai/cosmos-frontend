# cosmos-frontend

Next.js 16 frontend for Cosmos — a Vedic astrology AI assistant. Connects to `cosmos-backend` for all chart computation and analysis.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind v4** with semantic theme tokens (dusk / dawn / mist)
- **next-intl** — i18n routing for English, Hindi, Telugu
- **Supabase Auth** (`@supabase/ssr`) — email/password + Google OAuth
- **TanStack Query v5** — server state, caching, mutations
- **Vitest + MSW** — unit tests
- **Playwright** — E2E tests

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev                   # http://localhost:3000
```

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

The backend must be running at `NEXT_PUBLIC_BACKEND_URL`. See `cosmos-backend/` for setup.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E tests |

## Routes

All routes are locale-prefixed (`/en`, `/hi`, `/te`).

| Route | Description |
|-------|-------------|
| `/` | Landing page (redirects to `/chart` if signed in) |
| `/sign-in` | Email/password + Google sign-in |
| `/sign-up` | Registration |
| `/chart` | Chart overview — birth form on first visit |
| `/chart/birthchart` | North / South Indian chart view |
| `/chart/planets` | 9-planet detail grid |
| `/chart/dasha` | Vimshottari Mahadasha timeline |
| `/chart/transits` | Current + double transit snapshot |
| `/chart/sadesati` | Saturn Sade Sati phase |
| `/chart/varshaphal` | Annual chart (year selector) |
| `/chart/analyses` | All 16 AI analysis sections |
| `/chart/analyses/[section]` | Full analysis view |
| `/chart/chat` | Streaming AI chat |
| `/chart/predict` | Timing predictions |
| `/chart/muhurta` | Auspicious date finder |
| `/chart/compatibility` | Ashtakoot compatibility |
| `/chart/report` | PDF report download |

## Testing

### Unit tests

```bash
npm test            # run once
npm run test:watch  # watch mode
```

49 tests covering the API client layer, query hooks, and key components. All network calls are intercepted by MSW — no live backend needed.

### E2E tests

Requires a running dev server and Supabase credentials:

```bash
# Add to .env.local:
PLAYWRIGHT_TEST_USER_EMAIL=<test account email>
PLAYWRIGHT_TEST_USER_PASSWORD=<test account password>

npx playwright test
```

Tests are skipped automatically when credentials are absent (safe for CI without Supabase).

## Project structure

```
src/
├── app/
│   ├── [locale]/           # All locale-prefixed routes
│   │   ├── (auth)/         # Sign-in, sign-up, callback
│   │   ├── chart/          # Protected chart routes
│   │   └── layout.tsx      # Locale layout + providers
│   └── providers.tsx       # React Query provider
├── components/             # UI components
├── i18n/                   # next-intl routing + request config
└── lib/
    ├── api/                # Typed backend API client
    ├── query/              # React Query hooks
    └── supabase/           # Auth clients (browser / server / middleware)
messages/                   # en.json, hi.json, te.json
tests/
├── e2e/                    # Playwright tests
├── msw/                    # MSW handlers + server
└── unit/                   # Vitest unit tests
```
