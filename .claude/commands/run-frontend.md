---
description: Start the Next.js dev server with env preflight.
allowed-tools: Bash, Read
model: inherit
---

Pre-flight checks:

```
!test -f package.json && echo "package.json present" || echo "ERROR: no package.json — scaffold the project first"
!test -f .env.local && echo ".env.local present" || echo "ERROR: missing .env.local — copy .env.example and fill in keys"
!grep -E "^(NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|NEXT_PUBLIC_BACKEND_URL)=" .env.local 2>/dev/null | awk -F= '{print $1, ($2 ? "set" : "EMPTY")}'
!test -d node_modules && echo "deps installed" || echo "run: npm install"
```

If any required value is missing or empty, stop and ask the user to fix before proceeding.

Then start the dev server:

```
!npm run dev
```

Remind the user:
- Frontend at `http://localhost:3000`
- Backend (cosmos-backend) should be running at `http://localhost:8000` — start it via `cosmos-backend/.claude/commands/run-backend` or `uv run uvicorn app.main:app --reload`
- Stop with Ctrl+C
