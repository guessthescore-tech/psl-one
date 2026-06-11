# PSL One — Story-by-Story Code Walkthrough

This document explains what each Sprint 1 story built, how the code works, and where the files live. It is intended for engineers joining the project.

---

## Issue 0 — Monorepo Foundation & Agent Operating Model

**Product purpose:** Set up the pnpm monorepo, TypeScript strict mode, NestJS API, Next.js web app, Prisma, and the AI agent operating model.

**What was built:**
- `pnpm-workspace.yaml` — workspace definition
- `tsconfig.base.json` — shared TypeScript config (strict, exactOptionalPropertyTypes, noUncheckedIndexedAccess)
- `apps/api/` — NestJS 10 API application skeleton
- `apps/web/` — Next.js 14 App Router web application skeleton
- `apps/api/prisma/schema.prisma` — initial Prisma schema
- `apps/api/src/prisma/prisma.service.ts` — `PrismaService` extends `PrismaClient`, used as a singleton across all modules
- `apps/api/src/main.ts` — API entrypoint, binds to port 4000
- `apps/api/src/app.module.ts` — root module, imports all domain modules
- CLAUDE.md — agent operating rules and architectural constraints

**Key pattern established:** Every bounded context is a NestJS module with its own Service, Controller, and Module file. `PrismaService` is imported from `PrismaModule` and injected into each service constructor.

---

## STORY-01 — Fan Auth MVP

**Product purpose:** Fans can register, log in, and manage their account. Admins can authenticate with elevated privileges.

**What fans/admins can do:** Register with email + password; log in and receive a JWT; view own user profile; request password reset; confirm password reset with token.

**Backend files:**
- `apps/api/src/auth/auth.service.ts` — `AuthService`: `register()`, `login()`, `getMe()`, `requestPasswordReset()`, `confirmPasswordReset()`. Passwords hashed with bcrypt. JWT signed with `@nestjs/jwt`.
- `apps/api/src/auth/auth.controller.ts` — `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/password-reset/request`, `POST /auth/password-reset/confirm`
- `apps/api/src/auth/auth.module.ts` — imports `JwtModule`, `PrismaModule`
- `apps/api/src/auth/auth.service.spec.ts` — unit tests for all auth flows

**Frontend files:**
- `apps/web/src/app/login/page.tsx`
- `apps/web/src/app/register/page.tsx`
- `apps/web/src/app/forgot-password/page.tsx`
- `apps/web/src/app/reset-password/page.tsx`
- `apps/web/src/lib/auth-client.ts` — typed API client for auth endpoints

**Prisma models:**
- `User` — id, email, passwordHash, roles (string[]), passwordResetToken, passwordResetExpiry
- Migration: `20260609045934_init_auth_schema`

**How the code works:** `AuthService.register()` checks for duplicate email, hashes the password with bcrypt, creates a `User` record with `roles: ['FAN']`, and creates a `FanProfile` record in the same transaction. `login()` finds the user by email, compares passwords with `bcrypt.compare`, signs a JWT with `userId` and `roles` claims. `JwtAuthGuard` validates the JWT on every protected route. `RolesGuard` reads the `@Roles()` metadata and checks `user.roles` array.

**Integration points:** `AuthService.register()` also calls `ProfileService` to create the `FanProfile` — these are tightly coupled at registration. JWT payload is available to all guards downstream.

---

## STORY-02 — Football Core MVP

**Product purpose:** The platform knows about competitions, seasons, teams, players, fixtures, standings, and match state.

**What fans can do:** Browse competitions, seasons, teams, players, fixtures, standings. View live match state, timeline, player stats, lineups. View match centre summary.

**Backend files:**
- `apps/api/src/football/football.service.ts` — `FootballService`: queries for all football entities (competitions, seasons, teams, players, fixtures, standings)
- `apps/api/src/football/football.controller.ts` — `GET /football/competitions`, `/seasons`, `/teams`, `/players`, `/fixtures`, `/standings`, `/match-centre/:fixtureId`, and sub-routes for live data
- `apps/api/src/football/live-match.service.ts` — `LiveMatchService`: 16 methods for live match operations (state, events, lineups, player stats, live fantasy preview, live dashboard)
- `apps/api/src/football/live-match-provider.interface.ts` — `LiveMatchProviderInterface` adapter for sports data providers
- `apps/api/src/football/fixture-event.publisher.ts` — `FixtureEventPublisher`: publishes fixture events (console in Sprint 1, Kafka-ready)
- `apps/api/src/football/football.service.spec.ts`, `live-match.service.spec.ts`, `world-cup-2026.integration.spec.ts`

**Frontend files:**
- `apps/web/src/app/football/` — competitions, seasons, teams, players, fixtures, standings, match-centre pages
- `apps/web/src/lib/football-client.ts` — typed football API client

**Prisma models:**
- `Competition` — id, name, slug, country, type
- `Season` — id, competitionId, name, status (UPCOMING/ACTIVE/COMPLETED/ARCHIVED), startDate, endDate
- `Team` — id, name, slug, shortName, country, logoUrl
- `Player` — id, teamId, name, position, number, nationality, fantasyPrice
- `Fixture` — id, seasonId, homeTeamId, awayTeamId, kickoffAt, status, homeScore, awayScore, venue
- `MatchState` — real-time match state, possession, shots, etc.
- `MatchEvent` — goals, cards, substitutions
- `LineupEntry` — starting XI and bench for each fixture
- `MatchStats` — player performance stats per fixture
- `Standing` — league table row (points, GD, W/D/L counts)
- `Stage` — tournament stage (Group Stage, Knockouts)
- Migrations: `20260609054914_add_football_core`, `20260609100000_add_provider_fields`, `20260609150000_add_competition_format_and_stages`

**How the code works:** `FootballService` wraps Prisma queries with appropriate `include` and `where` clauses. `GET /football/fixtures` accepts query params (`seasonId`, `teamId`, `status`, `from`, `to`, `limit`). `LiveMatchService` uses the `LiveMatchProviderInterface` to fetch real-time data — in Sprint 1, this is mocked. `FixtureEventPublisher.publishGoal()` etc. emit events that will trigger downstream scoring and notification hooks.

---

## STORY-03 — Fan Profile & Preferences MVP

**Product purpose:** Each fan has a profile with their favourite team and notification preferences.

**What fans can do:** View/edit profile (display name, favourite team, bio, avatar URL). Set notification preferences. View profile summary.

