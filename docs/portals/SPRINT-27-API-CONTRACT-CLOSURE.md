# Sprint 27 — API Contract Closure

**Date:** 2026-06-23  
**Status:** CLOSED — 13 API_PENDING items resolved → 0 remaining  

---

## API_PENDING Resolution Map

All 13 `API_PENDING: true` comments have been removed from portal clients and
replaced with real endpoint URLs pointing to Sprint 27 backend implementations.

### Club Portal API (`apps/experience/src/lib/club-portal-api.ts`)

| # | Old API_PENDING | New Endpoint |
|---|----------------|--------------|
| 1 | `API_PENDING: true — endpoint GET /club/:clubId/profile` | `GET /club-portal/profile?clubId=${clubId}` |
| 2 | `API_PENDING: true — endpoint GET /club/:clubId/squad` | `GET /club-portal/squad?clubId=${clubId}` |
| 3 | `API_PENDING: true — endpoint GET /club/:clubId/fixtures` | `GET /club-portal/fixtures?clubId=${clubId}` |
| 4 | `API_PENDING: true — endpoint GET /club/:clubId/fans` | `GET /club-portal/fans?clubId=${clubId}` |
| 5 | `API_PENDING: true — endpoint GET /club/:clubId/analytics` | `GET /club-portal/analytics?clubId=${clubId}` |
| 6 | `API_PENDING: true — endpoint GET /club/:clubId/content` | `GET /club-portal/content?clubId=${clubId}` |

### Sponsor Portal API (`apps/experience/src/lib/sponsor-portal-api.ts`)

| # | Old API_PENDING | New Endpoint |
|---|----------------|--------------|
| 7 | `API_PENDING: true — endpoint GET /sponsors/:sponsorId` | `GET /sponsor-portal/profile?sponsorId=${sponsorId}` |
| 8 | `API_PENDING: true — endpoint GET /sponsors/:sponsorId/campaigns` | `GET /sponsor-portal/campaigns?sponsorId=${sponsorId}` |
| 9 | `API_PENDING: true — endpoint POST /sponsors/:sponsorId/campaigns` | `POST /sponsor-portal/campaigns/drafts?sponsorId=${sponsorId}` |
| 10 | `API_PENDING: true — endpoint GET /sponsors/:sponsorId/rewards` | `GET /sponsor-portal/rewards?sponsorId=${sponsorId}` |
| 11 | `API_PENDING: true — endpoint GET /sponsors/:sponsorId/audiences` | `GET /sponsor-portal/audiences?sponsorId=${sponsorId}` |
| 12 | `API_PENDING: true — endpoint GET /sponsors/:sponsorId/activations` | `GET /sponsor-portal/activations?sponsorId=${sponsorId}` |
| 13 | `API_PENDING: true — endpoint GET /sponsors/:sponsorId/analytics` | `GET /sponsor-portal/analytics?sponsorId=${sponsorId}` |

---

## New Endpoints Added (not previously tracked)

In addition to resolving the 13 API_PENDING items, new endpoints were added:

**Club Portal:**
- `GET /club-portal/overview`
- `GET /club-portal/campaigns`
- `GET /club-portal/sponsors`
- `POST /club-portal/content-submissions`

**Sponsor Portal:**
- `GET /sponsor-portal/overview`
- `GET /sponsor-portal/clubs`
- `GET /sponsor-portal/assets`
- `GET /sponsor-portal/billing-placeholder`

---

## Remaining Planned Items

- GAP-27-01: User-club DB scoping (Sprint 28)
- GAP-27-02: User-sponsor DB scoping (Sprint 28)
- GAP-27-03: Audience segmentation (Sprint 28)
- GAP-27-04: Asset management (Sprint 28)
