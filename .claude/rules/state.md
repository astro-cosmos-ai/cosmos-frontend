---
paths:
  - "src/**/*.tsx"
  - "src/lib/query/**"
---

# Rule: State management

| State type | Tool | Why |
|------------|------|-----|
| Server state (data fetched from cosmos-backend) | **TanStack Query (React Query) v5** | Cache, refetch, mutations, retry. Wraps the API client. |
| Component-local state | `useState` / `useReducer` | Form fields, toggle states, hover. |
| Cross-component client state (rare) | **Zustand** | Only when React Query isn't enough — e.g., theme, locale, selected planet tab persisted across pages. |
| Persistent client state | `localStorage` via Zustand `persist` middleware | Theme, last-viewed chart UI prefs. **Not** auth tokens (Supabase handles those). |

**Do not use:** Redux, MobX, Recoil, Jotai. Don't introduce a fourth state library.

## React Query setup

- Provider in `src/app/providers.tsx`, wrapped around the locale layout.
- Query keys are arrays: `['chart', chartId]`, `['analyses', chartId]`, `['transits', chartId, date]`.
- Server state stays in queries; never mirror it into Zustand.

## Hooks live in `src/lib/query/`

```
src/lib/query/
├── index.ts          # QueryClient instance + provider
├── chart.ts          # useChart, useCreateChart, useLoadChart
├── analyses.ts       # useAnalysis, useAnalyses, useRunAnalysis
├── chat.ts           # useChatHistory, useChatStream (or pass-through to chat-stream.ts)
├── transits.ts       # useTransits, useDoubleTransit, useSadeSati
├── timeline.ts       # useTimeline
├── compatibility.ts  # useCompatibility, useComputeCompatibility
└── varshaphal.ts     # useVarshaphal
```

Pages and components import from here: `import { useChart } from '@/lib/query/chart';`

## What to refuse

- `useEffect(() => { fetch(...) }, [])` — that's React Query's job.
- Mirroring server state into Zustand or `useState` (causes drift).
- Storing auth tokens in any client state — Supabase handles that.
- Adding a new global state library without a plan-file justification.