**Backend files:**
- `apps/api/src/profile/profile.service.ts` — `ProfileService`: `getProfile()`, `updateProfile()`, `getPreferences()`, `updatePreferences()`, `getSummary()`
- `apps/api/src/profile/profile.controller.ts` — `GET/PATCH /profile/me`, `GET/PATCH /profile/preferences`, `GET /profile/summary`
- `apps/api/src/profile/profile.service.spec.ts`

**Frontend files:**
- `apps/web/src/app/profile/page.tsx`, `/edit/page.tsx`, `/preferences/page.tsx`
- `apps/web/src/lib/profile-client.ts`

**Prisma models:**
- `FanProfile` — userId (1:1 with User), displayName, bio, avatarUrl, favouriteTeamId, fanValueTotal
- `FanPreference` — userId, emailNotifications, pushNotifications, inAppNotifications
- Migration: `20260609063037_add_fan_profile`

**How the code works:** `FanProfile` is created automatically at registration. `updateProfile()` validates the favouriteTeamId exists as a Team before updating. `getSummary()` joins FanProfile with User and includes fan value total, achievement count, and prediction count for a rich profile card.

---

## STORY-04 — Live Fixture Feed / Match State MVP

**Product purpose:** Fans can follow live matches with real-time score, events, and player stats.

**What fans can do:** View live fixture status, current score, match timeline (goals, cards, subs), lineups, player stats, live fantasy points preview.

**Backend files:**
- Extensions to `FootballController` — `GET /football/fixtures/:id/live-dashboard`, `/live-state`, `/timeline`, `/player-stats`, `/live-fantasy-preview`, `/live`, `/events`, `/lineups`, `/availability`
- Extensions to `LiveMatchService` — all 16 live match methods
- `FixtureEventPublisher` — publishes match events

**Frontend files:**
- `apps/web/src/app/football/match-centre/[fixtureId]/page.tsx`
- `apps/web/src/app/football/fixtures/[id]/page.tsx`
- `apps/web/src/app/admin/football/live/page.tsx` — admin live dashboard
- `apps/web/src/app/admin/football/fixtures/[fixtureId]/live/page.tsx`

**Prisma models:** `MatchState`, `MatchEvent`, `LineupEntry`, `MatchStats` (all in football core migration)

**Admin routes:** `PATCH /football/admin/fixtures/:id/status`, `PATCH /football/admin/fixtures/:id/score`, `POST /football/admin/fixtures/:id/events`, `POST /football/admin/fixtures/:id/lineups`, `PATCH /football/admin/fixtures/:id/live-state`, `POST /football/admin/fixtures/:id/match-events`, `PATCH /football/admin/events/:eventId`

**How the code works:** Admin pushes score/event updates via API. `LiveMatchService` queries `MatchState` and `MatchEvent` from the database. `live-fantasy-preview` reads current fantasy team selections and applies provisional scoring against the current match state — it is read-only and does not affect stored scores.

---

## STORY-05 — Social Predictions / Peer Challenges MVP

**Product purpose:** Fans can predict match scores to earn Fan Value points and challenge other fans head-to-head.

**What fans can do:** Make a score prediction for any upcoming fixture. View their predictions. Challenge a friend on a specific fixture with Fan Value at stake. Accept/decline/cancel challenges.

**Backend files:**
- `apps/api/src/predictions/predictions.service.ts` — `PredictionsService`: `create()`, `findByUser()`, `findByFixture()`, `updatePrediction()`, `lockFixture()`, `settleFixture()`, `voidFixture()`, `lockGameweek()`, `settleGameweek()`
- `apps/api/src/predictions/predictions.controller.ts` — fan + admin routes
- `apps/api/src/predictions/scoring.ts` — `calculatePoints(homeScore, awayScore, predictedHome, predictedAway)`: returns 10 (exact), 5 (correct goal diff), 3 (correct result), 0 (wrong)
- `apps/api/src/challenges/challenges.service.ts` — `ChallengesService`: `create()`, `findByUser()`, `findById()`, `accept()`, `decline()`, `cancel()`
- `apps/api/src/challenges/challenges.controller.ts`
- `apps/api/src/predictions/predictions.service.spec.ts`, `apps/api/src/challenges/challenges.service.spec.ts`

**Frontend files:**
- `apps/web/src/app/predictions/` — prediction pages
- `apps/web/src/app/challenges/` — challenge pages
- `apps/web/src/lib/predictions-client.ts`, `challenges-client.ts`

**Prisma models:**
- `ScorePrediction` — userId, fixtureId, predictedHomeScore, predictedAwayScore, pointsAwarded, status (PENDING/LOCKED/WON/LOST/SETTLED/VOID)
- `PredictionPointsLedger` — userId, fixtureId, points, description
- `PeerChallenge` — challengerId, challengeeId, fixtureId, status (PENDING/ACCEPTED/DECLINED/CANCELLED/SETTLED), Fan Value wager
- Migrations: `20260609073452_add_predictions`, `20260609190000_add_prediction_void_status`

**How the code works:** `calculatePoints()` is a pure function in `scoring.ts` — it accepts actual and predicted scores and returns the point value. Settlement calls `calculatePoints()` for each prediction on a settled fixture, creates a `PredictionPointsLedger` entry, and updates the prediction's `pointsAwarded` and `status`. Predictions are locked when a gameweek locks (preventing new predictions or edits). The `VOID` status was added in STORY-11 for postponed/cancelled fixtures.

**Integration points:** `PredictionPointsLedger` drives the predictions leaderboard in `LeaderboardsService`. Fan Value (`FanValueLedger`) is credited when predictions settle.

---

## STORY-06 — Fantasy Team MVP

**Product purpose:** Fans can create and manage a fantasy football squad, selecting players from real teams.

**What fans can do:** Create a fantasy team for the active season. Add/remove/update players. Set a captain and vice-captain. View their team.

**Backend files:**
- `apps/api/src/fantasy/fantasy.service.ts` — core team CRUD: `createTeam()`, `getTeam()`, `updateTeam()`, `addPlayer()`, `removePlayer()`, `updatePlayerRole()`. Enforces squad constraints (max players per team, positions, captain/vice-captain uniqueness).
- `apps/api/src/fantasy/fantasy.controller.ts` — `POST/GET/PATCH /fantasy/team/me`, `POST/DELETE/PATCH /fantasy/team/me/players`
- `apps/api/src/fantasy/fantasy.service.spec.ts`

**Frontend files:**
- `apps/web/src/app/fantasy/team/` — team creation and management
- `apps/web/src/app/fantasy/player-pool/` — player browsing
- `apps/web/src/lib/fantasy-client.ts`

