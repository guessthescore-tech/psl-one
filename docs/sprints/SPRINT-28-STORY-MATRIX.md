# Sprint 28: Story Matrix

**Date:** 2026-06-23
**Sprint:** 28
**Status:** COMPLETE (CONDITIONAL_GO)

PSL remains INACTIVE. Wallet SANDBOX. NON-FINANCIAL. No real-money.

---

## Stories Delivered

| ID | Title | Status | Notes |
|---|---|---|---|
| S28-01 | ClubMembership + SponsorMembership tables | COMPLETE | Migration 44 |
| S28-02 | PortalScopeService | COMPLETE | resolveClubScope, resolveSponsorScope |
| S28-03 | ClubPortalModule DB-backed scoping | COMPLETE | GAP-27-01 resolved |
| S28-04 | SponsorPortalModule DB-backed scoping | COMPLETE | GAP-27-02 resolved |
| S28-05 | Cross-tenant access controls | COMPLETE | CROSS_CLUB/SPONSOR_ACCESS_DENIED |
| S28-06 | ADR-032 | COMPLETE | Membership table decision |
| S28-07 | 3 Smoke tools | COMPLETE | PENDING_OWNER_AUTHORIZATION to run |
| S28-08 | 13 Documentation files | COMPLETE | |
| S28-09 | Sprint 28 experience tests | COMPLETE | |

---

## Deferred to Next Sprint

| Item | Reason |
|---|---|
| Staging migration deploy | PENDING_OWNER_AUTHORIZATION |
| Membership admin UI | Scope expansion |
| Multi-club admin support | Future feature |

---

## Test Coverage Delta

| Suite | Before | After | Delta |
|---|---|---|---|
| portal-scope spec | 0 | 22+ | +22 |
| club-portal.service spec | 14 | ~20 | +6 |
| club-portal.controller spec | 10 | 11 | +1 |
| sponsor-portal.service spec | 18 | ~25 | +7 |
| experience spec | (S27 count) | (S28 count) | +Sprint28 block |

---

## Files Changed

### New
- `apps/api/src/portal-scope/portal-scope.module.ts`
- `apps/api/src/portal-scope/portal-scope.service.ts`
- `apps/api/src/portal-scope/portal-scope.service.spec.ts`
- `apps/api/prisma/migrations/20260623000001_club_sponsor_memberships/migration.sql`
- 3 smoke tools
- 13+ docs

### Modified
- `apps/api/prisma/schema.prisma` — 2 new models, 3 back-relations
- `apps/api/src/club-portal/club-portal.module.ts`
- `apps/api/src/club-portal/club-portal.service.ts`
- `apps/api/src/club-portal/club-portal.controller.ts`
- `apps/api/src/club-portal/club-portal.service.spec.ts`
- `apps/api/src/club-portal/club-portal.controller.spec.ts`
- `apps/api/src/sponsor-portal/sponsor-portal.module.ts`
- `apps/api/src/sponsor-portal/sponsor-portal.service.ts`
- `apps/api/src/sponsor-portal/sponsor-portal.controller.ts`
- `apps/api/src/sponsor-portal/sponsor-portal.service.spec.ts`
- `apps/api/src/app.module.ts`
- `apps/experience/src/lib/experience.spec.ts`
