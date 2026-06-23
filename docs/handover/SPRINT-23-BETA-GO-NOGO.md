# Sprint 23 — Beta Go/No-Go

## Status: CONDITIONAL_GO

## Sprint 23 Gate Checks

| Gate | Result |
|------|--------|
| RBAC root cause identified | PASS — `@Roles('ADMIN')` on non-existent role |
| Fix applied — `@Roles('PSL_ADMIN')` in 3 files | PASS |
| `@Roles('ADMIN')` fully removed from codebase | PASS — 0 occurrences remain |
| New HTTP-level guard tests: 36 added | PASS |
| All API tests pass (1,968) | PASS |
| RolesGuard not bypassed | PASS |
| JwtAuthGuard not removed | PASS |
| Admin endpoints not made public | PASS |
| Unauthenticated → 401 (verified by tests) | PASS |
| FAN role → 403 (verified by tests) | PASS |
| PSL_ADMIN → passes guards (verified by tests) | PASS |
| `.env` hygiene confirmed — file not tracked in git | PASS |
| PSL NOT activated | PASS |
| No scheduled ingestion | PASS |
| No production ingestion | PASS |
| Wallet sandbox-only | PASS |
| No real-money functionality | PASS |
| No provider keys in frontend | PASS |
| No admin JWT committed | PASS |

## Outstanding Conditions

1. **Beta EC2 authenticated smoke not yet run** — RBAC fix is code-only; EC2 deployment and re-smoke pending owner authorisation
2. **PSL fixtures unavailable** — ~July/August 2026; ingestion dry-run will return `sourceEmpty: true` until then
3. **PSL NOT activated** — requires separate owner-authorised Season Switching action
4. **Provider keys should be rotated** if any were shared outside local dev (see `SPRINT-23-ENV-HYGIENE.md`)

## What Is Working

- PSL_ADMIN role now correctly accesses all intended admin endpoints
- Admin RBAC guard correctly enforces 401/403
- All 1,968 API tests pass
- 36 new HTTP-level guard tests provide ongoing regression coverage

## Owner Actions Before Next Milestone

- Authorise beta EC2 re-deployment and authenticated smoke (Sprint 24 gate)
- Confirm provider keys rotation if needed
- Authorise write smoke (`ALLOW_WRITE_SMOKE=true`) when ready

## Platform Status

- Points-only system — no real-money functionality
- WC2026 season ACTIVE, PSL INACTIVE
- Wallet: sandbox mode only
- Ingestion: disabled (manual only, PSL fixtures ~July/August 2026)
