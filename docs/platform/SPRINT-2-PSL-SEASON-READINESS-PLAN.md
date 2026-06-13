# PSL One — Sprint 2: PSL Season Readiness Plan

**Sprint:** Sprint 2  
**Theme:** PSL Season Data & Operating Model Readiness  
**Trigger:** World Cup ends, official PSL season data becomes available  
**Goal:** Transition from World Cup beta mode to PSL season operating mode

---

## Sprint 2 Purpose

After the World Cup, PSL One must shift from World Cup beta data to the official Premier Soccer League season. Sprint 2 is not commerce-first — it is data and calibration work. The platform must be able to ingest real PSL clubs, squads, and fixtures; validate data before publishing; and configure the fantasy and prediction engines for PSL rules.

Sprint 2 prepares the operating model. Sprint 3 turns on production and commerce.

---

## Guiding Principles for Sprint 2

### Do not hardcode team counts
The Premier Soccer League has 16 teams, but promoted and relegated clubs change each season. Sprint 2 must not hardcode `COUNT = 16` anywhere. Season-specific club participation must drive which clubs, players, and fixtures are active.

### Existing PSL clubs are baseline
Teams like Kaizer Chiefs, Orlando Pirates, Mamelodi Sundowns, etc. already exist in the system as examples or can be pre-seeded. Promoted/relegated clubs can be added once officially confirmed.

### Import-first, manual validation
All PSL fixture and squad data should be importable via the existing import pipeline (`/admin/imports`). Admins must be able to validate and preview before committing. No batch commits without review.

### Provider-neutral fixture data
PSL fixture data may come from the PSL directly, from a licensed data provider (Opta, Stats Perform, etc.), or via manual entry. The import pipeline must support all three without code changes. The `LiveMatchProviderInterface` adapter from Sprint 1 is the right pattern.

### Do not break World Cup data
The platform supports multiple competitions simultaneously. WC 2026 data can remain available for historical browsing. Sprint 2 adds a new PSL season; it does not delete or overwrite WC data.

---

## Candidate Stories

### STORY-26 — PSL Club, Squad, Season & Club Experience Readiness ✅ COMPLETE (2026-06-11)

**Goal:** Ensure all PSL clubs and their squads are ready for the season, and fans have a full club experience.

**Work completed:**
- 16 PSL clubs seeded with `SeasonTeam` participation for `psl-premiership-upcoming`
- 14 unique venues seeded (`Venue` model) with capacity and city
- `ClubProfile`, `ClubContentItem`, `ClubShopProduct` (8 per club, `CATALOGUE_ONLY`), `ClubExperienceStatus` seeded for all clubs
- `ClubExperienceService` — 11 fan-facing methods (club list, detail, overview, fixtures, results, squad, stats, stadium, tickets, shop, product)
- `ClubAdminService` — 24 admin methods across season management, player assignment, fixture assignment, readiness validation
- `ClubExperienceController` — full route suite with static-before-dynamic ordering for Fastify compatibility
- 11 fan web pages + 8 admin web pages
- 71 new tests; total 883 API tests passing

**Acceptance criteria met:** Admin can browse all 16 PSL clubs with readiness status. Fans can view club hub, squad, fixtures, results, stats, stadium, shop catalogue. Commerce stub returns `CATALOGUE_ONLY` with Sprint 3 note. All gate checks pass.

---

### STORY-27 — PSL Fixture Import, Validation & Publishing Workflow ✅ COMPLETE (2026-06-11)

**Goal:** Import the official PSL fixture calendar and validate it before publishing to fans.

**Work completed:**
- `Fixture.isPublished Boolean @default(true)` — existing WC2026 fixtures remain fan-visible; PSL import fixtures start `false`
- Migration `20260611000005_fixture_import`: `fixture_import_batches`, `fixture_import_rows` tables + 3 enums
- `FixtureImportService` (22 methods): batch CRUD, row CRUD, validation (ERROR/WARNING/INFO), conflict detection (DUPLICATE_FIXTURE, TEAM_SCHEDULE_OVERLAP, VENUE_OVERLAP), commit (idempotent, `isPublished=false`), publish (blocks if predictions/fantasy/events), auto-gameweek creation from round data
- `FixtureImportController` at `@Controller('fixtures/admin')` — 21 PSL_ADMIN routes
- `FootballService.listFixtures()` and `ClubExperienceService` fixture queries filter `isPublished: true`
- 10 admin web pages: imports list/new/detail/rows/validation/publish, season validation/conflicts/gameweeks/publishing
- `fixture-import-client.ts` — 21 typed API wrappers
- 110 new tests; total 922 API tests passing

