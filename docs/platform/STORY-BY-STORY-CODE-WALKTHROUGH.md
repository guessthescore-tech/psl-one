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

---

## STORY-27 — PSL Fixture Import, Validation & Publishing Workflow

**Product purpose:** Deliver an admin-controlled workflow to stage, validate, and safely publish PSL fixture data without risking World Cup beta fixture visibility or fan data integrity. Fixtures remain invisible to fans until explicitly published after validation.

**Schema additions (`20260611000005_fixture_import`):**
- `Fixture.isPublished Boolean @default(true)` — all existing WC2026 fixtures remain fan-visible; new PSL import-created fixtures default to `false`
- 3 new enums: `FixtureImportBatchStatus` (DRAFT → VALIDATING → VALIDATED/FAILED_VALIDATION → COMMITTED → PUBLISHED/REJECTED), `FixtureImportRowStatus` (PENDING/VALID/WARNING/ERROR/COMMITTED/SKIPPED), `FixtureImportSource` (MANUAL/CSV_UPLOAD/PROVIDER_API)
- `FixtureImportBatch` model — staging container, tracks row counts and lifecycle timestamps
- `FixtureImportRow` model — one row per fixture; stores raw input fields, resolved team/venue/gameweek IDs, and validation errors/warnings as JSONB
- Back-relation `Season.fixtureImportBatches` and `Fixture.importRows` added

**`isPublished` fan-facing protection:**
- `FootballService.listFixtures()` filters `isPublished: true`
- `ClubExperienceService.getClubFixtures()` and `getClubResults()` filter `isPublished: true`
- Existing WC2026 fixtures have `isPublished = true` by migration default — no fan-visible change

**New service: `FixtureImportService` (22 methods):**
- Batch CRUD: `listBatches`, `createBatch`, `getBatch`, `deleteBatch`, `getBatchRows`, `getBatchSummary`
- Row CRUD: `addRow`, `updateRow`, `deleteRow` — with auto-resolution of team/venue by name/slug/shortName
- Validation pipeline: `validateBatch` — row-level ERROR/WARNING/INFO items; detects missing teams, invalid kickoff dates, team equality, season participation, season date window, venue/gameweek warnings, duplicate rows within batch, duplicate vs existing DB fixtures
- Conflict detection: `getSeasonFixtureConflicts` — DUPLICATE_FIXTURE (same home/away on same date), TEAM_SCHEDULE_OVERLAP (within 2 hours), VENUE_OVERLAP (same venue, same kickoff)
- Commit: `commitBatch` — creates fixtures with `isPublished: false`, idempotent (skips exact duplicates already in DB)
- Publish: `publishBatch` — sets `isPublished: true`, blocks if fixture has predictions/fantasy/events attached
- Season tools: `getSeasonFixtureValidation`, `getGameweekReadiness`, `autoCreateGameweeks` (groups fixtures by round, creates gameweeks with deadlines 1h before earliest kickoff), `assignFixturesByRound`
- Publishing readiness: `getPublishingReadiness`, `publishProvisionalFixtures`, `unpublishProvisionalFixtures` (only safe fixtures with no fan data)
- Reject: `rejectBatch`

**Controller (`@Controller('fixtures/admin')` — PSL_ADMIN only, 21 routes):**
- Route family `fixtures/admin` chosen to avoid collision with existing `admin/fixtures` (AdminFixtureAssignmentController)
- Static season-level routes (`validation/season/:id`, `conflicts/season/:id`, `gameweeks/season/:id/...`, `publishing/season/:id/...`) declared before parameterised `:batchId` routes

**Validation rules (ERROR blocks commit, WARNING allows commit with review):**
- ERROR: missing homeTeam, missing awayTeam, home == away, invalid kickoff date, team not in season, unresolved team name, duplicate row in batch
- WARNING: team participation not ACTIVE, kickoff outside season window, venue not specified, gameweek not assigned, gameweek deadline after kickoff, duplicate vs existing DB fixture

**Commit is idempotent:** If exact duplicate (home+away+kickoff+season) already exists in DB, row is marked COMMITTED with the existing fixture ID and counted as `skipped`.

**Provider-neutral design:** `FixtureImportSource` enum supports MANUAL, CSV_UPLOAD, PROVIDER_API. No vendor-specific parsing. Team resolution by name, slug, shortName, or externalId.

**Commerce boundaries:** No checkout, cart, orders, payments, fulfilment, refunds, vouchers, inventory reservation, deposits, withdrawals, fiat, crypto, betting, odds, stakes, payouts, or wagers. Import workflow is fixture data only.

**Web pages added (10 admin pages):**
- `/admin/fixtures/imports` — batch list with status pipeline
- `/admin/fixtures/imports/new` — create batch form
- `/admin/fixtures/imports/[batchId]` — batch detail with lifecycle action buttons
- `/admin/fixtures/imports/[batchId]/rows` — row table with inline add form
- `/admin/fixtures/imports/[batchId]/validation` — auto-runs validation on load, row-by-row error/warning breakdown
- `/admin/fixtures/imports/[batchId]/publish` — publish confirmation with pre-publish checklist
- `/admin/fixtures/validation` — season-level fixture data quality check
- `/admin/fixtures/conflicts` — conflict scanner (DUPLICATE/OVERLAP/VENUE)
- `/admin/fixtures/gameweeks` — gameweek readiness + auto-create from rounds
- `/admin/fixtures/publishing` — season-level publish/unpublish all

**Web client:** `apps/web/src/lib/fixture-import-client.ts` — 21 typed fetch wrappers matching controller routes

**Test gate:** 922 API tests passing (110 new in `fixture-import.service.spec.ts`), 8 web tests passing. Typecheck clean. API and web build clean. Seed passes. Schema validates.

**TypeScript fixes applied:** `exactOptionalPropertyTypes: true` required: `where` spread instead of `where: undefined`; optional string fields mapped to `null`; Prisma nullable JSON cleared via `Prisma.JsonNull` not `null`.

---

## STORY-28 — Competition Switching: World Cup Beta to PSL Season Mode

**Goal:** Build a controlled admin-only season activation workflow. The platform can switch from World Cup beta mode to PSL season mode without losing any historical data. World Cup fixtures, predictions, fantasy teams, and fan data are preserved as historical records.

**Core rule:** The platform does not automatically activate the PSL season. Admin must explicitly activate via the switching workflow after readiness checks pass or warnings are acknowledged.

### Data model

**Migration:** `20260611000006_season_switch_audit`

