# PSL One — API Route Reference

**Purpose:** Accurate API route inventory extracted from actual controllers  
**Audience:** Frontend engineers, architects, QA  
**Status:** Current as of STORY-39 (commit `08e3852`)  
**Last verified:** 2026-06-14  
**Total controllers:** 41  
**Source:** `apps/api/src/**/*.controller.ts`  
**Authority:** Controllers are the single source of truth — regenerate this if routes change  

---

## Base URL

| Environment | URL |
|------------|-----|
| Local development | `http://localhost:4000` |
| Production (planned) | `https://api.pslone.co.za` |

---

## Route Classification

| Label | Meaning |
|-------|---------|
| `PUBLIC` | No authentication required |
| `FAN` | JWT required, any role |
| `ADMIN` | JWT + `PSL_ADMIN` role required |
| `SANDBOX_ONLY` | Adapter makes no real outbound HTTP calls; mock data returned |
| `DRY_RUN` | Returns simulation only; no Prisma writes |
| `READINESS_GATED` | Route executes but will throw `BadRequestException` if 13-check readiness fails |
| `READ` | Does not mutate state |
| `MUTATION` | Creates, updates, or deletes records |

> **Note on SANDBOX_ONLY:** The wallet routes call `SiliconEnterpriseSandboxWalletAdapter` which contains no outbound HTTP calls. No real money can move. See ADR-019.  
> **Note on season switching mutations:** `activate`, `complete`, and `rollback` are real executable routes. They are blocked at the service layer by the 13-check readiness gate, not by a code disable flag. See ADR-013 and ADR-026.

---

## Health & Version

**Controller:** `health.controller.ts`, `version.controller.ts`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/health` | PUBLIC | READ | API liveness check |
| GET | `/health/ready` | PUBLIC | READ | API readiness check; verifies database and required configuration |
| GET | `/version` | PUBLIC | READ | API version |

---

## Authentication

**Controller:** `auth.controller.ts` — prefix: `auth`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| POST | `/auth/register` | PUBLIC | MUTATION | Register new fan account |
| POST | `/auth/login` | PUBLIC | READ | Login, returns `access_token` |
| POST | `/auth/logout` | FAN | MUTATION | Logout |
| GET | `/auth/me` | FAN | READ | Current user context |
| POST | `/auth/password-reset/request` | PUBLIC | MUTATION | Request password reset |
| POST | `/auth/password-reset/confirm` | PUBLIC | MUTATION | Complete password reset |

---

## Profile

**Controller:** `profile.controller.ts` — prefix: `profile`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/profile/me` | FAN | READ | My profile |
| PATCH | `/profile/me` | FAN | MUTATION | Update profile |
| GET | `/profile/preferences` | FAN | READ | My preferences |
| PATCH | `/profile/preferences` | FAN | MUTATION | Update preferences |
| GET | `/profile/summary` | FAN | READ | Profile summary |

---

## Football Core

**Controller:** `football.controller.ts` — prefix: `football`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/football/competitions` | FAN | READ | List competitions |
| GET | `/football/competitions/:slug` | FAN | READ | Get competition |
| GET | `/football/seasons` | FAN | READ | List seasons |
| GET | `/football/seasons/active` | FAN | READ | Active season |
| GET | `/football/seasons/:slug` | FAN | READ | Get season |
| GET | `/football/context` | FAN | READ | Current season context |
| GET | `/football/teams` | FAN | READ | List teams |
| GET | `/football/teams/:slug` | FAN | READ | Get team |
| GET | `/football/teams/:slug/players` | FAN | READ | Team player roster |
| GET | `/football/players` | FAN | READ | List players |
| GET | `/football/players/:id` | FAN | READ | Get player |
| GET | `/football/fixtures` | FAN | READ | List fixtures |
| GET | `/football/fixtures/:id/live` | FAN | READ | Live fixture state |
| GET | `/football/fixtures/:id/live-state` | FAN | READ | Live state detail |
| GET | `/football/fixtures/:id/timeline` | FAN | READ | Match timeline |
| GET | `/football/fixtures/:id/events` | FAN | READ | Match events |
| GET | `/football/fixtures/:id/player-stats` | FAN | READ | Player stats for fixture |
| GET | `/football/fixtures/:id/live-dashboard` | FAN | READ | Live dashboard |
| GET | `/football/fixtures/:id/live-fantasy-preview` | FAN | READ | Live Fantasy preview |

---

## Admin — Competitions & Seasons

**Controller:** `admin-competitions.controller.ts` — prefixes: `admin/competitions`, `admin/seasons`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/admin/competitions` | ADMIN | READ | List competitions |
| POST | `/admin/competitions` | ADMIN | MUTATION | Create competition |
| PATCH | `/admin/competitions/:id` | ADMIN | MUTATION | Update competition |
| GET | `/admin/competitions/:id/seasons` | ADMIN | READ | Seasons for competition |
| POST | `/admin/competitions/:id/seasons` | ADMIN | MUTATION | Create season |
| PATCH | `/admin/seasons/:id` | ADMIN | MUTATION | Update season |
| POST | `/admin/seasons/:id/activate` | ADMIN | MUTATION | Activate season in competition |

---

## Gameweeks

**Controller:** `gameweeks.controller.ts` — prefixes: `gameweeks`, `admin/gameweeks`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/gameweeks` | FAN | READ | List gameweeks |
| GET | `/gameweeks/active` | FAN | READ | Active gameweek |
| GET | `/gameweeks/:id` | FAN | READ | Get gameweek |
| GET | `/gameweeks/:id/fixtures` | FAN | READ | Gameweek fixtures |
| GET | `/gameweeks/:id/lock-state` | FAN | READ | Lock state |
| PATCH | `/admin/gameweeks/:id/status` | ADMIN | MUTATION | Update gameweek status |
| PATCH | `/admin/gameweeks/:id/deadlines` | ADMIN | MUTATION | Update deadlines |

---

## Gameweek Operations

**Controller:** `gameweek-operations.controller.ts` — prefix: `gameweeks/admin/operations`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/gameweeks/admin/operations/seasons` | ADMIN | READ | Seasons list |
| GET | `/gameweeks/admin/operations/:seasonId/overview` | ADMIN | READ | Season operations overview |
| GET | `/gameweeks/admin/operations/:seasonId/gameweeks` | ADMIN | READ | Gameweeks list |
| GET | `/gameweeks/admin/operations/:seasonId/gameweeks/:gameweekId` | ADMIN | READ | Gameweek detail |
| GET | `/gameweeks/admin/operations/:seasonId/readiness` | ADMIN | READ | Readiness |
| GET | `/gameweeks/admin/operations/:seasonId/deadlines` | ADMIN | READ | Deadlines |
| GET | `/gameweeks/admin/operations/:seasonId/fixture-assignment` | ADMIN | READ | Fixture assignment |
| GET | `/gameweeks/admin/operations/:seasonId/fantasy-impact` | ADMIN | READ | Fantasy impact |
| GET | `/gameweeks/admin/operations/:seasonId/prediction-impact` | ADMIN | READ | Prediction impact |
| GET | `/gameweeks/admin/operations/:seasonId/publication-readiness` | ADMIN | READ | Publication readiness |
| GET | `/gameweeks/admin/operations/:seasonId/activation-impact` | ADMIN | READ | Activation impact |
| GET | `/gameweeks/admin/operations/:seasonId/matchday-control` | ADMIN | READ | Matchday control |
| POST | `/gameweeks/admin/operations/:seasonId/gameweeks/derive` | ADMIN | MUTATION | Derive gameweeks |
| POST | `/gameweeks/admin/operations/:seasonId/derive-deadlines` | ADMIN | MUTATION | Derive deadlines |
| POST | `/gameweeks/admin/operations/:seasonId/validate` | ADMIN | READ | Validate |