**Prisma models:**
- `FantasyTeam` — userId, seasonId, name, totalPoints, formation
- `FantasyTeamPlayer` — fantasyTeamId, playerId, position (STARTER/BENCH), role (NONE/CAPTAIN/VICE_CAPTAIN), benchOrder
- Migration: `20260609120000_add_fantasy`

**How the code works:** Squad validation enforces: minimum 11 starters, maximum 3 players from any one real-world team, valid formation (4-4-2, 4-3-3, etc.), exactly 1 captain, exactly 1 vice-captain. `FantasyTeamPlayer.benchOrder` (1–4) determines auto-substitution priority. The `position` field tracks whether a player is in the starting XI or on the bench.

---

## STORY-07 — Gameweek & Transfer Deadline MVP

**Product purpose:** Fantasy transfers are only allowed during open gameweek windows.

**What fans can do:** Make transfers before the gameweek deadline. View transfer status and remaining free transfers. Wildcard chip bypasses transfer costs.

**Backend files:**
- `apps/api/src/gameweeks/gameweeks.service.ts` — `GameweeksService`: `findAll()`, `findActive()`, `findById()`, `getFixtures()`, `getLockState()`, `updateStatus()`, `updateDeadlines()`
- `apps/api/src/gameweeks/gameweek-deadline.service.ts` — `GameweekDeadlineService`: `assertFantasyOpen()` — throws if the current gameweek is locked. Called by all fantasy mutation services.
- `apps/api/src/gameweeks/gameweeks.controller.ts`
- `apps/api/src/fantasy/fantasy-transfer.service.ts` — `FantasyTransferService`: `makeTransfer()`, `getTransferStatus()`, `rolloverTransfers()`. Tracks free transfers remaining and penalizes paid transfers.
- `apps/api/src/gameweeks/gameweek-deadline.service.spec.ts`, `apps/api/src/gameweeks/gameweeks.service.spec.ts`

**Frontend files:**
- `apps/web/src/app/gameweeks/` — gameweek list/detail pages
- `apps/web/src/app/fantasy/transfers/page.tsx`
- `apps/web/src/app/fantasy/deadline/page.tsx`

**Prisma models:**
- `Gameweek` — seasonId, number, name, status (UPCOMING/OPEN/LOCKED/LIVE/COMPLETED), deadlineAt, startDate, endDate
- `FantasyTransfer` — fantasyTeamId, gameweekId, playerInId, playerOutId, isFree
- Migration: `20260609140000_add_gameweeks`, `20260609130000_add_fantasy_formation_transfers`

**How the code works:** `assertFantasyOpen()` checks the current active `Gameweek` status. If it is `LOCKED`, `LIVE`, or `COMPLETED`, it throws a `BadRequestException` with a `lockReason` explaining why. This guard is called at the top of all fantasy mutation methods (add player, remove player, make transfer, activate chip). The admin can override lock state via `PATCH /admin/gameweeks/:id/status`.

---

## Competition Format Hardening Pass

**Purpose:** Reinforce competition format data with stages, groups, and tournament bracket support.

**What changed:** Added `Stage`, `Group`, `GroupMembership` models. Added `stageId`, `groupId` to `Fixture`. Seed updated to populate all 7 WC 2026 stages and 12 groups.

**Prisma models:** `Stage`, `Group`, `GroupMembership`  
**Migration:** `20260609150000_add_competition_format_and_stages`

---

## STORY-08 — Competition & Season Management MVP

**Product purpose:** Admins can create and manage competitions and seasons.

**What admins can do:** Create competition, update competition metadata, list seasons for a competition, create season, activate season (sets others to COMPLETED).

**Backend files:**
- `apps/api/src/admin/admin-competitions.service.ts` — `AdminCompetitionsService`
- `apps/api/src/admin/admin-competitions.controller.ts` — `GET/POST /admin/competitions`, `PATCH /admin/competitions/:id`, `GET/POST /admin/competitions/:id/seasons`, `PATCH /admin/seasons/:id`, `POST /admin/seasons/:id/activate`
- `apps/api/src/admin/admin-competitions.service.spec.ts`

**Frontend files:**
- `apps/web/src/app/admin/competitions/` — competition list, detail, new pages
- `apps/web/src/app/admin/seasons/[id]/page.tsx`
- `apps/web/src/lib/admin-client.ts`

**Prisma models:** `Competition`, `Season`  
**Migration:** `20260609160000_add_competition_season_management`

**How the code works:** Season activation queries all seasons in the same competition, sets them to `COMPLETED`, then sets the target season to `ACTIVE` — all in a Prisma transaction. This ensures only one season is active per competition at any time.

---

## STORY-09 — Competition Import & Manual Seeding MVP

**Product purpose:** Admins can import competition data (teams, players, fixtures) from a structured file format or enter data manually.

**What admins can do:** Validate an import payload, commit validated imports, retry/cancel failed import jobs. Or manually enter competitions, seasons, teams, players, venues, and fixtures one by one.

**Backend files:**
- `apps/api/src/admin/competition-import.service.ts` — `CompetitionImportService`: `validate()`, `commit()`, `findAll()`, `findById()`, `retry()`, `cancel()`, manual entry methods
- `apps/api/src/admin/admin-imports.controller.ts` — `POST /admin/imports/validate`, `/commit`, `/manual`, `GET /admin/imports`, `GET /admin/imports/:id`, retry/cancel. And manual sub-routes: `/admin/imports/manual/competition|season|team|player|venue|fixture`
- `apps/api/src/admin/competition-import.service.spec.ts`

**Frontend files:**
- `apps/web/src/app/admin/imports/` — import list, new, detail, preview, manual pages
- `apps/web/src/lib/admin-imports-client.ts`

**Prisma models:**
- `CompetitionImportJob` — status, payload, errorLog, retryCount
- `ImportJobItem` — individual records within an import job
- Migration: `20260609170000_add_competition_import_jobs`

**How the code works:** The import pipeline is two-step: `validate()` parses the payload, checks for conflicts (duplicate slugs, missing team references), and creates a `CompetitionImportJob` with `status: PENDING_REVIEW`. `commit()` takes a validated job and upserts all entities (competitions, seasons, teams, players, fixtures) in one transaction. If any step fails, the job status is set to `FAILED` with an error log.

---

## STORY-10 — Fixture & Gameweek Assignment MVP

**Product purpose:** Admins can assign fixtures to gameweeks and tournament stages.

**What admins can do:** View unassigned fixtures, bulk-assign fixtures to a gameweek or stage, auto-assign based on kickoff date ranges, view assignment summary.

