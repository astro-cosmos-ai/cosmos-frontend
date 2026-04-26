# Rule: Use skills, subagents, and slash commands — don't freelance

If the work fits a lane below, delegate or invoke the command. Skipping wastes the user's investment in the setup and produces unreviewed code.

## Subagents (project-specific, in `.claude/agents/`)

### Building lanes (write code)

| Editing / creating | Subagent |
|--------------------|----------|
| `src/app/**` (pages, layouts, route handlers) | `page-author` |
| `src/components/**` | `component-author` |
| `src/lib/api/**` (backend client, SSE consumer) | `api-client-author` |
| `src/lib/supabase/**`, `src/proxy.ts` | `auth-wirer` |
| `messages/**`, `src/i18n/**` | `i18n-author` |
| `src/lib/query/**` (React Query hooks) | `client-state-author` |

### Verifying / planning lanes

| When | Subagent |
|------|----------|
| After writing or modifying frontend code | `code-reviewer` (read-only) |
| Adding tests, raising coverage | `test-author` |
| Build error, hydration mismatch, runtime issue | `debugger` |
| Multi-layer feature before writing | `planner` |

## Slash commands (in `.claude/commands/`)

| Task | Command |
|------|---------|
| Scaffold a new page | `/add-page <route>` |
| Scaffold a new component | `/add-component <name>` |
| Add a new locale | `/add-locale <code>` |
| Wrap a backend endpoint as a typed client function | `/wire-endpoint <verb> <path>` |
| Start dev server with env preflight | `/run-frontend` |
| Fetch live library docs | `/fetch-docs <lib> <topic>` |
| Audit invariants | `/check-frontend` |

## Installed skills (`~/.claude/skills/`)

### Frontend-relevant (wired into subagents via frontmatter)

| Skill | Auto-loaded into | Use for |
|-------|------------------|---------|
| `react-best-practices` | page-author, component-author, client-state-author, code-reviewer | Vercel React/Next.js performance |
| `composition-patterns` | component-author, code-reviewer | Compound components, render props, refactoring boolean-prop chaos |
| `frontend-design` | component-author | Distinctive, production-grade UI |
| `web-design-guidelines` | code-reviewer | Accessibility / UX audit |
| `webapp-testing` | test-author | Playwright frontend testing patterns |
| `context7-mcp` | most subagents | Live library docs (mandatory for Next 16) |

### Superpowers (plugin)

| Skill | Auto-loaded into |
|-------|------------------|
| `superpowers:test-driven-development` | test-author |
| `superpowers:verification-before-completion` | test-author |
| `superpowers:systematic-debugging` | debugger |
| `superpowers:writing-plans` | planner |
| `superpowers:dispatching-parallel-agents` | planner |
| `superpowers:receiving-code-review` | code-reviewer |

### On-demand (not auto-loaded — invoke when needed)

- `gsap-react`, `gsap-core`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-utils`, `gsap-performance`, `gsap-plugins`, `gsap-frameworks` — if you add GSAP animations.
- `react-view-transitions` — if you add page-level transitions.
- `deploy-to-vercel` — when shipping to production.

## Why this exists

The setup invested significant effort to encode project conventions. Each subagent is a pre-loaded context. Skipping them means:
- Re-deriving conventions from training data (which drifts, especially for Next 16).
- Missing the Context7 calls the scaffold would have made.
- Producing code that doesn't match the rest of the codebase.

Rule of thumb: **if the work fits a lane above, use the tool. If it doesn't, ask the user before proceeding.**
