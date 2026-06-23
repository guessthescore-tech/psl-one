# Sprint 28: User-to-Org Scoping

**Date:** 2026-06-23
**Sprint:** 28

---

## Overview

Sprint 28 introduces DB-backed user-to-organisation scoping for club and sponsor portals. The scoping mechanism uses two new membership tables (`club_memberships`, `sponsor_memberships`) and a central `PortalScopeService` that resolves scope from the DB before any portal endpoint executes business logic.

PSL remains inactive. Wallet stays sandbox. Non-financial. No real-money.

---

## ClubMembership Table

**Table:** `club_memberships`

| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| user_id | FK → users.id | The CLUB_ADMIN user |
| team_id | FK → teams.id | The assigned club (Team model) |
| role | String | "CLUB_ADMIN" (default) |
| is_active | Boolean | true = active membership |
| created_at | DateTime | Audit |
| updated_at | DateTime | Audit |

Constraints:
- `@@unique([userId, teamId])` — one row per user-team pair
- `@@index([teamId])`, `@@index([userId])` — fast lookups
- `onDelete: Cascade` — membership removed if user or team is deleted

---

## SponsorMembership Table

**Table:** `sponsor_memberships`

| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| user_id | FK → users.id | The SPONSOR user |
| sponsor_id | FK → sponsors.id | The assigned sponsor |
| role | String | "SPONSOR" (default) |
| is_active | Boolean | true = active membership |
| created_at | DateTime | Audit |
| updated_at | DateTime | Audit |

---

## PortalScopeService

Located at `apps/api/src/portal-scope/portal-scope.service.ts`.

### `resolveClubScope(userId, role, requestedTeamId?)`

1. If userId empty → UNAUTHENTICATED (401)
2. If role = PSL_ADMIN → requires `requestedTeamId`; validates team exists; returns allowed
3. If role = CLUB_ADMIN → queries `clubMembership` table for active membership; checks cross-club if teamId provided; returns allowed with membership teamId
4. Any other role → ROLE_NOT_PERMITTED (403)

### `resolveSponsorScope(userId, role, requestedSponsorId?)`

Same pattern for sponsor portal.

---

## Integration Pattern

Portal services call `portalScopeService.resolveClubScope()` at the start of each method. On denial, they throw `ForbiddenException` (403), `BadRequestException` (400), or `NotFoundException` (404). Controllers pass `req.user.sub` (userId) and `req.user.role` from the JWT.

---

## Migration

Migration 44: `20260623000001_club_sponsor_memberships` — additive, creates two new tables. NOT deployed to staging yet (PENDING_OWNER_AUTHORIZATION).

---

## Safety

- PSL remains inactive. No PSL activation.
- Wallet stays sandbox. No wallet production.
- Non-financial rewards only. No real-money.
- Billing stays INVOICE_ONLY.
