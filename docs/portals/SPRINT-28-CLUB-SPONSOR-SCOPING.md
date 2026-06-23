# Sprint 28: Club and Sponsor Portal Scoping

**Date:** 2026-06-23
**Sprint:** 28

---

## Summary

Before Sprint 28, club and sponsor portals used query-param-based scoping (GAP-27-01, GAP-27-02). Any CLUB_ADMIN could pass any `clubId`. Sprint 28 replaces this with DB-backed membership scoping.

PSL remains inactive. Wallet stays sandbox. Non-financial. No real-money.

---

## Club Portal Scoping

**Module:** `ClubPortalModule`
**Controller:** `ClubPortalController` — `@Roles('CLUB_ADMIN', 'PSL_ADMIN')`
**Service:** `ClubPortalService`
**Scope resolver:** `PortalScopeService.resolveClubScope()`

### For CLUB_ADMIN Users

The controller passes `req.user.sub` (userId) and `req.user.role` to every service method. The service calls `resolveClubScope(userId, 'CLUB_ADMIN', teamId?)` which:

1. Queries `club_memberships` for an active membership where `userId` matches
2. If no membership → 403 `API_SCOPE_REQUIRED`
3. If `teamId` query param provided AND doesn't match membership → 403 `CROSS_CLUB_ACCESS_DENIED`
4. Returns the membership's `teamId` as the enforced scope

**Before:** `GET /club-portal/overview?clubId=<uuid>` — any ID accepted
**After:** `GET /club-portal/overview` — scope from DB membership (or `?teamId=<uuid>` for PSL_ADMIN)

### For PSL_ADMIN Users

Must provide `?teamId=<uuid>`. Service validates the team exists. Can access any club.

### Changed: `API_SCOPE_PENDING` replaced

The old `{ scopeStatus: 'API_SCOPE_PENDING' }` response is gone. All methods now throw proper HTTP exceptions on scope failure.

---

## Sponsor Portal Scoping

**Module:** `SponsorPortalModule`
**Controller:** `SponsorPortalController` — `@Roles('SPONSOR', 'PSL_ADMIN')`
**Service:** `SponsorPortalService`
**Scope resolver:** `PortalScopeService.resolveSponsorScope()`

Same pattern as club portal. SPONSOR users get scope from their active `SponsorMembership`. PSL_ADMIN must pass `?sponsorId=<uuid>`.

### Preserved Invariants

- `getBillingPlaceholder()` always returns `INVOICE_ONLY` — no wallet, no real-money
- `getSponsorRewards()` always enforces `isFinancial: false`
- `createCampaignDraft()` always creates `status: 'DRAFT'` — never ACTIVE/PUBLISHED

---

## Assigning Memberships

Currently, memberships must be inserted directly via DB (seed or admin SQL). A future sprint will add an admin UI for membership management.

Example seed:
```sql
INSERT INTO club_memberships (id, user_id, team_id, role, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), '<user-uuid>', '<team-uuid>', 'CLUB_ADMIN', true, now(), now());
```
