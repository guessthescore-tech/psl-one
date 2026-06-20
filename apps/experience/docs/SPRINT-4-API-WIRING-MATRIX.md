# Sprint 4 — API Wiring Matrix

**Story:** STORY-S4-03  
**Agent:** Agent 4 — API Wiring and Data Truth  
**Date:** 2026-06-20  
**Routes audited:** 52 pages in `apps/experience/src/app`
**Last reconciled:** 2026-06-20 (Sprint 4 final reconciliation)

---

## Classification Key

| Status | Meaning |
|--------|---------|
| `LIVE_BETA_DATA` | Wired to real PSL One NestJS API; mode-switched via `getDataMode()` |
| `DESIGN_REVIEW_DATA` | Uses local mock/design data; no real API call |
| `STATIC_CONTENT` | No dynamic data; static page |
| `MISSING_BACKEND_CONTRACT` | Frontend exists; no backend route available yet |
| `DEFERRED_STUB` | Intentionally stubbed; backend exists but wiring deferred |
| `PARTIAL` | Some data from real API; some from design review |

---

## Route Classification Table

| Route | Page File | Data Status | Backend Route | Notes |
|-------|-----------|-------------|---------------|-------|
| `/` | `app/page.tsx` | `PARTIAL` | Multiple | WC_FIXTURES design data; competition from backend |
| `/matches` | `app/matches/page.tsx` | `LIVE_BETA_DATA` | `GET /football/fixtures` | Mode-switched |
| `/matches/[fixtureId]` | `app/matches/[fixtureId]/page.tsx` | `LIVE_BETA_DATA` | `GET /football/fixtures/:id` | Full match centre |
| `/matches/[fixtureId]/motm` | `app/matches/[fixtureId]/motm/page.tsx` | `DESIGN_REVIEW_DATA` | `POST /social-predictions/direct-challenges` | MOTM voting → social prediction |
| `/predict` | `app/predict/page.tsx` | `PARTIAL` | `GET /football/fixtures?status=SCHEDULED` | DESIGN_REVIEW uses WC_FIXTURES; LIVE calls football API |
| `/predict/challenge` | `app/predict/challenge/page.tsx` | `DESIGN_REVIEW_DATA` | `POST /challenges` | Link-based challenges; backend exists for auth'd users |
| `/predict/challenge/accept` | `app/predict/challenge/accept/page.tsx` | `DESIGN_REVIEW_DATA` | `POST /challenges/:id/accept` | Link-based acceptance; backend exists |
| `/stats/standings` | `app/stats/standings/page.tsx` | `LIVE_BETA_DATA` | `GET /football/teams`, `GET /football/context` | Mode-switched |
| `/stats/season` | `app/stats/season/page.tsx` | `LIVE_BETA_DATA` | `GET /football/fixtures` | Season fixtures/results |
| `/stats/awards` | `app/stats/awards/page.tsx` | `DESIGN_REVIEW_DATA` | — | `MISSING_BACKEND_CONTRACT` — no awards endpoint |
| `/stats/hall-of-fame` | `app/stats/hall-of-fame/page.tsx` | `DESIGN_REVIEW_DATA` | — | `MISSING_BACKEND_CONTRACT` — no hall of fame endpoint |
| `/stats/compare` | `app/stats/compare/page.tsx` | `DESIGN_REVIEW_DATA` | — | `MISSING_BACKEND_CONTRACT` — no comparison endpoint |
| `/players` | `app/players/page.tsx` | `LIVE_BETA_DATA` | `GET /football/players` | Mode-switched |
| `/players/[playerId]` | `app/players/[playerId]/page.tsx` | `LIVE_BETA_DATA` | `GET /football/players/:id` | Player profile |
| `/players/[playerId]/stats` | `app/players/[playerId]/stats/page.tsx` | `LIVE_BETA_DATA` | `GET /player-stats/:id/season/:seasonId/stats` | Player stats |
| `/fantasy` | `app/fantasy/page.tsx` | `PARTIAL` | `GET /fantasy/team` | Fantasy hub — team state from backend; picks from design |
| `/fantasy/onboarding` | `app/fantasy/onboarding/page.tsx` | `LIVE_BETA_DATA` | `POST /fantasy/team` | Create team |
| `/fantasy/team` | `app/fantasy/team/page.tsx` | `LIVE_BETA_DATA` | `GET /fantasy/team`, `GET /fantasy/players` | Squad view |
| `/fantasy/team/transfers` | `app/fantasy/team/transfers/page.tsx` | `LIVE_BETA_DATA` | `POST /fantasy/transfers` | Transfer window |
| `/fantasy/team/chips` | `app/fantasy/team/chips/page.tsx` | `LIVE_BETA_DATA` | `GET /fantasy/team`, `POST /fantasy/chips` | Chips |
| `/fantasy/fixtures` | `app/fantasy/fixtures/page.tsx` | `DESIGN_REVIEW_DATA` | `GET /football/fixtures` | Empty state stub; backend exists but wiring deferred |
| `/fantasy/fixture-difficulty` | `app/fantasy/fixture-difficulty/page.tsx` | `DESIGN_REVIEW_DATA` | — | `MISSING_BACKEND_CONTRACT` — FDR algorithm not built |
| `/fantasy/stats` | `app/fantasy/stats/page.tsx` | `DESIGN_REVIEW_DATA` | — | `MISSING_BACKEND_CONTRACT` — fantasy stats summary |
| `/fantasy/points` | `app/fantasy/points/page.tsx` | `DESIGN_REVIEW_DATA` | `GET /fantasy/points-history` | Backend exists; wiring deferred |
| `/fantasy/history` | `app/fantasy/history/page.tsx` | `DESIGN_REVIEW_DATA` | `GET /gameweeks` | Gameweek history |
| `/fantasy/history/[gameweekId]` | `app/fantasy/history/[gameweekId]/page.tsx` | `DESIGN_REVIEW_DATA` | `GET /gameweeks/:id/results` | Gameweek detail |
| `/fantasy/rules` | `app/fantasy/rules/page.tsx` | `DESIGN_REVIEW_DATA` | — | `STATIC_CONTENT` — rules are config; can show from design |
| `/fantasy/search` | `app/fantasy/search/page.tsx` | `LIVE_BETA_DATA` | `GET /fantasy/players?q=` | Player search |
| `/fantasy/leagues` | `app/fantasy/leagues/page.tsx` | `LIVE_BETA_DATA` | `GET /fantasy/leagues` | Private leagues |
| `/fantasy/leagues/create` | `app/fantasy/leagues/create/page.tsx` | `LIVE_BETA_DATA` | `POST /fantasy/leagues` | Create league |
| `/fantasy/leagues/join` | `app/fantasy/leagues/join/page.tsx` | `LIVE_BETA_DATA` | `POST /fantasy/leagues/join` | Join by code |
| `/fantasy/leagues/[leagueId]` | `app/fantasy/leagues/[leagueId]/page.tsx` | `LIVE_BETA_DATA` | `GET /fantasy/leagues/:id` | League standings |
| `/fantasy/leagues/[leagueId]/teams/[teamId]` | `app/fantasy/leagues/[leagueId]/teams/[teamId]/page.tsx` | `LIVE_BETA_DATA` | `GET /fantasy/teams/:id` | Rival team |
| `/account` | `app/account/page.tsx` | `PARTIAL` | `GET /profile/summary` | Summary from API; nav static |
| `/account/notifications` | `app/account/notifications/page.tsx` | `PARTIAL` | `GET /notifications/preferences`, `PATCH /notifications/preferences` | LIVE when authenticated; falls back to design defaults if unauthenticated or DESIGN_REVIEW_DATA mode |
| `/account/profile` | `app/account/profile/page.tsx` | `LIVE_BETA_DATA` | `GET /profile/me`, `PATCH /profile/me` | Profile edit |
| `/account/security` | `app/account/security/page.tsx` | `DESIGN_REVIEW_DATA` | `POST /auth/password/change` | `MISSING_BACKEND_CONTRACT` — password change |
| `/account/favourite-team` | `app/account/favourite-team/page.tsx` | `PARTIAL` | `PATCH /profile/me` | Uses WC_CLUBS design data for club list |
| `/account/delete` | `app/account/delete/page.tsx` | `DESIGN_REVIEW_DATA` | — | `MISSING_BACKEND_CONTRACT` — POPIA deletion endpoint |
| `/sign-in` | `app/sign-in/page.tsx` | `LIVE_BETA_DATA` | `POST /auth/login` | Fully wired |
| `/register` | `app/register/page.tsx` | `LIVE_BETA_DATA` | `POST /auth/register` | Fully wired |
| `/forgot-password` | `app/forgot-password/page.tsx` | `LIVE_BETA_DATA` | `POST /auth/password-reset/request` | Wired |
| `/reset-password` | `app/reset-password/page.tsx` | `LIVE_BETA_DATA` | `POST /auth/password-reset/confirm` | Wired |
| `/media` | `app/media/page.tsx` | `DESIGN_REVIEW_DATA` | `GET /media` | `DEFERRED_STUB` — Media module exists |
| `/media/[slug]` | `app/media/[slug]/page.tsx` | `DESIGN_REVIEW_DATA` | `GET /media/:slug` | `DEFERRED_STUB` |
| `/scan` | `app/scan/page.tsx` | `DESIGN_REVIEW_DATA` | — | `STATIC_CONTENT` — QR badge scan UI |
| `/quiz/[quizId]` | `app/quiz/[quizId]/page.tsx` | `DESIGN_REVIEW_DATA` | — | `MISSING_BACKEND_CONTRACT` |
| `/help` | `app/help/page.tsx` | `STATIC_CONTENT` | — | Static FAQ |
| `/help/[slug]` | `app/help/[slug]/page.tsx` | `STATIC_CONTENT` | — | Static article |
| `/about` | `app/about/page.tsx` | `STATIC_CONTENT` | — | Static |
| `/terms` | `app/terms/page.tsx` | `STATIC_CONTENT` | — | Static |
| `/privacy` | `app/privacy/page.tsx` | `STATIC_CONTENT` | — | Static |