**Acceptance criteria met:** Admin can create import batches, add rows, validate (row-level ERROR/WARNING), commit to provisional fixtures, and publish safely. Fan-facing fixture queries return only published fixtures. WC2026 fixtures remain visible (default `true`). RBAC enforced (401/403 for non-admin). All gate checks pass.

**Provider-neutral:** Import source enum supports MANUAL, CSV_UPLOAD, PROVIDER_API. No vendor parsing hardcoded.

**Commerce boundary:** No betting, odds, stakes, payouts, wallet, payment, checkout, order, or commerce mechanics introduced.

---

### STORY-28 — Competition Switching: World Cup Beta to PSL Season Mode ✅ COMPLETE (2026-06-11)

**Goal:** Activate the PSL season as the primary competition without losing WC 2026 data.

**Work completed:**
- Migration `20260611000006_season_switch_audit`: `SeasonSwitchAction`, `SeasonSwitchStatus`, `season_switch_audits` table
- `SeasonSwitchingService` (7 methods): `getAdminSeasonContext`, `getSeasonSwitchReadiness` (7 cross-domain checks), `getSeasonSwitchPreview`, `activateSeason` (transactional + acknowledgeWarnings), `completeSeason`, `rollbackSeason`, `getSwitchHistory`
- `SeasonSwitchingController` at `@Controller('seasons/admin')` — 7 admin routes, all PSL_ADMIN
- `FootballService.getSeasonBySlug()` + `GET /football/seasons/:slug` for historical access
- `FootballService.getSeasonContext()` + `GET /football/context` for fan default context
- Seed fix: `fixtureImportRow/Batch` and `seasonSwitchAudit` cleared before season delete
- 5 admin web pages: context, switching list, season detail, readiness dashboard, preview+activate
- `season-context-client.ts` — 10 typed API wrappers
- 32 new tests; total 954 API tests passing

**Acceptance criteria met:** Admin can preview, check readiness (7 cross-domain checks), and activate PSL season. WC2026 data preserved and accessible by slug. Only one season active at a time. Activation is transactional. Rollback restores prior active season. Blockers prevent activation. Warnings require explicit acknowledgement. RBAC enforced (FAN=403, unauth=401). All gate checks pass.

---

### STORY-29 — PSL Fantasy Season Calibration ✅ COMPLETE (2026-06-11)

**Goal:** Configure fantasy rules and pricing for the PSL season operating model.

**Work completed:**
- `seed-data/psl-players.ts` — 96 provisional placeholder players (6 per club × 16 clubs: 1 GK, 2 DEF, 2 MID, 1 FWD). Source `PSL_PLACEHOLDER`. Not official PSL data.
- Seed extended: idempotent player creation (findFirst + conditional create), FantasyRulesConfig (halfwayGameweek=15, seasonGameweekCount=30), provisional player prices (GK=50, DEF=50, MID=55, FWD=60 × 10), SeasonSquadRegistrations
- `FantasyCalibrationService` — 10 methods: `getCalibrationSeasons`, `getCalibrationReadiness`, `getFantasyRules`, `createProvisionalRules`, `updateFantasyRules`, `getPlayerPriceReadiness`, `generateProvisionalPrices`, `updatePlayerPrice`, `getSquadReadiness`, `getGameweekReadiness`, `deriveGameweekDeadlines`, `getActivationImpact`
- `FantasyCalibrationController` at `@Controller('fantasy/admin/calibration')` — 13 PSL_ADMIN routes
- `FantasyCalibrationModule` registered in `AppModule`
- `fantasy-calibration-client.ts` — 13 typed API wrappers
- 7 admin web pages: calibration list, season dashboard, readiness detail, rules config, player prices, gameweek deadlines, activation impact
- 21 new spec tests; total 975 API tests passing
- WC integration tests updated to filter by `source: 'fifa-wc2026'` (PSL players use `source: 'PSL_PLACEHOLDER'`)