**Backend files:**
- `apps/api/src/admin/fixture-assignment.service.ts` — `FixtureAssignmentService`: `getUnassigned()`, `bulkAssignGameweek()`, `bulkAssignStage()`, `autoAssign()`, `getSummary()`, `assignGameweek()`, `assignStage()`
- `apps/api/src/admin/admin-fixture-assignment.controller.ts`
- `apps/api/src/admin/fixture-assignment.service.spec.ts`

**Frontend files:**
- `apps/web/src/app/admin/fixtures/` — unassigned, assignments, summary pages
- `apps/web/src/lib/admin-fixtures-client.ts`

**Prisma models:** `Fixture` got `gameweekId`, `stageId`, `assignmentStatus` fields  
**Migration:** `20260609180000_add_fixture_assignment_status`

**How the code works:** `autoAssign()` fetches all unassigned fixtures, groups them by kickoff date range against gameweek windows, and bulk-updates `gameweekId` and `stageId`. `bulkAssignGameweek()` takes an array of fixtureIds and a gameweekId, validates the gameweek exists, and does a batch `updateMany`.

---

## STORY-11 — Prediction Engine: Lock & Settle MVP

**Product purpose:** Predictions are locked before kickoff and settled after the final whistle.

**What admins can do:** Lock a fixture's predictions (prevents new predictions/edits). Settle a fixture (calculates and awards points). Void a fixture (cancels predictions without point penalty).

**Backend files:**
- Extensions to `PredictionsService` — `lockFixture()`, `settleFixture()`, `voidFixture()`, `lockGameweek()`, `settleGameweek()`
- `scoring.ts` — `calculatePoints()` function: 10 (exact), 5 (correct goal diff), 3 (correct result), 0 (miss)
- Admin routes in `PredictionsController`

**Prisma models:**
- `PredictionStatus` enum gained `VOID` value
- `PredictionPointsLedger` — created at settlement, drives leaderboard
- Migration: `20260609190000_add_prediction_void_status`

**How the code works:** Settlement iterates all `LOCKED` predictions for a fixture. For each, `calculatePoints()` is called with the actual final score and the predicted score. A `PredictionPointsLedger` record is inserted, the prediction's `pointsAwarded` is updated, and status changes to `WON`, `LOST`, or `VOID`. `voidFixture()` sets all predictions to `VOID` (no points, no penalty). `lockGameweek()` locks all fixtures in a gameweek at once via `settleGameweek()`.

---

## STORY-12 — Fantasy Deadlines & Transfer Rules MVP

**Product purpose:** Fantasy has strict transfer rules enforced by the deadline service.

**What fans can do:** Make free transfers before the deadline. Pay a point penalty for extra transfers. See transfer cost summary before confirming.

**Backend files:**
- `apps/api/src/fantasy/fantasy-deadline.service.ts` — `FantasyDeadlineService`: wraps `GameweekDeadlineService.assertFantasyOpen()` with a `lockReason` field for detailed error messages
- Extensions to `FantasyTransferService` — free transfer tracking, penalty calculation, rollover logic

**Frontend files:**
- `apps/web/src/app/fantasy/transfers/page.tsx` — transfer deadline and status UI

**Prisma models:** `Gameweek.lockReason` field added  
**Migration:** (included in fantasy rules engine migration)

**How the code works:** Each gameweek has `freeTransfersRemaining` tracked per fantasy team. When a fan makes a transfer: if `freeTransfersRemaining > 0`, it is free; otherwise, a configurable point deduction applies. `rolloverTransfers()` (called when a gameweek completes) carries over unused free transfers up to a configured maximum (typically 2 banked max). `assertFantasyOpen()` is called at the start of every mutation and throws if the gameweek is locked.

---

## STORY-13 — Fantasy Chips MVP

**Product purpose:** Fans have special one-time chips that modify fantasy rules for a gameweek.

**What fans can do:** View available chips, activate a chip for the current gameweek, cancel an active chip. Chips: Wildcard (free unlimited transfers), Free Hit (one-gameweek free squad change), Triple Captain (3x captain points), Bench Boost (bench players score points).

**Backend files:**
- `apps/api/src/fantasy/fantasy-chip.service.ts` — `FantasyChipService`: `getChips()`, `activateChip()`, `cancelChip()`. Enforces one chip per gameweek, one use per chip type per season.
- Routes in `FantasyController` — `GET /fantasy/chips`, `POST /fantasy/chips/:chipId/activate`, `POST /fantasy/chips/:chipId/cancel`

**Frontend files:**
- `apps/web/src/app/fantasy/chips/page.tsx`

**Prisma models:**
- `FantasyChip` — fantasyTeamId, chipType (WILDCARD/FREE_HIT/TRIPLE_CAPTAIN/BENCH_BOOST), status (AVAILABLE/ACTIVE/USED), gameweekId
- Migration: `20260609130000_add_fantasy_formation_transfers`

**How the code works:** Each fantasy team starts with 4 chips (one per type), all `AVAILABLE`. `activateChip()` validates: chip is `AVAILABLE`, no other chip is `ACTIVE` for this gameweek, gameweek is open. Sets chip to `ACTIVE` and `gameweekId`. `cancelChip()` resets to `AVAILABLE` (only while gameweek is still open). When a gameweek is scored, `ACTIVE` chips become `USED`. Wildcard bypasses `assertFantasyOpen()` transfer limit check.

---

## STORY-14 — Fantasy Rules Admin Configuration MVP

**Product purpose:** Admins can configure fantasy league parameters without code changes.

**What admins can do:** Create/update a `FantasyRulesConfig` for a season. Set budget, squad size, formation, transfer limits, and scoring weights. All fantasy services read from this config.

**Backend files:**
- `apps/api/src/fantasy/fantasy-rules-config.service.ts` — `FantasyRulesConfigService`: `get()`, `upsert()`. All other fantasy services call `getRulesConfig()` to get the current config for the active season.
- `apps/api/src/fantasy/fantasy-rules-engine.spec.ts` — tests that services respect config values
- Admin routes in `FantasyController` — config CRUD

**Frontend files:**
- `apps/web/src/app/admin/fantasy/rules/page.tsx`
- `apps/web/src/lib/fantasy-rules-client.ts`

**Prisma models:**
- `FantasyRulesConfig` — seasonId (unique), squadSize, startingXiSize, transferBudgetFv, freeTransfersPerGameweek, transferDeadlineHours, maxPlayersPerTeam, defaultFormation, scoringWeights (JSON), captainMultiplier, viceCaptainMultiplier
- Migration: `20260610000001_add_fantasy_rules_config`