---

## Fixture Import

**Controller:** `fixture-import.controller.ts` — prefix: `fixtures/admin`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/fixtures/admin/imports` | ADMIN | READ | Import batches |
| POST | `/fixtures/admin/imports` | ADMIN | MUTATION | Create import batch |
| GET | `/fixtures/admin/validation/season/:seasonId` | ADMIN | READ | Season validation |
| GET | `/fixtures/admin/conflicts/season/:seasonId` | ADMIN | READ | Conflicts |
| GET | `/fixtures/admin/gameweeks/season/:seasonId/readiness` | ADMIN | READ | Gameweek readiness |
| POST | `/fixtures/admin/gameweeks/season/:seasonId/auto-create` | ADMIN | MUTATION | Auto-create gameweeks |
| POST | `/fixtures/admin/gameweeks/season/:seasonId/assign-by-round` | ADMIN | MUTATION | Assign by round |
| GET | `/fixtures/admin/publishing/season/:seasonId/readiness` | ADMIN | READ | Publishing readiness |
| POST | `/fixtures/admin/publishing/season/:seasonId/publish-provisional` | ADMIN | MUTATION | Publish provisional |
| POST | `/fixtures/admin/publishing/season/:seasonId/unpublish-provisional` | ADMIN | MUTATION | Unpublish provisional |
| GET | `/fixtures/admin/imports/:batchId` | ADMIN | READ | Get batch |
| DELETE | `/fixtures/admin/imports/:batchId` | ADMIN | MUTATION | Delete batch |
| GET | `/fixtures/admin/imports/:batchId/summary` | ADMIN | READ | Batch summary |
| GET | `/fixtures/admin/imports/:batchId/rows` | ADMIN | READ | Batch rows |
| POST | `/fixtures/admin/imports/:batchId/rows` | ADMIN | MUTATION | Add row |
| PATCH | `/fixtures/admin/imports/:batchId/rows/:rowId` | ADMIN | MUTATION | Update row |
| DELETE | `/fixtures/admin/imports/:batchId/rows/:rowId` | ADMIN | MUTATION | Delete row |
| POST | `/fixtures/admin/imports/:batchId/validate` | ADMIN | MUTATION | Validate batch |
| POST | `/fixtures/admin/imports/:batchId/commit` | ADMIN | MUTATION | Commit batch |
| POST | `/fixtures/admin/imports/:batchId/publish` | ADMIN | MUTATION | Publish fixtures |
| POST | `/fixtures/admin/imports/:batchId/reject` | ADMIN | MUTATION | Reject batch |

---

## Fixture Assignment

**Controller:** `admin-fixture-assignment.controller.ts` — prefix: `admin/fixtures`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/admin/fixtures/unassigned` | ADMIN | READ | Unassigned fixtures |
| GET | `/admin/fixtures/assignment-summary` | ADMIN | READ | Assignment summary |
| POST | `/admin/fixtures/bulk-assign-gameweek` | ADMIN | MUTATION | Bulk assign to gameweek |
| POST | `/admin/fixtures/bulk-assign-stage` | ADMIN | MUTATION | Bulk assign to stage |
| POST | `/admin/fixtures/auto-assign` | ADMIN | MUTATION | Auto-assign |
| POST | `/admin/fixtures/:id/assign-gameweek` | ADMIN | MUTATION | Assign fixture to gameweek |
| POST | `/admin/fixtures/:id/assign-stage` | ADMIN | MUTATION | Assign fixture to stage |

---

## Admin Imports (Manual Data Entry)

**Controller:** `admin-imports.controller.ts` — prefixes: `admin/imports`, `admin/imports/manual`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/admin/imports` | ADMIN | READ | Import jobs |
| POST | `/admin/imports/validate` | ADMIN | MUTATION | Validate import |
| POST | `/admin/imports/commit` | ADMIN | MUTATION | Commit import |
| POST | `/admin/imports/manual` | ADMIN | MUTATION | Manual import |
| GET | `/admin/imports/:id` | ADMIN | READ | Get import |
| POST | `/admin/imports/:id/retry` | ADMIN | MUTATION | Retry import |
| POST | `/admin/imports/:id/cancel` | ADMIN | MUTATION | Cancel import |
| POST | `/admin/imports/manual/competition` | ADMIN | MUTATION | Manual competition entry |
| POST | `/admin/imports/manual/season` | ADMIN | MUTATION | Manual season entry |
| POST | `/admin/imports/manual/team` | ADMIN | MUTATION | Manual team entry |
| POST | `/admin/imports/manual/player` | ADMIN | MUTATION | Manual player entry |
| POST | `/admin/imports/manual/venue` | ADMIN | MUTATION | Manual venue entry |
| POST | `/admin/imports/manual/fixture` | ADMIN | MUTATION | Manual fixture entry |

---

## Predictions

**Controller:** `predictions.controller.ts` — prefix: `predictions`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| POST | `/predictions` | FAN | MUTATION | Submit prediction |
| GET | `/predictions/me` | FAN | READ | My predictions |
| GET | `/predictions/me/:fixtureId` | FAN | READ | My prediction for fixture |
| PATCH | `/predictions/:id` | FAN | MUTATION | Update prediction (before lock) |
| GET | `/predictions/fixtures` | FAN | READ | Eligible fixtures |
| GET | `/predictions/fixtures/:fixtureId/lock-state` | FAN | READ | Fixture lock state |
| GET | `/predictions/fixtures/:fixtureId/eligibility` | FAN | READ | Eligibility check |
| GET | `/predictions/gameweek/:gameweekId` | FAN | READ | Predictions for gameweek |
| POST | `/predictions/admin/settle-fixture/:fixtureId` | ADMIN | MUTATION | Settle fixture predictions |
| POST | `/predictions/admin/lock-fixture/:fixtureId` | ADMIN | MUTATION | Lock fixture predictions |
| POST | `/predictions/admin/void-fixture/:fixtureId` | ADMIN | MUTATION | Void fixture predictions |
| POST | `/predictions/admin/lock-gameweek/:gameweekId` | ADMIN | MUTATION | Lock gameweek predictions |
| POST | `/predictions/admin/lock-gameweek/:gameweekId/force` | ADMIN | MUTATION | Force lock gameweek |
| POST | `/predictions/admin/settle-gameweek/:gameweekId` | ADMIN | MUTATION | Settle gameweek predictions |

---

## Prediction Calibration

**Controller:** `prediction-calibration.controller.ts` — prefix: `predictions/admin/calibration`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/predictions/admin/calibration` | ADMIN | READ | List calibrations |
| GET | `/predictions/admin/calibration/:seasonId` | ADMIN | READ | Season calibration |
| GET | `/predictions/admin/calibration/:seasonId/readiness` | ADMIN | READ | Readiness |
| GET | `/predictions/admin/calibration/:seasonId/rules` | ADMIN | READ | Rules config |
| POST | `/predictions/admin/calibration/:seasonId/rules` | ADMIN | MUTATION | Create rules config |
| PATCH | `/predictions/admin/calibration/:seasonId/rules` | ADMIN | MUTATION | Update rules config |
| GET | `/predictions/admin/calibration/:seasonId/fixture-eligibility` | ADMIN | READ | Fixture eligibility |
| GET | `/predictions/admin/calibration/:seasonId/lock-readiness` | ADMIN | READ | Lock readiness |
| GET | `/predictions/admin/calibration/:seasonId/settlement-readiness` | ADMIN | READ | Settlement readiness |
| GET | `/predictions/admin/calibration/:seasonId/peer-challenge-readiness` | ADMIN | READ | Peer challenge readiness |
| GET | `/predictions/admin/calibration/:seasonId/activation-impact` | ADMIN | READ | Activation impact |