**Acceptance:** Admin can view all seasons' calibration status; create provisional PSL rules (30-round); generate provisional prices for unpriced players; derive gameweek deadlines from fixture kickoffs; view activation impact before switching. All values clearly marked PROVISIONAL. No official PSL data. STORY-28 season switching readiness warnings resolved.

---

### STORY-30 — Guess the Score PSL Season Calibration ✅ COMPLETE (2026-06-12)

**Goal:** Make Guess the Score / Predictions fully PSL-season aware.

**Work completed:**
- Migration `20260612000001_prediction_rules_config`: `PredictionRulesConfig` model + `PredictionRulesStatus` enum
- `PredictionCalibrationService` — 10 methods: `getCalibrationSeasons`, `getCalibrationReadiness`, `getPredictionRules`, `createProvisionalRules`, `updatePredictionRules`, `getFixtureEligibility`, `getLockReadiness`, `getSettlementReadiness`, `getPeerChallengeReadiness`, `getActivationImpact`
- `PredictionCalibrationController` at `@Controller('predictions/admin/calibration')` — 11 PSL_ADMIN routes
- `PredictionCalibrationModule` registered in AppModule
- `PredictionsService` extended: `isPublished` filter on `createPrediction`, `getMyPredictions` season filter, `listEligibleFixtures`, `getSingleFixtureEligibility`
- `PredictionsController` extended: `GET /predictions/fixtures?seasonSlug=`, `GET /predictions/fixtures/:id/eligibility`, `GET /predictions/me?seasonSlug=`
- `SeasonSwitchingService` updated: 8th readiness check `checkPredictionReadiness` (WARNING severity)
- Seed updated: PSL `PredictionRulesConfig` upserted (PROVISIONAL, 10/5/3/0 scoring — matches existing engine)
- `prediction-calibration-client.ts` — 12 typed API wrappers
- 9 admin web pages under `/admin/predictions/calibration/`
- 23 new spec tests; total 998 API tests passing

**Acceptance:** Admin can view all seasons' prediction calibration status; create provisional PSL prediction rules; view fixture eligibility for predictions; monitor lock, settlement, and challenge readiness. Season switching readiness now has 8 checks (prediction rules added). World Cup prediction history preserved. All values clearly PROVISIONAL. No gambling mechanics.

---

### STORY-31 — PSL Gameweek & Matchday Operations Readiness ✅ COMPLETE (2026-06-12)

**Goal:** Operational bridge between imported fixtures and fan-facing gameplay. PSL_ADMIN users can see whether each matchday is operationally ready.

**Work completed:**
- `GameweekOperationsModule` — thin orchestration layer, no new schema; delegates to `FixtureImportService`, `FantasyCalibrationService`, `PredictionCalibrationService`
- `GameweekOperationsService` — 16 methods; computes `GameweekOperationalStatus` and `MatchdayReadinessStatus` at request time (not persisted)
- `GameweekOperationsController` at `@Controller('gameweeks/admin/operations')` — 15 PSL_ADMIN routes
- `DeriveDeadlinesDto` — mode (`MISSING_ONLY` | `OVERWRITE_DERIVED_ONLY`), `fantasyBufferMinutes`, `predictionBufferMinutes`
- `SeasonSwitchingService` updated: 9th readiness check `checkMatchdayOperationsReadiness` (WARNING severity)
- `gameweek-operations-client.ts` — 15 typed API wrappers
- 12 admin web pages under `/admin/gameweeks/operations/`
- 39 new spec tests; total 1037 API tests passing

**Acceptance:** Admin can see per-gameweek operational status; derive gameweeks from fixtures; derive deadlines with configurable buffer; inspect fantasy and prediction impact; view matchday control panel with safety flags. Season switching now has 9 readiness checks. No new schema or migrations.

---

### STORY-32 — Admin Operations QA, Control Plane & Launch Integration Readiness ✅ COMPLETE (2026-06-12)

**Goal:** Create the platform admin control plane and integration readiness layer.