**How the code works:** `FantasyRulesConfigService.get()` fetches the `FantasyRulesConfig` for the active season. If none exists, it returns sensible defaults. Every fantasy service that enforces rules (squad size, budget, transfers, scoring multipliers) calls `get()` before applying logic. This means rules can be changed at any time by updating the config — no code deployment needed.

---

## STORY-15 — Fantasy Leagues & Cups MVP

**Product purpose:** Fans can compete in private, public, and global leagues.

**What fans can do:** View their leagues. Create a private league (invite by code). Join a public league. Automatically participate in the global league. View league standings. Leave a league.

**Backend files:**
- `apps/api/src/fantasy/fantasy-league.service.ts` — `FantasyLeagueService`: `getMyLeagues()`, `createPrivate()`, `joinByCode()`, `joinPublic()`, `getLeague()`, `getStandings()`, `leave()`
- `apps/api/src/fantasy/fantasy-cup.service.ts` — `FantasyCupService`: mini-cups between fans
- Routes in `FantasyController`

**Frontend files:**
- `apps/web/src/app/fantasy/leagues/` — list, create, join, detail pages
- `apps/web/src/app/fantasy/cups/page.tsx`

**Prisma models:**
- `FantasyLeague` — seasonId, name, type (PRIVATE/PUBLIC/GLOBAL), inviteCode, createdByUserId
- `FantasyLeagueMembership` — leagueId, fantasyTeamId, rank, totalPoints
- Migration: `20260610000002_fantasy_leagues_v2`

**How the code works:** Global leagues are created automatically per season. `joinByCode()` looks up `FantasyLeague` by `inviteCode`, validates the season matches, and creates a `FantasyLeagueMembership`. Standings are calculated by summing `FantasyGameweekScore.points` for each team in the league, ordered by total points (tie-breaker: fewer transfers made). `leave()` deletes the membership record.

---

## STORY-16 — Gameweek-level Fantasy Scoring & History MVP

**Product purpose:** Each gameweek produces a score for every fantasy team based on player performance.

**What fans can do:** View their gameweek score breakdown. View scoring history across all gameweeks. View highest-scoring players.

**Backend files:**
- `apps/api/src/fantasy/fantasy-gameweek-scoring.service.ts` — `FantasyGameweekScoringService`: `settleGameweek()`, `recalculate()`, `getScore()`, `getHistory()`. Reads `MatchStats` and `FantasyTeamPlayer` to compute points.
- `apps/api/src/fantasy/fantasy-scoring.service.ts` — `FantasyScoringService`: `calculatePlayerPoints()` — applies scoring weights from `FantasyRulesConfig` to raw player stats.
- Admin routes in `FantasyController`

**Frontend files:**
- `apps/web/src/app/fantasy/history/` — history list and gameweek detail
- `apps/web/src/app/fantasy/leaderboard/page.tsx`

**Prisma models:**
- `FantasyGameweekScore` — fantasyTeamId, gameweekId, points, rank, captainPoints, autosub details
- `FanValueLedger` entries are created at scoring time for fantasy points
- Migration: `20260610000004_fantasy_gameweek_scoring`

**Seed fix:** `MatchStats` records required a valid `fixtureId` FK — the seed script was updated to create `MatchStats` after fixtures are created.

**How the code works:** `settleGameweek()` fetches all fantasy teams for the season, fetches `MatchStats` for all fixtures in the gameweek, and for each team: iterates starting XI, calls `calculatePlayerPoints()` per player, applies captain multiplier (2x or 3x if Triple Captain chip active), applies Bench Boost if active, creates `FantasyGameweekScore`. League standings are updated after scoring.

---

## STORY-17 — Live Match Dashboard & Real-time Score Updates MVP

**Product purpose:** Admins get a real-time operational view of in-progress matches. Fans see live score and event feeds.

**What admins/fans can do:** View live match state, current score, goal/card/sub timeline, player stats, live fantasy points preview. Admin can push score updates, add events, update live state.

**Backend files:**
- `apps/api/src/football/live-match.service.ts` — 16 methods: `getLiveDashboard()`, `getLiveState()`, `getTimeline()`, `getPlayerStats()`, `getLiveFantasyPreview()`, `updateScore()`, `addEvent()`, `updateLiveState()`, `getLineups()`, `getFixtureAvailability()`, etc.
- `apps/api/src/football/live-match-provider.interface.ts` — adapter interface for sports data providers
- `apps/api/src/football/live-match.service.spec.ts`

**Frontend files:**
- `apps/web/src/app/admin/football/live/page.tsx`
- `apps/web/src/app/admin/football/fixtures/[fixtureId]/live/page.tsx`
- `apps/web/src/app/football/match-centre/[fixtureId]/page.tsx`
- `apps/web/src/lib/admin-football-client.ts`

**Prisma models:** `MatchState`, `MatchEvent`, `LineupEntry`, `MatchStats` (from football core)  
**Migration:** `20260610000005_live_match_dashboard`

**How the code works:** The `LiveMatchProviderInterface` abstracts the data source. In Sprint 1, the API calls are admin-driven (PATCH/POST endpoints). In Sprint 2+, a real provider adapter can be plugged in via dependency injection, replacing the stub without changing any controller or service signature. Live fantasy preview is computed on-the-fly — it reads current team selections and applies provisional points from current `MatchStats`. This is read-only and doesn't write `FantasyGameweekScore`.

---

## STORY-18 — Fantasy Auto-Substitution MVP

**Product purpose:** If a starter doesn't play, a bench player is automatically substituted in.

**What fans see:** Bench players are automatically moved to the starting XI if their corresponding starter has 0 minutes played.

**Backend files:**
- `apps/api/src/fantasy/fantasy-auto-sub.service.ts` — `FantasyAutoSubService`: `processAutoSubs()` — iterates all fantasy teams for a gameweek, checks for non-playing starters, substitutes highest-priority eligible bench player, creates `FantasyAutoSubstitution` record.
- Admin route: `POST /fantasy/admin/gameweeks/:gameweekId/process-auto-subs`
- `apps/api/src/fantasy/fantasy-auto-sub.service.spec.ts`

**Frontend files:**
- `apps/web/src/app/admin/fantasy/auto-subs/page.tsx`
- `apps/web/src/app/fantasy/team/page.tsx` — shows applied auto-subs

**Prisma models:**
- `FantasyAutoSubstitution` — fantasyTeamId, gameweekId, playerOutId, playerInId, status (APPLIED/SKIPPED_NO_ELIGIBLE_SUB/SKIPPED_LINEUP_FULL/SKIPPED_FORMATION_INVALID/SKIPPED_PLAYER_PLAYED)
- Migration: `20260610000006_fantasy_auto_substitution`

