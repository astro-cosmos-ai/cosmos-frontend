---
paths:
  - "src/app/**/*.tsx"
  - "src/app/**/*.ts"
---

# Rule: Next.js 16 App Router

**Next 16 has breaking changes vs training data. Fetch docs via Context7 (`/vercel/next.js`) before writing anything non-trivial.**

## Server vs client components

- **Default = server component.** Async, can `await`, can read cookies/headers, no hooks, no event handlers.
- Add `'use client'` only when you need state, effects, browser APIs, or event handlers.
- Push `'use client'` to leaf components — don't mark whole pages client-side.

## Dynamic routes (Next 16 change)

`params` and `searchParams` are now **`Promise<...>`** in page/layout/route props:

```tsx
// page.tsx
type Props = {
  params: Promise<{ locale: string; chartId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ params, searchParams }: Props) {
  const { locale, chartId } = await params;
  const { tab } = await searchParams;
  ...
}
```

If you write `params.locale` without awaiting, the build will fail. Always `await`.

## Layouts

- `src/app/[locale]/layout.tsx` is the root for the locale segment. Wrap with `NextIntlClientProvider` here.
- Layouts are server components by default — fetch data here, pass to client children via props.
- `loading.tsx`, `error.tsx`, `not-found.tsx` are colocated. Use them.

## Route handlers (`route.ts`)

- Replaces `pages/api/`. Export `GET`, `POST`, etc. as named functions.
- For backend proxying (forwarding to cosmos-backend), prefer calling the backend directly from server components / server actions instead of proxying through a route handler — fewer hops.

## Caching defaults

Next 16 changed cache defaults. Don't assume `fetch()` is cached. Verify via Context7 docs before relying on cache behavior. Use explicit `cache: 'force-cache'` or `cache: 'no-store'` to be safe.

## What to refuse

- Sync handlers in dynamic routes — Next 16 will fail the build.
- Reading cookies/headers from a client component — only server components can.
- Importing server-only code (e.g. `cosmos-backend` service-role keys) into a client component.
