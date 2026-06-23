# Sprint 28: Scoping Model Investigation

**Date:** 2026-06-23
**Sprint:** 28
**Status:** COMPLETE

---

## Investigation Questions

### Q1: Does User have clubId?
**No.** The `User` model (`@@map("users")`) has no `clubId` column. It has: id, email, phone, saIdHash, passwordHash, role (UserRole enum), dateOfBirth, isVerified, isActive, createdAt, updatedAt. No org references.

### Q2: Does User have sponsorId?
**No.** Same as above — no `sponsorId` column on User model.

### Q3: Are there membership tables?
**No — prior to Sprint 28.** The closest existing pattern is `FantasyLeagueMember` which associates users to fantasy leagues (userId → FantasyLeague, @@unique, @@map). There were no ClubMembership or SponsorMembership tables.

### Q4: What model represents a "club"?
The `Team` model (`@@map("teams")`) represents a club. It has: id, name, slug, shortName, logoUrl, country, externalId. The `ClubProfile` model (`@@map("club_profiles")`) is a 1:1 extension via `ClubProfile.teamId`. Clubs are always referred to as `Team` in backend code.

### Q5: What model represents a sponsor?
The `Sponsor` model (`@@map("sponsors")`) — separate from Team. Has: id, name, slug, sector, logoUrl, websiteUrl, primaryContactName, primaryContactEmail, status.

### Q6: Should beta use membership tables?
**Yes.** See ADR-032. Reasons:
1. Follows FantasyLeagueMember pattern (established in this codebase)
2. Supports future multi-club admin (CLUB_ADMIN managing multiple clubs)
3. User model stays lean — no org FK coupling
4. isActive flag allows suspension without deletion
5. Additive migration — no breaking changes

### Q7: Migration approach
Add two tables: `club_memberships` and `sponsor_memberships`. Both additive. No changes to existing models. Rollback = drop both tables.

---

## Prior State (GAP-27-01, GAP-27-02)

Club portal accepted `?clubId=<uuid>` query param from any CLUB_ADMIN. No DB check. Any CLUB_ADMIN could pass any teamId. This was documented as `API_SCOPE_PENDING` and returned a placeholder response.

Similarly for sponsor portal: `?sponsorId=<uuid>` from any SPONSOR user.

**Sprint 28 resolves both GAPs.**

---

## Sprint 28 Resolution

- `ClubMembership` table created
- `SponsorMembership` table created
- `PortalScopeService` reads active memberships from DB
- CLUB_ADMIN scope = active `ClubMembership.teamId`
- SPONSOR scope = active `SponsorMembership.sponsorId`
- Cross-tenant access returns `CROSS_CLUB_ACCESS_DENIED` / `CROSS_SPONSOR_ACCESS_DENIED` (403)

---

## Safety Confirmation

- PSL remains inactive. No PSL activation performed.
- Wallet stays sandbox. No wallet production. Non-financial.
- No real-money. No billing. No scheduling.