---

## Fantasy

**Controller:** `fantasy.controller.ts` — prefix: `fantasy`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/fantasy/player-pool` | FAN | READ | Available players |
| GET | `/fantasy/player-pool/:fixtureId` | FAN | READ | Players for fixture |
| GET | `/fantasy/deadline` | FAN | READ | Current deadline |
| GET | `/fantasy/gameweeks/:gameweekId/deadline` | FAN | READ | Gameweek deadline |
| GET | `/fantasy/gameweeks/:gameweekId/score` | FAN | READ | Gameweek score |
| GET | `/fantasy/gameweeks/:gameweekId/players` | FAN | READ | Gameweek player scores |
| GET | `/fantasy/transfers/status` | FAN | READ | Transfer status |
| POST | `/fantasy/team` | FAN | MUTATION | Create Fantasy team |
| GET | `/fantasy/team/me` | FAN | READ | My Fantasy team |
| POST | `/fantasy/team/me` | FAN | MUTATION | Set team |
| PATCH | `/fantasy/team/me` | FAN | MUTATION | Update team |
| POST | `/fantasy/team/me/players` | FAN | MUTATION | Add player |
| DELETE | `/fantasy/team/me/players/:playerId` | FAN | MUTATION | Remove player |
| PATCH | `/fantasy/team/me/players/:playerId` | FAN | MUTATION | Update player slot |
| POST | `/fantasy/team/me/transfers` | FAN | MUTATION | Make transfers |
| POST | `/fantasy/team/me/validate` | FAN | READ | Validate team |
| POST | `/fantasy/validate` | FAN | READ | Validate (alt) |
| GET | `/fantasy/chips` | FAN | READ | My chips |
| POST | `/fantasy/chips/:chipId/activate` | FAN | MUTATION | Activate chip |
| POST | `/fantasy/chips/:chipId/cancel` | FAN | MUTATION | Cancel chip |
| GET | `/fantasy/player-prices` | FAN | READ | Player prices |
| GET | `/fantasy/leagues/me` | FAN | READ | My leagues |
| POST | `/fantasy/leagues/private` | FAN | MUTATION | Create private league |
| POST | `/fantasy/leagues/join` | FAN | MUTATION | Join league by code |
| POST | `/fantasy/leagues/public/join` | FAN | MUTATION | Join public league |
| GET | `/fantasy/leagues/:leagueId` | FAN | READ | Get league |
| GET | `/fantasy/leagues/:leagueId/standings` | FAN | READ | League standings |
| POST | `/fantasy/leagues/:leagueId/leave` | FAN | MUTATION | Leave league |
| GET | `/fantasy/cups/me` | FAN | READ | My cups |
| GET | `/fantasy/cups/:id` | FAN | READ | Get cup |
| GET | `/fantasy/gameweeks/:gameweekId/auto-subs` | FAN | READ | Auto-sub results |
| GET | `/fantasy/gameweeks/:gameweekId/final-xi` | FAN | READ | Final XI |
| GET | `/fantasy/history` | FAN | READ | Gameweek history |
| GET | `/fantasy/history/:gameweekId` | FAN | READ | Specific gameweek history |
| GET | `/fantasy/leaderboard` | FAN | READ | Fantasy leaderboard |
| GET | `/fantasy/leaderboard/gameweek/:gameweekId` | FAN | READ | Gameweek leaderboard |
| GET | `/fantasy/leaderboard/season/:seasonId` | FAN | READ | Season leaderboard |
| GET | `/fantasy/rules` | FAN | READ | Current rules config |
| GET | `/fantasy/admin/rules` | ADMIN | READ | Admin rules view |
| GET | `/fantasy/admin/rules/:seasonId` | ADMIN | READ | Season rules |
| POST | `/fantasy/admin/rules/:seasonId/default` | ADMIN | MUTATION | Set default rules |
| PATCH | `/fantasy/admin/rules/:seasonId` | ADMIN | MUTATION | Update rules |
| POST | `/fantasy/admin/rules/:seasonId/reset-defaults` | ADMIN | MUTATION | Reset to defaults |
| POST | `/fantasy/admin/validate-rules` | ADMIN | READ | Validate rules |
| GET | `/fantasy/admin/leagues` | ADMIN | READ | All leagues |
| GET | `/fantasy/admin/leagues/:leagueId` | ADMIN | READ | League detail |
| POST | `/fantasy/admin/leagues/:leagueId/lock` | ADMIN | MUTATION | Lock league |
| POST | `/fantasy/admin/leagues/:leagueId/unlock` | ADMIN | MUTATION | Unlock league |
| POST | `/fantasy/admin/leagues/global/ensure/:seasonId` | ADMIN | MUTATION | Ensure global league |
| POST | `/fantasy/admin/leagues/:id/generate-head-to-head-fixtures` | ADMIN | MUTATION | Generate H2H fixtures |
| POST | `/fantasy/admin/leagues/:id/settle-head-to-head-gameweek/:gameweekId` | ADMIN | MUTATION | Settle H2H gameweek |
| POST | `/fantasy/admin/cups` | ADMIN | MUTATION | Create cup |
| POST | `/fantasy/admin/cups/:id/generate-round` | ADMIN | MUTATION | Generate cup round |
| POST | `/fantasy/admin/cups/:id/settle-round/:gameweekId` | ADMIN | MUTATION | Settle cup round |
| POST | `/fantasy/admin/settle-fixture/:fixtureId` | ADMIN | MUTATION | Settle fixture fantasy |
| POST | `/fantasy/admin/gameweeks/:gameweekId/recalculate-deadline` | ADMIN | MUTATION | Recalculate deadline |
| POST | `/fantasy/admin/gameweeks/:gameweekId/rollover-transfers` | ADMIN | MUTATION | Rollover transfers |
| POST | `/fantasy/admin/players/:playerId/price` | ADMIN | MUTATION | Update player price |
| POST | `/fantasy/admin/gameweeks/:gameweekId/process-auto-subs` | ADMIN | MUTATION | Process auto-subs |
| POST | `/fantasy/admin/fixtures/:fixtureId/match-stats` | ADMIN | MUTATION | Store match stats |
| POST | `/fantasy/admin/fixtures/:fixtureId/settle-fantasy-points` | ADMIN | MUTATION | Settle fantasy points |
| POST | `/fantasy/admin/scoring/gameweeks/:gameweekId/settle` | ADMIN | MUTATION | Settle GW scoring |
| POST | `/fantasy/admin/scoring/gameweeks/:gameweekId/recalculate` | ADMIN | MUTATION | Recalculate scoring |
| POST | `/fantasy/admin/scoring/teams/:fantasyTeamId/gameweeks/:gameweekId/recalculate` | ADMIN | MUTATION | Recalculate team scoring |
| POST | `/fantasy/admin/auto-subs/gameweeks/:gameweekId/apply` | ADMIN | MUTATION | Apply auto-subs |
| POST | `/fantasy/admin/auto-subs/teams/:fantasyTeamId/gameweeks/:gameweekId/recalculate` | ADMIN | MUTATION | Recalculate auto-subs |
| GET | `/fantasy/admin/auto-subs/gameweeks/:gameweekId` | ADMIN | READ | GW auto-sub status |

---

## Fantasy Calibration

**Controller:** `fantasy-calibration.controller.ts` — prefix: `fantasy/admin/calibration`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/fantasy/admin/calibration` | ADMIN | READ | Calibration hub |
| GET | `/fantasy/admin/calibration/:seasonId` | ADMIN | READ | Season calibration |
| GET | `/fantasy/admin/calibration/:seasonId/readiness` | ADMIN | READ | Readiness |
| GET | `/fantasy/admin/calibration/:seasonId/rules` | ADMIN | READ | Rules |
| POST | `/fantasy/admin/calibration/:seasonId/rules` | ADMIN | MUTATION | Create rules |
| PATCH | `/fantasy/admin/calibration/:seasonId/rules` | ADMIN | MUTATION | Update rules |
| GET | `/fantasy/admin/calibration/:seasonId/players` | ADMIN | READ | Players |
| POST | `/fantasy/admin/calibration/:seasonId/players/generate-prices` | ADMIN | MUTATION | Generate prices |
| PATCH | `/fantasy/admin/calibration/:seasonId/players/:playerId/price` | ADMIN | MUTATION | Update price |
| GET | `/fantasy/admin/calibration/:seasonId/squads` | ADMIN | READ | Squads |
| GET | `/fantasy/admin/calibration/:seasonId/gameweeks` | ADMIN | READ | Gameweeks |
| POST | `/fantasy/admin/calibration/:seasonId/gameweeks/derive-deadlines` | ADMIN | MUTATION | Derive deadlines |
| GET | `/fantasy/admin/calibration/:seasonId/activation-impact` | ADMIN | READ | Activation impact |

