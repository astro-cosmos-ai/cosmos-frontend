#!/usr/bin/env bash
# Stop hook: nudge to commit + run tests when work seems done.
set -e

input=$(cat)
cwd=$(echo "$input" | jq -r '.cwd // empty')
if [ -n "$cwd" ]; then
  cd "$cwd" 2>/dev/null || true
fi

reminders=""
nl=$'\n'

# Uncommitted changes?
if git rev-parse --git-dir >/dev/null 2>&1; then
  dirty=$(git status --porcelain | wc -l | tr -d ' ')
  if [ "$dirty" != "0" ]; then
    reminders="${reminders}${nl}- ${dirty} uncommitted change(s). Stage + commit when this unit of work is logically complete."
  fi
fi

# TS/TSX changed without test run?
if [ -d tests ] || ls src/**/*.test.tsx >/dev/null 2>&1; then
  if git rev-parse --git-dir >/dev/null 2>&1; then
    changed=$(git diff --name-only HEAD 2>/dev/null | grep -E '\.(ts|tsx)$' | grep -v node_modules | grep -v '\.test\.' | wc -l | tr -d ' ')
    if [ "$changed" != "0" ]; then
      reminders="${reminders}${nl}- ${changed} TS/TSX file(s) changed. Consider 'npx vitest run' or delegating to test-author before declaring done."
    fi
  fi
fi

# package.json changed but lockfile not refreshed?
if git rev-parse --git-dir >/dev/null 2>&1; then
  if git status --porcelain package.json 2>/dev/null | grep -q . && ! git status --porcelain package-lock.json 2>/dev/null | grep -q .; then
    reminders="${reminders}${nl}- package.json changed but package-lock.json untouched. Run 'npm install' so lockfile reflects deps."
  fi
fi

# i18n parity check (only if all three locale files exist)
if [ -f messages/en.json ] && [ -f messages/hi.json ] && [ -f messages/te.json ]; then
  parity=$(node -e "
    const flat = (o, p='') => Object.entries(o).flatMap(([k,v]) => typeof v === 'object' && v ? flat(v, p+k+'.') : [p+k]);
    const en = new Set(flat(JSON.parse(require('fs').readFileSync('messages/en.json','utf8'))));
    const hi = new Set(flat(JSON.parse(require('fs').readFileSync('messages/hi.json','utf8'))));
    const te = new Set(flat(JSON.parse(require('fs').readFileSync('messages/te.json','utf8'))));
    let mismatch = 0;
    for (const k of en) { if (!hi.has(k)) mismatch++; if (!te.has(k)) mismatch++; }
    for (const k of hi) if (!en.has(k)) mismatch++;
    for (const k of te) if (!en.has(k)) mismatch++;
    console.log(mismatch);
  " 2>/dev/null || echo "0")
  if [ "$parity" != "0" ]; then
    reminders="${reminders}${nl}- i18n parity drift detected (${parity} key mismatches). Delegate to i18n-author to sync locale files."
  fi
fi

if [ -n "$reminders" ]; then
  jq -n --arg r "$reminders" '{systemMessage:("# Before stopping" + $r)}'
else
  echo '{}'
fi
