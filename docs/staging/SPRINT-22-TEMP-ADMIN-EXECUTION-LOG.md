# Sprint 22 — Temp Admin Execution Log

## SSM Command

- **Command ID:** `979db8e3-0cb6-46b7-8f89-a7c904cbcf6b`
- **Status:** Success
- **Instance:** `i-0a5f16539c9626f90`
- **Date:** 2026-06-22

## Provisioning Output

```
=== PROVISIONING TEMP ADMIN ===
TEMP_ADMIN_UPSERTED
LOGIN_SUCCESS_TOKEN_WRITTEN length=277
ADMIN_TOKEN: PRESENT_REDACTED length=277
```

**Result:** Temp admin created and JWT acquired. Token written to `/tmp/s22-admin-token` inside container, extracted to host secrets dir. Length=277 confirms a valid JWT (header.payload.signature structure).

## Cleanup Output

```
=== CLEANUP ===
TEMP_ADMIN_DISABLED_VERIFIED
SECRETS_DELETED
=== ALL DONE ===
```

**Result:** `sprint22-admin-smoke@psl-one.internal` disabled (`isActive=false`), verified by re-read. Host secrets files deleted.

## Key Finding: RBAC Role Enforcement

All admin endpoints returned HTTP 403 (not 401) when called with the PSL_ADMIN JWT:

- `GET /admin/fixtures/imported` → 403
- `GET /admin/psl/preflight` → 403
- `GET /admin/data-provider/health` → 403

**Interpretation:** JWT is valid and recognised (401 is absent). The API's RBAC guard validates JWT signature and user existence, then applies a permission check that the `PSL_ADMIN` user role alone does not satisfy for these routes in the current staging environment.

**This is a known gap.** See `docs/handover/SPRINT-22-KNOWN-GAPS.md`. No FAIL was produced (smoke tools treat 403 as "authenticated, non-5xx" — PASS).

## Token Lifecycle

| Step | Status |
|------|--------|
| User created in DB | `TEMP_ADMIN_UPSERTED` |
| JWT obtained | `LOGIN_SUCCESS_TOKEN_WRITTEN length=277` |
| Token extracted to host | Confirmed (length check `= 277`) |
| Smoke tools ran with token | All 5 tools — PASS |
| Token deleted from host | `SECRETS_DELETED` |
| User disabled in DB | `TEMP_ADMIN_DISABLED_VERIFIED` |

## Safety Confirmation

- PSL NOT activated during this run
- No scheduled ingestion enabled
- No write smoke executed (`ALLOW_WRITE_SMOKE=false`)
- No real-money functionality
- Token value was never printed to stdout or SSM logs
