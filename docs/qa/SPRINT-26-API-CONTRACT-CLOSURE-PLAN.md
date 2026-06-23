# Sprint 26 — API Contract Closure Plan

**Date:** 2026-06-23
**Sprint:** 26 (Controlled User Testing)
**Purpose:** Convert API_PENDING gaps from Sprint 25/26 portal API contracts into Sprint 27 backlog

---

## Summary

| Portal     | API_PENDING Endpoints | Sprint 27 Priority |
|------------|----------------------|--------------------|
| Club       | 6                    | HIGH               |
| Sponsor    | 7                    | HIGH               |
| Admin      | 0                    | N/A (complete)     |

Total API_PENDING gaps: **13 endpoints**

---

## Club Portal API Gaps

Source: `apps/experience/src/lib/club-portal-api.ts`

| Endpoint                          | Function              | Method | Status         | Sprint 27 Action                        |
|-----------------------------------|-----------------------|--------|----------------|-----------------------------------------|
| `GET /club/:clubId/profile`       | `getClubProfile`      | GET    | API_PENDING    | Implement ClubPortalModule.getProfile   |
| `GET /club/:clubId/squad`         | `getClubSquad`        | GET    | API_PENDING    | Implement ClubPortalModule.getSquad     |
| `GET /club/:clubId/fixtures`      | `getClubFixtures`     | GET    | API_PENDING    | Implement ClubPortalModule.getFixtures  |
| `GET /club/:clubId/fans`          | `getClubFans`         | GET    | API_PENDING    | Implement ClubPortalModule.getFans      |
| `GET /club/:clubId/analytics`     | `getClubAnalytics`    | GET    | API_PENDING    | Implement ClubPortalModule.getAnalytics |
| `GET /club/:clubId/content`       | `getClubContent`      | GET    | API_PENDING    | Implement ClubPortalModule.getContent   |

**Prerequisite:** CLUB_ADMIN JWT provisioned on staging for RBAC smoke after implementation.

---

## Sponsor Portal API Gaps

Source: `apps/experience/src/lib/sponsor-portal-api.ts`

| Endpoint                                    | Function                   | Method | Status         | Sprint 27 Action                            |
|---------------------------------------------|----------------------------|--------|----------------|---------------------------------------------|
| `GET /sponsors/:sponsorId`                  | `getSponsorProfile`        | GET    | API_PENDING    | Implement SponsorPortalModule.getProfile     |
| `GET /sponsors/:sponsorId/campaigns`        | `getSponsorCampaigns`      | GET    | API_PENDING    | Implement SponsorPortalModule.getCampaigns   |
| `POST /sponsors/:sponsorId/campaigns`       | `createSponsorCampaign`    | POST   | API_PENDING    | Implement SponsorPortalModule.createCampaign |
| `GET /sponsors/:sponsorId/rewards`          | `getSponsorRewards`        | GET    | API_PENDING    | Implement SponsorPortalModule.getRewards     |
| `GET /sponsors/:sponsorId/audiences`        | `getSponsorAudiences`      | GET    | API_PENDING    | Implement SponsorPortalModule.getAudiences   |
| `GET /sponsors/:sponsorId/activations`      | `getSponsorActivations`    | GET    | API_PENDING    | Implement SponsorPortalModule.getActivations |
| `GET /sponsors/:sponsorId/analytics`        | `getSponsorAnalytics`      | GET    | API_PENDING    | Implement SponsorPortalModule.getAnalytics   |

**Prerequisite:** Sponsor Billing ADR authored before `createSponsorCampaign` billing integration.
**Prerequisite:** SPONSOR_ADMIN JWT provisioned on staging for RBAC smoke after implementation.

---

## Admin Portal API Gaps

**Status:** None — all admin portal API contracts are backed by NestJS endpoints.

Admin portal API contract (`apps/experience/src/lib/admin-portal-api.ts`) is fully implemented.
No gaps to close for admin portal in Sprint 27.

---

## Points / Rules API Gaps

| Gap                                | Description                                             | Status      |
|------------------------------------|---------------------------------------------------------|-------------|
| PredictionRulesConfig admin        | Admin config for GTS rules — COMPLETE (Sprint 30)       | CLOSED      |
| FantasyRulesConfig admin           | Admin config for Fantasy rules — COMPLETE (Sprint 14)   | CLOSED      |
| Points simulation API              | Admin simulation tool — COMPLETE                        | CLOSED      |
| Points leaderboard season scope    | Season-scoped leaderboards — COMPLETE (Sprint 33)       | CLOSED      |

No points/rules API gaps.

---

## Billing ADR Requirement

Before any billing implementation proceeds:

1. Author `ADR-031-sponsor-billing.md` in `docs/adr/`
2. Review must cover: payment provider selection, compliance requirements, financial regulations
   (POPIA, Consumer Protection Act), settlement flows, refund policy, sandbox-first approach
3. ADR must be approved by owner before implementation begins
4. Billing page remains at `/sponsor/billing-placeholder` until ADR is approved

**Current next ADR number:** ADR-030 (check `docs/adr/` for latest)

---

## RBAC Staging Smoke Requirements

Before club/sponsor portals can be fully smoke-tested:

1. **CLUB_ADMIN JWT:** Owner provisions test account with `CLUB_ADMIN` role on staging
2. **SPONSOR_ADMIN JWT:** Owner provisions test account with `SPONSOR_ADMIN` role on staging
3. **Smoke script:** `tools/staging/sprint-26-role-route-smoke.mjs` with tokens provided
4. **Expected results:** CLUB_ADMIN: 14/0, SPONSOR_ADMIN: 13/0

---

## Sprint 27 Delivery Priority

| Priority | Action                                        | Owner        | Prerequisite                     |
|----------|-----------------------------------------------|--------------|----------------------------------|
| 1        | ClubPortalModule — 6 GET endpoints            | Engineering  | None                             |
| 2        | SponsorPortalModule — 6 GET endpoints         | Engineering  | None                             |
| 3        | `createSponsorCampaign` POST endpoint         | Engineering  | Sponsor Billing ADR              |
| 4        | CLUB_ADMIN staging smoke                      | Owner + Eng  | Owner provisions JWT             |
| 5        | SPONSOR_ADMIN staging smoke                   | Owner + Eng  | Owner provisions JWT             |
| 6        | Sponsor Billing ADR (ADR-031)                 | Engineering  | Owner review                     |

---

## GAP References

- GAP-26-01: Club portal API contracts API_PENDING (6 endpoints in `club-portal-api.ts`)
- GAP-26-02: Sponsor portal API contracts API_PENDING (7 endpoints in `sponsor-portal-api.ts`)
- GAP-26-03: CLUB_ADMIN staging smoke PENDING_TOKEN
- GAP-26-04: SPONSOR_ADMIN staging smoke PENDING_TOKEN
- GAP-26-06: Sponsor billing ADR not yet written