**Delivered:**
- `IntegrationProviderConfig` model + 3 enums (migration 20260612000002)
- 9 provider config placeholders seeded (all production-disabled)
- `AdminOperationsModule`: service (17 methods), controller (17 routes), spec (51 tests)
- 17 admin routes under `/admin/operations/...` — all PSL_ADMIN guarded
- 12 admin web pages under `/admin/operations/`
- `apps/web/src/lib/admin-operations-client.ts` — 16 wrappers
- `docs/platform/ADMIN-CAPABILITY-GAP-REVIEW.md` — 9 capability categories
- Capability gap review, launch readiness checklist, season module readiness (19 modules)
- Smoke test route inventory, RBAC definitions, workflow summaries
- All commercial modules: PRODUCTION_DISABLED or PROVIDER_REQUIRED
- Fantasy and Guess the Score confirmed POINTS-ONLY — no real-money mechanics

**Test count:** 1088 API tests passing (51 new in AdminOperationsService spec)

---

### STORY-33 — PSL Leaderboards & Fan Value Season Scope ✅ COMPLETE

**Goal:** Season-scoped leaderboards, harden Fan Value season scope, admin engagement metrics module, 10th season-switching readiness check.

**Delivered:**
- `LeaderboardsModule` fully rewritten: 7 fan routes, season-aware, `?seasonSlug=` historical access
- `EngagementModule` (new): 10 admin routes under `/admin/engagement/`, `PSL_ADMIN`-only
- `SeasonSwitchingService`: 10th check `checkEngagementSeasonScope` added
- `AdminOperationsService`: 2 new checklist items, 2 new season modules (LEADERBOARDS, ENGAGEMENT_METRICS)
- 6 fan web pages, 10 admin web pages, 2 new web clients
- WC/PSL data isolation confirmed; no migration needed; World Cup history preserved
- 1170 API tests passing (82 new). Typecheck clean. Build clean.

**Acceptance:** Season-scoped leaderboards live. Admin engagement metrics visible. 10th readiness check active.

---

### STORY-34 — PSL Player Stats & Match Performance ✅ COMPLETE (2026-06-12)

**Goal:** Authoritative production player match statistics — separated from fantasy-only `FantasyPlayerMatchStat`. Full DRAFT→VERIFIED→PUBLISHED→LOCKED lifecycle with admin pipeline and fan-facing views.

**Work completed:**
- Migration `20260612000004_player_match_stats`: `PlayerMatchStatsSource` enum (MANUAL/IMPORTED/PROVIDER/SYSTEM_DERIVED), `PlayerMatchStatsStatus` enum (DRAFT/VERIFIED/PUBLISHED/LOCKED), `player_match_stats` table with 40+ fields, unique on `(player_id, fixture_id)`, direct `season_id` + `gameweek_id` columns
- Named relations to avoid collision with `FantasyPlayerMatchStat`: Player→`playerStats`, Team→`statsEntries`, Fixture/Season/Gameweek→`playerMatchStats`
- `PlayerStatsModule` — service (16 fan + admin methods), `PlayerStatsController` (7 fan routes under `/players`), `PlayerStatsAdminController` (10 admin routes under `/players/admin/stats`, PSL_ADMIN gated)
- Fan reads return only PUBLISHED/VERIFIED stats; admin sees all statuses
- `adminUpsertStat` auto-derives `seasonId` + `gameweekId` from fixture (upsert on `(playerId, fixtureId)`)
- LOCKED stats are immutable; PUBLISHED stats are deletion-protected
- `checkPlayerStatsReadiness` — 11th season-switching readiness check (WARNING when finished fixtures have no/draft stats)
- `PLAYER_STATS` module added to `AdminOperationsService` module readiness list (BUILT_NOW, foundational, non-commercial)
- `apps/web/src/lib/players-client.ts` — 7 typed fan API wrappers
- `apps/web/src/lib/admin-player-stats-client.ts` — 9 typed admin API wrappers
- 10 fan web pages: `/players`, `/players/[id]`, `/players/[id]/season/[id]`, `/players/[id]/fixture/[id]`, `/players/fixtures/[id]`, `/players/season/[id]`, `/players/season/[id]/top-performers`, `/players/gameweek/[id]`
- 11 admin web pages: `/admin/player-stats`, `/admin/player-stats/new`, `/admin/player-stats/[id]`, `/admin/player-stats/season/[id]`, `/admin/player-stats/season/[id]/readiness`, `/admin/player-stats/fixture/[id]`
- 42 new spec tests; total 1188 API tests passing

