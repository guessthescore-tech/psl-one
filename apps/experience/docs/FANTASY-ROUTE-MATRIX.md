# Fantasy Route Matrix — Authoritative Truth Table
**Last updated:** 2026-06-19 (STORY-FE-FANTASY-AGENTIC-01 — final reconciliation)
**Total prerendered pages:** 56
**Branch:** `feature/fantasy-complete-experience`
**Source of truth:** filesystem (`find apps/experience/src/app -name "page.tsx"`) + build output

## Classification Key

| Code | Meaning |
|------|---------|
| `DESIGN_REVIEW_ONLY` | Page renders; all data is WC 2026 mock (DESIGN_REVIEW_DATA default) |
| `MISSING_BACKEND` | Page shell exists; required backend endpoint not yet built |
| `DEFERRED` | Stub page ("Coming soon") — awaiting content or backend contract |

## Auth & Data Source Legend

| Field | Values |
|-------|--------|
| Auth | `NONE` = no auth required; `SIMULATED` = DESIGN_REVIEW_DATA accepts any credentials |
| Data source | `WC_MOCK` = in-memory WC 2026 mock data from `src/lib/data.ts` |
| Backend dep | Backend API call required for production; `NONE` = static content only |

---

## Route Truth Table (complete)

| Route | Render | State | Auth | Data | Backend Dep | Known Limitation | Review Status |
|-------|--------|-------|------|------|-------------|-----------------|---------------|
| `/` | STATIC | DESIGN_REVIEW_ONLY | NONE | WC_MOCK | Yes (fixtures, scores) | Picsum images | NEEDS_REVIEW |
| `/fantasy` | STATIC | DESIGN_REVIEW_ONLY | SIMULATED | WC_MOCK | Yes (gameweek, points) | Mock GW data | NEEDS_REVIEW |
| `/fantasy/team` | STATIC | DESIGN_REVIEW_ONLY | SIMULATED | WC_MOCK | Yes (team, captain) | Mock pitch only | NEEDS_REVIEW |
| `/fantasy/team/transfers` | STATIC | DESIGN_REVIEW_ONLY | SIMULATED | WC_MOCK | Yes (market, budget) | Mock players only | NEEDS_REVIEW |
| `/fantasy/team/chips` | STATIC | DESIGN_REVIEW_ONLY | SIMULATED | WC_MOCK | Yes (chip state) | Mock chip state | NEEDS_REVIEW |
| `/fantasy/fixture-difficulty` | STATIC | DESIGN_REVIEW_ONLY | NONE | WC_MOCK | Yes (FDR algorithm) | Mock FDR colours | NEEDS_REVIEW |
| `/fantasy/onboarding` | STATIC | DESIGN_REVIEW_ONLY | SIMULATED | WC_MOCK | Yes (team create) | 4 steps, no real write | NEEDS_REVIEW |
| `/fantasy/search` | STATIC | DESIGN_REVIEW_ONLY | NONE | WC_MOCK | Yes (search API) | Mock results | NEEDS_REVIEW |
| `/fantasy/history` | STATIC | DESIGN_REVIEW_ONLY | SIMULATED | WC_MOCK | Yes (GW history) | Mock timeline | NEEDS_REVIEW |
| `/fantasy/history/[gameweekId]` | DYNAMIC | DESIGN_REVIEW_ONLY | SIMULATED | WC_MOCK | Yes (GW scoring) | Mock GW breakdown | NEEDS_REVIEW |
| `/fantasy/points` | STATIC | DEFERRED | SIMULATED | NONE | Yes (live scoring) | Stub only | NEEDS_REVIEW |
| `/fantasy/fixtures` | STATIC | DEFERRED | NONE | NONE | UX decision pending | Stub only | NEEDS_REVIEW |
| `/fantasy/stats` | STATIC | DEFERRED | SIMULATED | NONE | Yes (stats API) | Stub only | NEEDS_REVIEW |
| `/fantasy/rules` | STATIC | DEFERRED | NONE | NONE | Rules content needed | Stub only | NEEDS_REVIEW |
| `/fantasy/leagues` | STATIC | DESIGN_REVIEW_ONLY | SIMULATED | WC_MOCK | Yes (leagues API) | Mock leagues | NEEDS_REVIEW |
| `/fantasy/leagues/[leagueId]` | DYNAMIC | DESIGN_REVIEW_ONLY | SIMULATED | WC_MOCK | Yes (standings) | Mock standings | NEEDS_REVIEW |
| `/fantasy/leagues/[leagueId]/teams/[teamId]` | DYNAMIC | DESIGN_REVIEW_ONLY | SIMULATED | WC_MOCK | Yes (rival team) | Read-only pitch | NEEDS_REVIEW |
| `/fantasy/leagues/create` | STATIC | DESIGN_REVIEW_ONLY | SIMULATED | WC_MOCK | Yes (create API) | No real create | NEEDS_REVIEW |
| `/fantasy/leagues/join` | STATIC | DESIGN_REVIEW_ONLY | SIMULATED | WC_MOCK | Yes (join API) | No real join | NEEDS_REVIEW |
| `/matches` | STATIC | DESIGN_REVIEW_ONLY | NONE | WC_MOCK | Yes (fixtures API) | Mock fixtures | NEEDS_REVIEW |
| `/matches/[fixtureId]` | DYNAMIC | DESIGN_REVIEW_ONLY | NONE | WC_MOCK | Yes (live match) | Mock timeline | NEEDS_REVIEW |
| `/matches/[fixtureId]/motm` | DYNAMIC | DESIGN_REVIEW_ONLY | SIMULATED | WC_MOCK | Yes (MOTM vote) | Mock MOTM | NEEDS_REVIEW |
| `/players` | STATIC | DESIGN_REVIEW_ONLY | NONE | WC_MOCK | Yes (player API) | Mock 6 players | NEEDS_REVIEW |
| `/players/[playerId]` | DYNAMIC | DESIGN_REVIEW_ONLY | NONE | WC_MOCK | Yes (player profile) | Picsum photo | NEEDS_REVIEW |
| `/players/[playerId]/stats` | DYNAMIC | DESIGN_REVIEW_ONLY | NONE | WC_MOCK | Yes (stats API) | Mock GW stats | NEEDS_REVIEW |
| `/stats/standings` | STATIC | DESIGN_REVIEW_ONLY | NONE | WC_MOCK | Yes (standings) | Mock table | NEEDS_REVIEW |
| `/stats/season` | STATIC | DESIGN_REVIEW_ONLY | NONE | WC_MOCK | Yes (season API) | Mock totals | NEEDS_REVIEW |
| `/stats/awards` | STATIC | DESIGN_REVIEW_ONLY | NONE | WC_MOCK | Yes (awards) | Mock award data | NEEDS_REVIEW |
| `/stats/hall-of-fame` | STATIC | DESIGN_REVIEW_ONLY | NONE | WC_MOCK | Yes (HOF) | Mock records | NEEDS_REVIEW |
| `/stats/compare` | STATIC | DESIGN_REVIEW_ONLY | NONE | WC_MOCK | Yes (player data) | Mock 2 players | NEEDS_REVIEW |
| `/media` | STATIC | DESIGN_REVIEW_ONLY | NONE | WC_MOCK | Yes (media API) | Mock 4 articles/4 videos | NEEDS_REVIEW |
| `/media/[slug]` | DYNAMIC | DESIGN_REVIEW_ONLY | NONE | WC_MOCK | Yes (media API) | Slug prefix s/v | NEEDS_REVIEW |
| `/predict` | STATIC | DEFERRED | NONE | NONE | Yes (prediction API) | Stub only | NEEDS_REVIEW |
| `/sign-in` | STATIC | DESIGN_REVIEW_ONLY | NONE | NONE | Yes (auth API) | Simulated auth | NEEDS_REVIEW |
| `/register` | STATIC | DESIGN_REVIEW_ONLY | NONE | NONE | Yes (auth API) | Simulated auth | NEEDS_REVIEW |
| `/forgot-password` | STATIC | DESIGN_REVIEW_ONLY | NONE | NONE | Yes (email API) | No real email | NEEDS_REVIEW |
| `/reset-password` | STATIC | DESIGN_REVIEW_ONLY | NONE | NONE | Yes (reset API) | No real token | NEEDS_REVIEW |
| `/account` | STATIC | DESIGN_REVIEW_ONLY | SIMULATED | WC_MOCK | Yes (profile API) | Mock profile | NEEDS_REVIEW |
| `/account/profile` | STATIC | DESIGN_REVIEW_ONLY | SIMULATED | NONE | Yes (profile PUT) | No real save | NEEDS_REVIEW |
| `/account/security` | STATIC | DESIGN_REVIEW_ONLY | SIMULATED | NONE | Yes (password API) | No real change | NEEDS_REVIEW |
| `/account/favourite-team` | STATIC | DESIGN_REVIEW_ONLY | SIMULATED | WC_MOCK | Yes (profile PUT) | No real save | NEEDS_REVIEW |
| `/account/delete` | STATIC | MISSING_BACKEND | SIMULATED | NONE | POPIA deletion endpoint not built | Placeholder only | NEEDS_REVIEW |
| `/help` | STATIC | DESIGN_REVIEW_ONLY | NONE | WC_MOCK | NONE | Static categories | NEEDS_REVIEW |
| `/help/[slug]` | SSG (11) | DESIGN_REVIEW_ONLY | NONE | WC_MOCK | NONE | 11 seeded articles | NEEDS_REVIEW |
| `/quiz/[quizId]` | SSG (3) | DESIGN_REVIEW_ONLY | NONE | WC_MOCK | NONE | 3 seeded quizzes | NEEDS_REVIEW |
| `/scan` | STATIC | DESIGN_REVIEW_ONLY | NONE | NONE | Yes (QR scanner) | Shell only | NEEDS_REVIEW |
| `/terms` | STATIC | DESIGN_REVIEW_ONLY | NONE | NONE | NONE | Static content | NEEDS_REVIEW |
| `/privacy` | STATIC | DESIGN_REVIEW_ONLY | NONE | NONE | NONE | Static content | NEEDS_REVIEW |
| `/about` | STATIC | DESIGN_REVIEW_ONLY | NONE | NONE | NONE | Static content | NEEDS_REVIEW |