New enums and model in `apps/api/prisma/schema.prisma`:

```prisma
enum SeasonSwitchAction { PREVIEW ACTIVATE COMPLETE ROLLBACK }
enum SeasonSwitchStatus  { SUCCESS BLOCKED FAILED }

model SeasonSwitchAudit {
  id                String             @id @default(uuid())
  fromSeasonId      String?            @map("from_season_id")
  toSeasonId        String             @map("to_season_id")
  action            SeasonSwitchAction
  status            SeasonSwitchStatus
  performedByUserId String?            @map("performed_by_user_id")
  blockersJson      Json?              @map("blockers_json")
  warningsJson      Json?              @map("warnings_json")
  summaryJson       Json?              @map("summary_json")
  createdAt         DateTime           @default(now()) @map("created_at")
  @@index([toSeasonId])
  @@index([createdAt(sort: Desc)])
  @@map("season_switch_audits")
}
```

### SeasonSwitchingService (`apps/api/src/season-switching/season-switching.service.ts`)

7 cross-domain readiness checks:
1. **Season teams** (BLOCKER): ≥2 teams must be registered
2. **Fixtures loaded** (WARNING): ≥1 fixture present
3. **Fixtures published** (WARNING): ≥1 published fixture
4. **Gameweeks** (WARNING): ≥1 gameweek defined
5. **Fantasy rules config** (WARNING): `FantasyRulesConfig` exists
6. **Player prices** (WARNING): ≥11 `FantasyPlayerPrice` rows
7. **Club profiles** (INFO): all season teams have club profiles

`activationStatus`:
- `READY` — no blockers or warnings
- `READY_WITH_WARNINGS` — no blockers, at least one warning; requires `acknowledgeWarnings: true` to activate
- `BLOCKED` — ≥1 blocker; creates `BLOCKED` audit; throws 400

Activation flow (transactional):
1. Check readiness; reject if BLOCKED or unacknowledged warnings
2. `$transaction`: set all active seasons `isActive: false`; set target `isActive: true, status: ACTIVE`
3. Write `SeasonSwitchAudit` with `ACTIVATE` + `SUCCESS`
4. Rollback available: deactivates current active, restores `fromSeasonId` from most recent activation audit

`getSeasonSwitchPreview()` writes a `PREVIEW` audit record so every admin inspection is logged.

### SeasonSwitchingController (`apps/api/src/season-switching/season-switching.controller.ts`)

`@Controller('seasons/admin')` — distinct from existing `@Controller('admin/seasons')` (AdminCompetitionsController).

All routes require `JwtAuthGuard` + `RolesGuard` + `@Roles('PSL_ADMIN')`.

Static routes declared before dynamic `:seasonId` routes.

### FootballController / FootballService additions

- `GET /football/context` — returns `{ activeSeason, upcomingSeasons }` for fan default context
- `GET /football/seasons/:slug` — returns historical season by slug (World Cup accessible as `fifa-world-cup-2026`)

### Seed fix (`apps/api/prisma/seed.ts`)

Added `fixtureImportRow.deleteMany()`, `fixtureImportBatch.deleteMany()`, and `seasonSwitchAudit.deleteMany()` before `season.deleteMany()` to resolve FK constraint P2003.

### Web client (`apps/web/src/lib/season-context-client.ts`)

8 typed API wrappers: `getActiveSeasonContext`, `getActiveSeason`, `getSeasonBySlug`, `getAdminSeasonContext`, `getSwitchReadiness`, `getSwitchPreview`, `activateSeason`, `completeSeason`, `rollbackSeason`, `getSwitchHistory`.

### Admin web pages (5)

- `/admin/seasons/context` — active season card, all seasons table, last switch metadata
- `/admin/seasons/switching` — list inactive seasons, recent switch history
- `/admin/seasons/switching/[seasonId]` — season detail + per-season audit history
- `/admin/seasons/switching/[seasonId]/readiness` — 7-check readiness dashboard with BLOCKER/WARNING/INFO badges
- `/admin/seasons/switching/[seasonId]/preview` — activation preview with cross-domain impact, warning acknowledgement, activate button

**Test gate:** 954 API tests passing (32 new in `season-switching.service.spec.ts`). Typecheck clean. API and web build clean. Seed passes. Schema validates. All 9 admin routes verified locally including RBAC (FAN=403, unauth=401).

---

## STORY-29 — PSL Fantasy Season Calibration

**Goal:** Make PSL Fantasy ready enough for activation and beta testing. All values are provisional and clearly marked as such.

**Constraints respected:**
- No official PSL squad scraping or inferred private data
- No real-money mechanics, payments, betting, gambling, or commerce
- No new fantasy chips or advanced mechanics beyond existing MVP rules
- No World Cup fantasy history recalculation or deletion
- All provisional values explicitly documented as non-official

### Seed data (`apps/api/prisma/seed-data/psl-players.ts`)

96 provisional placeholder players: 6 per club × 16 PSL clubs (1 GK, 2 DEF, 2 MID, 1 FWD). Source: `PSL_PLACEHOLDER`. Named convention: `{ClubShortName} GK`, `{ClubShortName} DEF 1`, etc.

Provisional price bands (stored as integer × 10):
- GK: 50 (5.0 credits)
- DEF: 50 (5.0 credits)
- MID: 55 (5.5 credits)
- FWD: 60 (6.0 credits)

### Seed updates (`apps/api/prisma/seed.ts`)

- Added `fantasyPlayerPriceHistory.deleteMany()` + `fantasyPlayerPrice.deleteMany()` before `player.deleteMany()` (FK safety)
- Idempotent PSL player creation: `findFirst({ where: { externalId } })` + conditional `create` (NOT upsert — `Player.externalId` is non-unique in schema)
- PSL `FantasyRulesConfig` upsert: `halfwayGameweek: 15`, `seasonGameweekCount: 30`, `update: {}` (never overwrites)
- Provisional player prices: `update: {}` idempotent — existing manually-set prices preserved
- `SeasonSquadRegistration` upsert: `PROVISIONAL` status, `PLACEHOLDER` source, `update: {}`
- WC integration tests updated to filter `source: 'fifa-wc2026'` to exclude PSL placeholder players

### FantasyCalibrationService (`apps/api/src/fantasy-calibration/fantasy-calibration.service.ts`)

