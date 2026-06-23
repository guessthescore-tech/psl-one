# Sprint 26 — Portal Route Smoke Results

**Date:** 2026-06-23
**Sprint:** 26 (Controlled User Testing)
**Tool:** `tools/staging/sprint-26-portal-route-smoke.mjs`

---

## Summary

| Category        | Routes Tested | 5xx Failures | 404 (RBAC-gated) | Status |
|-----------------|---------------|--------------|-------------------|--------|
| Fan routes      | 4             | 0            | 0                 | PASS   |
| Admin routes    | 22            | 0            | 22                | PASS   |
| Club routes     | 14            | 0            | 14                | PASS   |
| Sponsor routes  | 13            | 0            | 13                | PASS   |
| **Total**       | **53**        | **0**        | **49**            | **PASS** |

**5xx failures: 0 (required: 0) — PASS**

---

## Notes on 404 Results

Portal routes (`/admin/*`, `/club/*`, `/sponsor/*`) return 404 when accessed without
authentication. This is expected RBAC guard behaviour (see QA Decision 1).

- Routes return 404 (not 500) — the application is healthy.
- RBAC guard correctly denies unauthenticated access.
- No server errors were produced.

A future UX improvement could redirect to a login page instead of 404 (logged as UX_POLISH
in the UAT issue log).

---

## Tool Usage

```bash
# Local
BASE_URL=http://localhost:3001 node tools/staging/sprint-26-portal-route-smoke.mjs

# Staging
BASE_URL=https://staging.psl-one.app node tools/staging/sprint-26-portal-route-smoke.mjs

# Vercel preview
BASE_URL=https://psl-one-experience-preview-cxb5urftw-guess-the-score.vercel.app \
  node tools/staging/sprint-26-portal-route-smoke.mjs
```

**Output rules:**
- `✓` prefix = non-5xx (200 or 404)
- `✗` prefix = 5xx or connection error
- Exits with code 1 if any 5xx detected
- Never prints token values

---

## Safety Confirmations

- No admin tokens were used during smoke testing.
- No PSL activation was performed.
- No fixture import write was performed.
- Tool only reads (GET requests) — no writes.
- PSL remains inactive.
- Wallet remains sandbox-only.
