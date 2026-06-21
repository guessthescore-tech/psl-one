# Sprint 6 Delivery Plan — Live Data, Durable Challenges & Fan Onboarding

**Sprint:** 6  
**Theme:** Live Data Boundary, Durable Challenges & Fan Onboarding  
**Status:** COMPLETE  
**Branch:** `feature/sprint-6-live-data-challenges-onboarding`  
**Started:** 2026-06-21  
**Completed:** 2026-06-21

---

## Stories

| Story ID | Title | Status |
|----------|-------|--------|
| S6-01 | Provider Trial Boundary & Live Data Discovery | COMPLETE |
| S6-02 | Durable Prediction Challenge Backend | COMPLETE |
| S6-03 | Fan Onboarding Journey | COMPLETE |
| S6-04 | Preview Analytics Adapter | COMPLETE |
| S6-05 | Live Data Route Upgrade | PARTIAL — routes truthfully classified, no provider key in production |
| S6-06 | Sprint 6 Release Gate | COMPLETE |

---

## New Endpoints

| Method | Path | Auth | Module |
|--------|------|------|--------|
| POST | /predictions/challenges | JWT | PredictionChallengesModule |
| GET | /predictions/challenges | JWT | PredictionChallengesModule |
| GET | /predictions/challenges/:token | Public | PredictionChallengesModule |
| POST | /predictions/challenges/:token/accept | JWT | PredictionChallengesModule |
| GET | /predictions/challenges/:token/status | Public | PredictionChallengesModule |
| GET | /account/onboarding | JWT | AccountModule |
| GET | /admin/data-provider/health | Admin | DataProviderModule |
| GET | /admin/data-provider/discovery/seasons | Admin | DataProviderModule |
| GET | /admin/data-provider/discovery/fixtures/:seasonId | Admin | DataProviderModule |
| GET | /admin/data-provider/discovery/teams/:seasonId | Admin | DataProviderModule |
| POST | /analytics/events | Public | PreviewAnalyticsModule |

---

## New Models

- `PredictionChallenge` — token-based shareable challenge (Migration 41)
- `PredictionChallengeStatus` enum — PENDING, ACCEPTED, EXPIRED, CANCELLED, LOCKED
- `AuditEvent` extensions — CHALLENGE_TOKEN_CREATED, CHALLENGE_TOKEN_ACCEPTED

---

## Product Constraints Confirmed

- PSL season: INACTIVE (WC2026 ACTIVE)
- Wallet: sandbox only
- Fantasy: points only, no monetary value
- No production provider ingestion
- No API keys in frontend code
- No real-money functionality
- STORY-40: RESERVED
