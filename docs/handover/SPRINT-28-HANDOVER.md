# Sprint 28: Handover

**Date:** 2026-06-23
**Sprint:** 28
**Engineer:** PSL One Backend Lead

PSL remains INACTIVE. PSL not activated. Wallet SANDBOX. NON-FINANCIAL. No real-money. No billing.

---

## What Was Built

### Schema Changes (Migration 44)
- `ClubMembership` table (`club_memberships`) — links CLUB_ADMIN users to Team (club)
- `SponsorMembership` table (`sponsor_memberships`) — links SPONSOR users to Sponsor
- Back-relations added to `User`, `Team`, `Sponsor` models
- Migration: `apps/api/prisma/migrations/20260623000001_club_sponsor_memberships/`

### New Module: PortalScopeModule
- `apps/api/src/portal-scope/portal-scope.module.ts`
- `apps/api/src/portal-scope/portal-scope.service.ts`
- `apps/api/src/portal-scope/portal-scope.service.spec.ts`

**PortalScopeService methods:**
- `resolveClubScope(userId, role, requestedTeamId?)` → PortalScopeResult
- `resolveSponsorScope(userId, role, requestedSponsorId?)` → PortalScopeResult

### ClubPortalModule Updated
- `club-portal.module.ts` — imports PortalScopeModule
- `club-portal.service.ts` — injects PortalScopeService; all methods take `(userId, role, requestedTeamId?)`; throws on scope denial
- `club-portal.controller.ts` — all routes pass `req.user.sub` and `req.user.role` to service
- `club-portal.service.spec.ts` — updated for new signature + scope mocking
- `club-portal.controller.spec.ts` — updated for new req.user pattern

### SponsorPortalModule Updated
- `sponsor-portal.module.ts` — imports PortalScopeModule
- `sponsor-portal.service.ts` — injects PortalScopeService; all methods take `(userId, role, requestedSponsorId?)`; throws on scope denial
- `sponsor-portal.controller.ts` — all routes pass `req.user.sub` and `req.user.role`
- `sponsor-portal.service.spec.ts` — updated

### AppModule
- `app.module.ts` — imports PortalScopeModule

### Smoke Tools (3)
- `tools/staging/sprint-28-club-scope-smoke.mjs`
- `tools/staging/sprint-28-sponsor-scope-smoke.mjs`
- `tools/staging/sprint-28-role-cross-tenant-smoke.mjs`

---

## GAPs Resolved

| GAP | Description | Resolution |
|---|---|---|
| GAP-27-01 | No user-to-club DB FK | ClubMembership table + PortalScopeService |
| GAP-27-02 | No user-to-sponsor DB FK | SponsorMembership table + PortalScopeService |

---

## What Was NOT Done (Deferred)

| Item | Reason |
|---|---|
| Staging migration deploy | PENDING_OWNER_AUTHORIZATION |
| Membership admin UI | Post-Sprint 28 (currently manual DB insert) |
| Fan-club association | Different feature; post-Sprint 28 |
| Audience segmentation | Still PLANNED |
| Asset management | Still PLANNED |

---

## Owner Actions Required

1. Authorize staging migration: `prisma migrate deploy` on EC2
2. Insert test memberships via SQL
3. Run 3 smoke tools and confirm PASS
4. Merge PR after CI passes

---

## Safety Confirmation

- PSL remains INACTIVE. No PSL activation. No season activation.
- Wallet stays sandbox. No wallet production. No real-money.
- Rewards non-financial. isFinancial: false enforced.
- Billing is INVOICE_ONLY. No payment processing. No billing integration.
- No fixture publication. No scheduled ingestion.
