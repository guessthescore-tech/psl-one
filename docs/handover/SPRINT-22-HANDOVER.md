# Sprint 22 — Handover

## Sprint Goal

Complete the full authenticated staging smoke that Sprint 21 could not finish due to missing DB-backed admin user. Create temp admin, run all 5 tools, disable temp admin, capture evidence.

## Delivered

| Item | Status |
|------|--------|
| Temp admin provisioned (`sprint22-admin-smoke@psl-one.internal`) | DONE |
| JWT obtained via `/auth/login` (length=277) | DONE |
| JWT never printed to stdout or logs | DONE |
| All 5 Sprint 19 smoke tools run with real auth token | DONE |
| 15 PASS / 0 FAIL / 9 SKIP across all tools | DONE |
| Temp admin disabled after smoke | DONE (`TEMP_ADMIN_DISABLED_VERIFIED`) |
| EC2 secrets deleted | DONE (`SECRETS_DELETED`) |
| 6 staging evidence docs | DONE |
| 5 handover docs | DONE |
| 22 experience tests (836 → 858 total) | DONE |

## Sprint 22 Test Counts

- **API tests:** 1,932 (unchanged)
- **Experience tests:** 858 (+22 from Sprint 21 baseline of 836)
- **Total migrations:** 42 (unchanged)

## Key Technical Finding

pnpm monorepo module resolution: `require('@prisma/client')` and `require('bcrypt')` only resolve inside API container when running from `/app/apps/api` directory (via `NODE_PATH=/app/apps/api/node_modules`). Confirmed fix for all future provisioning scripts.

## RBAC Finding

`PSL_ADMIN` user role alone is not sufficient to access admin endpoints. JWT is valid (no 401) but RBAC guard returns 403. Investigation deferred to Sprint 23. See `docs/handover/SPRINT-22-KNOWN-GAPS.md`.

## Platform State at Handover

- **Beta EC2:** Online, healthy
- **PSL:** INACTIVE
- **WC2026:** ACTIVE
- **Wallet:** SANDBOX
- **Ingestion:** DISABLED (manual only, PSL fixtures ~July/August 2026)
- **Data provider:** NoOpAdapter (default)

## Next Sprint (Sprint 23) Recommended Focus

1. Investigate RBAC guard (`roles.guard.ts`) — resolve PSL_ADMIN 403 on admin endpoints (GAP-22-01)
2. Owner gate: authorise write smoke (`ALLOW_WRITE_SMOKE=true`)
3. Re-run authenticated smoke with resolved RBAC — expect HTTP 200 on admin read endpoints
4. Begin PSL fixture preparation (parser calibration, dry-run)
