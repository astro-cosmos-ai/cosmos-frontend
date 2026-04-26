---
description: Audit cosmos-frontend invariants — async params, no bare fetch, every string i18n'd, locale parity, no hardcoded colors.
allowed-tools: Read, Grep, Glob, Bash
model: inherit
---

Run the cosmos-frontend invariants audit. Report as a punch list — pass/fail per check, no filler.

### 1. No `params.x` without `await` in dynamic routes
Next 16 fails the build if you read params synchronously. Detect leftover sync access:
```
!grep -rn "params\.[a-z]" src/app/ 2>/dev/null | grep -v "await params" | grep -v "// " || echo "PASS: no synchronous params access detected"
```

### 2. No bare `fetch()` outside `src/lib/api/`
```
!grep -rn "fetch(" src/ 2>/dev/null | grep -v "src/lib/api/" | grep -v "\.test\." || echo "PASS: all fetches go through src/lib/api/"
```

### 3. No hardcoded user-facing strings (best-effort heuristic)
Look for JSX text that doesn't come from `t(...)`. Heuristic only — flag for human review:
```
!grep -rEn '<(button|h[1-6]|p|span|label)[^>]*>[A-Z][a-z]+ ' src/ 2>/dev/null | head -20 || echo "PASS: no obvious hardcoded English strings"
```

### 4. Locale parity — all 3 message files have the same key set
```
!node -e "
  const flat = (o, p='') => Object.entries(o).flatMap(([k,v]) => typeof v === 'object' && v ? flat(v, p+k+'.') : [p+k]);
  try {
    const en = flat(JSON.parse(require('fs').readFileSync('messages/en.json','utf8'))).sort();
    const hi = flat(JSON.parse(require('fs').readFileSync('messages/hi.json','utf8'))).sort();
    const te = flat(JSON.parse(require('fs').readFileSync('messages/te.json','utf8'))).sort();
    const missing = (a,b) => a.filter(k => !b.includes(k));
    const m1 = missing(en, hi), m2 = missing(en, te);
    if (m1.length === 0 && m2.length === 0) console.log('PASS: locale parity');
    else { if (m1.length) console.log('FAIL hi missing:', m1); if (m2.length) console.log('FAIL te missing:', m2); }
  } catch (e) { console.log('SKIP: messages files not present yet'); }
" 2>&1
```

### 5. No hardcoded hex/rgb colors in components
```
!grep -rEn '#[0-9a-fA-F]{3,8}\b|rgb\(' src/components/ 2>/dev/null | head -10 || echo "PASS: components use theme tokens"
```

### 6. No `dark:` Tailwind variants
```
!grep -rn "dark:" src/ 2>/dev/null | head -10 || echo "PASS: no dark: variants (theme tokens handle it)"
```

### 7. No `localStorage.setItem('token'...)` (Supabase manages tokens)
```
!grep -rn "localStorage.*token" src/ 2>/dev/null || echo "PASS: no manual token storage"
```

### 8. No `useEffect(() => fetch(...))` pattern
```
!grep -rEn "useEffect.*fetch\(" src/ 2>/dev/null | head -10 || echo "PASS: server state goes through React Query"
```

### 9. Build still passes
```
!npm run build 2>&1 | tail -20
```

### Final report

If all 9 checks pass: green-light summary. Otherwise list each failure with file:line and a one-line remediation.