**All 48 route templates listed. Total prerendered: 56 (includes 14 SSG paths: 11 × /help/[slug] + 3 × /quiz/[quizId]).**

---

---

## Homepage

| Route | Lines | Classification | Notes |
|-------|-------|---------------|-------|
| `/` | 283 | `DESIGN_REVIEW_ONLY` | 13 homepage sections; WC 2026 mock data |

---

## Fantasy Core

| Route | Lines | Classification | Notes |
|-------|-------|---------------|-------|
| `/fantasy` | 283 | `DESIGN_REVIEW_ONLY` | Gameweek hub; points, captain, transfers card |
| `/fantasy/team` | 170 | `DESIGN_REVIEW_ONLY` | 15-player pitch view; captain selection |
| `/fantasy/team/transfers` | 235 | `DESIGN_REVIEW_ONLY` | Transfer market; budget, position filter, pool |
| `/fantasy/team/chips` | 182 | `DESIGN_REVIEW_ONLY` | Wildcard, Bench Boost, Triple Captain, Free Hit |
| `/fantasy/fixture-difficulty` | 48 | `DESIGN_REVIEW_ONLY` | FDR colour grid |
| `/fantasy/onboarding` | 389 | `DESIGN_REVIEW_ONLY` | 4-step first-time setup wizard |
| `/fantasy/search` | 25 | `DESIGN_REVIEW_ONLY` | Manager/player search UI |
| `/fantasy/history` | 67 | `DESIGN_REVIEW_ONLY` | Gameweek history list |
| `/fantasy/history/[gameweekId]` | 100 | `DESIGN_REVIEW_ONLY` | Gameweek detail; stats breakdown |
| `/fantasy/points` | 11 | `DEFERRED` | Stub — awaiting backend contract |
| `/fantasy/fixtures` | 11 | `DEFERRED` | Stub — may merge with `/matches` |
| `/fantasy/stats` | 11 | `DEFERRED` | Stub — awaiting backend contract |
| `/fantasy/rules` | 11 | `DEFERRED` | Stub — awaiting rules content from Product |