---

## Summary Counts

| Classification | Count | % |
|---------------|-------|---|
| `LIVE_BETA_DATA` | 18 | 35% |
| `PARTIAL` | 5 | 10% |
| `DESIGN_REVIEW_DATA` | 18 | 35% |
| `STATIC_CONTENT` | 6 | 12% |
| `DEFERRED_STUB` | 2 | 4% |
| `MISSING_BACKEND_CONTRACT` | 7 | 14% |

_Totals exceed 52 because MISSING_BACKEND_CONTRACT routes are a subset of DESIGN_REVIEW_DATA._

---

## Routes Prioritised for Live Wiring (Sprint 4)

1. `/matches` — competitions, fixtures ✅ backend exists
2. `/matches/[fixtureId]` — match centre ✅ backend exists
3. `/stats/standings` — standings ✅ backend exists
4. `/players` — player list ✅ backend exists
5. `/fantasy/team` — squad ✅ backend exists
6. `/fantasy/team/transfers` — transfers ✅ backend exists
7. `/fantasy/leagues` — leagues ✅ backend exists
8. `/account/profile` — profile ✅ backend exists
9. `/predict` — predictions (PARTIAL — SCHEDULED fixtures from backend) ✅
10. `/sign-in`, `/register`, password flows ✅ backend exists

