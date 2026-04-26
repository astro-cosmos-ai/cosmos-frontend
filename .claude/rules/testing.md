---
paths:
  - "tests/**"
  - "src/**/*.test.ts"
  - "src/**/*.test.tsx"
---

# Rule: Testing

| Layer | Tool | Pattern |
|-------|------|---------|
| Component / hook unit | **Vitest** + `@testing-library/react` | `*.test.tsx` colocated next to source |
| API client unit | **Vitest** + **MSW** (Mock Service Worker) | Mock cosmos-backend at the network boundary |
| E2E happy paths | **Playwright** | `tests/e2e/*.spec.ts` |
| Visual regression (later) | **Playwright + screenshot** | optional, defer |

## What to test, by layer

- **`src/lib/api/`** — every wrapped client function. Use MSW to mock backend responses; assert correct URL, headers (auth!), error handling. Do **not** hit live backend.
- **`src/lib/query/`** — React Query hooks: assert cache key, refetch behavior. Mock the underlying `api()` function.
- **`src/components/`** — render via Testing Library, assert behavior (clicks, keyboard nav, ARIA). No snapshot testing as primary assertion.
- **`src/app/**/page.tsx`** — Playwright covers these. Don't unit-test pages.
- **i18n** — at least one Vitest assertion that all 3 locale files have the same key set.

## MSW pattern

`tests/msw/handlers.ts` contains canonical responses for every backend endpoint, hand-rolled from `cosmos-backend/docs/api-reference.md` example payloads. Tests import from there.

## Playwright fixtures

- One canonical chart fixture (a known birth) seeded into Supabase via the test setup. Or stub at the network layer.
- Tests should NOT depend on previous test state — each `test()` is isolated.

## Conventions

- Test names describe behavior: `it('redirects to /sign-in when no session')`, not `it('test login')`.
- One assertion focus per test; many small tests beat one big one.
- No `any` in tests — types matter as much as in source.
- Use `@pytest.fixture(scope='session')`-equivalent: `test.beforeAll` for slow setup.

## What to refuse

- Tests that hit the live backend. Always mock.
- Tests that store secrets in plaintext in fixtures.
- Snapshot tests as the only assertion (they rot fast and don't describe intent).
- Skipping a failing test instead of fixing it. If it's flaky, fix the flake or delete the test.