**Acceptance criteria met:** Admin can create DRAFT stats, verify, publish (fan-visible), lock (immutable). Fan views return only PUBLISHED/VERIFIED. Lifecycle protection enforced (LOCKED blocks edits/verify/publish/delete; PUBLISHED blocks delete). Season switching has 11 checks. PLAYER_STATS module is BUILT_NOW. RBAC enforced (401/403). Web typecheck clean. Web build clean (14 player-stats pages compiled). All gate checks pass.

**Provider-neutral:** `PlayerMatchStatsSource.PROVIDER` enum value reserved for future live-provider ingestion. No external provider calls or SDK dependencies introduced. `providerStatId` field reserved for provider reconciliation.

---

### STORY-35 — Beta Feedback, Bug Fixes & UX Polish ✅ COMPLETE (2026-06-12)

**Goal:** Centralise beta token helper, harden audit logging, add performance indexes, and collect structured beta feedback.

**Work completed:**
- `getBetaToken()` centralised in `apps/web/src/lib/auth-client.ts`; all 34 prior pages migrated from inline `'dev-token'`
- `AdminAuditLog` model added; `AdminOperationsService` writes audit entries for destructive operations
- Migration `20260612000005_performance_indexes`: composite indexes on `Fixture`, `ScorePrediction`, `PredictionPointsLedger`, `FantasyGameweekScore`, `FanValueLedger`, `PlayerMatchStats`
- `BetaFeedbackModule` — `BetaFeedbackService` (7 methods), `BetaFeedbackController` (6 routes), `BetaFeedbackAdminController` (4 admin routes)
- 4 admin web pages under `/admin/beta-feedback/`
- 28 new spec tests; total 1216 API tests passing

**Acceptance criteria met:** All web pages use `getBetaToken()`. Admin audit logs visible. Performance indexes deployed. Beta feedback API operational. RBAC enforced. All gate checks pass.

---

### STORY-36 — PSL Squad Import, Player Price Finalisation & Activation Dry Run ✅ COMPLETE (2026-06-13)

**Goal:** Full squad import pipeline with lifecycle management, fantasy price finalisation workflow, and a read-only activation dry-run for safe season launch.

**Work completed:**
- Migration `20260612000006_squad_import_and_price_calibration`: 4 enums (`SquadImportBatchStatus`, `SquadImportRowStatus`, `SquadImportRowIssue`, `FantasyPriceCalibrationStatus`), `squad_import_batches`, `squad_import_rows`, `fantasy_price_calibration_batches` tables
- `FantasyRulesConfig` extended: `minPrice Int @default(40)`, `maxPrice Int @default(200)`, `defaultPrice Int @default(55)`
- `SquadImportService` (14 methods): `createManualBatch`, `validateBatch` (BLOCKER + WARNING checks), `importBatch` (idempotent player create/find, `SeasonSquadRegistration` PROVISIONAL), `publishBatch` (PROVISIONAL→CONFIRMED), `cancelBatch`, `getDuplicates`, `getReadiness`, `getActivationImpact`, `getActivationDryRun`
- `FantasyPriceCalibrationService` (12 methods): `updatePlayerPrice` (validates bounds), `bulkApplyDefaults` (position-based: GK/DEF=50, MID=55, FWD=60), `validateCalibration` (creates `FantasyPriceCalibrationBatch`), `publishCalibration`, `getActivationDryRun` (`pricesHaveNoCashValue: true`)
- `SeasonSwitchingService`: 12th check `checkSquadImportReadiness`, 13th check `checkFantasyPriceCalibrationReadiness` — season switching now has **13 checks**
- `AdminOperationsService`: SQUAD_IMPORT and FANTASY_PRICE_CALIBRATION added to module readiness list (BUILT_NOW)
- `apps/web/src/lib/squad-import-client.ts` — 14 typed API wrappers
- `apps/web/src/lib/fantasy-price-calibration-client.ts` — 12 typed API wrappers
- 9 squad import admin web pages + 8 fantasy price calibration admin web pages = 17 new pages
- Activation dry-run: `dryRunOnly: true`, `activationWillNotBePerformed: true`, safety confirmations including `pricesHaveNoCashValue: true`
- 77 new spec tests; total 1293 API tests passing

