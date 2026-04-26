#!/usr/bin/env bash
# PostToolUseFailure hook for Bash: surface common npm/Next/Vitest/Playwright recovery hints.
set -e

input=$(cat)
cmd=$(echo "$input" | jq -r '.tool_input.command // empty')
err=$(echo "$input" | jq -r '.error // empty')

hint=""

case "$cmd" in
  *"npm run dev"*|*"next dev"*)
    hint="Dev server failed. Common causes: port 3000 in use (lsof -i :3000), missing .env.local, node_modules out of sync (npm install). Run /run-frontend for env preflight."
    ;;
  *"npm run build"*|*"next build"*)
    hint="Build failed. If TS error mentions 'Promise<{...}>' on params/searchParams — Next 16 requires await. If 'Module not found', check tsconfig.json paths alias. If hydration warning, delegate to debugger subagent."
    ;;
  *"npx vitest"*|*"vitest run"*)
    hint="Vitest failed. Read the assertion line carefully. If using MSW, verify the handler URL/method matches the actual fetch. Consider delegating to debugger subagent."
    ;;
  *"npx playwright"*|*"playwright test"*)
    hint="Playwright failed. Common causes: backend not running at NEXT_PUBLIC_BACKEND_URL, selector doesn't match (prefer getByRole over CSS), test depends on prior state."
    ;;
  *"npm install"*|*"npm ci"*)
    hint="npm install failed. Check Node version (>=20), network access, and that package.json is valid JSON. Delete node_modules + package-lock.json and retry if 'unmet peer dependency' errors persist."
    ;;
  *"tsc"*)
    hint="TypeScript check failed. Read the first error — fixing it usually unblocks the rest. For Next 16 dynamic routes, params/searchParams are now Promise<...>."
    ;;
esac

if [ -z "$hint" ]; then
  case "$err" in
    *"permission denied"*|*"Permission denied"*)
      hint="Permission denied. Don't sudo — check file ownership."
      ;;
    *"address already in use"*|*"EADDRINUSE"*)
      hint="Port already in use. Find the process: lsof -i :3000 (or :8000 for backend), then stop it before retrying."
      ;;
    *"ENOENT"*)
      hint="File not found. Check the path; the project may not be scaffolded yet (no package.json, no node_modules)."
      ;;
  esac
fi

if [ -n "$hint" ]; then
  jq -n --arg h "$hint" '{systemMessage:$h}'
else
  echo '{}'
fi
