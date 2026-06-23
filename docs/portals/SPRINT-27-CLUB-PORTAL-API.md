# Sprint 27 — Club Portal API

**Status:** IMPLEMENTED  
**Date:** 2026-06-23  

---

## Overview

ClubPortalModule provides authenticated API endpoints for club administrators.
Role access: `CLUB_ADMIN`, `PSL_ADMIN`.

PSL remains INACTIVE. Wallet is SANDBOX only. All operations are non-financial.

---

## RBAC Table

| Role | Access |
|------|--------|
| `PSL_ADMIN` | Full access to all club-portal endpoints |
| `CLUB_ADMIN` | Full access to all club-portal endpoints |
| `SPONSOR` | FORBIDDEN (403) |
| `FAN` | FORBIDDEN (401/403) |
| Unauthenticated | FORBIDDEN (401) |

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/club-portal/overview` | Club overview: team, player count, recent fixtures |
| GET | `/club-portal/profile` | Club profile with ClubProfile relation |
| GET | `/club-portal/squad` | Club players |
| GET | `/club-portal/fixtures` | Recent fixtures (home or away), take 20 |
| GET | `/club-portal/fans` | Fan placeholder (GAP-27-01: fan-club FK pending) |
| GET | `/club-portal/analytics` | Aggregate counts: players, fixtures, content |
| GET | `/club-portal/campaigns` | SponsorCampaigns where clubId matches |
| GET | `/club-portal/sponsors` | Distinct sponsors via campaign association |
| GET | `/club-portal/content` | ClubContentItems where teamId matches |
| POST | `/club-portal/content-submissions` | Create ClubContentItem (DRAFT status only) |

All endpoints accept `?clubId=` query parameter.

---

## Scope Pending Pattern

When `clubId` is not provided, endpoints return:
```json
{
  "scopeStatus": "API_SCOPE_PENDING",
  "reason": "Provide clubId query param. GAP-27-01: No user-club FK."
}
```

GAP-27-01: User-to-club database scoping is planned for Sprint 28.

---

## Content Submission

POST `/club-portal/content-submissions` creates a `ClubContentItem` with:
- `status: 'DRAFT'` always
- `type` mapped from contentType string to `ClubContentType` enum
- Never creates PUBLISHED content directly