---

## Fantasy Price Calibration

**Controller:** `fantasy-price-calibration.controller.ts` — prefix: `admin/fantasy-price-calibration`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/admin/fantasy-price-calibration/seasons` | ADMIN | READ | Calibration seasons |
| GET | `/admin/fantasy-price-calibration/:seasonId/overview` | ADMIN | READ | Season overview |
| GET | `/admin/fantasy-price-calibration/:seasonId/players` | ADMIN | READ | Players |
| GET | `/admin/fantasy-price-calibration/:seasonId/missing-prices` | ADMIN | READ | Missing prices |
| GET | `/admin/fantasy-price-calibration/:seasonId/invalid-prices` | ADMIN | READ | Invalid prices |
| PATCH | `/admin/fantasy-price-calibration/:seasonId/players/:playerId` | ADMIN | MUTATION | Update player price |
| POST | `/admin/fantasy-price-calibration/:seasonId/bulk-apply-defaults` | ADMIN | MUTATION | Bulk apply defaults |
| POST | `/admin/fantasy-price-calibration/:seasonId/validate` | ADMIN | READ | Validate prices |
| POST | `/admin/fantasy-price-calibration/:seasonId/publish` | ADMIN | MUTATION | Publish prices |
| GET | `/admin/fantasy-price-calibration/:seasonId/readiness` | ADMIN | READ | Readiness |
| GET | `/admin/fantasy-price-calibration/:seasonId/activation-impact` | ADMIN | READ | Activation impact |
| GET | `/admin/fantasy-price-calibration/:seasonId/activation-dry-run` | ADMIN | DRY_RUN | Dry run |

---

## Social Predictions (Marketplace)

**Controller:** `social-prediction.controller.ts` — prefixes: `social-predictions`, `admin/social-predictions`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/social-predictions/allocation` | FAN | READ | My gameplay allocation |
| GET | `/social-predictions/marketplace/:fixtureId` | FAN | READ | Marketplace for fixture |
| GET | `/social-predictions/markets/:marketId` | FAN | READ | Get market |
| GET | `/social-predictions/markets/:marketId/listings` | FAN | READ | Market listings |
| POST | `/social-predictions/listings` | FAN | MUTATION | Create listing |
| GET | `/social-predictions/listings` | FAN | READ | My listings |
| GET | `/social-predictions/listings/:id` | FAN | READ | Get listing |
| DELETE | `/social-predictions/listings/:id` | FAN | MUTATION | Cancel listing |
| POST | `/social-predictions/listings/:id/accept` | FAN | MUTATION | Accept listing |
| GET | `/social-predictions/leaderboard` | FAN | READ | SP leaderboard |
| GET | `/social-predictions/ledger` | FAN | READ | My points ledger |
| GET | `/social-predictions/challenges/incoming` | FAN | READ | Incoming challenges |
| GET | `/social-predictions/challenges/outgoing` | FAN | READ | Outgoing challenges |
| POST | `/social-predictions/listings/:id/challenge` | FAN | MUTATION | Send direct challenge |
| POST | `/social-predictions/listings/:id/challenge/accept` | FAN | MUTATION | Accept direct challenge |
| POST | `/social-predictions/listings/:id/challenge/decline` | FAN | MUTATION | Decline direct challenge |
| POST | `/social-predictions/listings/:id/challenge/withdraw` | FAN | MUTATION | Withdraw direct challenge |
| GET | `/social-predictions/listings/:id/share-link` | FAN | READ | Share link |
| POST | `/admin/social-predictions/market-configs` | ADMIN | MUTATION | Create market config |
| GET | `/admin/social-predictions/market-configs` | ADMIN | READ | List market configs |
| PATCH | `/admin/social-predictions/market-configs/:id/toggle` | ADMIN | MUTATION | Toggle market config |
| POST | `/admin/social-predictions/fixtures/:fixtureId/markets` | ADMIN | MUTATION | Create market |
| GET | `/admin/social-predictions/fixtures/:fixtureId/markets` | ADMIN | READ | List markets |
| PATCH | `/admin/social-predictions/markets/:id/open` | ADMIN | MUTATION | Open market |
| PATCH | `/admin/social-predictions/markets/:id/lock` | ADMIN | MUTATION | Lock market |
| PATCH | `/admin/social-predictions/markets/:id/settle` | ADMIN | MUTATION | Settle market |
| PATCH | `/admin/social-predictions/markets/:id/void` | ADMIN | MUTATION | Void market |
| POST | `/admin/social-predictions/allocations/grant` | ADMIN | MUTATION | Grant gameplay points |
| PATCH | `/admin/social-predictions/allocations/:fanUserId/:gameweekId` | ADMIN | MUTATION | Update allocation |
| GET | `/admin/social-predictions/listings` | ADMIN | READ | All listings |
| GET | `/admin/social-predictions/listings/:id` | ADMIN | READ | Get listing |
| PATCH | `/admin/social-predictions/matches/:id/void` | ADMIN | MUTATION | Void match |
| GET | `/admin/social-predictions/compliance` | ADMIN | READ | Compliance report |

---

## Challenges (Legacy Peer-to-Peer)

**Controller:** `challenges.controller.ts` — prefix: `challenges`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| POST | `/challenges` | FAN | MUTATION | Create challenge |
| GET | `/challenges/me` | FAN | READ | My challenges |
| GET | `/challenges/:id` | FAN | READ | Get challenge |
| POST | `/challenges/:id/accept` | FAN | MUTATION | Accept challenge |
| POST | `/challenges/:id/decline` | FAN | MUTATION | Decline challenge |
| POST | `/challenges/:id/cancel` | FAN | MUTATION | Cancel challenge |

---

## Match Centre