---

## Fantasy Leagues

| Route | Lines | Classification | Notes |
|-------|-------|---------------|-------|
| `/fantasy/leagues` | 155 | `DESIGN_REVIEW_ONLY` | League listing; join/create CTAs |
| `/fantasy/leagues/[leagueId]` | 137 | `DESIGN_REVIEW_ONLY` | League detail + standings table |
| `/fantasy/leagues/[leagueId]/teams/[teamId]` | 79 | `DESIGN_REVIEW_ONLY` | Rival manager pitch view |
| `/fantasy/leagues/create` | 69 | `DESIGN_REVIEW_ONLY` | League creation form |
| `/fantasy/leagues/join` | 227 | `DESIGN_REVIEW_ONLY` | Join by code |

---

## Matches & Live

| Route | Lines | Classification | Notes |
|-------|-------|---------------|-------|
| `/matches` | 253 | `DESIGN_REVIEW_ONLY` | All fixtures calendar |
| `/matches/[fixtureId]` | 230 | `DESIGN_REVIEW_ONLY` | Live match detail; timeline, stats, lineup |
| `/matches/[fixtureId]/motm` | 60 | `DESIGN_REVIEW_ONLY` | Man of the Match card |

---

## Players

| Route | Lines | Classification | Notes |
|-------|-------|---------------|-------|
| `/players` | 175 | `DESIGN_REVIEW_ONLY` | Player pool browser; position filter |
| `/players/[playerId]` | 237 | `DESIGN_REVIEW_ONLY` | Player profile; stats, club, fantasy price |
| `/players/[playerId]/stats` | 162 | `DESIGN_REVIEW_ONLY` | Player stats breakdown |

---

## Media

