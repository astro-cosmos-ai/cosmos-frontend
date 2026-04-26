---
description: Fetch live library docs via Context7 MCP. Mandatory for Next 16, React 19, @supabase/ssr, TanStack Query v5, next-intl, Tailwind v4 — training data is stale.
argument-hint: <library> <topic>
allowed-tools: mcp__context7__resolve-library-id, mcp__context7__get-library-docs
model: inherit
---

Fetch fresh documentation for **$1** on topic **$2**.

1. `mcp__context7__resolve-library-id` with `libraryName: "$1"`. Pick the best match (exact name → description relevance → snippet count). Common IDs:
   - Next.js: `/vercel/next.js`
   - React: `/facebook/react` or `/reactjs/react.dev`
   - `@supabase/ssr`: `/supabase/ssr`
   - TanStack Query: `/tanstack/query`
   - next-intl: `/amannn/next-intl`
   - Tailwind: `/tailwindlabs/tailwindcss`
   - Supabase JS: `/supabase/supabase-js`
   - Playwright: `/microsoft/playwright`
   - Vitest: `/vitest-dev/vitest`
   - MSW: `/mswjs/msw`

2. `mcp__context7__get-library-docs` with that ID and `topic: "$2"`. Set `tokens` based on breadth: 3000 for focused, 8000 for multi-feature.

3. Summarize the relevant API + quote the smallest snippet that answers the question.

Do NOT answer from memory. The user invoked this command specifically to override stale training data — honor that.