**Controller:** `match-centre.controller.ts` — prefixes: `match-centre`, `admin/match-centre`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/match-centre/fixture/:fixtureId` | FAN | READ | Live match centre |
| GET | `/match-centre/fixture/:fixtureId/line-ups` | FAN | READ | Line-ups |
| GET | `/match-centre/fixture/:fixtureId/stats` | FAN | READ | Match stats |
| GET | `/match-centre/fixture/:fixtureId/player-ratings` | FAN | READ | Player ratings |
| GET | `/match-centre/standings/:seasonId` | FAN | READ | League standings |
| GET | `/match-centre/team-form/:clubId` | FAN | READ | Club recent form |
| GET | `/match-centre/player/:playerId` | FAN | READ | Player match centre |
| PATCH | `/admin/match-centre/standings/:seasonId/:clubId` | ADMIN | MUTATION | Update standings |
| POST | `/admin/match-centre/player-ratings` | ADMIN | MUTATION | Enter player ratings |
| POST | `/admin/match-centre/ingest` | ADMIN | MUTATION | Ingest match data |
| GET | `/admin/match-centre/ingestion-log` | ADMIN | READ | Ingestion log |
| GET | `/admin/match-centre/provenance/:entityType/:entityId` | ADMIN | READ | Data provenance |
| GET | `/admin/match-centre/capability-status` | ADMIN | READ | Capability status |

---

## Leaderboards

**Controller:** `leaderboards.controller.ts` — prefix: `leaderboards`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/leaderboards` | FAN | READ | All leaderboards |
| GET | `/leaderboards/seasons` | FAN | READ | Season leaderboard list |
| GET | `/leaderboards/overall` | FAN | READ | Overall leaderboard |
| GET | `/leaderboards/fan-value` | FAN | READ | Fan Value leaderboard |
| GET | `/leaderboards/fantasy` | FAN | READ | Fantasy leaderboard |
| GET | `/leaderboards/predictions` | FAN | READ | Predictions leaderboard |
| GET | `/leaderboards/achievements` | FAN | READ | Achievement leaderboard |

---

## Fan Value

**Controller:** `fan-value.controller.ts` — prefix: `fan-value`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/fan-value/summary` | FAN | READ | My Fan Value summary |
| GET | `/fan-value/ledger` | FAN | READ | My ledger |
| GET | `/fan-value/by-type` | FAN | READ | Ledger by type |
| GET | `/fan-value/by-source` | FAN | READ | Ledger by source |
| GET | `/fan-value/seasons/:seasonId` | FAN | READ | Season Fan Value |
| GET | `/fan-value/gameweeks/:gameweekId` | FAN | READ | Gameweek Fan Value |
| GET | `/fan-value/admin/summary` | ADMIN | READ | Platform-wide summary |
| GET | `/fan-value/admin/users/:userId/ledger` | ADMIN | READ | Fan's ledger |
| POST | `/fan-value/admin/entries` | ADMIN | MUTATION | Create manual entry |

---

## Achievements

**Controller:** `achievements.controller.ts` — prefix: `achievements`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/achievements` | FAN | READ | My achievements |
| GET | `/achievements/summary` | FAN | READ | Summary |
| GET | `/achievements/progress` | FAN | READ | Progress |
| GET | `/achievements/badges` | FAN | READ | My badges |
| GET | `/achievements/definitions` | FAN | READ | All definitions |
| GET | `/achievements/definitions/badges` | FAN | READ | Badge definitions |
| POST | `/achievements/evaluate` | FAN | MUTATION | Trigger evaluation |
| GET | `/achievements/admin/stats` | ADMIN | READ | Platform stats |
| GET | `/achievements/admin/definitions` | ADMIN | READ | All definitions |
| POST | `/achievements/admin/definitions` | ADMIN | MUTATION | Create definition |
| PATCH | `/achievements/admin/definitions/:id` | ADMIN | MUTATION | Update definition |
| GET | `/achievements/admin/badges` | ADMIN | READ | All badges |
| POST | `/achievements/admin/badges` | ADMIN | MUTATION | Create badge |
| PATCH | `/achievements/admin/badges/:id` | ADMIN | MUTATION | Update badge |
| POST | `/achievements/admin/link-badge` | ADMIN | MUTATION | Link badge to achievement |
| GET | `/achievements/admin/users/:userId` | ADMIN | READ | Fan achievements |
| POST | `/achievements/admin/users/:userId/award` | ADMIN | MUTATION | Manually award |
| POST | `/achievements/admin/users/:userId/revoke-achievement/:fanAchievementId` | ADMIN | MUTATION | Revoke achievement |
| POST | `/achievements/admin/users/:userId/revoke-badge/:fanBadgeId` | ADMIN | MUTATION | Revoke badge |
| POST | `/achievements/admin/evaluate/:userId` | ADMIN | MUTATION | Evaluate fan |

---

## Rewards Readiness

**Controller:** `rewards-readiness.controller.ts` — prefix: `rewards-readiness`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/rewards-readiness` | FAN | READ | My reward readiness |
| GET | `/rewards-readiness/eligible` | FAN | READ | Eligible rewards |
| GET | `/rewards-readiness/locked` | FAN | READ | Locked rewards |
| POST | `/rewards-readiness/evaluate` | FAN | MUTATION | Trigger evaluation |
| GET | `/rewards-readiness/definitions` | FAN | READ | All definitions |
| GET | `/rewards-readiness/admin/stats` | ADMIN | READ | Platform stats |
| GET | `/rewards-readiness/admin/definitions` | ADMIN | READ | All definitions |
| POST | `/rewards-readiness/admin/definitions` | ADMIN | MUTATION | Create definition |
| PATCH | `/rewards-readiness/admin/definitions/:id` | ADMIN | MUTATION | Update definition |
| POST | `/rewards-readiness/admin/definitions/:id/toggle` | ADMIN | MUTATION | Toggle definition |
| GET | `/rewards-readiness/admin/definitions/:id/eligible-fans` | ADMIN | READ | Eligible fans |
| POST | `/rewards-readiness/admin/evaluate/:userId` | ADMIN | MUTATION | Evaluate fan |
| POST | `/rewards-readiness/admin/evaluate-all` | ADMIN | MUTATION | Evaluate all fans |

---

## Notifications

**Controller:** `notifications.controller.ts` — prefix: `notifications`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/notifications` | FAN | READ | My notifications |
| GET | `/notifications/unread-count` | FAN | READ | Unread count |
| GET | `/notifications/preferences` | FAN | READ | My preferences |
| PATCH | `/notifications/preferences` | FAN | MUTATION | Update preferences |
| GET | `/notifications/:id` | FAN | READ | Get notification |
| POST | `/notifications/:id/read` | FAN | MUTATION | Mark read |
| POST | `/notifications/read-all` | FAN | MUTATION | Mark all read |
| POST | `/notifications/:id/archive` | FAN | MUTATION | Archive |
| GET | `/notifications/admin/stats` | ADMIN | READ | Stats |
| GET | `/notifications/admin/recent` | ADMIN | READ | Recent |
| POST | `/notifications/admin/users/:userId` | ADMIN | MUTATION | Send to fan |
| POST | `/notifications/admin/broadcast` | ADMIN | MUTATION | Broadcast |
| POST | `/notifications/admin/fantasy-deadline` | ADMIN | MUTATION | Fantasy deadline alert |
| POST | `/notifications/admin/live-match-alert` | ADMIN | MUTATION | Live match alert |

---

## Activity Feed