---

## Routes with Missing Backend Contracts (S4-04 scope)

| Route | Missing Endpoint | Priority |
|-------|-----------------|----------|
| `/stats/awards` | `GET /api/awards/season/:seasonId` | MEDIUM |
| `/stats/hall-of-fame` | `GET /api/hall-of-fame?season=` | MEDIUM |
| `/stats/compare` | `GET /api/players/compare?ids=` | LOW |
| `/fantasy/fixture-difficulty` | FDR algorithm not designed | LOW |
| `/fantasy/stats` | `GET /api/fantasy/stats/summary` | MEDIUM |
| `/account/security` | `POST /api/auth/password/change` | HIGH |
| `/account/delete` | `POST /api/account/deletion-request` (POPIA) | HIGH |
| `/quiz/[quizId]` | `GET /api/quizzes/:id` | LOW |

---

## Security Rules Applied

- No API keys in `NEXT_PUBLIC_*` variables
- No browser-direct provider calls  
- No third-party API calls from frontend (all via NestJS proxy)
- All auth'd calls use JWT Bearer token from localStorage
- `publicFetch` used only for public football data endpoints
- `apiFetch` used for authenticated endpoints

---

## Loading/Error/Empty State Coverage

| State | Implementation |
|-------|---------------|
| Loading skeleton | SkeletonCard, SkeletonText, animate-pulse divs |
| Network error | Try-again UI on predict page, fantasy pages |
| Empty state | FantasyEmptyState, fixture empty state |
| Unauthenticated | Auth guard redirects in account/* pages |
| No active season | DesignReviewBanner + fallback data |
| Stale/offline | Cache-control headers; no specific offline UI yet |
