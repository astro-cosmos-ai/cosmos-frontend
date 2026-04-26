---
paths:
  - "src/lib/api/**"
  - "src/app/api/**"
  - "src/lib/query/**"
---

# Rule: Backend integration (cosmos-backend)

**Backend contract:** `cosmos-backend/docs/api-reference.md` — 18 endpoints, all JWT-auth'd.

## Where backend calls live

- **`src/lib/api/`** — the *only* place that knows backend URLs, JWT injection, and SSE parsing.
  - `client.ts` — wrapped fetch with auth header injection, error normalization
  - `chart.ts`, `analyses.ts`, `chat.ts`, `transits.ts`, `compatibility.ts`, ... — one file per resource
  - `chat-stream.ts` — SSE consumer for `POST /chat`
  - `types.ts` — TypeScript types matching the backend response shapes (hand-written from api-reference.md)
- **`src/lib/query/`** — React Query hooks wrapping the API client (`useChart`, `useAnalysis`, `useChatStream`, etc.)
- **Pages and components import from `src/lib/query/`, never call `fetch()` directly.**

## The wrapped client (sketch)

```ts
// src/lib/api/client.ts
import { createBrowserClient } from '@supabase/ssr';

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL!;

async function getToken(): Promise<string> {
  const supabase = createBrowserClient(...);
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new ApiError(401, 'Not authenticated');
  return data.session.access_token;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json();
}
```

Server-side calls (from RSC) get the token via `createServerClient(...)` from `@supabase/ssr` instead.

## SSE for chat (`POST /api/charts/{id}/chat`)

Backend streams `data: {"text": "..."}` lines, ending with `data: [DONE]`. See api-reference.md for the full pattern. Wrap in `src/lib/api/chat-stream.ts`:

```ts
export async function* chatStream(chartId: string, message: string) {
  const token = await getToken();
  const res = await fetch(`${BASE}/api/charts/${chartId}/chat`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value);
    const lines = buffer.split('\n');
    buffer = lines.pop()!;
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      if (line === 'data: [DONE]') return;
      yield JSON.parse(line.slice(6)).text as string;
    }
  }
}
```

## Caching pattern (analyses, varshaphal, compatibility)

Backend already caches. Frontend should:
1. Use React Query with sensible `staleTime` (analyses cache for `Infinity` once loaded — they're idempotent).
2. Invalidate on user action only (e.g., "regenerate analysis" button → invalidates the query).
3. Don't rebuild the cache key — backend handles it; frontend just hits the endpoint.

## What to refuse

- `fetch('/api/charts/...')` outside `src/lib/api/`.
- Forgetting `Authorization: Bearer <token>` — every endpoint except `/health` requires it.
- Manual JWT decoding in the frontend — Supabase SDK handles refresh.
- Local sweph computation. cosmos-app does this; cosmos-frontend never does. The backend is the source of truth.
