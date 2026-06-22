# Sprint 21 — PSL Pre-Flight Smoke Results

## Tool

`tools/staging/sprint-19-psl-preflight-smoke.mjs`

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
=== Sprint 19 — PSL Pre-Flight Smoke ===
BASE_URL: http://api:4000
ADMIN_TOKEN present: false
This tool is READ-ONLY. It does NOT activate PSL.

  [SKIP] GET /admin/psl/preflight — HTTP 401 — ADMIN_TOKEN required

PASS (auth-gated). Set ADMIN_TOKEN to run full pre-flight smoke.
```

## Results Summary

| Check | Status |
|-------|--------|
| GET /admin/psl/preflight (unauthenticated) | SKIP — HTTP 401 (correct) |
| Auth-gated PASS | PASS |

**PASS (auth-gated)** — unauthenticated access correctly rejected.

## Authenticated Pre-Flight Check

**Status:** `MANUAL_SMOKE_PENDING_ADMIN_TOKEN`

The full pre-flight check (13 checks including `fixtures_exist`, `teams_exist`, `season_active`) requires `ADMIN_TOKEN`. Without it, the tool correctly exits with auth-gated PASS.

**Expected result when run with token:** `NO_GO` or `CONDITIONAL_GO` — PSL fixtures are not yet available (~July/August 2026). PSL activation would require a separate Season Switching admin action — the pre-flight tool is read-only.

---

## Safety Guarantees

- PSL NOT activated — this tool is read-only
- No scheduled ingestion enabled
- No real-money functionality
- No provider keys printed
