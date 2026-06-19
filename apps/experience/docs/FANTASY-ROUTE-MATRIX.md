# Fantasy Route Matrix
**Last updated:** 2026-06-19 (STORY-FE-FANTASY-AGENTIC-01 final)
**Total pages built:** 56
**Branch:** `feature/fantasy-complete-experience`

## Classification Key

| Code | Meaning |
|------|---------|
| `FRONTEND_BUILT` | Page has substantial UI; renders with DESIGN_REVIEW_DATA mock |
| `DESIGN_REVIEW_ONLY` | Page renders; all data is mock (DESIGN_REVIEW_DATA mode only) |
| `MISSING_BACKEND` | Page shell exists; backend endpoint not yet built |
| `DEFERRED` | Stub page ("Coming soon") — awaiting content or backend contract |

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
