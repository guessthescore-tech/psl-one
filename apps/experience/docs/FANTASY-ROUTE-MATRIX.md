# PSL One — Fantasy Route Matrix
**Story:** STORY-FE-FANTASY-AGENTIC-01
**Date:** 2026-06-19

All 40 canonical screens + supporting routes. Each agent builds only their assigned routes.

---

## Agent 3 — Fantasy Core

| Route | Screen | Auth | Data mode | Agent |
|-------|--------|------|-----------|-------|
| `/fantasy` | Fantasy landing | Optional | DESIGN_REVIEW_DATA | 3 |
| `/fantasy/onboarding` | Fantasy onboarding | Required | DESIGN_REVIEW_DATA | 3 |
| `/fantasy/team` | Team profile | Required | DESIGN_REVIEW_DATA | 3 |
| `/fantasy/team/transfers` | Transferring a player | Required | DESIGN_REVIEW_DATA | 3 |
| `/fantasy/team/chips` | Activating a chip | Required | DESIGN_REVIEW_DATA | 3 |
| `/fantasy/fixture-difficulty` | Fixture difficulty rating | Optional | DESIGN_REVIEW_DATA | 3 |
| `/fantasy/help` | Help & Rules | None | DESIGN_REVIEW_DATA + live rules | 3 |

## Agent 4 — Leagues & Social

| Route | Screen | Auth | Data mode | Agent |
|-------|--------|------|-----------|-------|
| `/fantasy/leagues` | League hub | Required | DESIGN_REVIEW_DATA | 4 |
| `/fantasy/leagues/join` | Join a league | Required | DESIGN_REVIEW_DATA | 4 |
| `/fantasy/leagues/create` | Create a league | Required | DESIGN_REVIEW_DATA | 4 |
| `/fantasy/leagues/[leagueId]` | League detail | Required | DESIGN_REVIEW_DATA | 4 |
| `/fantasy/leagues/[leagueId]/teams/[teamId]` | Team detail (rival) | Required | DESIGN_REVIEW_DATA | 4 |
| `/fantasy/history` | Season history | Required | DESIGN_REVIEW_DATA | 4 |
| `/fantasy/history/[gameweekId]` | Gameweek history detail | Required | DESIGN_REVIEW_DATA | 4 |
| `/fantasy/search` | Manager search | Required | DESIGN_REVIEW_DATA | 4 |

## Agent 5 — Football Context

| Route | Screen | Auth | Data mode | Agent |
|-------|--------|------|-----------|-------|
| `/matches` | Results | None | DESIGN_REVIEW_DATA | 5 |
| `/matches/[fixtureId]` | Match detail | None | DESIGN_REVIEW_DATA | 5 |
| `/matches/[fixtureId]/motm` | Man of the Match | None | DESIGN_REVIEW_DATA | 5 |
| `/players` | Player list | None | DESIGN_REVIEW_DATA | 5 |
| `/players/[playerId]` | Player detail | None | DESIGN_REVIEW_DATA | 5 |
| `/players/[playerId]/stats` | Player stats | None | DESIGN_REVIEW_DATA | 5 |
| `/stats/season` | Season stats | None | DESIGN_REVIEW_DATA | 5 |
| `/stats/compare` | Player comparison | None | DESIGN_REVIEW_DATA | 5 |
| `/stats/standings` | League table | None | DESIGN_REVIEW_DATA | 5 |
| `/stats/awards` | Awards | None | DESIGN_REVIEW_DATA | 5 |
| `/stats/hall-of-fame` | Hall of Fame | None | DESIGN_REVIEW_DATA | 5 |
| `/media/[slug]` | Article + video detail | None | DESIGN_REVIEW_DATA | 5 |

## Agent 6 — Account & Support

| Route | Screen | Auth | Data mode | Agent |
|-------|--------|------|-----------|-------|
| `/sign-in` | Logging in | None | LIVE_BETA_DATA | 6 |
| `/register` | Registration | None | LIVE_BETA_DATA | 6 |
| `/forgot-password` | Reset password step 1 | None | LIVE_BETA_DATA | 6 |
| `/reset-password` | Reset password step 2 | None | LIVE_BETA_DATA | 6 |
| `/account` | Manage account | Required | LIVE_BETA_DATA | 6 |
| `/account/profile` | Edit personal details | Required | LIVE_BETA_DATA | 6 |
| `/account/security` | Change password | Required | DESIGN_REVIEW_DATA (API missing) | 6 |
| `/account/favourite-team` | Change favourite team | Required | LIVE_BETA_DATA | 6 |
| `/account/delete` | Delete account | Required | DESIGN_REVIEW_DATA (POPIA pending) | 6 |
| `/help` | FAQs | None | Static | 6 |
| `/help/[slug]` | Help article | None | Static | 6 |
| `/terms` | Terms & conditions | None | Static | 6 |
| `/privacy` | Privacy policy | None | Static | 6 |
| `/about` | About | None | Static | 6 |
| `/scan` | Badge scan shell | Required | DESIGN_REVIEW_DATA | 6 |
| `/quiz/[quizId]` | Quiz shell | Required | DESIGN_REVIEW_DATA | 6 |

---

## Required States Per Screen

Every screen must implement:
- `loading` — skeleton placeholders
- `empty` — meaningful empty state with CTA
- `error` — recoverable error with retry
- `unauthenticated` — redirect or prompt
- `authenticated` — normal flow

Fantasy-specific screens also need:
- `deadline-open` vs `deadline-locked` vs `deadline-approaching`
- `no-active-season` — for pre-season state
- Formation validation states (valid / invalid)
- Budget states (sufficient / insufficient)

---

## Design-Review-Only Screens (labelled with purple banner)

These screens use `DESIGN_REVIEW_DATA` because the required API doesn't exist yet:

| Screen | Missing API |
|--------|------------|
| Fantasy onboarding | None — all APIs exist |
| Fixture difficulty | `GET /api/fantasy/fixture-difficulty` |
| Rival team detail | `GET /api/fantasy/teams/:teamId/public` |
| Player comparison | `GET /api/stats/compare` |
| Awards | No awards model |
| Hall of Fame | No historical data |
| MOTM | Derivation not built |
| Manager search | No search endpoint |
| Change password | `POST /api/auth/password/change` |
| Delete account | `DELETE /api/auth/account` |
| Badge scan | No BadgeScan model |
| Quiz | No Quiz model |
| FAQs | Static content |
| Terms/Privacy | Placeholder text (legal pending) |