12 methods:
- `getCalibrationSeasons()` — all seasons with calibration metadata (hasRulesConfig, playerPriceCount, gameweekCount)
- `getCalibrationReadiness(seasonId)` — 5-check readiness: rules config, player prices, squad registrations, gameweeks, published fixtures → READY / READY_WITH_WARNINGS / BLOCKED
- `getFantasyRules(seasonId)` — returns config or null (does not throw)
- `createProvisionalRules(seasonId)` — upsert with PSL overrides (halfwayGameweek=15, seasonGameweekCount=30), never overwrites existing
- `updateFantasyRules(seasonId, dto)` — partial update, creates if not exists
- `getPlayerPriceReadiness(seasonId)` — total/priced/unpriced counts, missing by position, isReady flag
- `generateProvisionalPrices(seasonId)` — generates prices only for unpriced registered players; skips existing
- `updatePlayerPrice(seasonId, playerId, price)` — upsert + history entry with reason `ADMIN_CALIBRATION`
- `getSquadReadiness(seasonId)` — per-club eligible player counts and isReady (min 11 players, all positions covered)
- `getGameweekReadiness(seasonId)` — per-gameweek fixture linkage status (Gameweek.transferDeadlineAt is non-nullable)
- `deriveGameweekDeadlines(seasonId)` — sets deadlines to earliest published fixture kickoff − 90 minutes; skips gameweeks without fixtures
- `getActivationImpact(seasonId)` — summary: fantasyTeams, predictions, rulesConfigured, playerPricesSet, gameweeksConfigured, warnings

**Key schema notes:**
- `Gameweek.round` (not `gameweekNumber`) — field name per Prisma schema
- `Gameweek.transferDeadlineAt` is non-nullable — readiness checks fixture linkage instead of null filter
- `prisma.scorePrediction` (not `prisma.prediction`)
- `Season._count.playerPrices` (relation name in Season model)
- `Season.startDate` for orderBy (no `createdAt` on Season)

### FantasyCalibrationController (`apps/api/src/fantasy-calibration/fantasy-calibration.controller.ts`)

`@Controller('fantasy/admin/calibration')` — all 13 routes use `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('PSL_ADMIN')` at class level.

`UpdatePlayerPriceDto` uses `@IsInt() @Min(1)` — required because global `ValidationPipe({ whitelist: true })` strips undecorated properties.

### Season switching integration

`SeasonSwitchingService.checkFantasyRulesConfig()` and `checkFantasyPlayerPrices()` (WARNING severity) both resolve after STORY-29 seed:
- PSL `FantasyRulesConfig` exists → `checkFantasyRulesConfig` PASSES
- PSL has 96 player prices (≥ 11) → `checkFantasyPlayerPrices` PASSES

### Web client (`apps/web/src/lib/fantasy-calibration-client.ts`)

13 typed API wrappers matching controller routes.

### Admin web pages (7)

- `/admin/fantasy/calibration` — season list with calibration status indicators
- `/admin/fantasy/calibration/[seasonId]` — dashboard: overall status, blockers, warnings, nav links
- `/admin/fantasy/calibration/[seasonId]/readiness` — full check breakdown with codes, messages, detail text
- `/admin/fantasy/calibration/[seasonId]/rules` — rules config view; create provisional button if missing
- `/admin/fantasy/calibration/[seasonId]/players` — price readiness counts; generate provisional prices button
- `/admin/fantasy/calibration/[seasonId]/gameweeks` — per-gameweek fixture linkage table; derive deadlines button
- `/admin/fantasy/calibration/[seasonId]/activation-impact` — impact summary before season switching

**Test gate:** 975 API tests passing (21 new in `fantasy-calibration.service.spec.ts`). Typecheck clean. API and web build clean. Seed passes. Schema validates. All 13 admin routes verified locally. RBAC confirmed: FAN=403, unauth=401. PSL season switching readiness WARNINGs resolved.

---

## STORY-30 — Guess the Score PSL Season Calibration

**Files created:**
- `apps/api/prisma/migrations/20260612000001_prediction_rules_config/migration.sql` — `PredictionRulesStatus` enum, `prediction_rules_configs` table
- `apps/api/src/prediction-calibration/prediction-calibration.service.ts` — 10 methods: seasons list, readiness check, CRUD rules, fixture eligibility, lock/settlement/challenge readiness, activation impact
- `apps/api/src/prediction-calibration/prediction-calibration.controller.ts` — 11 PSL_ADMIN routes at `predictions/admin/calibration`
- `apps/api/src/prediction-calibration/prediction-calibration.module.ts` — PrismaModule + AuthModule imports
- `apps/api/src/prediction-calibration/prediction-calibration.service.spec.ts` — 23 Vitest tests
- `apps/web/src/lib/prediction-calibration-client.ts` — 12 typed API wrappers

**Files modified:**
- `apps/api/prisma/schema.prisma` — `PredictionRulesStatus` enum, `PredictionRulesConfig` model, `Season.predictionRulesConfig` relation
- `apps/api/prisma/seed.ts` — PSL `PredictionRulesConfig` upserted (PROVISIONAL, 10/5/3/0)
- `apps/api/src/app.module.ts` — `PredictionCalibrationModule` registered
- `apps/api/src/predictions/predictions.service.ts` — `isPublished` filter on `createPrediction`, `getMyPredictions` season filter, `listEligibleFixtures`, `getSingleFixtureEligibility`
- `apps/api/src/predictions/predictions.controller.ts` — `GET /predictions/fixtures`, `GET /predictions/fixtures/:id/eligibility`, `GET /predictions/me?seasonSlug=`
- `apps/api/src/season-switching/season-switching.service.ts` — 8th readiness check `checkPredictionReadiness` (WARNING severity)
- `apps/api/src/season-switching/season-switching.service.spec.ts` — mock updated with `predictionRulesConfig`, length check updated from 7→8
- `apps/api/src/predictions/predictions.service.spec.ts` — `MOCK_SCHEDULED` updated with `isPublished: true`

**9 admin web pages:**
- `/admin/predictions/calibration` — season list
- `/admin/predictions/calibration/[seasonId]` — dashboard
- `/admin/predictions/calibration/[seasonId]/readiness` — readiness detail
- `/admin/predictions/calibration/[seasonId]/rules` — rules config with inline editing
- `/admin/predictions/calibration/[seasonId]/fixtures` — fixture eligibility table
- `/admin/predictions/calibration/[seasonId]/locks` — lock state per fixture
- `/admin/predictions/calibration/[seasonId]/settlement` — settlement readiness
- `/admin/predictions/calibration/[seasonId]/peer-challenges` — peer challenge counts (fan points only)
- `/admin/predictions/calibration/[seasonId]/activation-impact` — activation summary

