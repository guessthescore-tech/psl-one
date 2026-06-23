# ADR-032: User-to-Club and User-to-Sponsor Scoping via Membership Tables

**Status:** ACCEPTED
**Date:** 2026-06-23
**Authors:** PSL One Backend Lead
**Sprint:** 28
**Previous ADR:** ADR-031 (Sponsor Billing Off-Platform)
**Next ADR:** ADR-033

---

## Context

Prior to Sprint 28, club portal and sponsor portal routes accepted a `clubId`/`sponsorId` query parameter directly and returned `{ scopeStatus: 'API_SCOPE_PENDING' }` if not provided. This was a GAP (GAP-27-01, GAP-27-02) — any CLUB_ADMIN could pass any teamId in the query parameter and access arbitrary club data.

We need DB-backed user-to-club and user-to-sponsor scoping before beta goes to external users.

The `User` model has no `clubId` or `sponsorId` column. We need to decide how to add scoping.

**Safety constraints (non-negotiable):**
- No PSL activation. PSL remains inactive. Season NOT activated.
- No wallet production. No real-money. Wallet stays sandbox.
- Non-financial rewards only. No cash payouts.
- No billing integration. Invoice-only per ADR-031.
- No scheduled ingestion. No fixture publication.

---

## Decision

**Use membership tables (`ClubMembership`, `SponsorMembership`) — NOT a direct FK on `User`.**

### Models Added

```prisma
model ClubMembership {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  teamId    String   @map("team_id")
  role      String   @default("CLUB_ADMIN") @map("role")
  isActive  Boolean  @default(true) @map("is_active")
  // ... relations to User and Team with CASCADE
  @@unique([userId, teamId])
  @@map("club_memberships")
}

model SponsorMembership {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  sponsorId String   @map("sponsor_id")
  role      String   @default("SPONSOR") @map("role")
  isActive  Boolean  @default(true) @map("is_active")
  // ... relations to User and Sponsor with CASCADE
  @@unique([userId, sponsorId])
  @@map("sponsor_memberships")
}
```

---

## Why Membership Tables (not FK on User)

| Approach | Pros | Cons |
|---|---|---|
| FK on User (`User.clubId`) | Simple lookup | One-club limit; breaks if club admin manages multiple clubs; User model grows with every org type |
| Membership table | Follows established FantasyLeagueMember pattern; supports future multi-club admin; isActive flag for suspension; additive migration only | One extra query per portal request |

The `FantasyLeagueMember` model is the established pattern in this codebase for user-to-org associations. We follow the same pattern.

---

## RBAC Rules

| Role | Club Portal Access | Sponsor Portal Access |
|---|---|---|
| FAN | DENIED (403) — not in @Roles | DENIED (403) — not in @Roles |
| CLUB_ADMIN | Scoped to their active ClubMembership only | DENIED (403) — wrong role |
| SPONSOR | DENIED (403) — wrong role | Scoped to their active SponsorMembership only |
| PSL_ADMIN | Must provide explicit `teamId` query param | Must provide explicit `sponsorId` query param |
| Anonymous | DENIED (401) | DENIED (401) |

**Cross-tenant denial:** CLUB_ADMIN requesting a `teamId` that does not match their membership returns `CROSS_CLUB_ACCESS_DENIED` (403). Similarly for SPONSOR with wrong `sponsorId`.

---

## Migration Impact

- Migration `20260623000001_club_sponsor_memberships`
- Additive only — two new tables, no changes to existing User, Team, or Sponsor columns
- Rollback: `DROP TABLE club_memberships; DROP TABLE sponsor_memberships;`
- No data migration needed — existing users simply have no memberships until assigned

---

## Beta Limitation

- Staging smoke: `PENDING_OWNER_AUTHORIZATION` — deployment requires owner instruction per staging runbook
- No staging deployment performed in this sprint
- No PSL activation performed
- No production deployment

---

## Confirmed Constraints

- No PSL activation. PSL remains INACTIVE.
- No wallet production. SANDBOX only. No real-money.
- Non-financial rewards only. isFinancial: false enforced.
- No billing integration. INVOICE_ONLY per ADR-031.
- No fixture publication. No scheduled ingestion.
- No admin token exposed in code.