**Controller:** `activity-feed.controller.ts` — prefix: `activity-feed`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/activity-feed` | FAN | READ | Public feed |
| GET | `/activity-feed/me` | FAN | READ | My feed |
| GET | `/activity-feed/admin` | ADMIN | READ | All feed items |
| GET | `/activity-feed/admin/stats` | ADMIN | READ | Feed stats |
| POST | `/activity-feed/admin/system` | ADMIN | MUTATION | Post system item |
| POST | `/activity-feed/admin/live-match-alert` | ADMIN | MUTATION | Post match alert |
| POST | `/activity-feed/admin/:id/hide` | ADMIN | MUTATION | Admin hide item |
| POST | `/activity-feed/admin/:id/unhide` | ADMIN | MUTATION | Unhide item |
| GET | `/activity-feed/:id` | FAN | READ | Single item |
| POST | `/activity-feed/:id/reactions` | FAN | MUTATION | React to item |
| DELETE | `/activity-feed/:id/reactions/:reactionType` | FAN | MUTATION | Remove reaction |
| POST | `/activity-feed/:id/hide` | FAN | MUTATION | Hide from my feed |

---

## Club Experience

**Controller:** `club-experience.controller.ts` — prefix: `clubs`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/clubs` | FAN | READ | List PSL clubs |
| GET | `/clubs/:slug` | FAN | READ | Club hub |
| GET | `/clubs/:slug/overview` | FAN | READ | Club overview |
| GET | `/clubs/:slug/fixtures` | FAN | READ | Club fixtures |
| GET | `/clubs/:slug/results` | FAN | READ | Club results |
| GET | `/clubs/:slug/squad` | FAN | READ | Club squad |
| GET | `/clubs/:slug/stats` | FAN | READ | Club stats |
| GET | `/clubs/:slug/stadium` | FAN | READ | Stadium info |
| GET | `/clubs/:slug/tickets` | FAN | READ | Tickets (stub) |
| GET | `/clubs/:slug/shop` | FAN | READ | Club shop |
| GET | `/clubs/:slug/shop/:productSlug` | FAN | READ | Shop product |
| GET | `/clubs/admin/list` | ADMIN | READ | All clubs |
| GET | `/clubs/admin/readiness` | ADMIN | READ | Club readiness |
| GET | `/clubs/admin/fixtures/unassigned` | ADMIN | READ | Unassigned fixtures |
| GET | `/clubs/admin/players/unassigned` | ADMIN | READ | Unassigned players |
| PATCH | `/clubs/admin/fixtures/:fixtureId/teams` | ADMIN | MUTATION | Assign teams to fixture |
| PATCH | `/clubs/admin/fixtures/:fixtureId/venue` | ADMIN | MUTATION | Assign venue |
| PATCH | `/clubs/admin/fixtures/:fixtureId/gameweek` | ADMIN | MUTATION | Assign gameweek |
| PATCH | `/clubs/admin/fixtures/:fixtureId/assignment-status` | ADMIN | MUTATION | Update assignment status |
| GET | `/clubs/admin/seasons/:seasonId/teams` | ADMIN | READ | Season teams |
| POST | `/clubs/admin/seasons/:seasonId/teams` | ADMIN | MUTATION | Add team to season |
| PATCH | `/clubs/admin/seasons/:seasonId/teams/:teamId` | ADMIN | MUTATION | Update season team |
| DELETE | `/clubs/admin/seasons/:seasonId/teams/:teamId` | ADMIN | MUTATION | Remove season team |
| GET | `/clubs/admin/seasons/:seasonId/validate` | ADMIN | READ | Validate season |
| GET | `/clubs/admin/seasons/:seasonId/fixtures/validate` | ADMIN | READ | Validate fixtures |
| GET | `/clubs/admin/:id` | ADMIN | READ | Club admin detail |
| GET | `/clubs/admin/:id/experience` | ADMIN | READ | Experience detail |
| GET | `/clubs/admin/:id/players` | ADMIN | READ | Players |
| GET | `/clubs/admin/:id/shop/readiness` | ADMIN | READ | Shop readiness |
| GET | `/clubs/admin/:id/fixtures` | ADMIN | READ | Fixtures |
| POST | `/clubs/admin/:id/validate` | ADMIN | MUTATION | Validate club |
| POST | `/clubs/admin/:id/seasons/:seasonId/players` | ADMIN | MUTATION | Add season player |
| PATCH | `/clubs/admin/:id/seasons/:seasonId/players/:playerId` | ADMIN | MUTATION | Update season player |
| DELETE | `/clubs/admin/:id/seasons/:seasonId/players/:playerId` | ADMIN | MUTATION | Remove season player |
| POST | `/clubs/admin/:id/seasons/:seasonId/players/:playerId/move` | ADMIN | MUTATION | Move player |
| GET | `/clubs/admin/:id/seasons/:seasonId/squad/validate` | ADMIN | READ | Validate squad |

---

## Player Stats (Fan)

**Controller:** `player-stats.controller.ts` — prefix: `players`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/players/:playerId/profile` | FAN | READ | Player profile |
| GET | `/players/:playerId/season/:seasonId/stats` | FAN | READ | Season stats |
| GET | `/players/:playerId/fixture/:fixtureId/stats` | FAN | READ | Match stats |
| GET | `/players/fixtures/:fixtureId/stats` | FAN | READ | All player stats for fixture |
| GET | `/players/season/:seasonId/top-performers` | FAN | READ | Top performers |
| GET | `/players/gameweek/:gameweekId/stats` | FAN | READ | Gameweek player stats |
| GET | `/players/season/:seasonId/team/:teamId/squad-stats` | FAN | READ | Squad stats |

---

## Player Stats (Admin)

**Controller:** `player-stats-admin.controller.ts` — prefix: `players/admin/stats`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/players/admin/stats` | ADMIN | READ | All player stats |
| GET | `/players/admin/stats/season/:seasonId/readiness` | ADMIN | READ | Readiness |
| GET | `/players/admin/stats/:id` | ADMIN | READ | Get stats entry |
| POST | `/players/admin/stats` | ADMIN | MUTATION | Create stats entry |
| POST | `/players/admin/stats/:id/verify` | ADMIN | MUTATION | Verify entry |
| POST | `/players/admin/stats/:id/publish` | ADMIN | MUTATION | Publish entry |
| POST | `/players/admin/stats/:id/lock` | ADMIN | MUTATION | Lock entry |
| POST | `/players/admin/stats/fixtures/:fixtureId/bulk-publish` | ADMIN | MUTATION | Bulk publish fixture stats |
| DELETE | `/players/admin/stats/:id` | ADMIN | MUTATION | Delete entry |

---

## Media

**Controller:** `media.controller.ts`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/fan/media` | FAN | READ | Fan media feed |
| GET | `/fan/media/:slug` | FAN | READ | Single media item |
| GET | `/fan/clubs/:clubId/media` | FAN | READ | Club media |
| POST | `/fan/media/:id/view` | FAN | MUTATION | Record view |
| POST | `/fan/media/:id/complete` | FAN | MUTATION | Record completion |
| GET | `/admin/media` | ADMIN | READ | All media |
| POST | `/admin/media` | ADMIN | MUTATION | Create media item |
| GET | `/admin/media/:id` | ADMIN | READ | Get media item |
| PATCH | `/admin/media/:id` | ADMIN | MUTATION | Update media item |
| POST | `/admin/media/:id/publish` | ADMIN | MUTATION | Publish |
| POST | `/admin/media/:id/archive` | ADMIN | MUTATION | Archive |

---

## Campaigns

**Controller:** `campaigns.controller.ts`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/fan/campaigns` | FAN | READ | Available campaigns |
| GET | `/fan/campaigns/:slug` | FAN | READ | Campaign detail |
| POST | `/fan/campaigns/:id/start` | FAN | MUTATION | Start campaign |
| POST | `/fan/campaigns/:id/actions/:actionId/complete` | FAN | MUTATION | Complete action |
| GET | `/fan/campaigns/:id/progress` | FAN | READ | Campaign progress |
| GET | `/admin/campaigns` | ADMIN | READ | All campaigns |
| POST | `/admin/campaigns` | ADMIN | MUTATION | Create campaign |
| GET | `/admin/campaigns/:id` | ADMIN | READ | Get campaign |
| PATCH | `/admin/campaigns/:id` | ADMIN | MUTATION | Update campaign |
| POST | `/admin/campaigns/:id/publish` | ADMIN | MUTATION | Publish campaign |
| POST | `/admin/campaigns/:id/pause` | ADMIN | MUTATION | Pause campaign |
| POST | `/admin/campaigns/:id/complete` | ADMIN | MUTATION | Complete campaign |