**Key design decisions:**
- `PredictionRulesConfig` is a calibration/readiness record only — it does NOT wire into `scoring.ts` (which remains hardcoded at 10/5/3/0). The scoring engine does not need a code change; PSL defaults match WC values exactly.
- `createPrediction` now rejects unpublished fixtures with `BadRequestException('Fixture is not available for predictions')` — ensures fans can only predict on published fixtures.
- Season switching now has 8 readiness checks (was 7) — prediction rules is WARNING severity (not BLOCKER).
- `getMyPredictions` extended with optional `seasonSlug` query param for season-aware fan history.

---

## STORY-31 — PSL Gameweek & Matchday Operations Readiness

**New module:** `apps/api/src/gameweek-operations/`

- `GameweekOperationsModule` — thin orchestration layer, no new schema; delegates to `FixtureImportService`, `FantasyCalibrationService`, `PredictionCalibrationService`
- `GameweekOperationsService` — 13 read methods + 3 action methods; computes `GameweekOperationalStatus` and `MatchdayReadinessStatus` at request time (not persisted)
- `GameweekOperationsController` — 15 routes under `GET/POST /gameweeks/admin/operations/...`, all `PSL_ADMIN`-gated
- `DeriveDeadlinesDto` — `mode` (`MISSING_ONLY` | `OVERWRITE_DERIVED_ONLY`), `fantasyBufferMinutes`, `predictionBufferMinutes`

**Season switching:** 9th readiness check `checkMatchdayOperationsReadiness` added (WARNING severity).

**Computed types (not persisted):**
- `GameweekOperationalStatus`: DRAFT | READY_TO_REVIEW | READY_TO_PUBLISH | OPEN | LOCKED | IN_PROGRESS | FINALIZING | COMPLETE | NEEDS_REVIEW | HISTORICAL
- `MatchdayReadinessStatus`: READY | READY_WITH_WARNINGS | BLOCKED | IN_PROGRESS | CLOSED | HISTORICAL

**12 web pages** under `/admin/gameweeks/operations/`; **web client** at `apps/web/src/lib/gameweek-operations-client.ts`.

**Key design decisions:**
- No new Prisma models or migrations — `Gameweek` model is already complete
- Operational status is derived from existing `GameweekStatus` + fixture counts + deadline validity
- `deriveGameweeks` delegates entirely to `FixtureImportService.autoCreateGameweeks()`
- `deriveDeadlines` computes from earliest fixture kickoff minus buffer minutes; skips past gameweeks and those without fixtures
- Season switching 9th check is WARNING (not BLOCKER) — gameweeks optional at activation time
- All fantasy impact uses `calibrationStatus` (not `activationStatus`); prediction impact uses `activationStatus` (not `status`) due to different service interfaces

**Test gate:** 998 API tests passing (23 new in `prediction-calibration.service.spec.ts`). Typecheck clean. Seed passes. All 11 admin routes + 3 fan route extensions verified locally. RBAC confirmed. Season switching readiness shows 8 checks with prediction domain. World Cup prediction history preserved (no deletions).

---

## STORY-31 — Gameweek & Matchday Operations Readiness (Sprint 2)

**Module:** `GameweekOperationsModule` (`apps/api/src/gameweek-operations/`)

**Goal:** Admin operations layer for gameweek lifecycle, deadline derivation, and matchday control readiness.

**New files:**
- `gameweek-operations.service.ts` — 16 methods for season overview, per-gameweek status, deadlines, fixture assignment, fantasy/prediction impact, matchday control
- `gameweek-operations.controller.ts` — 15 routes under `GET/POST /gameweeks/admin/operations/...`, all `PSL_ADMIN`-gated
- `derive-deadlines.dto.ts` — `mode` (`MISSING_ONLY` | `OVERWRITE_DERIVED_ONLY`), buffer options
- `gameweek-operations.service.spec.ts` — 39 tests

**Season switching:** 9th readiness check `checkMatchdayOperationsReadiness` added (WARNING severity).

**Computed types:** `GameweekOperationalStatus`, `MatchdayReadinessStatus` — not persisted.

**12 web pages** under `/admin/gameweeks/operations/`.

**Test gate:** 1037 API tests passing. All 15 routes verified. RBAC confirmed.

---

## STORY-32 — Admin Operations QA, Control Plane & Launch Integration Readiness (Sprint 2)

**Module:** `AdminOperationsModule` (`apps/api/src/admin-operations/`)

**Goal:** Platform control plane for capability gap review, launch readiness, season module readiness, route smoke tests, and integration provider readiness.

**Migration:** `20260612000002_integration_provider_config`
- 3 new enums: `IntegrationProviderType`, `IntegrationProviderMode`, `IntegrationProviderStatus`
- New model: `IntegrationProviderConfig` — non-sensitive readiness state only, no secrets

**New files:**
- `admin-operations.service.ts` — 17 methods: overview, capability review, launch readiness, season module readiness, smoke tests, 7 integration provider readiness methods
- `admin-operations.controller.ts` — 17 routes under `GET/POST /admin/operations/...`, all `PSL_ADMIN`-gated
- `admin-operations.module.ts` — imports `PrismaModule`, `AuthModule`
- `admin-operations.service.spec.ts` — 51 tests

**Seed additions:** 9 `IntegrationProviderConfig` entries (all `isProductionEnabled: false`):
- wallet-default (SANDBOX_READY), payment-default (PROVIDER_REQUIRED), checkout-default (PRODUCTION_DISABLED), ticketing-default (PROVIDER_REQUIRED), live-data-default (PROVIDER_REQUIRED), sponsor-activation-default (INTEGRATION_READY), rewards-redemption-default (COMPLIANCE_REQUIRED), notifications-default (SANDBOX_READY), analytics-default (SANDBOX_READY)

**Capability status taxonomy (read-only computed):**
`BUILT_NOW`, `PARTIALLY_BUILT`, `ADMIN_SHELL_READY`, `FOUNDATION_READY`, `INTEGRATION_READY`, `SANDBOX_READY`, `PROVIDER_REQUIRED`, `COMPLIANCE_REQUIRED`, `CONTRACT_REQUIRED`, `PRODUCTION_DISABLED`, `ENABLED`, `FUTURE_IMPLEMENTATION`

**12 web pages** under `/admin/operations/`; **web client** at `apps/web/src/lib/admin-operations-client.ts`.

**Doc:** `docs/platform/ADMIN-CAPABILITY-GAP-REVIEW.md` — 9 capability categories, 60+ capabilities reviewed.

