---
description: Wrap a cosmos-backend endpoint as a typed client function + React Query hook. Delegates to api-client-author + client-state-author.
argument-hint: <verb> <path> (e.g. "GET /api/charts/{id}/transits")
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Agent
model: inherit
---

Wire backend endpoint: **$1 $2**

Steps:

1. Open the backend API reference and find this endpoint:
   ```
   !grep -A 30 "$1.*$2" ../cosmos-backend/docs/api-reference.md | head -50
   ```
   Confirm it exists. Note the request body shape, query params, response shape, and any prerequisites (e.g. `/load` must be called first).

2. Decide:
   - Resource name (camelCase, plural for lists): e.g. `transits`, `analyses`, `compatibility`.
   - Function name: `fetchX` for GET, `createX` / `updateX` / `runX` for POST.
   - File: `src/lib/api/<resource>.ts` (create if missing).

3. Delegate to `api-client-author` subagent with:
   - Endpoint: `$1 $2`
   - Reference section in `cosmos-backend/docs/api-reference.md`
   - Request body type (if POST/PUT)
   - Response type (mirror the example payload exactly)

4. Delegate to `client-state-author` subagent to add the React Query hook in `src/lib/query/<resource>.ts`:
   - GET → `useQuery` with appropriate `staleTime` (see `.claude/rules/state.md`)
   - POST → `useMutation` with `onSuccess` cache update
   - Query key follows convention: `['<resource>', ...identifying args]`

5. Delegate to `test-author` to add a Vitest unit with MSW mocking the endpoint. Use `tests/fixtures/` payload from api-reference.md.

6. Verify:
   ```
   !test -f src/lib/api/<resource>.ts && echo "client function created"
   !test -f src/lib/query/<resource>.ts && echo "query hook created"
   !npx vitest run src/lib/api/<resource>.test.ts 2>&1 | tail -10
   ```

Report: client function path, hook path, test path, status.