---

## Campaign Analytics

**Controller:** `campaign-analytics.controller.ts`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/admin/campaigns/:id/analytics` | ADMIN | READ | Campaign analytics |
| POST | `/admin/campaigns/:id/analytics/recalculate` | ADMIN | MUTATION | Recalculate analytics |
| GET | `/admin/sponsors/:id/analytics` | ADMIN | READ | Sponsor analytics |

---

## Campaign Rewards

**Controller:** `campaign-rewards.controller.ts`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/fan/rewards` | FAN | READ | My rewards |
| GET | `/fan/rewards/:id` | FAN | READ | Get reward |
| POST | `/fan/rewards/:id/claim` | FAN | MUTATION | Claim reward |
| POST | `/fan/rewards/:id/redeem` | FAN | MUTATION | Redeem reward |
| GET | `/admin/reward-definitions` | ADMIN | READ | All reward definitions |
| POST | `/admin/reward-definitions` | ADMIN | MUTATION | Create definition |
| PATCH | `/admin/reward-definitions/:id` | ADMIN | MUTATION | Update definition |
| POST | `/admin/rewards` | ADMIN | MUTATION | Create reward |
| GET | `/admin/rewards` | ADMIN | READ | All rewards |

---

## Sponsors

**Controller:** `sponsors.controller.ts` — prefix: `admin/sponsors`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/admin/sponsors` | ADMIN | READ | All sponsors |
| POST | `/admin/sponsors` | ADMIN | MUTATION | Create sponsor |
| GET | `/admin/sponsors/:id` | ADMIN | READ | Get sponsor |
| PATCH | `/admin/sponsors/:id` | ADMIN | MUTATION | Update sponsor |

---

## Wallet Integration

**Controller:** `wallet-integration.controller.ts`

> All wallet routes use `SiliconEnterpriseSandboxWalletAdapter`. No real money can move. See ADR-019.

| Method | Route | Auth | Class | Description | Label |
|--------|-------|------|-------|-------------|-------|
| GET | `/fan/wallet/status` | FAN | READ | Wallet link status | SANDBOX_ONLY |
| POST | `/fan/wallet/link/start` | FAN | MUTATION | Begin wallet link | SANDBOX_ONLY |
| POST | `/fan/wallet/link/confirm` | FAN | MUTATION | Confirm wallet link | SANDBOX_ONLY |
| POST | `/fan/wallet/unlink` | FAN | MUTATION | Unlink wallet | SANDBOX_ONLY |
| GET | `/admin/wallet/providers` | ADMIN | READ | Wallet providers | — |
| POST | `/admin/wallet/providers` | ADMIN | MUTATION | Add provider | — |
| PATCH | `/admin/wallet/providers/:id` | ADMIN | MUTATION | Update provider | — |
| GET | `/admin/wallet/links` | ADMIN | READ | All wallet links | — |
| GET | `/admin/wallet/transactions` | ADMIN | READ | Transactions | — |
| POST | `/admin/wallet/webhooks/:providerSlug/sandbox` | ADMIN | MUTATION | Sandbox webhook | SANDBOX_ONLY |

---

## Season Switching

**Controller:** `season-switching.controller.ts` — prefix: `seasons/admin`

> `activate`, `complete`, and `rollback` are real executable routes. They are blocked by the service-layer 13-check readiness gate if checks fail — not by a code disable flag. See ADR-013 and ADR-026.

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/seasons/admin/context` | ADMIN | READ | Current season context |
| GET | `/seasons/admin/switching/history` | ADMIN | READ | Switch history |
| GET | `/seasons/admin/switching/readiness/:seasonId` | ADMIN | READ | 13-check readiness |
| GET | `/seasons/admin/switching/preview/:seasonId` | ADMIN | DRY_RUN | Switch preview |
| POST | `/seasons/admin/switching/activate/:seasonId` | ADMIN | MUTATION | Activate season (READINESS_GATED) |
| POST | `/seasons/admin/switching/complete/:seasonId` | ADMIN | MUTATION | Complete season (READINESS_GATED) |
| POST | `/seasons/admin/switching/rollback/:seasonId` | ADMIN | MUTATION | Rollback switch (READINESS_GATED) |

---

## Squad Import

**Controller:** `squad-import.controller.ts` — prefix: `admin/squad-import`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/admin/squad-import/seasons` | ADMIN | READ | Import-ready seasons |
| GET | `/admin/squad-import/:seasonId/overview` | ADMIN | READ | Import overview |
| GET | `/admin/squad-import/:seasonId/batches` | ADMIN | READ | Import batches |
| GET | `/admin/squad-import/:seasonId/batches/:batchId` | ADMIN | READ | Batch detail |
| GET | `/admin/squad-import/:seasonId/batches/:batchId/rows` | ADMIN | READ | Batch rows |
| POST | `/admin/squad-import/:seasonId/batches/manual` | ADMIN | MUTATION | Create manual batch |
| POST | `/admin/squad-import/:seasonId/batches/:batchId/validate` | ADMIN | MUTATION | Validate batch |
| POST | `/admin/squad-import/:seasonId/batches/:batchId/import` | ADMIN | MUTATION | Import batch |
| POST | `/admin/squad-import/:seasonId/batches/:batchId/publish` | ADMIN | MUTATION | Publish batch |
| POST | `/admin/squad-import/:seasonId/batches/:batchId/cancel` | ADMIN | MUTATION | Cancel batch |
| GET | `/admin/squad-import/:seasonId/duplicates` | ADMIN | READ | Duplicate detection |
| GET | `/admin/squad-import/:seasonId/readiness` | ADMIN | READ | Import readiness |
| GET | `/admin/squad-import/:seasonId/activation-impact` | ADMIN | READ | Activation impact |
| GET | `/admin/squad-import/:seasonId/activation-dry-run` | ADMIN | DRY_RUN | Dry run |

---

## Admin Engagement

**Controller:** `engagement.controller.ts` — prefix: `admin/engagement`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/admin/engagement/seasons` | ADMIN | READ | Seasons list |
| GET | `/admin/engagement/:seasonId/overview` | ADMIN | READ | Season overview |
| GET | `/admin/engagement/:seasonId/leaderboards` | ADMIN | READ | Leaderboard admin |
| GET | `/admin/engagement/:seasonId/fan-value` | ADMIN | READ | Fan Value summary |
| GET | `/admin/engagement/:seasonId/fantasy` | ADMIN | READ | Fantasy summary |
| GET | `/admin/engagement/:seasonId/predictions` | ADMIN | READ | Predictions summary |
| GET | `/admin/engagement/:seasonId/achievements` | ADMIN | READ | Achievement summary |
| GET | `/admin/engagement/:seasonId/unscoped-ledger` | ADMIN | READ | Unscoped ledger |
| GET | `/admin/engagement/:seasonId/season-scope-audit` | ADMIN | READ | Season scope audit |
| GET | `/admin/engagement/:seasonId/activation-impact` | ADMIN | DRY_RUN | Season activation impact |

---

## Admin Operations (Control Plane)

