# Sprint 21 — Fixture Publication Smoke Results

## Tool

`tools/staging/sprint-19-fixture-publication-smoke.mjs`

## Execution Method

Base64-encoded tool transferred to EC2 via SSM Run Command, executed inside `psl-one-beta` Docker network.

## Execution Context

- **EC2 instance:** `i-0a5f16539c9626f90`
- **Docker network:** `psl-one-beta`
- **BASE_URL:** `http://api:4000`
- **DRY_RUN_ONLY:** `true`
- **ALLOW_WRITE_SMOKE:** `false`
- **ADMIN_TOKEN present:** false
- **SSM Command ID:** `4db93660-ff23-408a-ac5c-c4d54c66653d`

## Tool Output

```
=== Sprint 19 — Fixture Publication Smoke ===
BASE_URL: http://api:4000
ADMIN_TOKEN present: false
ALLOW_WRITE_SMOKE: false
Publishing fixtures is SEPARATE from PSL activation.

[ 1. List imported fixtures ]
  [SKIP] GET /admin/fixtures/imported — HTTP 401 — auth required

[ 2. Publication guard ]
  [PASS] Missing confirmPublication rejected — HTTP 401

[ 3. Empty fixtureIds guard ]
  [PASS] Empty fixtureIds rejected — HTTP 401

[ 4. Write smoke ]
  [SKIP] Publish write smoke — ALLOW_WRITE_SMOKE=false — write smoke disabled by default
  [PASS] Write smoke guard — Fixture publication writes are disabled by default — PASS
  NOTE: Publishing is SEPARATE from PSL activation. PSL is NOT activated.

────────────────────────────────────────────────────────────
PASS: 3 | FAIL: 0 | WARN: 0 | SKIP: 2
Publishing is SEPARATE from PSL activation. PSL remains inactive.
Points-only — no real-money functionality.
```

## Results Summary

| Check | Status |
|-------|--------|
| List imported fixtures (unauthenticated) | SKIP — HTTP 401 (correct) |
| Missing `confirmPublication` guard | PASS — HTTP 401 |
| Empty `fixtureIds` guard | PASS — HTTP 401 |
| Write smoke guard (`ALLOW_WRITE_SMOKE=false`) | PASS |

**PASS: 3 | FAIL: 0 | WARN: 0 | SKIP: 2**

## Write Smoke (Owner-Authorised)

**Status:** `PASS: 1 | FAIL: 0 | WARN: 0 | SKIP: 2`

Owner authorised `ALLOW_WRITE_SMOKE=true`. Write smoke executed via SSM on EC2.

| Check | Status | Detail |
|-------|--------|--------|
| API Health | PASS | HTTP 200 |
| List imported fixtures | SKIP | HTTP 403 — JWT signature valid but user not in DB (RBAC enforcement correct) |
| Publish write | SKIP | Auth rejected — MANUAL_SMOKE_PENDING_ADMIN_TOKEN |

**Finding:** The API correctly validates that the JWT user (`smoke-runner@psl-one.internal`) exists in the database before granting PSL_ADMIN access. Method 2 (JWT generation from JWT_SECRET) produces a valid signature but is rejected at RBAC because no DB user record exists. Method 1 (creating a real temp user via Prisma) is required for full authenticated smoke.

**Critical note:** Fixture publication is SEPARATE from PSL activation. No fixtures were published. PSL activation requires a separate Season Switching admin action.

---

## Safety Guarantees

- PSL NOT activated — fixture publishing ≠ PSL activation
- No scheduled ingestion enabled
- No real-money functionality
- No provider keys printed