**How the code works:** `processAutoSubs()` checks `MatchStats.minutesPlayed` for each starter. If `minutesPlayed === 0` (did not play), it looks for the bench player with the lowest `benchOrder` who: (a) played some minutes, (b) doesn't violate formation constraints. Valid auto-subs create an `APPLIED` record. If no eligible sub exists, a `SKIPPED_*` record explains why. These records are displayed in the team view so fans understand what happened.

---

## STORY-19 — Fan Value Ledger MVP

**Product purpose:** Every platform action earns Fan Value (FV) — a non-financial engagement currency.

**What fans can do:** View their FV balance and ledger. See FV earned by type (prediction, fantasy, achievement). See FV earned by source (fixture, gameweek). View history by season or gameweek.

**Backend files:**
- `apps/api/src/fan-value/fan-value-ledger.service.ts` — `FanValueLedgerService`: `getSummary()`, `getLedger()`, `getByType()`, `getBySource()`, `createEntry()`, `voidEntry()`, `postSponsorEngagementReady()`
- `apps/api/src/fan-value/fan-value.controller.ts` — fan + admin routes
- `apps/api/src/fan-value/fan-value-ledger.service.spec.ts`

**Frontend files:**
- `apps/web/src/app/fan-value/` — summary, ledger, by-type, by-source pages
- `apps/web/src/app/admin/fan-value/` — admin summary and post-entry pages
- `apps/web/src/lib/fan-value-client.ts`

**Prisma models:**
- `FanValueLedger` — userId, amount, entryType (PREDICTION/FANTASY/ACHIEVEMENT/CHALLENGE/ADMIN/BONUS/VOID), source (fixture/gameweek reference), description, seasonId, gameweekId
- Enums: `FanValueEntryType`, `FanValueSource`, `FanValueTransactionType`
- Migration: `20260610000007_fan_value_ledger_v2`

**How the code works:** `FanValueLedger` is append-only (ledger pattern). `createEntry()` creates a positive record. `voidEntry()` creates a negative offsetting record (never deletes). `getSummary()` aggregates `SUM(amount)` grouped by entry type. `FanProfile.fanValueTotal` is a denormalized total kept in sync via service calls. Fan Value has no exchange rate, no fiat value, and no redemption in Sprint 1.

**Integration points:** `PredictionsService.settleFixture()` calls `FanValueLedgerService.createEntry()` for prediction points. `FantasyGameweekScoringService.settleGameweek()` calls it for fantasy points. `AchievementsService.awardAchievement()` calls it for achievement points.

---

## STORY-20 — Achievements & Badges MVP

**Product purpose:** Fans earn achievements and badges for platform milestones.

**What fans can do:** View earned achievements and badges. See progress toward definitions. Unlock achievements by meeting criteria.

**Backend files:**
- `apps/api/src/achievements/achievements.service.ts` — `AchievementsService`: `getFanAchievements()`, `getSummary()`, `getProgress()`, `getBadges()`, `evaluateForUser()`, `awardAchievement()`, `revokeAchievement()`, admin CRUD for definitions/badges
- `apps/api/src/achievements/achievements.controller.ts`
- `apps/api/src/achievements/achievements.service.spec.ts`

**Frontend files:**
- `apps/web/src/app/achievements/` — fan pages (list, badges, progress)
- `apps/web/src/app/admin/achievements/` — admin pages (definitions, badges, user achievements)
- `apps/web/src/lib/achievements-client.ts`

**Prisma models:**
- `AchievementDefinition` — name, description, criteria (JSON), pointsValue, triggerType (PREDICTION/FANTASY/CHALLENGE/STREAK/MANUAL/MILESTONE/SEASONAL/SOCIAL)
- `Badge` — name, description, iconUrl, rarity (COMMON/UNCOMMON/RARE/EPIC/LEGENDARY), achievementDefinitionId
- `FanAchievement` — fanId, achievementDefinitionId, awardedAt
- `FanBadge` — fanId, badgeId, awardedAt
- Enums: `AchievementTriggerType`, `BadgeRarity`
- Migration: `20260610000008_achievements_badges`

**Seed data:** 17 achievement definitions seeded (First Prediction, 5-Prediction Streak, Exact Score, Fantasy Team Created, First Transfer, Wildcard Used, League Creator, etc.) with corresponding badges.

**How the code works:** `evaluateForUser()` queries the fan's activity (prediction count, exact score count, streak data, fantasy actions) against `AchievementDefinition.criteria` (stored as JSON). Matching achievements trigger `awardAchievement()`, which creates `FanAchievement` and `FanBadge` records and calls `FanValueLedgerService.createEntry()` for the point value. Admin can manually award or revoke achievements.

**Integration points:** `PredictionsService`, `ChallengesService`, and `FantasyService` each call `AchievementsService.evaluateForUser()` after relevant actions to trigger real-time achievement unlocks.

---

## STORY-21 — Rewards Readiness MVP

**Product purpose:** Fans are evaluated for sponsor reward eligibility based on their platform activity.

**What fans can do:** View their reward eligibility status. See which rewards they qualify for (ELIGIBLE) and which they don't yet meet (INELIGIBLE). Request re-evaluation.

**Backend files:**
- `apps/api/src/rewards/rewards-readiness.service.ts` — `RewardsReadinessService`: `getMyReadiness()`, `getEligible()`, `getLocked()`, `evaluate()`, `getDefinitions()`, admin: CRUD definitions, `evaluateAll()`, `evaluateForUser()`
- `apps/api/src/rewards/rewards-readiness.controller.ts`
- `apps/api/src/rewards/rewards-readiness.service.spec.ts`

**Frontend files:**
- `apps/web/src/app/rewards/` — fan pages (overview, eligible, locked)
- `apps/web/src/app/admin/rewards/` — admin pages (definitions, overview)
- `apps/web/src/lib/rewards-client.ts`

**Prisma models:**
- `RewardReadinessDefinition` — name, criteria (JSON), fanValueThreshold, predictionCountThreshold, fantasyTeamRequired, achievementsRequired (string[])
- `FanRewardReadiness` — fanId, definitionId, status (ELIGIBLE/INELIGIBLE/PENDING_EVALUATION), evaluatedAt, eligibilityMetadata (JSON)
- Enum: `RewardReadinessStatus`
- Migration: `20260611000001_rewards_readiness`