**Key design decisions:**
- `IntegrationProviderConfig` stores readiness state only — no secrets, API keys, tokens, or credentials
- Module readiness is computed per-season at request time (no persisted `SeasonModuleConfig`)
- Smoke test route inventory is a deterministic static list — no live HTTP calls in service
- All commercial modules: `PRODUCTION_DISABLED` or `PROVIDER_REQUIRED` — production money movement disabled by default
- Fantasy and Guess the Score confirmed `POINTS-ONLY` — not connected to wallet/payment providers
- Peer challenges: `FAN_POINTS_ONLY` — no monetary stakes

**Test gate:** 1088 API tests passing (51 new). Typecheck clean. Seed passes. Build clean.

---

## STORY-33 — PSL Leaderboards & Fan Value Season Scope (Sprint 2)

**Modules:** `LeaderboardsModule` (rewritten), `EngagementModule` (new) in `apps/api/src/`

**Goal:** Season-scoped leaderboards (WC/PSL data isolation), admin engagement metrics module, 10th season-switching readiness check.

**No new migration:** `FanValueLedger.seasonId` already existed as nullable. `PredictionPointsLedger` season derived from `fixture.seasonId`. `FantasyGameweekScore.seasonId` is required. `FanAchievement` intentionally global (cross-season by design).

