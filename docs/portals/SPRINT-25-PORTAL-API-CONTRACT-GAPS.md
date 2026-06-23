# Sprint 25 — Portal API Contract Gaps

**Status:** Beta Ready — Gaps Documented
**Date:** 2026-06-23

## Platform Safety Constraints

- PSL remains inactive. World Cup 2026 remains active beta context.
- Wallet remains sandbox-only. No production wallet activation.
- Fantasy remains points-only. No real-money integration.
- Guess the Score remains points-only. No real-money integration.
- Sponsor rewards remain non-financial (points, badges, digital experiences only).
- No production ingestion. No scheduled ingestion.
- No real-money functionality.

## API Pending Endpoints

All portal API clients are implemented but some backend endpoints are pending (marked `API_PENDING: true`).

### Admin Portal API (`admin-portal-api.ts`)

| Endpoint | Status | Notes |
|---|---|---|
| GET /admin/overview | API_PENDING | Aggregated platform status |
| GET /admin/competitions | API_PENDING | May map to /competitions |
| GET /admin/seasons | API_PENDING | May map to /seasons |
| GET /admin/fixtures | EXISTS | /admin/fixtures already wired in Sprint 27 |
| GET /admin/teams | API_PENDING | May map to /teams |
| GET /admin/players | API_PENDING | May map to /players |
| GET /admin/users | API_PENDING | May map to /auth/users |
| GET /admin/audit | API_PENDING | AdminAuditLog from Sprint 35 |
| GET /admin/readiness | EXISTS | SeasonSwitchAudit from Sprint 28 |

### Club Portal API (`club-portal-api.ts`)

| Endpoint | Status | Notes |
|---|---|---|
| GET /clubs/:id | EXISTS | ClubExperienceModule Sprint 26 |
| GET /clubs/:id/players | EXISTS | Sprint 26 |
| GET /clubs/:id/fixtures | EXISTS | Sprint 26 |
| GET /clubs/:id/fans | API_PENDING | New endpoint needed |
| GET /clubs/:id/analytics | API_PENDING | New endpoint needed |
| GET /clubs/:id/content | API_PENDING | New endpoint needed |

### Sponsor Portal API (`sponsor-portal-api.ts`)

| Endpoint | Status | Notes |
|---|---|---|
| GET /sponsors/:id | EXISTS | Sprint 37 SponsorModule |
| GET /sponsors/:id/campaigns | EXISTS | Sprint 37 |
| POST /sponsors/:id/campaigns | EXISTS | Sprint 37 |
| GET /sponsors/:id/rewards | EXISTS | Sprint 37 — non-financial only |
| GET /sponsors/:id/audiences | API_PENDING | New endpoint needed |
| GET /sponsors/:id/activations | EXISTS | Sprint 37 |
| GET /sponsors/:id/analytics | API_PENDING | New endpoint needed |

### Points Rules API (`points-rules-api.ts`)

| Endpoint | Status | Notes |
|---|---|---|
| GET /admin/rules/prediction | EXISTS | PredictionRulesConfig Sprint 30 |
| PATCH /admin/rules/prediction | EXISTS | Sprint 30 |
| GET /admin/rules/prediction/simulation | API_PENDING | New endpoint needed |
| GET /admin/fantasy/rules | EXISTS | FantasyRulesConfig Sprint 14 |
| PATCH /admin/fantasy/rules | EXISTS | Sprint 14 |
| GET /admin/fantasy/rules/simulation | API_PENDING | New endpoint needed |
| GET /admin/points | API_PENDING | Aggregated view needed |

## Resolution Plan

API_PENDING endpoints should be implemented in Sprint 26 backend work, then portal API clients will automatically pick up live data when `NEXT_PUBLIC_API_BASE_URL` points to the running backend.
