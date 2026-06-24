# Sprint 28: Cross-Tenant Access Controls

**Date:** 2026-06-23
**Sprint:** 28

---

## Overview

Cross-tenant access prevention ensures that a CLUB_ADMIN cannot access data for a club they are not assigned to, and a SPONSOR user cannot access data for a sponsor they are not assigned to.

PSL remains inactive. Wallet stays sandbox. Non-financial. No real-money.

---

## Denial Mechanism

### CROSS_CLUB_ACCESS_DENIED

Triggered when:
- Role = CLUB_ADMIN
- User has an active `ClubMembership`
- But `requestedTeamId` query param does NOT match `membership.teamId`

**Response:** HTTP 403 ForbiddenException
**Error code:** `CROSS_CLUB_ACCESS_DENIED`
**Message:** "Cross-club access denied — requested teamId does not match membership"

### CROSS_SPONSOR_ACCESS_DENIED

Triggered when:
- Role = SPONSOR
- User has an active `SponsorMembership`
- But `requestedSponsorId` query param does NOT match `membership.sponsorId`

**Response:** HTTP 403 ForbiddenException
**Error code:** `CROSS_SPONSOR_ACCESS_DENIED`
**Message:** "Cross-sponsor access denied — requested sponsorId does not match membership"

---

## Error Codes Reference

| Code | HTTP | When |
|---|---|---|
| `UNAUTHENTICATED` | 401 | No userId in token |
| `CLUB_SCOPE_REQUIRED` | 400 | PSL_ADMIN missing teamId |
| `SPONSOR_SCOPE_REQUIRED` | 400 | PSL_ADMIN missing sponsorId |
| `TEAM_NOT_FOUND` | 404 | PSL_ADMIN teamId not in DB |
| `SPONSOR_NOT_FOUND` | 404 | PSL_ADMIN sponsorId not in DB |
| `API_SCOPE_REQUIRED` | 403 | CLUB_ADMIN/SPONSOR with no active membership |
| `CROSS_CLUB_ACCESS_DENIED` | 403 | CLUB_ADMIN requesting wrong club |
| `CROSS_SPONSOR_ACCESS_DENIED` | 403 | SPONSOR requesting wrong sponsor |
| `ROLE_NOT_PERMITTED` | 403 | FAN/wrong role on portal |

---

## Attack Scenarios Mitigated

### Scenario 1: CLUB_ADMIN queries another club's data
Before Sprint 28: `GET /club-portal/overview?clubId=<other-club>` → returns data (GAP-27-01)
After Sprint 28: `GET /club-portal/overview?teamId=<other-club>` → 403 CROSS_CLUB_ACCESS_DENIED

### Scenario 2: CLUB_ADMIN tries to access sponsor portal
`GET /sponsor-portal/overview` with CLUB_ADMIN JWT → 403 (RolesGuard — CLUB_ADMIN not in @Roles('SPONSOR', 'PSL_ADMIN'))

### Scenario 3: SPONSOR tries to access club portal
`GET /club-portal/overview` with SPONSOR JWT → 403 (RolesGuard — SPONSOR not in @Roles('CLUB_ADMIN', 'PSL_ADMIN'))

### Scenario 4: FAN tries to access any portal
`GET /club-portal/overview` with FAN JWT → 403 (RolesGuard)
`GET /sponsor-portal/overview` with FAN JWT → 403 (RolesGuard)

### Scenario 5: Anonymous access
Any portal endpoint without JWT → 401 (JwtAuthGuard)

### Scenario 6: PSL_ADMIN without scope
`GET /club-portal/overview` with PSL_ADMIN JWT, no teamId → 400 CLUB_SCOPE_REQUIRED

---

## Implementation Location

- `PortalScopeService` — `apps/api/src/portal-scope/portal-scope.service.ts`
- Called from `ClubPortalService.resolveScope()` and `SponsorPortalService.resolveScope()`
- Both portal services throw HTTP exceptions on denial; controllers do not need to handle scope logic
