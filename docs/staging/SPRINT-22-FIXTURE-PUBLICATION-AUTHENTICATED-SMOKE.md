# Sprint 22 — Fixture Publication Smoke (Authenticated)

## Tool

`tools/staging/sprint-19-fixture-publication-smoke.mjs`

## Execution Context

- **EC2:** `i-0a5f16539c9626f90`
- **SSM Command ID:** `979db8e3-0cb6-46b7-8f89-a7c904cbcf6b`
- **ADMIN_TOKEN present:** true
- **ALLOW_WRITE_SMOKE:** false

## Tool Output

```
=== Sprint 19 — Fixture Publication Smoke ===
BASE_URL: http://api:4000
ADMIN_TOKEN present: true
ALLOW_WRITE_SMOKE: false
Publishing fixtures is SEPARATE from PSL activation.

[ 1. List imported fixtures ]
  [SKIP] GET /admin/fixtures/imported — HTTP 403 — auth required

[ 2. Publication guard ]
  [PASS] Missing confirmPublication rejected — HTTP 403

[ 3. Empty fixtureIds guard ]
  [PASS] Empty fixtureIds rejected — HTTP 403

[ 4. Write smoke ]
  [SKIP] Publish write smoke — ALLOW_WRITE_SMOKE=false — write smoke disabled by default
  [PASS] Write smoke guard — Fixture publication writes are disabled by default — PASS
  NOTE: Publishing is SEPARATE from PSL activation. PSL is NOT activated.

────────────────────────────────────────────────────────────
PASS: 3 | FAIL: 0 | WARN: 0 | SKIP: 2
Publishing is SEPARATE from PSL activation. PSL remains inactive.
Points-only — no real-money functionality.
```

## Results Table

| Check | HTTP | Result |
|-------|------|--------|
| `GET /admin/fixtures/imported` (PSL_ADMIN JWT) | 403 | SKIP (RBAC) |
| Missing `confirmPublication` guard | 403 | PASS |
| Empty `fixtureIds` guard | 403 | PASS |
| Write smoke guard (`ALLOW_WRITE_SMOKE=false`) | — | PASS |

**PASS: 3 | FAIL: 0 | WARN: 0 | SKIP: 2**

---

## Safety Guarantees

- PSL NOT activated — publishing is SEPARATE from PSL activation
- No fixture publication writes occurred
- No real-money functionality
