---
paths:
  - "src/lib/supabase/**"
  - "src/proxy.ts"
  - "src/app/(auth)/**"
---

# Rule: Supabase Auth (App Router)

**Library:** `@supabase/ssr` (the App Router-friendly wrapper). **Not** `@supabase/auth-helpers-nextjs` — that's deprecated. Fetch Context7 docs for `@supabase/ssr` before writing auth code.

## Three client flavors

| Where you are | Use |
|---------------|-----|
| Client components (`'use client'`) | `createBrowserClient(...)` |
| Server components / server actions | `createServerClient(...)` (reads cookies) |
| Middleware (`src/proxy.ts`) | `createServerClient(...)` with the middleware cookie shape |

Wrap each in `src/lib/supabase/`:

```
src/lib/supabase/
├── browser.ts      # createBrowserClient export
├── server.ts       # createServerClient (RSC) export
└── middleware.ts   # createServerClient (middleware) export
```

## Middleware refresh

`src/proxy.ts` (Next.js middleware) must refresh the session on every request so server components see a valid token. Skeleton:

```ts
import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);   // refreshes Supabase session cookie
  // chain with next-intl
  return intlMiddleware(request) ?? response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
```

## Token in API calls

The wrapped fetch client at `src/lib/api/client.ts` reads the token from the Supabase client (browser or server flavor depending on context). Never store the token in localStorage manually — Supabase SDK handles cookie/storage.

## Sign-in flow

Use Supabase's email + password (or OAuth providers) via the browser client. After successful sign-in, the session cookie is set by `@supabase/ssr` automatically; redirect to `/chart` (or wherever).

## What to refuse

- `localStorage.setItem('token', ...)` — Supabase manages storage.
- Hardcoded JWT in code or env vars — tokens are user-specific.
- Calling Supabase admin/service-role from the browser. Service-role is backend-only.
- Skipping middleware — without it, server components see stale tokens after refresh.