**Seed data:** 6 reward readiness definitions (Bronze Fan, Silver Predictor, Gold Fantasy Player, Prediction Ace, Fantasy Champion, Social Star).

**How the code works:** `evaluateForUser()` loads all `RewardReadinessDefinition` records and the fan's current stats (Fan Value total, prediction count, fantasy team existence, achievement list). For each definition, it checks if the fan meets all thresholds. Creates or updates `FanRewardReadiness` records. This is an eligibility system only — there is no redemption workflow in Sprint 1. Rewards are non-financial; the actual reward (discount code, merchandise) is fulfilled externally by the sponsor.

---

## STORY-22 — Notifications & Alerts MVP

**Product purpose:** Fans receive in-app notifications for platform events (predictions settled, fantasy scored, achievements unlocked, etc.).

**What fans can do:** View notification inbox. Mark individual or all as read. Archive notifications. Set notification preferences (opt in/out per category). View unread count.

**Backend files:**
- `apps/api/src/notifications/notifications.service.ts` — `NotificationsService`: `getForUser()`, `getById()`, `markRead()`, `markAllRead()`, `archive()`, `getPreferences()`, `updatePreferences()`, `getUnreadCount()`, `send()`, `broadcast()`, admin: `sendFantasyDeadlineAlert()`, `sendLiveMatchAlert()`
- `apps/api/src/notifications/notifications.controller.ts`
- `apps/api/src/notifications/notifications.service.spec.ts`

**Frontend files:**
- `apps/web/src/app/notifications/` — fan inbox, detail, preferences pages
- `apps/web/src/app/admin/notifications/` — admin send, broadcast pages
- `apps/web/src/lib/notifications-client.ts`

**Prisma models:**
- `Notification` — userId, type (PREDICTION_SETTLED/FANTASY_SCORED/ACHIEVEMENT_UNLOCKED/REWARD_ELIGIBLE/LEAGUE_UPDATE/MATCH_ALERT/SYSTEM), title, body, isRead, isArchived, metadata (JSON)
- `NotificationPreference` — userId, type, enabled
- `NotificationDeliveryLog` — notificationId, channel (IN_APP), status (DELIVERED/FAILED/PENDING), attemptedAt
- Enums: `NotificationType`, `NotificationDeliveryChannel`, `NotificationDeliveryStatus`
- Migration: `20260611000002_notifications`

**How the code works:** `send()` creates a `Notification` record and a `NotificationDeliveryLog` record. In Sprint 1, delivery is in-app only (no email, SMS, or push). The `NotificationDeliveryChannel` enum is ready for email/push additions. Preferences are checked before sending — if a fan has opted out of a notification type, the send is skipped. Admin broadcast creates notifications for all fans with `FAN` role.

**Integration points:** `PredictionsService.settleFixture()`, `FantasyGameweekScoringService.settleGameweek()`, `AchievementsService.awardAchievement()`, `RewardsReadinessService.evaluate()`, and `ActivityFeedService` each call `NotificationsService.send()` for relevant events.

---

## STORY-23 — Social Activity Feed MVP

**Product purpose:** Fans see a social feed of platform activity — predictions made, challenges accepted, achievements unlocked, fantasy milestones, and match highlights.

**What fans can do:** Browse global activity feed. View own activity feed. React to activity items (LIKE, FIRE, SHOCK, etc.). Hide own items. View item detail.

**Backend files:**
- `apps/api/src/activity-feed/activity-feed.service.ts` — `ActivityFeedService`: 22 methods including `getGlobalFeed()`, `getUserFeed()`, `getById()`, `addReaction()`, `removeReaction()`, `hide()`, admin: `post()`, `hide()`, `unhide()`, `getAdminFeed()`, `getStats()`
- `apps/api/src/activity-feed/activity-feed.controller.ts`
- `apps/api/src/activity-feed/activity-feed.service.spec.ts`

**Frontend files:**
- `apps/web/src/app/activity/` — fan pages (feed, my feed, item detail)
- `apps/web/src/app/admin/activity/` — admin moderation, system post, stats pages
- `apps/web/src/lib/activity-client.ts`

**Prisma models:**
- `ActivityItem` — userId, type (PREDICTION_MADE/CHALLENGE_CREATED/CHALLENGE_ACCEPTED/ACHIEVEMENT_UNLOCKED/FANTASY_TEAM_CREATED/TRANSFER_MADE/FANTASY_SCORE/MATCH_HIGHLIGHT/SYSTEM_ANNOUNCEMENT/LEAGUE_JOINED/REWARD_ELIGIBLE), status (ACTIVE/HIDDEN/ARCHIVED), content (JSON), relatedEntityId, relatedEntityType
- `ActivityReaction` — activityItemId, userId, reactionType (LIKE/FIRE/SHOCK/TROPHY/HEART)
- Enums: `ActivityItemType`, `ActivityStatus`, `ReactionType`
- Migration: `20260611000003_activity_feed`

**How the code works:** Activity items are created by other services as side effects of fan actions. `ActivityFeedService.post()` is called by `PredictionsService`, `ChallengesService`, `AchievementsService`, and `FantasyService` with the relevant `ActivityItemType` and metadata. Reactions are unique per user per item per type (upsert). Pagination uses cursor-based `take`/`skip`. Admin can hide individual items; fans can hide their own items.

---

## STORY-24 — Admin Command Centre / Admin Dashboard MVP

**Product purpose:** PSL_ADMIN gets a single operational command centre that aggregates metrics and provides quick navigation to all admin tools.

**What admins can do:** View real-time platform KPIs (users, fans, fixtures, fantasy teams, predictions, challenges, reward eligibles, activity items). See action-required alerts (locked predictions on finished fixtures, failed notification delivery, hidden activity items). Navigate to 11 operational sub-sections. Use quick links to deep admin pages.

**Backend files:**
- `apps/api/src/admin-dashboard/admin-dashboard.service.ts` — `AdminDashboardService`: 27+ methods including `getFullDashboard()`, `getOverview()`, `getPlatformHealth()` (synchronous), `getActionRequired()`, domain summaries for all 11 sections, and `_getAllSections()` (runs 19 parallel queries via `Promise.all`)
- `apps/api/src/admin-dashboard/admin-dashboard.controller.ts` — class-level `@Roles('PSL_ADMIN')`, 27 GET routes
- `apps/api/src/admin-dashboard/admin-dashboard.module.ts`
- `apps/api/src/admin-dashboard/admin-dashboard.service.spec.ts` — 56 tests
- `apps/api/src/admin-dashboard/admin-dashboard.controller.spec.ts` — 21 tests

