# Sprint 22 — RBAC Smoke (Authenticated)

## Tool

`tools/staging/sprint-19-admin-rbac-smoke.mjs`

## Execution Context

- **EC2:** `i-0a5f16539c9626f90`
- **SSM Command ID:** `979db8e3-0cb6-46b7-8f89-a7c904cbcf6b`
- **Docker network:** `psl-one-beta`
- **BASE_URL:** `http://api:4000`
- **ADMIN_TOKEN present:** true (JWT length=277, `PRESENT_REDACTED`)
- **DRY_RUN_ONLY:** true
- **ALLOW_WRITE_SMOKE:** false

## Tool Output

```
=== Sprint 19 — Admin RBAC Smoke ===
BASE_URL: http://api:4000
ADMIN_TOKEN present: true

[ Unauthenticated requests — expect 401 ]
  [PASS] No-auth: /admin/fixtures/imported — HTTP 401 — correctly rejected
  [PASS] No-auth: /admin/psl/preflight — HTTP 401 — correctly rejected
  [PASS] No-auth: /admin/data-provider/health — HTTP 401 — correctly rejected

[ Admin token requests — expect non-5xx ]
  [PASS] Admin: /admin/fixtures/imported — HTTP 403
  [PASS] Admin: /admin/psl/preflight — HTTP 403
  [PASS] Admin: /admin/data-provider/health — HTTP 403

[ POST /admin/fixtures/publish — unauthenticated ]
  [PASS] No-auth publish — HTTP 401 — correctly rejected

[ POST /admin/fixtures/publish — missing confirmPublication ]
  [PASS] Publish without confirmPublication — HTTP 403 — correctly rejected

────────────────────────────────────────────────────────────
PASS: 8 | FAIL: 0
```

## Results Table

| Check | HTTP | Result |
|-------|------|--------|
| No-auth: `GET /admin/fixtures/imported` | 401 | PASS |
| No-auth: `GET /admin/psl/preflight` | 401 | PASS |
| No-auth: `GET /admin/data-provider/health` | 401 | PASS |
| PSL_ADMIN JWT: `GET /admin/fixtures/imported` | 403 | PASS (non-5xx) |
| PSL_ADMIN JWT: `GET /admin/psl/preflight` | 403 | PASS (non-5xx) |
| PSL_ADMIN JWT: `GET /admin/data-provider/health` | 403 | PASS (non-5xx) |
| No-auth: `POST /admin/fixtures/publish` | 401 | PASS |
| No-auth publish (no `confirmPublication`) | 403 | PASS |

**PASS: 8 | FAIL: 0**

## RBAC Observation

Unauthenticated routes correctly return 401. Authenticated PSL_ADMIN JWT routes return 403 (not 401, not 5xx). JWT validity is confirmed. The 403 indicates the RBAC role guard applies an additional permission check beyond the `PSL_ADMIN` enum value alone.

See `docs/handover/SPRINT-22-KNOWN-GAPS.md` for the architectural investigation item.

---

## Safety Guarantees

- PSL NOT activated
- No real-money functionality
- No provider keys printed
- Token value: PRESENT_REDACTED