**LeaderboardsService (rewritten):**
- Season resolution: `resolveSeasonFromSlug`, `getActiveSeason`, `getLeaderboardSeasons` (with `leaderboardUrl`)
- Season-aware leaderboards: `getFanValueLeaderboard`, `getFantasyLeaderboard`, `getPredictionsLeaderboard`, `getAchievementsLeaderboard`, `getOverallLeaderboard`, `getLeaderboardOverview`
- Predictions: uses `findMany({ where: { fixture: { seasonId } } })` + JS aggregation (Prisma `groupBy` can't filter via relations)
- Achievements: always `ALL_TIME` scope (cross-season by design)
- Overall: delegates to Fan Value to avoid double-counting

**LeaderboardsController (rewritten):** 7 routes, all with `?seasonSlug=` query param defaulting to active season.

**EngagementService (new):** 10 methods:
- `listEngagementSeasons`, `getEngagementOverview`, `getEngagementLeaderboards`
- `getEngagementFanValue`, `getEngagementFantasy`, `getEngagementPredictions`, `getEngagementAchievements`
- `getUnscopedLedger` — entries with `seasonId IS NULL`, classified by `SeasonScopeSrc`
- `getSeasonScopeAudit` — 10 checks, READY/READY_WITH_WARNINGS/BLOCKED
- `getActivationImpact` — WC preservation, PSL clean start, safety confirmations

**EngagementController:** 10 routes under `GET /admin/engagement/...`, all `PSL_ADMIN`-gated.

**SeasonSwitchingService:** Added 10th readiness check `checkEngagementSeasonScope` (WARNING severity, triggers on >100 null-seasonId fan value entries).

**AdminOperationsService:** Updated `getLaunchReadiness` (2 new checklist items), `getSeasonModuleReadiness` (2 new modules: `LEADERBOARDS`, `ENGAGEMENT_METRICS`).

**2 new web clients:** `leaderboards-client.ts`, `admin-engagement-client.ts`

**6 fan web pages** under `/leaderboards/`: overview, overall, fan-value, fantasy, predictions, achievements
**10 admin web pages** under `/admin/engagement/`: season index, overview, leaderboards, fan-value, fantasy, predictions, achievements, unscoped-ledger, season-scope-audit, activation-impact

**Key design decisions:**
- Leaderboard default = active season; historical via `?seasonSlug=`
- Overall leaderboard = Fan Value only (prevents double-counting from multiple engagement sources)
- Predictions season scope: derived from `fixture.seasonId`, not stored on `PredictionPointsLedger`
- Achievements: intentionally global (unlock once, persist across seasons) — no season filter
- Unscoped legacy entries: admin-visible only, not surfaced in fan-facing season leaderboards
- `SeasonScopeSource` taxonomy: `DIRECT` → `DERIVED_GAMEWEEK` → `DERIVED_PREDICTION` → `DERIVED_PEER_CHALLENGE` → `DERIVED_FIXTURE` → `LEGACY_UNSCOPED`

**Test gate:** 1170 API tests passing (82 new). Typecheck clean. Seed passes. Build clean.

---

## STORY-34 — PSL Player Stats & Match Performance

**Goal:** Authoritative production player match statistics, separate from fantasy-scoring `FantasyPlayerMatchStat`. Manual entry, status lifecycle, season-scoped queries, 11th season-switching check.

**Migration `20260612000004_player_match_stats`:**
- New enums: `PlayerMatchStatsSource` (MANUAL/IMPORTED/PROVIDER/SYSTEM_DERIVED), `PlayerMatchStatsStatus` (DRAFT/VERIFIED/PUBLISHED/LOCKED)
- New model `PlayerMatchStats` with 40+ fields including direct `seasonId`, `gameweekId`, `status`, `source`, rating, and extended technical stats
- Unique constraint: `(playerId, fixtureId)`
- Relation naming to avoid collision with `FantasyPlayerMatchStat`: Player→`playerStats`, Team→`statsEntries`, Fixture→`playerMatchStats`, Season→`playerMatchStats`, Gameweek→`playerMatchStats`

**PlayerStatsService (new):** 15+ methods
- Fan: `getPlayerProfile`, `getPlayerSeasonStats`, `getPlayerMatchStat`, `listFixtureStats`, `listSeasonTopPerformers`, `listGameweekStats`, `listSeasonSquadStats`
- Admin: `adminListStats`, `adminGetStat`, `adminUpsertStat`, `adminVerifyStat`, `adminPublishStat`, `adminLockStat`, `adminBulkPublishFixture`, `adminDeleteStat`, `adminGetSeasonReadiness`
- Season check: `checkPlayerStatsReadiness`
- Fan routes return only PUBLISHED/VERIFIED; admin sees all statuses
- `adminUpsertStat` auto-derives `seasonId` and `gameweekId` from the fixture
- LOCKED stats are immutable (ForbiddenException on any mutation)
- PUBLISHED stats are protected from deletion

**PlayerStatsController:** 7 fan routes under `GET /players/...` (unauthenticated)
**PlayerStatsAdminController:** 10 admin routes under `/players/admin/stats/...` (PSL_ADMIN)

**SeasonSwitchingService:** Added 11th readiness check `checkPlayerStatsReadiness` (WARNING severity: triggers when finished fixtures exist but stats are empty or have drafts).

**AdminOperationsService:** Added `PLAYER_STATS` module to `getSeasonModuleReadiness` (BUILT_NOW, non-commercial, foundational).

**2 new web clients:** `players-client.ts`, `admin-player-stats-client.ts`

**10 fan web pages:**
- `/players` (index), `/players/[playerId]` (profile), `/players/[playerId]/season/[seasonId]` (season stats),
- `/players/[playerId]/fixture/[fixtureId]` (match detail), `/players/fixtures/[fixtureId]` (fixture overview),
- `/players/season/[seasonId]` (season index), `/players/season/[seasonId]/top-performers` (top scorers/assists),
- `/players/gameweek/[gameweekId]` (gameweek stats)

**11 admin web pages:**
- `/admin/player-stats` (list with status filter), `/admin/player-stats/new` (manual entry form),
- `/admin/player-stats/[statId]` (detail + lifecycle actions), `/admin/player-stats/season/[seasonId]` (season index),
- `/admin/player-stats/season/[seasonId]/readiness` (readiness report), `/admin/player-stats/fixture/[fixtureId]` (fixture stats + bulk publish)

**Key design decisions:**
- `PlayerMatchStats` is the authoritative, provider-neutral production model; `FantasyPlayerMatchStat` is retained for fantasy scoring only
- Season scope stored directly (not derived) — efficient querying at scale
- DataStatus taxonomy: NO_DATA → PROVISIONAL → PARTIAL → VERIFIED → PUBLISHED
- Live provider ingestion is foundation-ready but deferred to Sprint 3+ (no external calls)

**Test gate:** 1188 API tests passing (42 new in `player-stats.service.spec.ts`). Both typechecks clean.

---

## STORY-35 — Beta Feedback, Bug Fixes & UX Polish

**Goal:** Authentication clean-up (centralise `getBetaToken()`), performance indexing, audit log foundation, beta feedback module for admin, and UX polish across all web clients and pages.

**Migration `20260612000005_admin_audit_log_and_beta_indexes`:**
- New `AdminAuditLog` model — append-only cross-domain audit log. No FK to users table (intentional: immutability survives user deletion)
- Performance indexes on Fixture, ScorePrediction, PredictionPointsLedger, FantasyGameweekScore, FanValueLedger, PlayerMatchStats for 2M-fan scale

**Auth centralisation:**
- `getBetaToken()` added to `apps/web/src/lib/auth-client.ts` — single export point for all beta pages (`return getToken() ?? ''`)
- 29 pages that used `const TOKEN = 'dev-token'` migrated to `getBetaToken()`
- 5 seasons-switching pages that used inline `'dev-token'` migrated to `getBetaToken()`
- Port fixes: 5 web clients that defaulted to wrong port (3001 / 3000) corrected to `NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'`
- `admin-player-stats-client.ts`: added missing `authedHeaders()`, fixed `/fixtures/` → `/fixture/` path bug

**AdminAuditLog writes:**
- `PlayerStatsService.adminPublishStat()` and `adminLockStat()` write to `admin_audit_logs` after lifecycle transitions
- Actor identity threaded from controller via optional `actorUserId` parameter

**BetaFeedbackModule (new):**
- `BetaFeedbackService` — computed/read-only: no DB queries, pure structured responses
- 4 methods: `getOverview()`, `getKnownIssues()`, `getUxChecklist()`, `getReleaseNotes()`
- `BetaFeedbackController` — 4 admin-gated routes: `GET /admin/beta-feedback/overview|known-issues|ux-checklist|release-notes`
- `BetaFeedbackModule` registered in `AppModule`

**4 admin web pages:**
- `/admin/beta-feedback` — overview: status banner, KPI cards, sub-page nav, recommended actions
- `/admin/beta-feedback/known-issues` — 12 issues (KI-001 to KI-012) with severity/status badges
- `/admin/beta-feedback/ux-checklist` — checks grouped by area with PASS/WARN/FAIL/PENDING summary chips
- `/admin/beta-feedback/release-notes` — reverse-chronological story notes with key deliverables and safety boundaries

**UX polish:**
- `admin/dashboard/league-management` raw JSON dump replaced with structured active season display
- `BETA-READINESS-REVIEW.md` wager language corrected to `"fan points only — non-financial"`

**Key design decisions:**
- `BetaFeedbackService` is intentionally computed with no DB dependency — it documents platform state, not live telemetry. Sprint 3 can replace it with a real telemetry service.
- `AdminAuditLog` has no FK to users — immutability requirement overrides relational integrity here
- `getBetaToken()` is explicitly marked Sprint-2 temporary; Sprint 3 replaces with full session management

**Test gate:** 1216 API tests passing (28 new in `beta-feedback.service.spec.ts`). Both typechecks clean. API build clean. Web build clean (137 static pages). 8 web tests passing.

---

## STORY-36 — Squad Import, Player Price Finalisation & Activation Dry Run

**Goal:** Squad import pipeline (DRAFT→VALIDATED→IMPORTED→PUBLISHED); fantasy price calibration with bounds from FantasyRulesConfig; 2 new season-switching readiness checks (13 total); SQUAD_IMPORT + FANTASY_PRICE_CALIBRATION in AdminOperationsModule; activation dry-run endpoints.

**Migration `20260612000006_squad_import_price_calibration`:**
- 4 new enums: `SquadImportBatchStatus`, `SquadImportBatchSourceType`, `SquadImportRowValidationStatus`, `FantasyPriceCalibrationBatchStatus`
- `FantasyRulesConfig` extended: `minPrice INT DEFAULT 40`, `maxPrice INT DEFAULT 200`, `defaultPrice INT DEFAULT 55`
- `SquadImportBatch` model: 14 fields; FK to Season; indexed on (seasonId), (status), (seasonId, status), (createdAt DESC)
- `SquadImportRow` model: 21 fields; FK to SquadImportBatch (CASCADE) and Season; indexed on (batchId), (validationStatus), (matchedPlayerId), (seasonId), (teamId), (batchId, validationStatus)
- `FantasyPriceCalibrationBatch` model: 13 fields; FK to Season; indexed on (seasonId), (status), (seasonId, status), (createdAt DESC)

**SquadImportModule:**
- `SquadImportService` — 14 methods: `getImportSeasons`, `getImportOverview`, `listBatches`, `getBatch`, `listRows`, `createManualBatch`, `validateBatch`, `importBatch`, `publishBatch`, `cancelBatch`, `getDuplicates`, `getReadiness`, `getActivationImpact`, `getActivationDryRun`
- Validation in `validateBatch`: BLOCKER (invalid position, missing team, team not in season, price out of bounds, duplicate with active registration); WARNING (missing price, possible duplicate, missing shirt number, missing nationality)
- Import is idempotent: finds existing player by name+teamId; skips existing SeasonSquadRegistration
- Duplicate detection: normalised name match (lowercase, alphanumeric) within teamId
- Activation dry-run: `dryRunOnly: true`, `activationWillNotBePerformed: true`, safety confirmations (fantasyPointsOnly, fanValueNonFinancial)
- All mutations write to `AdminAuditLog` via `writeAuditLog` private helper
- 14 admin-gated routes under `@Controller('admin/squad-import')`

**FantasyPriceCalibrationModule:**
- `FantasyPriceCalibrationService` — 11 methods: `getSeasons`, `getOverview`, `listPlayers`, `listMissingPrices`, `listInvalidPrices`, `updatePlayerPrice`, `bulkApplyDefaults`, `validateCalibration`, `publishCalibration`, `getReadiness`, `getActivationImpact`, `getActivationDryRun`
- Price bounds read from `FantasyRulesConfig.minPrice/maxPrice`; fallback to 40/200
- `bulkApplyDefaults`: uses `defaultPrice` from config or position-based default (GK/DEF=50, MID=55, FWD=60); skips already-priced players (idempotent)
- `validateCalibration`: creates `FantasyPriceCalibrationBatch` (VALIDATED or HAS_WARNINGS); `publishCalibration` requires prior validated batch
- Activation dry-run: `pricesHaveNoCashValue: true` always set; `dryRunOnly: true`
- All mutations write to `AdminAuditLog`
- 12 admin-gated routes under `@Controller('admin/fantasy-price-calibration')`

**Season switching (13 checks):**
- Check 12 `checkSquadImportReadiness`: BLOCKER if teamCount < 2; WARNING if no registrations or no confirmed registrations
- Check 13 `checkFantasyPriceCalibrationReadiness`: WARNING if no rulesConfig, missing prices, invalid prices, or no published calibration batch
- `getSeasonSwitchReadiness` now runs 13 checks in parallel (was 11)

**AdminOperationsModule:**
- `getSeasonModuleReadiness` now includes SQUAD_IMPORT and FANTASY_PRICE_CALIBRATION as BUILT_NOW modules
- Added to data queries: `squadRegistrationCount`, `confirmedRegistrationCount`, `latestImportBatch`, `latestPriceCalibrationBatch`

**BetaFeedbackService updates:**
- `completedStories: 11`, `currentVersion: 'Sprint 2 — STORY-36'`
- STORY-36 release note added to `getReleaseNotesList()`
- KI-013 (official PSL squad data pending), KI-014 (unresolved duplicates), KI-015 (missing prices) added
- Squad Import and Fantasy Price Calibration UX areas added to checklist
- Season-switching check count updated from 11 to 13 in checklist and overview

**Web clients:**
- `apps/web/src/lib/squad-import-client.ts` — 14 methods using `getBetaToken()`
- `apps/web/src/lib/fantasy-price-calibration-client.ts` — 12 methods using `getBetaToken()`

**Web pages (17 new):**
- Squad Import (9): `/admin/squad-import`, `[seasonId]`, `[seasonId]/batches`, `[seasonId]/batches/[batchId]`, `[seasonId]/batches/[batchId]/rows`, `[seasonId]/duplicates`, `[seasonId]/readiness`, `[seasonId]/activation-impact`, `[seasonId]/activation-dry-run`
- Price Calibration (8): `/admin/fantasy-price-calibration`, `[seasonId]`, `[seasonId]/players`, `[seasonId]/missing-prices`, `[seasonId]/invalid-prices`, `[seasonId]/readiness`, `[seasonId]/activation-impact`, `[seasonId]/activation-dry-run`

**Key design decisions:**
- `FantasyPlayerPrice` has no status field — batch-level tracking via `FantasyPriceCalibrationBatch` avoids touching existing price records
- Import idempotency: `importBatch` checks for existing `SeasonSquadRegistration` before creating — safe to re-run
- Prices safety: `pricesHaveNoCashValue: true` and "fantasy points only — no cash value" language in BadRequestException message enforces no-monetary-value contract
- Duplicate detection is normalised name match only (not fuzzy) — simple, fast, deterministic

**Test gate:** 1293 API tests passing (77 new: 49 squad-import + 28 price-calibration). Both typechecks clean. API build clean. Web build clean.

---

## STORY-37 — PSL One Media, Sponsor Campaigns & Wallet Activation Foundation

**Sprint:** 2  
**Status:** Complete  
**Test gate:** 1452 API tests passing (159 new). Typechecks clean. Builds clean. Seed clean.

### What Was Built

Six new bounded contexts added as NestJS feature modules, one Prisma migration, nine web clients, and 25 web pages.

**Bounded contexts:**

1. **MediaModule** (`apps/api/src/media/`) — `MediaService` + `MediaController`. Manages media assets through DRAFT→PUBLISHED→ARCHIVED lifecycle. Rights-gating: assets with `rightsStatus !== 'CLEARED'` and `rightsStatus !== 'PUBLIC_DOMAIN'` are blocked from fan publishing. Fan views and completions are tracked in `MediaAssetEngagement`. `PUBLIC_MEDIA_SELECT` excludes internal admin fields. Safety copy mandatory in every fan-facing response.

2. **SponsorsModule** (`apps/api/src/sponsors/`) — `SponsorsService` + `SponsorsController`. Sponsor profile CRUD (PSL_ADMIN only). `PUBLIC_SPONSOR_SELECT` strips `primaryContactName`, `primaryContactEmail`, `notes`. Fan-facing sponsor detail available via campaign context only (no direct fan sponsor route).

3. **CampaignsModule** (`apps/api/src/campaigns/`) — `CampaignsService` + `CampaignsController`. Campaign lifecycle: DRAFT → PENDING_APPROVAL → APPROVED → PUBLISHED ↔ PAUSED → COMPLETED → ARCHIVED. `assertTransition()` enforces valid transitions. Fan routes: list/get published campaigns, start participation (idempotent), complete actions (`POST /fan/campaigns/:campaignId/actions/:actionId/complete` — `:campaignId` used to look up participation via `@@unique([campaignId, fanUserId])`), get progress. Admin routes: full CRUD + lifecycle mutations + actions + participations listing.

4. **CampaignRewardsModule** (`apps/api/src/campaign-rewards/`) — `CampaignRewardsService` + `CampaignRewardsController`. Reward definitions per campaign. Idempotent reward claim via `idempotencyKey` unique constraint (P2002 caught silently). `$transaction` block: atomically issue reward + increment `inventoryUsed`. Fan can claim and redeem. Safety copy for wallet integration mandatory on all reward responses.

5. **WalletIntegrationModule** (`apps/api/src/wallet-integration/`) — `WalletIntegrationService` + `WalletIntegrationController`. Zero-outbound adapter: `SiliconEnterpriseSandboxWalletAdapter` generates deterministic sandbox refs without calling any external service. Fan can link/confirm/unlink a wallet. Admin can list providers, links, transactions, and process sandbox webhooks. All responses include SANDBOX_ONLY safety copy. `PRODUCTION_DISABLED` module-readiness status in AdminOperations.

6. **CampaignAnalyticsModule** (`apps/api/src/campaign-analytics/`) — `CampaignAnalyticsService` + `CampaignAnalyticsController`. Snapshot-based analytics stored in `CampaignAnalyticsSnapshot`. Recalculate endpoint triggers async-style recalculation (synchronous in MVP). Sponsor-level analytics aggregate across all their campaigns. Status: PENDING → PROCESSING → READY.

### Key Design Decisions

- **`completeAction` uses `campaignId` not `participationId` in URL** — The route `POST /fan/campaigns/:campaignId/actions/:actionId/complete` takes `campaignId` and looks up the participation via `@@unique([campaignId, fanUserId])`. This is consumer-friendly (client never needs to know the participationId) and enforced by the unique constraint.

- **Participation uniqueness: `@@unique([campaignId, fanUserId])`** — One participation record per fan per campaign. `maxParticipationsPerFan` is set to 1 in seed; the `startParticipation` service method is idempotent (returns existing participation if already started). MVP coherence: the unique constraint IS the enforcement.

- **`FAN_SAFE_SELECT` for campaigns** — Strips `targetingRulesJson`, `createdByUserId`, `approvedByUserId` from fan responses. Prevents leaking internal marketing strategy.

- **AdminAuditLog writes** — Campaign lifecycle mutations (create, submit-for-approval, approve, reject, publish, pause, resume, complete, archive, add-action), sponsor mutations, media mutations (create, publish, archive), reward definition mutations all write to `AdminAuditLog`. Fan reward claim/redeem writes to `FanValueLedger` but not `AdminAuditLog` (fan-initiated, not admin action).

- **`RIGHTS_REQUIRED` module-readiness status** — Added to `CapabilityStatus` union in `admin-operations.service.ts` for the Media module. `SANDBOX_READY` for wallet. `PRODUCTION_DISABLED` for all three new fan-facing modules.

- **Route mismatches fixed** — Client calls `/fan/campaigns/:id/start` (not `/participate`), `/admin/campaigns/:id/submit-for-approval` (not `/submit`). `adminGetCampaignParticipations` backed by `GET admin/campaigns/:id/participations` controller route.

### File Map

```
apps/api/src/
  media/                         media.module.ts, media.service.ts, media.controller.ts, media.service.spec.ts
  sponsors/                      sponsors.module.ts, sponsors.service.ts, sponsors.controller.ts, sponsors.service.spec.ts
  campaigns/                     campaigns.module.ts, campaigns.service.ts, campaigns.controller.ts, campaigns.service.spec.ts
  campaign-rewards/              campaign-rewards.module.ts, …service, …controller, …spec
  wallet-integration/            wallet-integration.module.ts, …service (SiliconEnterpriseSandboxWalletAdapter), …controller, …spec
  campaign-analytics/            campaign-analytics.module.ts, …service, …controller, …spec

apps/web/src/lib/
  media-client.ts               fan media routes (listPublicMedia, recordMediaView, etc.)
  admin-media-client.ts         admin media CRUD + lifecycle
  sponsors-client.ts            admin sponsor CRUD
  campaigns-client.ts           fan campaign routes (startCampaignParticipation → /start, completeCampaignAction)
  admin-campaigns-client.ts     admin campaign lifecycle (submit → /submit-for-approval)
  campaign-rewards-client.ts    fan claim/redeem + admin definitions/issuance
  wallet-client.ts              fan wallet link/confirm/unlink
  admin-wallet-client.ts        admin provider/links/transactions/sandbox-webhook
  campaign-analytics-client.ts  admin analytics get/recalculate/sponsor

apps/web/src/app/
  media/                        page.tsx (catalogue), [slug]/page.tsx (detail)
  clubs/[slug]/media/           page.tsx (club media filter)
  campaigns/                    page.tsx (fan list), [slug]/page.tsx (fan detail)
  my-rewards/                   page.tsx
  wallet/                       page.tsx
  admin/media/                  page.tsx, new/page.tsx, [mediaId]/page.tsx
  admin/sponsors/               page.tsx, new/page.tsx, [sponsorId]/page.tsx
  admin/campaigns/              page.tsx, new/page.tsx, [campaignId]/page.tsx, [campaignId]/actions/page.tsx,
                                [campaignId]/rewards/page.tsx, [campaignId]/analytics/page.tsx
  admin/reward-definitions/     page.tsx
  admin/campaign-rewards/       page.tsx
  admin/wallet/                 page.tsx, providers/page.tsx, links/page.tsx, transactions/page.tsx

prisma/migrations/
  20260612000007_media_campaign_wallet_foundation/   migration.sql (22 enum types, 13 tables)
```

### Safety Boundaries

- No real-money wallet: `SiliconEnterpriseSandboxWalletAdapter` generates deterministic sandbox refs; zero outbound calls
- Fan Value rewards are non-financial loyalty points (safety copy in all reward + wallet API responses)
- Media rights gate: `rightsStatus !== 'CLEARED' && rightsStatus !== 'PUBLIC_DOMAIN'` blocks publishing
- No copyrighted images stored; seed uses placeholder URLs only
- `NEXT_PUBLIC_API_BASE_URL` convention applied to all 9 new web clients
- `PRODUCTION_DISABLED` / `RIGHTS_REQUIRED` / `SANDBOX_READY` statuses returned in AdminOperations capability map

**Test gate:** 1452 API tests passing (49 spec files). Both typechecks clean. API build clean. Web build clean (275 pages). Seed clean.