**Acceptance criteria met:** Admin can import squads via batch lifecycle (DRAFT→VALIDATED/HAS_WARNINGS/BLOCKED→IMPORTED→PUBLISHED); duplicate detection via normalised name matching; fantasy prices validated within config bounds; bulk defaults applied by position; price calibration batch published; dry-run simulates activation without state changes. Season switching has 13 checks. SQUAD_IMPORT + FANTASY_PRICE_CALIBRATION modules BUILT_NOW. RBAC enforced (401/403). Web typecheck clean. Web build clean. All gate checks pass.

**Safety boundaries enforced:** `pricesHaveNoCashValue: true` on all price operations. No cash value, market value, or monetary meaning assigned to player prices. Fantasy and Guess the Score remain points-only. Fan Value non-financial. No production money movement or checkout mechanics introduced.

---

## What NOT to do in Sprint 2

- Do not implement commerce or sponsor activation
- Do not implement production deployment (AWS)
- Do not implement CI/CD pipeline
- Do not implement real notification delivery (email/SMS/push)
- Do not implement rewards redemption
- Do not start POPIA compliance workflows
- Do not implement reporting builder or scheduled exports
- Do not implement full sponsor management portal

These are Sprint 3.

---

## Sprint 2 Technical Notes

### Database
- No new Prisma migrations expected for data readiness work
- Seed scripts should be extended to support PSL club and fixture data
- Use the existing import pipeline (`/admin/imports`) rather than custom seeding scripts

### Architecture
- Platform already supports multiple concurrent competitions
- No architectural changes needed — Sprint 2 is configuration and data

### Known deferred issues (from Sprint 1 expert review)

The following issues were identified in the Sprint 1 expert review and are documented here for Sprint 2 awareness. They do not block data readiness work but must be resolved before production:

**1. Audit log coverage**

Audit logs currently cover auth events (register, login, logout, password reset). Several domain mutations still need dedicated audit coverage before production, including prediction settlement, fantasy transfer, fan value posting, achievement awards, notification broadcasts, activity moderation, and admin dashboard actions. This should be addressed in Sprint 2 or Sprint 3 as a dedicated audit and governance story.

**2. Dev-token placeholder on web pages**

Resolved in STORY-35: all 34 pages migrated from `const TOKEN = 'dev-token'` / inline `'dev-token'` to `getBetaToken()` (centralised in `auth-client.ts`). The beta helper is explicitly marked for removal in Sprint 3 when full session management is implemented.

**3. CORS production readiness**

The API currently uses local development CORS settings (`localhost:3001` hardcoded). Before staging or production deployment, CORS origins must be environment-driven. No code change required in Sprint 2 — deferred to Sprint 3 pre-deployment.

**4. Performance indexes**

Resolved in STORY-35: migration `20260612000005` added composite indexes on Fixture, ScorePrediction, PredictionPointsLedger, FantasyGameweekScore, FanValueLedger, and PlayerMatchStats for 2M-fan scale. Peer challenge and fantasy leaderboard paths may need further indexing in Sprint 3 once load tested.

**5. Admin user management**

Admin visibility exists through the command centre, but full user and role administration (promote, suspend, search) is not yet implemented. Deferred to Sprint 3.

**6. Sponsor, reporting, and compliance are readiness stubs**

Sponsor Management, Reporting Centre, and Compliance/POPIA Governance are command-centre readiness sections in Sprint 1. Full operational sponsor management, report export centre, and compliance workflow engine belong in Sprint 3. Keep Sprint 2 focused on PSL Season Readiness, data validation, fixture and squad ingestion, competition switching, QA, and beta feedback.

### Testing
- All existing 1293 API tests must remain green (updated after STORY-36)
- New tests should cover PSL-specific rule variants (30-round seasons, squad sizes)
- Integration tests should cover full fixture-to-prediction-to-settlement lifecycle with PSL data

### Fixture Timing
- PSL season typically starts August/September
- World Cup ends late June 2026
- Sprint 2 window: approximately July 2026
- Official PSL fixture release: typically 4–6 weeks before season start
