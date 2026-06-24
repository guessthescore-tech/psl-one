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

**Status:** STAGING_SMOKE_PENDING

Results will be populated after EC2 deployment and smoke run.
See `SPRINT-29-CROSS-TENANT-SMOKE-EXECUTION-LOG.md`.

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
