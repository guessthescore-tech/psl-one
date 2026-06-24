# Sprint 29 Cross-Tenant Access Verification

**Date:** 2026-06-24
**Author:** Sprint 29 Principal Delivery Orchestrator
**Scope:** Club and Sponsor portal cross-tenant isolation

---

## Overview

Sprint 28 introduced `ClubMembership` and `SponsorMembership` DB-backed scoping
via `PortalScopeService`. Sprint 29 verifies these controls in the live beta
environment through a structured cross-tenant smoke run.

---

## Controls Under Test

### CROSS_CLUB_ACCESS_DENIED

- **Location:** `apps/api/src/club-portal/club-portal.service.ts`
- **Guard:** `PortalScopeService.assertClubScope(userId, requestedTeamId, userRole)`
- **Behaviour:**
  - `PSL_ADMIN`: may pass any `teamId` — bypasses membership check
  - `CLUB_ADMIN`: must have an active `ClubMembership` for `requestedTeamId`; if not, throws `ForbiddenException('CROSS_CLUB_ACCESS_DENIED')`
  - Other roles: blocked by `@Roles('CLUB_ADMIN', 'PSL_ADMIN')` guard before reaching scope check

### CROSS_SPONSOR_ACCESS_DENIED

- **Location:** `apps/api/src/sponsor-portal/sponsor-portal.service.ts`
- **Guard:** `PortalScopeService.assertSponsorScope(userId, requestedSponsorId, userRole)`
- **Behaviour:**
  - `PSL_ADMIN`: may pass any `sponsorId`
  - `SPONSOR`: must have an active `SponsorMembership` for `requestedSponsorId`; if not, throws `ForbiddenException('CROSS_SPONSOR_ACCESS_DENIED')`

---

## Verification Matrix (design-time)

| Scenario | Actor | Target | Expected HTTP | Reason |
|---|---|---|---|---|
| Own club | CLUB_ADMIN | Membered teamId | 200 | ClubMembership exists |
| Foreign club | CLUB_ADMIN | Non-membered teamId | **403** | CROSS_CLUB_ACCESS_DENIED |
| Sponsor portal | CLUB_ADMIN | Any sponsorId | **403** | Role guard blocks |
| Own sponsor | SPONSOR | Membered sponsorId | 200 | SponsorMembership exists |
| Foreign sponsor | SPONSOR | Non-membered sponsorId | **403** | CROSS_SPONSOR_ACCESS_DENIED |
| Club portal | SPONSOR | Any teamId | **403** | Role guard blocks |
| Admin + explicit scope | PSL_ADMIN | Any teamId/sponsorId | 200 | Admin override |
| Admin + no scope | PSL_ADMIN | None | 400/403 | Missing required param |
| Fan | FAN | Any | **403** | Role not in @Roles() |
| Anonymous | ANON | Any | **401** | JwtAuthGuard |

---

## Beta Smoke Results

**Status:** SMOKE_PASS — 21 PASS / 0 FAIL / 0 SKIP (2026-06-24T07:51:48Z)
**Deploy run:** 28082159537, SHA 2605b372df829ea77f76c9c334909d54abdec294

| Scenario | Actor | Target | Expected | Actual | Status |
|---|---|---|---|---|---|
| Own club | CLUB_ADMIN | Membered teamId | 200 | 200 | **PASS** |
| Foreign club | CLUB_ADMIN | Non-membered teamId | 403 | 403 | **PASS** |
| Sponsor portal | CLUB_ADMIN | Any sponsorId | 403 | 403 | **PASS** |
| Own sponsor | SPONSOR | Membered sponsorId | 200 | 200 | **PASS** |
| Foreign sponsor | SPONSOR | Non-membered sponsorId | 403 | 403 | **PASS** |
| Club portal | SPONSOR | Any teamId | 403 | 403 | **PASS** |
| Admin + explicit scope | PSL_ADMIN | Any teamId/sponsorId | 200 | 200 | **PASS** |
| Admin + no scope | PSL_ADMIN | None | 400/403 | 400 | **PASS** |
| Fan | FAN | Any | 403 | 403 | **PASS** |
| Anonymous | ANON | Any | 401 | 401 | **PASS** |

All cross-tenant denial checks returned 403. No 200 returned for unauthorised access.
No unauthenticated access (all anon checks returned 401).
`CROSS_CLUB_ACCESS_DENIED` enforced. `CROSS_SPONSOR_ACCESS_DENIED` enforced.

See `SPRINT-29-CROSS-TENANT-SMOKE-EXECUTION-LOG.md` for full output.

---

## Unit Test Coverage

Cross-tenant scope enforcement is covered by:
- `apps/api/src/club-portal/club-portal.controller.spec.ts` — RBAC + scope tests
- `apps/api/src/sponsor-portal/sponsor-portal.controller.spec.ts` — RBAC + scope tests
- `apps/api/src/club-portal/portal-scope.service.spec.ts` — `assertClubScope` unit tests
- `apps/api/src/sponsor-portal/portal-scope.service.spec.ts` — `assertSponsorScope` unit tests

---

## No-PSL-Activation Assertion

No step in cross-tenant verification modifies the PSL season state.
PSL remains INACTIVE on beta EC2 throughout this verification.

---

## Audit Log

All portal access attempts are logged via `AdminAuditLog` when applicable.
Forbidden access attempts generate audit events with `CROSS_TENANT_DENIED` action.
