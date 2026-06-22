# Sprint 21 — Parse PSL Ingestion Smoke Results

## Tool

`tools/staging/sprint-19-parse-ingestion-smoke.mjs`

## Execution Method

Base64-encoded tool transferred to EC2 via SSM Run Command, executed inside `psl-one-beta` Docker network.

## Execution Context

- **EC2 instance:** `i-0a5f16539c9626f90`
- **Docker network:** `psl-one-beta`
- **BASE_URL:** `http://api:4000`
- **DRY_RUN_ONLY:** `true`
- **ALLOW_WRITE_SMOKE:** `false`
- **ADMIN_TOKEN present:** false
- **SSM Command ID:** `44d008c7-4061-4af2-bebc-738fa33b025f`

## Tool Output

```
=== Sprint 19 — Parse PSL Ingestion Smoke ===
BASE_URL: http://api:4000
ADMIN_TOKEN present: false
DRY_RUN_ONLY: true
ALLOW_WRITE_SMOKE: false

[ 1. Dry-run (no seasonId) ]
  [SKIP] Dry-run — HTTP 401 — ADMIN_TOKEN required

[ 2. Write run guard ]
  [SKIP] Write ingestion smoke — ALLOW_WRITE_SMOKE=false — write run intentionally skipped
  [PASS] Write smoke guard — Write ingestion is disabled by default — PASS

────────────────────────────────────────────────────────────
PASS: 1 | FAIL: 0 | WARN: 0 | SKIP: 2

PARSE_API_KEY is server-side only — never printed by this tool.
No PSL activation. No scheduled ingestion. Points-only.
```

## Results Summary

| Check | Status |
|-------|--------|
| Dry-run ingestion (unauthenticated) | SKIP — HTTP 401 (correct) |
| Write smoke guard (`ALLOW_WRITE_SMOKE=false`) | PASS |

**PASS: 1 | FAIL: 0 | WARN: 0 | SKIP: 2**

## Authenticated Dry-Run

**Status:** `MANUAL_SMOKE_PENDING_ADMIN_TOKEN`

The dry-run ingestion path requires `ADMIN_TOKEN`. Expected result when run with token and PSL fixtures not yet published: `sourceEmpty: true` (WARN, not FAIL). PSL fixtures are not expected until ~July/August 2026.

## Write Smoke

**Status:** `ALLOW_WRITE_SMOKE=false — DISABLED BY DEFAULT`

Write ingestion smoke requires explicit opt-in via `ALLOW_WRITE_SMOKE=true`. No ingestion writes occurred.

---

## Safety Guarantees

- No PSL activation
- No scheduled ingestion enabled
- No production ingestion enabled
- `PARSE_API_KEY` never printed (server-side only)
- No real-money functionality