| Route | Lines | Classification | Notes |
|-------|-------|---------------|-------|
| `/media` | 52 | `DESIGN_REVIEW_ONLY` | Stories + video listing; WC_STORIES / WC_VIDEOS |
| `/media/[slug]` | 96 | `DESIGN_REVIEW_ONLY` | Article or video detail; prefix `s`/`v` detects type |

---

## Stats

| Route | Lines | Classification | Notes |
|-------|-------|---------------|-------|
| `/stats/standings` | 86 | `DESIGN_REVIEW_ONLY` | Group/league standings table |
| `/stats/season` | 116 | `DESIGN_REVIEW_ONLY` | Season-level statistics |
| `/stats/awards` | 173 | `DESIGN_REVIEW_ONLY` | Awards layout |
| `/stats/hall-of-fame` | 122 | `DESIGN_REVIEW_ONLY` | Hall of Fame grid |
| `/stats/compare` | 166 | `DESIGN_REVIEW_ONLY` | Player comparison |

---

## Prediction

| Route | Lines | Classification | Notes |
|-------|-------|---------------|-------|
| `/predict` | 8 | `DEFERRED` | Stub — "Coming soon" |

---

## Account & Auth

| Route | Lines | Classification | Notes |
|-------|-------|---------------|-------|
| `/sign-in` | 157 | `DESIGN_REVIEW_ONLY` | Full login form; DESIGN_REVIEW_DATA simulates success |
| `/register` | 243 | `DESIGN_REVIEW_ONLY` | Registration form; POPIA disclaimer |
| `/forgot-password` | 135 | `DESIGN_REVIEW_ONLY` | Email-entry for password reset |
| `/reset-password` | 209 | `DESIGN_REVIEW_ONLY` | New password form; reads `?token=` query param |
| `/account` | 167 | `DESIGN_REVIEW_ONLY` | Account dashboard; profile summary + AccountNav |
| `/account/profile` | 103 | `DESIGN_REVIEW_ONLY` | Edit display name |
| `/account/security` | 19 | `DESIGN_REVIEW_ONLY` | Change password (PasswordForm) |
| `/account/favourite-team` | 35 | `DESIGN_REVIEW_ONLY` | Team selector grid |
| `/account/delete` | 19 | `MISSING_BACKEND` | POPIA placeholder; deletion endpoint not built |

---

## Help & Legal

| Route | Lines | Classification | Notes |
|-------|-------|---------------|-------|
| `/help` | 121 | `DESIGN_REVIEW_ONLY` | Help category list |
| `/help/[slug]` | 156 | `DESIGN_REVIEW_ONLY` | Help article detail |
| `/terms` | 52 | `DESIGN_REVIEW_ONLY` | Terms & Conditions |
| `/privacy` | 44 | `DESIGN_REVIEW_ONLY` | Privacy Policy |
| `/about` | 151 | `DESIGN_REVIEW_ONLY` | About PSL One |

---

## Engagement

| Route | Lines | Classification | Notes |
|-------|-------|---------------|-------|
| `/quiz/[quizId]` | 64 | `DESIGN_REVIEW_ONLY` | Football quiz (3 seeded: psl-trivia, wc-trivia, football-history) |
| `/scan` | 18 | `DESIGN_REVIEW_ONLY` | Badge scanner shell |

---

## Not Built (Truthful Gap Record)

These were referenced in handover documents from earlier sessions but do not exist on this branch. Internal links from homepage sections have been corrected to point at existing routes.

| Route | Correct Fallback | Notes |
|-------|-----------------|-------|
| `/clubs` | `/players` | Club index page not in STORY-FE-FANTASY-AGENTIC-01 scope |
| `/clubs/[clubId]` | — | Club detail page not built |
| `/social` | — | Social feed page not built |
| `/account/notifications` | `/account` | Notifications preferences page not built |
| `/account/wallet` | `/account` | Wallet/Fan Value balance page not built |
| `/account/achievements` | `/account` | Achievements page not built |
| `/account/fan-value` | `/account` | Fan Value breakdown page not built |
| `/account/privacy` | `/privacy` | Privacy settings page not built |
| `/profile/fan-value` | `/account` | Fallback corrected in FanValueSection |
| `/video` | `/media` | Fallback corrected in VideoRailSection |
| `/news` | `/media` | Fallback corrected in EditorialGridSection |
| `/fixtures` | `/matches` | Fallback corrected in FixtureCarouselSection |
| `/table` | `/stats/standings` | Fallback corrected in LeagueTableSection |

---

## Summary

| Classification | Count |
|---------------|-------|
| `DESIGN_REVIEW_ONLY` (full UI, mock data) | 50 |
| `MISSING_BACKEND` | 1 |
| `DEFERRED` (stubs) | 5 |
| **Total pages** | **56** |
