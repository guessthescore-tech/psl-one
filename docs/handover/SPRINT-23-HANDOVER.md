# Sprint 23 — Handover

## Sprint Goal

Investigate and fix the GAP-22-01 RBAC issue where PSL_ADMIN JWT was accepted but all admin endpoints returned 403. Address the pre-existing `.env` hygiene concern identified in Sprint 22.

## Delivered

| Item | Status |
|------|--------|
| RBAC root cause identified | DONE |
| `@Roles('ADMIN')` → `@Roles('PSL_ADMIN')` in 3 files (5 decorators) | DONE |
| No `@Roles('ADMIN')` remaining in codebase | DONE |
| 36 new HTTP-level guard tests (fixture publication, data-provider, prediction challenges) | DONE |
| `.env` hygiene confirmed — not tracked, correctly gitignored | DONE |
| 3 security docs | DONE |
| 5 handover docs | DONE |
| Sprint 23 story matrix | DONE |
| Experience tests updated (+22) | DONE |
| All gates passing | DONE |

## Root Cause

`@Roles('ADMIN')` was used in 3 controllers but `'ADMIN'` is not a value in the `UserRole` enum (`FAN`, `CLUB_ADMIN`, `SPONSOR`, `PSL_ADMIN`). Since `RolesGuard` performs an exact string match, all affected endpoints returned HTTP 403 for ALL users — including PSL_ADMIN.

## Fix

One-line change per controller: `@Roles('ADMIN')` → `@Roles('PSL_ADMIN')`. No guard logic changed, no bypass introduced.

## Test Counts at Handover

| Suite | Count |
|-------|-------|
| API tests | 1,968 (+36) |
| Experience tests | 884 (+23) |
| Total migrations | 42 (unchanged) |

## Platform State at Handover

- **Beta EC2:** RBAC fix not yet deployed — pending owner authorisation for re-deployment
- **PSL:** INACTIVE
- **WC2026:** ACTIVE
- **Wallet:** SANDBOX
- **Ingestion:** DISABLED (manual only)

## Next Sprint (Sprint 24) Recommended Focus

1. Owner-authorised beta EC2 re-deployment with RBAC fix
2. Authenticated admin smoke — verify PSL_ADMIN now gets HTTP 200 (not 403) on admin endpoints
3. Begin PSL fixture preparation when July/August 2026 fixtures become available
