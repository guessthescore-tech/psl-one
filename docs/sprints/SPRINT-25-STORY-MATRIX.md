# Sprint 25 — Story Matrix

**Status:** Complete
**Date:** 2026-06-23

## Platform Safety Constraints

- PSL remains inactive. World Cup 2026 remains active beta context.
- Wallet remains sandbox-only. No production wallet activation.
- Fantasy remains points-only. No real-money integration.
- Guess the Score remains points-only. No real-money integration.
- Sponsor rewards remain non-financial (points, badges, digital experiences only).
- No production ingestion. No scheduled ingestion.
- No real-money functionality.

## Story Matrix

| Story ID | Title | Status | Pages | Tests |
|---|---|---|---|---|
| S25-01 | Portal Shell Components | DONE | 0 (components) | Spec coverage |
| S25-02 | Admin Portal (22 pages) | DONE | 22 | Spec coverage |
| S25-03 | Club Portal (14 pages) | DONE | 14 | Spec coverage |
| S25-04 | Sponsor Portal (13 pages) | DONE | 13 | Spec coverage |
| S25-05 | Points/Rules Management UI | DONE | 4 (rules+sim) | Spec coverage |
| S25-06 | Portal API Clients | DONE | 0 (lib files) | Spec coverage |
| S25-07 | Portal Route Constants | DONE | 0 (lib file) | Spec coverage |
| S25-08 | Portal Documentation | DONE | 13 docs | Spec coverage |
| S25-09 | Portal Test Coverage | DONE | 0 | 100+ new tests |

## Deliverables Summary

### Components Built: 8

1. PortalShell.tsx
2. PortalSidebar.tsx
3. PortalTopbar.tsx
4. PortalStatusBadges.tsx
5. PortalMetricCard.tsx
6. PortalDataTable.tsx
7. PortalEmptyState.tsx
8. PortalConfirmDialog.tsx

### Pages Built: 49

- Admin: 22 pages
- Club: 14 pages
- Sponsor: 13 pages

### API Clients: 4

- admin-portal-api.ts
- club-portal-api.ts
- sponsor-portal-api.ts
- points-rules-api.ts

### Documentation: 13 files

- 7 portal docs
- 5 handover docs
- 1 sprint matrix

## Safety Audit

| Check | Result |
|---|---|
| PSL not activated | PASS |
| Wallet sandbox only | PASS |
| GTS points only | PASS |
| Fantasy points only | PASS |
| Sponsor rewards non-financial | PASS |
| No production ingestion | PASS |
| No scheduled ingestion | PASS |
| No real money | PASS |
| No provider keys in frontend | PASS |
| No ADMIN_TOKEN in frontend | PASS |
| RBAC at API layer | PASS |
| Audit logs not bypassed | PASS |