**Frontend files (13 pages):**
- `apps/web/src/app/admin/page.tsx` — redirect to dashboard
- `apps/web/src/app/admin/dashboard/page.tsx` — main command centre
- `apps/web/src/app/admin/dashboard/guess-the-score/page.tsx`
- `apps/web/src/app/admin/dashboard/fantasy-rules/page.tsx`
- `apps/web/src/app/admin/dashboard/fantasy-league/page.tsx`
- `apps/web/src/app/admin/dashboard/league-management/page.tsx`
- `apps/web/src/app/admin/dashboard/fixture-management/page.tsx`
- `apps/web/src/app/admin/dashboard/sponsor-management/page.tsx`
- `apps/web/src/app/admin/dashboard/content-moderation/page.tsx`
- `apps/web/src/app/admin/dashboard/reporting/page.tsx`
- `apps/web/src/app/admin/dashboard/compliance/page.tsx`
- `apps/web/src/app/admin/dashboard/user-audience/page.tsx`
- `apps/web/src/app/admin/dashboard/system/page.tsx`
- `apps/web/src/lib/admin-dashboard-client.ts` — 22 typed API client functions

**No new Prisma models.** All queries are aggregation-only (Prisma `count()`, `groupBy()`, `aggregate()`).

**How the code works:** `getFullDashboard()` calls `_getAllSections()` which runs all 19 section queries in `Promise.all` for parallel execution. `getActionRequired()` checks for: predictions in `LOCKED` status on fixtures with `FINISHED` status (need settlement), delivery logs with `FAILED` status, hidden activity items. `getPlatformHealth()` is synchronous — returns static status object indicating local PostgreSQL only mode with no external services. Exact score count uses `pointsAwarded: 10` as a proxy (since `calculatePoints()` only returns 10 for exact scores).

---

## STORY-25 — Sprint 1 Final Handover & Beta Readiness Review

**Product purpose:** Document Sprint 1 completely for the handover to Sprint 2.

**What was produced:**
- `SPRINT-1-FINAL-HANDOVER.md` — executive handover
- `docs/platform/PLATFORM-OVERVIEW.md` — platform architecture
- `docs/platform/STORY-BY-STORY-CODE-WALKTHROUGH.md` — this document
- `docs/platform/API-ROUTE-INVENTORY.md` — all API routes
- `docs/platform/FRONTEND-ROUTE-INVENTORY.md` — all web pages
- `docs/platform/DATABASE-MIGRATION-INVENTORY.md` — all migrations
- `docs/platform/BETA-READINESS-REVIEW.md` — beta test plan
- `docs/platform/SPRINT-2-PSL-SEASON-READINESS-PLAN.md` — Sprint 2 plan
- `docs/platform/SPRINT-3-COMMERCE-PRODUCTION-PLAN.md` — Sprint 3 plan

**Final gate:** 812 API tests, 8 web tests, all clean. No new models. No AWS. No Kafka. Local PostgreSQL only.

---

## STORY-26 — PSL Club, Squad, Season & Club Experience Readiness

**Product purpose:** Deliver PSL club hub, season-specific participation, squad/player/fixture assignment readiness, club profile, shopfront catalogue, ticketing readiness, content placeholders, and admin club readiness tooling. Establishes the Premier League-style club experience foundation for the PSL Premiership.

**Schema additions (`20260611000004_club_experience`):**
- 12 new enums: `SeasonTeamStatus`, `SeasonTeamSource`, `ClubProfileStatus`, `ClubContentType`, `ClubContentStatus`, `ShopProductCategory`, `ShopProductAvailability`, `ShopProductStatus`, `ShopCommerceStatus`, `SquadRegistrationStatus`, `SquadRegistrationSource`
- 6 new models: `SeasonTeam`, `ClubProfile`, `ClubContentItem`, `ClubShopProduct`, `ClubExperienceStatus`, `SeasonSquadRegistration`
- Back-relations added to: `Season`, `Team`, `Player`

**Seed additions:**
- 14 PSL venues upserted (`PSL_MANUAL` source)
- 16 PSL clubs seeded via `psl-clubs.ts`
- `SeasonTeam` participation records for each club (status: `PROVISIONAL`)
- `ClubProfile` for each club (draft state, with colour data)
- 1 `ClubContentItem` announcement per club (published)
- 8 `ClubShopProduct` placeholder listings per club (catalogue-only, price TBC)
- `ClubExperienceStatus` for each club (initial review state)

**New service files:**
- `apps/api/src/club-experience/club-experience.service.ts` — 11 fan-facing methods
- `apps/api/src/club-experience/club-admin.service.ts` — 24 admin methods

**Fan routes (all public):** `GET /clubs`, `GET /clubs/:slug`, `GET /clubs/:slug/overview`, `/fixtures`, `/results`, `/squad`, `/stats`, `/stadium`, `/tickets`, `/shop`, `/shop/:productSlug`

**Admin routes (PSL_ADMIN only):** club list/readiness/detail/experience/shop/players/fixtures, season team CRUD, player assignment, fixture assignment, validation endpoints.

**Route ordering:** All static admin routes declared before `:slug` dynamic routes in controller to prevent NestJS slug capture.

**Commerce boundaries:** Shopfront is `CATALOGUE_ONLY`. No checkout, cart, orders, payments, fulfilment, refunds, vouchers, inventory, deposits, withdrawals, betting, or financial mechanics.

**Ticketing:** MVP stub only — no integration. `ticketingUrl` field in `ClubProfile` ready for future partner.

**Promoted/relegated flexibility:** Club participation is season-specific via `SeasonTeam`. Adding/removing clubs does not delete the club. No hardcoded 16-team assumption in service code.

**Web pages added:** 11 fan pages under `/clubs/...` and 8 admin pages under `/admin/clubs/...` + `/admin/seasons/[id]/clubs`.

**Test gate:** 883 API tests passing (71 new), 8 web tests passing. Typecheck clean. Seed passes. API and web build clean.

**Seeding note:** WC2026 integration test updated to filter by `source: 'fifa-wc2026'` to exclude PSL clubs from the 48-team count.

**Module fix:** `ClubExperienceModule` imports `AuthModule` (required for `JwtAuthGuard`/`RolesGuard` to resolve `LocalJwtProvider`). This is the standard pattern across all modules that use admin guards.

**`getClubs()` filter:** Without a season slug, the method filters to `where: { clubProfile: { isNot: null } }` so only PSL clubs (which have `ClubProfile` records) are returned. WC2026 teams have no `ClubProfile` and are excluded.