**Controller:** `admin-operations.controller.ts` — prefix: `admin/operations`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/admin/operations/overview` | ADMIN | READ | Control plane overview |
| GET | `/admin/operations/capability-review` | ADMIN | READ | Capability gap review |
| GET | `/admin/operations/launch-readiness` | ADMIN | READ | Launch readiness checklist |
| GET | `/admin/operations/module-readiness/:seasonId` | ADMIN | READ | Per-module readiness |
| GET | `/admin/operations/integrations/providers` | ADMIN | READ | All provider configs |
| GET | `/admin/operations/integrations/commercial-readiness` | ADMIN | READ | Commercial readiness |
| GET | `/admin/operations/integrations/wallet-payments` | ADMIN | READ | Wallet readiness |
| GET | `/admin/operations/integrations/live-data` | ADMIN | READ | Live data provider status |

---

## Admin Dashboard

**Controller:** `admin-dashboard.controller.ts` — prefix: `admin-dashboard`

> Note: the web frontend pages live at `/admin/dashboard/*` but the API routes use the hyphenated prefix `/admin-dashboard/*`.

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/admin-dashboard` | ADMIN | READ | Dashboard home |
| GET | `/admin-dashboard/overview` | ADMIN | READ | Overview |
| GET | `/admin-dashboard/health` | ADMIN | READ | Health |
| GET | `/admin-dashboard/action-required` | ADMIN | READ | Action required |
| GET | `/admin-dashboard/recent-events` | ADMIN | READ | Recent events |
| GET | `/admin-dashboard/quick-links` | ADMIN | READ | Quick links |
| GET | `/admin-dashboard/football` | ADMIN | READ | Football stats |
| GET | `/admin-dashboard/fans` | ADMIN | READ | Fan stats |
| GET | `/admin-dashboard/fantasy` | ADMIN | READ | Fantasy stats |
| GET | `/admin-dashboard/predictions` | ADMIN | READ | Prediction stats |
| GET | `/admin-dashboard/challenges` | ADMIN | READ | Challenge stats |
| GET | `/admin-dashboard/fan-value` | ADMIN | READ | Fan Value stats |
| GET | `/admin-dashboard/achievements` | ADMIN | READ | Achievement stats |
| GET | `/admin-dashboard/rewards` | ADMIN | READ | Reward stats |
| GET | `/admin-dashboard/notifications` | ADMIN | READ | Notification stats |
| GET | `/admin-dashboard/activity` | ADMIN | READ | Activity stats |
| GET | `/admin-dashboard/guess-the-score` | ADMIN | READ | GTS stats |
| GET | `/admin-dashboard/fantasy-rules` | ADMIN | READ | Fantasy rules |
| GET | `/admin-dashboard/fantasy-league` | ADMIN | READ | Fantasy league |
| GET | `/admin-dashboard/league-management` | ADMIN | READ | League management |
| GET | `/admin-dashboard/fixture-management` | ADMIN | READ | Fixture management |
| GET | `/admin-dashboard/sponsor-management` | ADMIN | READ | Sponsor management |
| GET | `/admin-dashboard/content-moderation` | ADMIN | READ | Content moderation |
| GET | `/admin-dashboard/reporting` | ADMIN | READ | Reporting |
| GET | `/admin-dashboard/compliance` | ADMIN | READ | Compliance |
| GET | `/admin-dashboard/user-audience` | ADMIN | READ | User audience |
| GET | `/admin-dashboard/system-operations` | ADMIN | READ | System operations |

---

## Beta Launch

**Controller:** `beta-launch.controller.ts` — prefix: `admin/beta-launch`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/admin/beta-launch/overview` | ADMIN | READ | Beta launch overview |
| GET | `/admin/beta-launch/seasons` | ADMIN | READ | Beta-ready seasons |
| GET | `/admin/beta-launch/cohorts` | ADMIN | READ | List cohorts |
| POST | `/admin/beta-launch/cohorts` | ADMIN | MUTATION | Create cohort |
| GET | `/admin/beta-launch/cohorts/:cohortId` | ADMIN | READ | Get cohort |
| PATCH | `/admin/beta-launch/cohorts/:cohortId` | ADMIN | MUTATION | Update cohort |
| POST | `/admin/beta-launch/cohorts/:cohortId/members` | ADMIN | MUTATION | Add member |
| DELETE | `/admin/beta-launch/cohorts/:cohortId/members/:userId` | ADMIN | MUTATION | Remove member |
| POST | `/admin/beta-launch/cohorts/:cohortId/start` | ADMIN | MUTATION | Start cohort |
| POST | `/admin/beta-launch/cohorts/:cohortId/pause` | ADMIN | MUTATION | Pause cohort |
| POST | `/admin/beta-launch/cohorts/:cohortId/complete` | ADMIN | MUTATION | Complete cohort |
| GET | `/admin/beta-launch/smoke-tests` | ADMIN | READ | Smoke test registry |
| POST | `/admin/beta-launch/smoke-tests/run` | ADMIN | DRY_RUN | Run smoke tests |
| GET | `/admin/beta-launch/:seasonId/readiness` | ADMIN | READ | 13-check readiness |
| GET | `/admin/beta-launch/:seasonId/blockers` | ADMIN | READ | Blocking issues |
| GET | `/admin/beta-launch/:seasonId/warnings` | ADMIN | READ | Warnings |
| GET | `/admin/beta-launch/:seasonId/frontend-readiness` | ADMIN | READ | Frontend readiness |
| GET | `/admin/beta-launch/:seasonId/data-readiness` | ADMIN | READ | Data readiness |
| GET | `/admin/beta-launch/:seasonId/security-readiness` | ADMIN | READ | Security readiness |
| GET | `/admin/beta-launch/:seasonId/operations-readiness` | ADMIN | READ | Operations readiness |
| GET | `/admin/beta-launch/:seasonId/beta-cohort-readiness` | ADMIN | READ | Cohort readiness |
| GET | `/admin/beta-launch/:seasonId/activation-preview` | ADMIN | DRY_RUN | Activation preview |
| POST | `/admin/beta-launch/:seasonId/dry-run` | ADMIN | DRY_RUN | Activation dry run |
| POST | `/admin/beta-launch/:seasonId/rollback-dry-run` | ADMIN | DRY_RUN | Rollback dry run |
| POST | `/admin/beta-launch/:seasonId/approve` | ADMIN | MUTATION | Create approval record |
| POST | `/admin/beta-launch/:seasonId/reject` | ADMIN | MUTATION | Reject approval |
| GET | `/admin/beta-launch/:seasonId/approval` | ADMIN | READ | Get approval |
| GET | `/admin/beta-launch/:seasonId/runbook` | ADMIN | READ | Launch runbook |

---

## Beta Feedback

**Controller:** `beta-feedback.controller.ts` — prefix: `admin/beta-feedback`

| Method | Route | Auth | Class | Description |
|--------|-------|------|-------|-------------|
| GET | `/admin/beta-feedback/overview` | ADMIN | READ | Beta programme overview |
| GET | `/admin/beta-feedback/known-issues` | ADMIN | READ | Known issues |
| GET | `/admin/beta-feedback/ux-checklist` | ADMIN | READ | UX checklist |
| GET | `/admin/beta-feedback/release-notes` | ADMIN | READ | Release notes |

---

## Notes

- All routes under `admin/*` or `admin-dashboard/*` require JWT with `PSL_ADMIN` role enforced by `JwtAuthGuard` + `RolesGuard`
- Routes labelled `DRY_RUN` perform no database writes — verify with `dryRunOnly: true` in the response (ADR-024)
- Routes labelled `SANDBOX_ONLY` call `SiliconEnterpriseSandboxWalletAdapter` — no outbound HTTP (ADR-019)
- Routes labelled `READINESS_GATED` work but throw `BadRequestException` if 13-check gate fails (ADR-013)
- Season activation is not blocked by a code flag — it is blocked by `SeasonSwitchingService.getSeasonSwitchReadiness()` returning `BLOCKED` (ADR-026)
- `NEXT_PUBLIC_API_BASE_URL` is the web environment variable pointing to this API (`http://localhost:4000` by default)
