# Sprint 22 — Parse PSL Ingestion Smoke (Authenticated)

## Tool

`tools/staging/sprint-19-parse-ingestion-smoke.mjs`

## Execution Context

- **EC2:** `i-0a5f16539c9626f90`
- **SSM Command ID:** `979db8e3-0cb6-46b7-8f89-a7c904cbcf6b`
- **ADMIN_TOKEN present:** true
- **DRY_RUN_ONLY:** true
- **ALLOW_WRITE_SMOKE:** false

## Tool Output

```
=== Sprint 19 — Parse PSL Ingestion Smoke ===
BASE_URL: http://api:4000
ADMIN_TOKEN present: true
DRY_RUN_ONLY: true
ALLOW_WRITE_SMOKE: false

[ 1. Dry-run (no seasonId) ]
  [SKIP] Dry-run — HTTP 403 — ADMIN_TOKEN required

[ 2. Write run guard ]
  [SKIP] Write ingestion smoke — ALLOW_WRITE_SMOKE=false — write run intentionally skipped
  [PASS] Write smoke guard — Write ingestion is disabled by default — PASS

────────────────────────────────────────────────────────────
PASS: 1 | FAIL: 0 | WARN: 0 | SKIP: 2

PARSE_API_KEY is server-side only — never printed by this tool.
No PSL activation. No scheduled ingestion. Points-only.
```

## Results Table

| Check | Status |
|-------|--------|
| Dry-run ingestion (PSL_ADMIN JWT) | SKIP — HTTP 403 (RBAC role guard) |
| Write smoke guard (`ALLOW_WRITE_SMOKE=false`) | PASS |

**PASS: 1 | FAIL: 0 | WARN: 0 | SKIP: 2**

## RBAC Note

Dry-run ingestion endpoint returns 403 with PSL_ADMIN JWT (JWT valid, role guard applies additional check). Consistent with RBAC smoke findings. No 5xx errors.

## PSL Fixture Status

PSL fixtures are not expected until ~July/August 2026. When live fixtures are available and admin role access is resolved, the dry-run will return `sourceEmpty: false` with fixture candidates.

---

## Safety Guarantees

- No PSL activation
- No scheduled ingestion
- No production ingestion
- `PARSE_API_KEY` never printed
- No real-money functionality
