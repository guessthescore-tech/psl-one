# Sprint 4 — Data Source Truth Table

**Story:** STORY-S4-03  
**Date:** 2026-06-20

This document records which data sources are authoritative for each data type in the premium experience app.

---

## Active Competition Context

| Item | Source | Notes |
|------|--------|-------|
| Active competition | `GET /football/context` | Returns active season + competition |
| Competition name | NestJS backend | Do not hard-code competition names |
| Season dates | NestJS backend | Season is WC 2026 in beta; PSL in future |
| PSL status | NestJS backend | PSL is currently INACTIVE |

---

## Football Data

| Data Type | DESIGN_REVIEW_DATA Source | LIVE_BETA_DATA Source | API Route |
|-----------|--------------------------|----------------------|-----------|
| Fixtures | `WC_FIXTURES` in `data.ts` | NestJS football service | `GET /football/fixtures` |
| Live fixture state | `WC_FIXTURES[0]` (status LIVE) | NestJS live state | `GET /football/fixtures/:id/live-state` |
| Match events | Mock timeline | NestJS events | `GET /football/fixtures/:id/events` |
| Lineups | Mock lineup | NestJS lineups | `GET /football/fixtures/:id/lineups` |
| Teams | `WC_CLUBS` in `data.ts` | NestJS teams | `GET /football/teams` |
| Standings | `WC_STANDINGS` in `data.ts` | NestJS standings (computed) | `GET /football/teams` + season |
| Players | `WC_PLAYERS` in `data.ts` | NestJS players | `GET /football/players` |
| Player stats | Mock stats | NestJS player stats | `GET /player-stats/:id/season/:id/stats` |

---

## Fantasy Data

| Data Type | Source | API Route |
|-----------|--------|-----------|
| Fantasy team | NestJS fantasy service | `GET /fantasy/team` |
| Available players | NestJS fantasy service | `GET /fantasy/players` |
| Transfer window | NestJS fantasy rules config | `GET /fantasy/team` |
| League standings | NestJS fantasy leagues | `GET /fantasy/leagues/:id` |
| Points history | NestJS gameweeks | `GET /fantasy/points-history` |
| Chips | NestJS fantasy service | `GET /fantasy/team` |

---

## Auth and Account

| Data Type | Source | API Route |
|-----------|--------|-----------|
| JWT token | localStorage `psl_access_token` | Set on login/register |
| Auth session | NestJS JWT guard | `GET /auth/me` |
| Fan profile | NestJS profile service | `GET /profile/me` |
| Profile summary | NestJS profile service | `GET /profile/summary` |
| Notification prefs | NestJS notifications service | `GET /notifications/preferences` |
| Favourite team | NestJS profile service (preferredTeamId) | `PATCH /profile/me` |

---

## Predictions and Challenges

| Data Type | Source | Notes |
|-----------|--------|-------|
| Prediction storage | `localStorage psl_predictions` | Client-side in DESIGN_REVIEW mode |
| Challenge links | URL query params | `?fixture=X&h=Y&a=Z` format |
| Backend challenges | `POST /challenges` | For authenticated users in LIVE mode |
| Points ledger | NestJS prediction service | Immutable; not modified by frontend |

---

## Important Rules

1. **Server-provided match state is authoritative.** Never override backend fixture status with client-side state.
2. **Prediction lock determined by fixture status.** If `fixture.status === 'LIVE' || 'HALF_TIME' || 'FINISHED'`, predictions are locked.
3. **No fake "live" claims.** If `DESIGN_REVIEW_DATA`, show the design review banner prominently.
4. **Competition source of truth:** Always derive competition name from backend; never hard-code "PSL DStv Premiership" unless confirmed from API.
5. **No provider data in frontend.** Sports data provider calls happen only inside NestJS services.

---

## Data Labels by Page

Every page that uses `DESIGN_REVIEW_DATA` must show:
- `DesignReviewBanner` component (already in FantasyShell)
- "Design Review Data" label where data cards appear
- "Points only - no real money" in any game surface

Pages that use `LIVE_BETA_DATA` must show:
- Real data source attribution where required
- Truthful empty states when no data is available
- Error states when the API is unreachable
