# PSL One — Database Migration Inventory

**Database:** Local PostgreSQL  
**Database name:** `psl_identity_dev`  
**Connection pattern:** `postgresql://localhost:5432/psl_identity_dev` (credentials in `.env`, never committed)  
**ORM:** Prisma 5.22  
**Schema file:** `apps/api/prisma/schema.prisma`  
**Migration directory:** `apps/api/prisma/migrations/`  
**Sprint:** 2 (STORY-26) — 27 migrations applied

**Commands:**
```bash
# Apply all pending migrations
cd apps/api && npx prisma migrate dev

# Run seed after migrations
pnpm --filter @psl-one/api db:seed

# Validate schema
cd apps/api && npx prisma validate

# Generate Prisma client after schema change
cd apps/api && npx prisma generate
```

---

## Migration Inventory

### 1. `20260609045934_init_auth_schema`

**Story:** Issue 0 / STORY-01 — Auth foundation  
**Tables created:** `users`, `refresh_tokens`, `password_reset_tokens`, `consents`, `audit_logs`  
**Enums created:** `UserRole` (FAN, CLUB_ADMIN, SPONSOR, PSL_ADMIN), `ConsentPurpose`  
**Seed dependency:** Yes — all seed users require this migration  
**Notes:** Foundation of the entire schema. `users` table is referenced by nearly every other table.

---

### 2. `20260609054914_add_football_core`

**Story:** STORY-02 — Football Core  
**Tables created:** `competitions`, `seasons`, `teams`, `players`, `fixtures`, `standings`  
**Enums created:** `PlayerPosition` (GOALKEEPER, DEFENDER, MIDFIELDER, FORWARD), `FixtureStatus` (SCHEDULED, LIVE, FINISHED, POSTPONED, CANCELLED), `CompetitionType`  
**Seed dependency:** Yes — teams, players, fixtures, competition, season  
**Notes:** `fixtures` references `seasons`, `teams` (home and away). `standings` references `seasons`, `teams`. `players` references `teams`.

---

### 3. `20260609063037_add_fan_profile`

**Story:** STORY-03 — Fan Profile  
**Tables created:** `fan_profiles`, `fan_preferences`  
**Seed dependency:** Yes — fan profiles created for all 32 fan users  
**Notes:** `fan_profiles.user_id` is a 1:1 FK to `users.id`. Created automatically at registration.

---

### 4. `20260609070826_add_match_state`

**Story:** STORY-04 — Live Match State  
**Tables created:** `match_states`, `match_events`, `lineup_entries`, `match_stats`  
**Enums created:** `MatchEventType` (GOAL, YELLOW_CARD, RED_CARD, SUBSTITUTION, etc.), `LineupStatus` (STARTING, SUBSTITUTE, UNAVAILABLE, etc.)  
**Seed dependency:** No (match data is admin-driven at runtime)  
**Notes:** `match_states` is 1:1 with `fixtures`. `match_events` and `match_stats` reference both `fixtures` and `players`.

---

### 5. `20260609073452_add_predictions`

**Story:** STORY-05 — Predictions & Challenges  
**Tables created:** `score_predictions`, `prediction_points_ledger`, `peer_challenges`  
**Enums created:** `PredictionStatus` (PENDING, LOCKED, WON, LOST, SETTLED), `ChallengeStatus` (PENDING, ACCEPTED, DECLINED, CANCELLED, SETTLED)  
**Seed dependency:** No  
**Notes:** `score_predictions` has a unique constraint on `(user_id, fixture_id)` — one prediction per user per fixture. `prediction_points_ledger` is append-only.

---

### 6. `20260609100000_add_provider_fields`

**Story:** STORY-02 / STORY-04 — Sports data provider readiness  
**Changes:** Added `external_id`, `source`, `source_url` columns to `teams`, `players`, `fixtures` tables  
**Seed dependency:** No  
**Notes:** Enables provider-neutral sports data import. `external_id` has a unique index per table. Used by `LiveMatchProviderInterface` adapter.

---

### 7. `20260609120000_add_fantasy`

**Story:** STORY-06 — Fantasy Team MVP  
**Tables created:** `fantasy_teams`, `fantasy_team_players`, `fantasy_chips`  
**Enums created:** `FantasyPlayerPosition` (STARTER, BENCH), `FantasyPlayerRole` (NONE, CAPTAIN, VICE_CAPTAIN)  
**Seed dependency:** No  
**Notes:** `fantasy_teams` has a unique constraint on `(user_id, season_id)` — one team per fan per season. `fantasy_chips` are pre-created (4 per team: WILDCARD, FREE_HIT, TRIPLE_CAPTAIN, BENCH_BOOST).

---

### 8. `20260609130000_add_fantasy_formation_transfers`

**Story:** STORY-07 / STORY-13 — Transfers and formation  
**Changes:** Added `formation` column to `fantasy_teams`  
**Tables created:** `fantasy_transfers`  
**Enums created:** (via `FantasyChipType`, `FantasyChipStatus` added later)  
**Seed dependency:** No  
**Notes:** `fantasy_transfers` tracks every player-in/player-out pair with `is_free` boolean. Required for transfer cost calculation and rollover.

---

### 9. `20260609140000_add_gameweeks`

**Story:** STORY-07 — Gameweek Deadlines  
**Tables created:** `gameweeks`, `gameweek_stages`  
**Enums created:** `GameweekStatus` (UPCOMING, OPEN, LOCKED, LIVE, COMPLETED)  
**Seed dependency:** Yes — 9 World Cup gameweeks seeded  
**Notes:** `gameweeks.deadline_at` is the cut-off for fantasy changes. `fixtures` references `gameweeks` via `gameweek_id` FK.

---

### 10. `20260609150000_add_competition_format_and_stages`

**Story:** Competition Format Hardening Pass  
**Tables created:** `stages`, `groups`, `group_memberships`  
**Enums created:** `CompetitionFormat` (LEAGUE, CUP, TOURNAMENT, HYBRID), `StageType` (LEAGUE, GROUP, KNOCKOUT, FINAL, PLAYOFF)  
**Seed dependency:** Yes — 7 WC stages and 12 groups seeded  
**Notes:** `fixtures` gained `stage_id` and `group_id` foreign keys. Enables tournament bracket and group stage modelling.

---

### 11. `20260609160000_add_competition_season_management`

**Story:** STORY-08 — Competition & Season Management  
**Changes:** Added `SeasonStatus` enum, status column to `seasons`, `activation` tracking  
**Enums created:** `SeasonStatus` (UPCOMING, ACTIVE, COMPLETED, ARCHIVED)  
**Seed dependency:** Yes — season status is set during seed  
**Notes:** Only one season per competition can be `ACTIVE` at any time — enforced by `activateSeason()` transaction.

---

### 12. `20260609170000_add_competition_import_jobs`

**Story:** STORY-09 — Competition Import  
**Tables created:** `competition_import_jobs`, `import_job_items`  
**Enums created:** `CompetitionImportStatus` (PENDING_REVIEW, COMMITTED, FAILED, CANCELLED)  
**Seed dependency:** No  
**Notes:** `competition_import_jobs.payload` is JSON — stores the full import data. `import_job_items` tracks per-entity status within a job.

---

### 13. `20260609180000_add_fixture_assignment_status`

**Story:** STORY-10 — Fixture & Gameweek Assignment  
**Changes:** Added `assignment_status`, `assignment_source`, `assigned_at` columns to `fixtures`  
**Seed dependency:** Yes — fixtures are assigned to gameweeks in the seed script  
**Notes:** `assignment_status` values: UNASSIGNED, ASSIGNED_TO_GAMEWEEK, ASSIGNED_TO_STAGE, FULLY_ASSIGNED.

---

### 14. `20260609190000_add_prediction_void_status`

**Story:** STORY-11 — Prediction Lock & Settle  
**Changes:** Added `VOID` value to `PredictionStatus` enum  
**Seed dependency:** No  
**Notes:** `VOID` status is used when a fixture is postponed/cancelled. No points awarded or deducted for voided predictions.

---

### 15. `20260610000000_add_fantasy_rules_engine`

**Story:** STORY-13 / STORY-12 — Fantasy chips and rules  
**Enums created:** `FantasyChipType` (BENCH_BOOST, FREE_HIT, TRIPLE_CAPTAIN, WILDCARD), `FantasyChipStatus` (AVAILABLE, ACTIVE, USED, CANCELLED, EXPIRED)  
**Changes:** `fantasy_chips` table finalized with chip type and status  
**Seed dependency:** No  

---

### 16. `20260610000001_add_fantasy_rules_config`

**Story:** STORY-14 — Fantasy Rules Admin Config  
**Tables created:** `fantasy_rules_configs`  
**Seed dependency:** No (config is created by admin; defaults used if absent)  
**Notes:** Unique constraint on `season_id`. `scoring_weights` column is JSON — stores per-action point values. All fantasy services read this config.

---

### 17. `20260610000002_fantasy_leagues_v2`

**Story:** STORY-15 — Fantasy Leagues & Cups  
**Tables created:** `fantasy_leagues`, `fantasy_league_memberships`, `fantasy_cups`, `fantasy_cup_matches`  
**Enums created:** `FantasyLeagueType` (PRIVATE, PUBLIC, GLOBAL), `FantasyLeagueMemberRole` (OWNER, MEMBER), `FantasyCupStatus`  
**Seed dependency:** No  
**Notes:** `fantasy_leagues` has a unique `invite_code` for private leagues. Global leagues are created once per season.

---

### 18. `20260610000004_fantasy_gameweek_scoring`

**Story:** STORY-16 — Fantasy Scoring & History  
**Tables created:** `fantasy_gameweek_scores`  
**Seed dependency:** No  
**Notes:** Unique constraint on `(fantasy_team_id, gameweek_id)`. `autosub_count` and `chip_used` fields capture gameweek-specific context. Rank is updated after all teams in a season are scored.

---

### 19. `20260610000005_live_match_dashboard`

**Story:** STORY-17 — Live Match Dashboard  
**Changes:** Additional columns to `match_states` for live dashboard data (possession, shots, corners, etc.)  
**Seed dependency:** No  
**Notes:** Live state columns default to 0. Populated by admin score/event push or future sports data provider.

---

### 20. `20260610000006_fantasy_auto_substitution`

**Story:** STORY-18 — Fantasy Auto-Substitution  
**Tables created:** `fantasy_auto_substitutions`  
**Enums created:** `FantasyAutoSubstitutionStatus` (APPLIED, SKIPPED_NO_ELIGIBLE_SUB, SKIPPED_FORMATION_INVALID, SKIPPED_BENCH_PLAYER_DID_NOT_PLAY, SKIPPED_GOALKEEPER_ONLY, SKIPPED_STARTER_PLAYED)  
**Seed dependency:** No  
**Notes:** Records are created for every evaluated substitution — both applied and skipped — so the audit trail is complete.

---

### 21. `20260610000007_fan_value_ledger_v2`

**Story:** STORY-19 — Fan Value Ledger  
**Tables created:** `fan_value_ledger`  
**Enums created:** `FanValueSourceType`, `FanValueType`, `FanValueTransactionType`  
**Seed dependency:** No  
**Notes:** Append-only ledger pattern. `void` entries are negative offsets, never deletions. `fan_profiles.fan_value_total` is a denormalized summary kept in sync.

---

### 22. `20260610000008_achievements_badges`

**Story:** STORY-20 — Achievements & Badges  
**Tables created:** `achievement_definitions`, `badges`, `fan_achievements`, `fan_badges`  
**Enums created:** `AchievementCategory`, `AchievementTriggerType`, `BadgeRarity` (COMMON, UNCOMMON, RARE, EPIC, LEGENDARY)  
**Seed dependency:** Yes — 17 achievement definitions and linked badges seeded  
**Notes:** `achievement_definitions.criteria` is JSON for flexible rule definition. `badges` links to `achievement_definitions` via optional FK.

---

### 23. `20260611000001_rewards_readiness`

**Story:** STORY-21 — Rewards Readiness  
**Tables created:** `reward_readiness_definitions`, `fan_reward_readiness`  
**Enums created:** `RewardReadinessStatus` (ELIGIBLE, INELIGIBLE, PENDING_EVALUATION), `RewardReadinessCategory`  
**Seed dependency:** Yes — 6 reward readiness definitions seeded  
**Notes:** `fan_reward_readiness` has a unique constraint on `(fan_id, definition_id)`. Eligibility metadata is stored as JSON for full criteria context.

---

### 24. `20260611000002_notifications`

**Story:** STORY-22 — Notifications & Alerts  
**Tables created:** `notifications`, `notification_preferences`, `notification_delivery_logs`  
**Enums created:** `NotificationType`, `NotificationStatus` (UNREAD, READ, ARCHIVED), `NotificationDeliveryChannel` (IN_APP), `NotificationDeliveryStatus` (PENDING, DELIVERED, FAILED)  
**Seed dependency:** No  
**Notes:** `notification_preferences` has a unique constraint on `(user_id, type)`. `notification_delivery_logs` tracks each delivery attempt per channel. Sprint 1 uses `IN_APP` channel only.

---

### 25. `20260611000003_activity_feed`

**Story:** STORY-23 — Social Activity Feed  
**Tables created:** `activity_items`, `activity_reactions`  
**Enums created:** `ActivityFeedType`, `ActivityVisibility` (PUBLIC, PRIVATE, ADMIN_ONLY), `ActivityStatus` (ACTIVE, HIDDEN, ARCHIVED), `ReactionType` (LIKE, FIRE, SHOCK, TROPHY, HEART)  
**Seed dependency:** No  
**Notes:** `activity_reactions` has a unique constraint on `(activity_item_id, user_id, reaction_type)` — one reaction per type per user per item. `activity_items.content` is JSON for flexible activity metadata.

---

### 26. (No new migration — STORY-24)

**Story:** STORY-24 — Admin Command Centre  
**Changes:** None — admin dashboard is aggregation-only, no new tables or enums  
**Seed dependency:** No  
**Notes:** The admin dashboard reads existing tables via Prisma `count()`, `groupBy()`, and `aggregate()`. No schema changes were required.

---

### 27. `20260611000004_club_experience`

**Story:** STORY-26 — PSL Club, Squad, Season & Club Experience Readiness  
**Tables created:** `season_teams`, `club_profiles`, `club_content_items`, `club_shop_products`, `club_experience_statuses`, `season_squad_registrations`  
**Enums created:** `SeasonTeamStatus` (ACTIVE, PROVISIONAL, PROMOTED, RELEGATED, WITHDRAWN, NEEDS_REVIEW), `SeasonTeamSource` (MANUAL, IMPORT, OFFICIAL, PLACEHOLDER), `ClubProfileStatus` (DRAFT, READY, PUBLISHED), `ClubContentType` (NEWS, VIDEO, ANNOUNCEMENT), `ClubContentStatus` (DRAFT, PUBLISHED, ARCHIVED), `ShopProductCategory` (HOME_KIT, AWAY_KIT, THIRD_KIT, TRAINING_WEAR, LIFESTYLE, ACCESSORIES, SOUVENIRS, KIDS), `ShopProductAvailability` (COMING_SOON, AVAILABLE_SOON, UNAVAILABLE), `ShopProductStatus` (DRAFT, PUBLISHED, ARCHIVED), `ShopCommerceStatus` (CATALOGUE_ONLY, COMMERCE_READY_FOR_SPRINT_3), `SquadRegistrationStatus` (PROVISIONAL, CONFIRMED, NEEDS_REVIEW, REMOVED), `SquadRegistrationSource` (MANUAL, IMPORT, OFFICIAL, PLACEHOLDER)  
**Seed dependency:** Yes — seed adds 16 PSL clubs, 14 unique venues, 16 SeasonTeam records, 8 placeholder shop products per club, ClubProfile, ClubContentItem, and ClubExperienceStatus per club  
**Notes:** `season_teams` has a unique constraint on `(season_id, team_id)`. `club_profiles` has a unique constraint on `team_id`. `season_squad_registrations` has a unique constraint on `(season_id, player_id)`. `club_shop_products` uses `ShopCommerceStatus.CATALOGUE_ONLY` for MVP — no checkout. `Player.teamId` is non-nullable; "unassigned" is represented by absence of a `season_squad_registrations` record rather than null FK.

---

## Seed Data Ordering

The seed script (`apps/api/prisma/seed.ts`) must execute in this order to satisfy FK constraints:

1. Create admin user and fan users (`users` table)
2. Create fan profiles (`fan_profiles`)
3. Create competition (`competitions`)
4. Create season (`seasons`)
5. Create teams (`teams`)
6. Create players (`players` → requires `teams`)
7. Create stages (`stages` → requires `seasons`)
8. Create groups (`groups` → requires `stages`)
9. Create gameweeks (`gameweeks` → requires `seasons`)
10. Create fixtures (`fixtures` → requires `seasons`, `teams`, `stages`, `gameweeks`)
11. Create group memberships (`group_memberships` → requires `groups`, `teams`)
12. Create standings (`standings` → requires `seasons`, `teams`)
13. Create achievement definitions + badges (`achievement_definitions`, `badges`)
14. Create reward readiness definitions (`reward_readiness_definitions`)
15. Create PSL venues (`venues`)
16. Create season participation records (`season_teams` → requires `seasons`, `teams`)
17. Create club profiles (`club_profiles` → requires `teams`)
18. Create club content items (`club_content_items` → requires `teams`)
19. Create shop products (`club_shop_products` → requires `teams`)
20. Create season squad registrations (`season_squad_registrations` → requires `seasons`, `players`)
21. Create club experience statuses (`club_experience_statuses` → requires `teams`)

**Note:** `match_stats` requires fixtures to exist (FK on `fixture_id`). If seeding match stats, do so after fixtures are created.

---

## Key FK Constraints

| Child table | FK column | Parent table |
|------------|-----------|-------------|
| `fan_profiles` | `user_id` | `users` |
| `players` | `team_id` | `teams` |
| `fixtures` | `season_id`, `home_team_id`, `away_team_id` | `seasons`, `teams` |
| `fixtures` | `gameweek_id`, `stage_id` | `gameweeks`, `stages` |
| `fantasy_teams` | `user_id`, `season_id` | `users`, `seasons` |
| `fantasy_team_players` | `fantasy_team_id`, `player_id` | `fantasy_teams`, `players` |
| `score_predictions` | `user_id`, `fixture_id` | `users`, `fixtures` |
| `fan_achievements` | `fan_id`, `achievement_definition_id` | `fan_profiles`, `achievement_definitions` |
| `fan_reward_readiness` | `fan_id`, `definition_id` | `fan_profiles`, `reward_readiness_definitions` |
| `activity_reactions` | `activity_item_id`, `user_id` | `activity_items`, `users` |
| `season_teams` | `season_id`, `team_id` | `seasons`, `teams` |
| `club_profiles` | `team_id` | `teams` |
| `club_content_items` | `team_id` | `teams` |
| `club_shop_products` | `team_id` | `teams` |
| `club_experience_statuses` | `team_id` | `teams` |
| `season_squad_registrations` | `season_id`, `player_id`, `team_id` | `seasons`, `players`, `teams` |

## Migration 20260611000005 — Fixture Import (STORY-27)

**File:** `apps/api/prisma/migrations/20260611000005_fixture_import/migration.sql`

### Changes

- `fixtures.is_published BOOLEAN NOT NULL DEFAULT true` — WC2026 fixtures default published; PSL import fixtures start unpublished
- New table `fixture_import_batches` — staging container for a set of imported fixtures (status pipeline: DRAFT → VALIDATING → VALIDATED/FAILED_VALIDATION → COMMITTED → PUBLISHED/REJECTED)
- New table `fixture_import_rows` — one row per fixture record in a batch; tracks raw input, resolved IDs, validation errors/warnings as JSONB
- New enums: `FixtureImportBatchStatus`, `FixtureImportRowStatus`, `FixtureImportSource`

### FK Constraints Added

| Child table | FK column | Parent table |
|------------|-----------|-------------|
| `fixture_import_batches` | `season_id` | `seasons` |
| `fixture_import_rows` | `batch_id` | `fixture_import_batches` |
| `fixture_import_rows` | `fixture_id` | `fixtures` |
| `fixture_import_rows` | `home_team_id`, `away_team_id` | `teams` |
| `fixture_import_rows` | `venue_id` | `venues` |
| `fixture_import_rows` | `gameweek_id` | `gameweeks` |

## Migration 20260611000006 — Season Switch Audit (STORY-28)

**File:** `apps/api/prisma/migrations/20260611000006_season_switch_audit/migration.sql`  
**Applied:** 2026-06-11 (local dev via `prisma migrate resolve --applied`)

**Adds:**
- Enum `SeasonSwitchAction`: `PREVIEW`, `ACTIVATE`, `COMPLETE`, `ROLLBACK`
- Enum `SeasonSwitchStatus`: `SUCCESS`, `BLOCKED`, `FAILED`
- Table `season_switch_audits`: id, from_season_id (nullable), to_season_id, action, status, performed_by_user_id (nullable), blockers_json (JSONB), warnings_json (JSONB), summary_json (JSONB), created_at
- Index on `to_season_id`
- Index on `created_at DESC`

**Purpose:** Immutable audit trail for every season switch action. Used by `SeasonSwitchingService` to record PREVIEW, ACTIVATE, COMPLETE, ROLLBACK events with full blocker/warning context.

## STORY-29 — No New Migration

**Reason:** All required models already existed: `FantasyRulesConfig`, `FantasyPlayerPrice`, `FantasyPlayerPriceHistory`, `SeasonSquadRegistration`.

**Seed additions only:**
- 96 provisional `Player` records (`source: 'PSL_PLACEHOLDER'`, `Player.externalId` is non-unique — seed uses `findFirst + create` pattern)
- 1 `FantasyRulesConfig` for PSL season (`halfwayGameweek: 15`, `seasonGameweekCount: 30`)
- 96 `FantasyPlayerPrice` records (provisional price bands, idempotent `update: {}`)
- 96 `SeasonSquadRegistration` records (`status: PROVISIONAL`, `source: PLACEHOLDER`, idempotent `update: {}`)

## Migration `20260612000001_prediction_rules_config` (STORY-30)

**Applied:** 2026-06-12 (local dev via `prisma migrate deploy`)

**Adds:**
- Enum `prediction_rules_status`: `PROVISIONAL`, `ACTIVE`
- Table `prediction_rules_configs`: id, season_id (UNIQUE FK → seasons), correct_score_points (default 10), correct_goal_difference_points (default 5), correct_result_points (default 3), participation_points (default 0), challenge_win_points (default 0), challenge_draw_points (default 0), lock_minutes_before_kickoff (default 0), status, created_at, updated_at

**Seed additions:**
- 1 `PredictionRulesConfig` for PSL season (PROVISIONAL, 10/5/3/0 scoring — matches existing `calculatePoints()` function)

## No Migration — STORY-31 (Gameweek & Matchday Operations Readiness)

**No schema changes.** The `Gameweek` model already contains all required fields (`transferDeadlineAt`, `predictionDeadlineAt`, `status`, `round`, `name`, `seasonId`). The `GameweekOperationsModule` is a thin orchestration layer that computes operational status at request time from existing models — no new tables, columns, or enums were added.

**No seed additions required.** All data is derived from existing `Gameweek`, `Fixture`, `FantasyRulesConfig`, and `PredictionRulesConfig` records.

**Purpose:** Per-season prediction calibration record. Enables season switching readiness to check prediction rules are configured. Does not change the scoring engine (`scoring.ts` remains hardcoded at 10/5/3/0 for compatibility). Admins can promote to ACTIVE once PSL season is confirmed.

## Migration 20260612000002 — STORY-32 (Admin Operations Control Plane)

**File:** `apps/api/prisma/migrations/20260612000002_integration_provider_config/migration.sql`

**Adds:**
- Enum `integration_provider_type`: `WALLET`, `PAYMENT`, `CHECKOUT`, `TICKETING`, `LIVE_DATA`, `SPONSOR_ACTIVATION`, `REWARDS_REDEMPTION`, `NOTIFICATIONS`, `ANALYTICS`
- Enum `integration_provider_mode`: `MOCK`, `SANDBOX`, `PRODUCTION`
- Enum `integration_provider_status`: `NOT_CONFIGURED`, `PROVIDER_REQUIRED`, `CONTRACT_REQUIRED`, `COMPLIANCE_REQUIRED`, `SANDBOX_READY`, `INTEGRATION_READY`, `PRODUCTION_DISABLED`, `ENABLED`
- Table `integration_provider_configs`: id, provider_type, provider_key (UNIQUE), display_name, mode (default MOCK), status (default NOT_CONFIGURED), is_enabled (default false), is_production_enabled (default false), requires_compliance_approval (default false), requires_contract_approval (default false), last_health_check_at, notes, created_at, updated_at

**Seed additions:**
- 9 `IntegrationProviderConfig` entries (all production-disabled): wallet-default (SANDBOX_READY), payment-default (PROVIDER_REQUIRED), checkout-default (PRODUCTION_DISABLED), ticketing-default (PROVIDER_REQUIRED), live-data-default (PROVIDER_REQUIRED), sponsor-activation-default (INTEGRATION_READY), rewards-redemption-default (COMPLIANCE_REQUIRED), notifications-default (SANDBOX_READY), analytics-default (SANDBOX_READY)

**Safety note:** No secrets, API keys, credentials, tokens, or private keys stored. Non-sensitive readiness state only.

---

## Migration — STORY-33 (PSL Leaderboards & Fan Value Season Scope)

**No new migration.** STORY-33 confirmed that:
- `FanValueLedger.seasonId` already exists as a nullable column (added in STORY-19). No backfill applied. No forced reassignment of World Cup beta records.
- `PredictionPointsLedger` derives season scope from `fixture.seasonId` via `findMany()` (Prisma limitation prevents `groupBy()` with relation filters).
- `FantasyGameweekScore.seasonId` is a required column — always fully season-scoped.
- `FanAchievement` has no `seasonId` — intentionally global (achievements unlock once, cross-season by design).

Unscoped legacy entries (null `seasonId` on `FanValueLedger`) are admin-visible only and not surfaced in fan-facing season leaderboards.

---

## Migration — STORY-34 (PSL Player Stats & Match Performance)

**File:** `20260612000004_player_match_stats`

**New enums:**
- `player_match_stats_source`: `MANUAL`, `IMPORTED`, `PROVIDER`, `SYSTEM_DERIVED`
- `player_match_stats_status`: `DRAFT`, `VERIFIED`, `PUBLISHED`, `LOCKED`

**New table `player_match_stats`:** id, player_id (FK→players), fixture_id (FK→fixtures), team_id (FK→teams, nullable), season_id (FK→seasons), gameweek_id (FK→gameweeks, nullable), status (default DRAFT), source (default MANUAL), minutes_played, goals, assists, own_goals, yellow_cards, red_cards, penalties_missed, penalties_saved, saves, goals_conceded, clean_sheet, started, came_on_minute, subbed_off_minute, shots_on_target, shots_total, key_passes, tackles_won, interceptions, blocked_shots, aerial_duels_won, distance_run (float), pass_accuracy (float), dribble_success (float), rating (float), did_not_play, provider_stat_id, notes, verified_at, verified_by_user_id, published_at, created_at, updated_at

**Unique constraint:** `(player_id, fixture_id)` — one authoritative stat entry per player per fixture.

**Relation names (to avoid collision with FantasyPlayerMatchStat):**
- Player→PlayerMatchStats: `playerStats` (existing `matchStats` = FantasyPlayerMatchStat)
- Team→PlayerMatchStats: `statsEntries` (existing `playerMatchStats` = FantasyPlayerMatchStat)
- Fixture→PlayerMatchStats: `playerMatchStats` (existing `fantasyMatchStats` = FantasyPlayerMatchStat)
- Season→PlayerMatchStats: `playerMatchStats`
- Gameweek→PlayerMatchStats: `playerMatchStats`

**Purpose:** Authoritative production player match statistics, separate from fantasy-scoring-specific `FantasyPlayerMatchStat`. Supports status lifecycle (DRAFT→VERIFIED→PUBLISHED→LOCKED), manual entry, provider readiness, and season-scoped queries.

---

## Migration — STORY-35 (Beta Feedback, Bug Fixes & UX Polish)

**File:** `20260612000005_admin_audit_log_and_beta_indexes`

**New table `admin_audit_logs`:** id (uuid), actor_user_id (nullable text), actor_role (nullable text), action (text), entity_type (text), entity_id (nullable text), route (nullable text), metadata (json), created_at (timestamp)

**No FK to users table** — intentional. Audit log must be immutable and retain history even if the acting user is later deleted. Append-only by design.

**Performance indexes added:**
- `fixtures`: `(season_id, status, is_published)`, `(season_id, kickoff_at)`
- `score_predictions`: `(user_id, status)`, `(fixture_id, status)`
- `prediction_points_ledger`: `(user_id)`
- `fantasy_gameweek_scores`: `(season_id, user_id)`, `(season_id, gameweek_id)`
- `fan_value_ledger`: `(user_id, season_id)`
- `player_match_stats`: `(season_id, status)`, `(player_id, season_id)`
- `admin_audit_logs`: `(actor_user_id)`, `(entity_type, entity_id)`, `(created_at DESC)`, `(action)`

**Audit log writes:** `PlayerStatsService.adminPublishStat()` and `adminLockStat()` now write to `admin_audit_logs` after each lifecycle transition. Actor identity passed from controller via optional `actorUserId` parameter.

**Purpose:** Foundation for cross-domain admin audit trail; performance indexing for 2M-fan scale on high-volume query paths.

---

## Migration — STORY-36 (Squad Import, Player Price Finalisation & Activation Dry Run)

**File:** `20260612000006_squad_import_price_calibration`

**New enums:**
- `squad_import_batch_status`: DRAFT | VALIDATED | HAS_WARNINGS | BLOCKED | IMPORTED | PUBLISHED | CANCELLED
- `squad_import_batch_source_type`: MANUAL | CSV_UPLOAD | OFFICIAL_API | PLACEHOLDER
- `squad_import_row_validation_status`: PENDING | VALID | WARNING | BLOCKED | IMPORTED
- `fantasy_price_calibration_batch_status`: DRAFT | VALIDATED | HAS_WARNINGS | PUBLISHED | CANCELLED

**Altered table `fantasy_rules_configs`:** Added 3 columns:
- `min_price INT DEFAULT 40` — minimum allowed fantasy price
- `max_price INT DEFAULT 200` — maximum allowed fantasy price
- `default_price INT DEFAULT 55` — default price applied via bulk-apply-defaults

Existing rows get defaults via `DEFAULT` constraint. No backfill required.

**New table `squad_import_batches`:** id (uuid), season_id (FK→seasons), source_type (enum), status (enum), notes (text nullable), total_rows (int), valid_rows (int), warning_rows (int), blocked_rows (int), imported_rows (int), published_rows (int), created_by_user_id (text nullable), validated_at (timestamp nullable), imported_at (timestamp nullable), published_at (timestamp nullable), cancelled_at (timestamp nullable), created_at, updated_at

Indexes: `(season_id)`, `(status)`, `(season_id, status)`, `(created_at DESC)`

**New table `squad_import_rows`:** id (uuid), batch_id (FK→squad_import_batches CASCADE), row_number (int), season_id (FK→seasons), team_id (text nullable), proposed_player_name (text), proposed_display_name (text nullable), proposed_position (text), proposed_shirt_number (int nullable), proposed_nationality (text nullable), proposed_date_of_birth (timestamp nullable), proposed_fantasy_price (int nullable), raw_data (json), validation_status (enum), validation_messages (json nullable), is_importable (bool nullable), matched_player_id (text nullable), imported_player_id (text nullable), imported_registration_id (text nullable), duplicate_player_ids (json nullable), created_at, updated_at

Indexes: `(batch_id)`, `(validation_status)`, `(matched_player_id)`, `(season_id)`, `(team_id)`, `(batch_id, validation_status)`

**New table `fantasy_price_calibration_batches`:** id (uuid), season_id (FK→seasons), status (enum), min_price (int), max_price (int), default_price (int), missing_price_count (int), invalid_price_count (int), calibrated_player_count (int), published_player_count (int), created_by_user_id (text nullable), validated_at (timestamp nullable), published_at (timestamp nullable), created_at, updated_at

Indexes: `(season_id)`, `(status)`, `(season_id, status)`, `(created_at DESC)`

**Season model additions:** `squadImportBatches`, `squadImportRows`, `fantasyPriceCalibrationBatches` relation arrays.

**Purpose:** Squad import lifecycle with full validation and idempotent import. Fantasy price calibration batch tracking. Price bounds configuration on FantasyRulesConfig for season-specific price policy.

---

## Migration — STORY-37 (Media, Sponsor Campaigns & Wallet Activation Foundation)

**File:** `20260612000007_media_campaign_wallet_foundation`

**New enums (22):**
- `media_asset_type`: VIDEO, AUDIO, IMAGE, ARTICLE, LIVESTREAM, PODCAST
- `media_rights_status`: UNKNOWN, RIGHTS_REQUIRED, CLEARED, PUBLIC_DOMAIN, LICENSED, EMBARGOED
- `media_content_rating`: GENERAL, TEEN, MATURE, RESTRICTED
- `media_asset_status`: DRAFT, SCHEDULED, PUBLISHED, ARCHIVED, REMOVED
- `sponsor_status`: PROSPECT, ACTIVE, PAUSED, EXPIRED, BLACKLISTED
- `campaign_status`: DRAFT, PENDING_APPROVAL, APPROVED, PUBLISHED, PAUSED, COMPLETED, ARCHIVED
- `campaign_audience_type`: ALL_FANS, CLUB_FANS, PREMIUM_FANS, TARGETED
- `campaign_action_type`: WATCH_VIDEO, CLICK_CTA, SHARE_CONTENT, PREDICT_MATCH, SCAN_QR, ANSWER_QUIZ, REGISTER, FOLLOW_CLUB
- `action_validation_status`: PENDING, VALID, INVALID, MANUAL_REVIEW, EXPIRED
- `fan_campaign_participation_status`: STARTED, IN_PROGRESS, COMPLETED, REWARDED, DISQUALIFIED, EXPIRED
- `campaign_reward_type`: FAN_VALUE_POINTS, DIGITAL_VOUCHER, PHYSICAL_PRIZE, EXPERIENCE, EXCLUSIVE_CONTENT, BADGE
- `fan_reward_status`: ISSUED, CLAIMED, REDEEMED, EXPIRED, CANCELLED
- `wallet_provider_status`: SANDBOX, STAGING, PRODUCTION, DEPRECATED
- `wallet_link_status`: PENDING, LINKED, UNLINKED, SUSPENDED, FAILED
- `wallet_transaction_type`: DEPOSIT, WITHDRAWAL, REWARD_CREDIT, REWARD_DEBIT, ADJUSTMENT, FEE
- `wallet_transaction_status`: PENDING, COMPLETED, FAILED, REVERSED
- `campaign_analytics_status`: PENDING, PROCESSING, READY, ERROR
- `FanValueSourceType` extension: added `CAMPAIGN_REWARD`, `WALLET_BONUS`
- `FanValueType` extension: added `CAMPAIGN_EARN`, `WALLET_EARN`
- `NotificationType` extension: added `CAMPAIGN_STARTED`, `REWARD_ISSUED`, `WALLET_LINKED`
- `ActivityFeedType` extension: added `CAMPAIGN_JOINED`, `REWARD_EARNED`

**New tables (13):**
1. `media_assets` — id, title, slug, type, rights_status, content_rating, status, club_id (FK nullable), season_id (FK nullable), tags (json), view_count, completion_count, admin_audit fields
2. `media_asset_engagements` — fan_id, media_asset_id, viewed_at, completed_at; unique(fan_id, media_asset_id)
3. `sponsor_profiles` — id, name, slug, status, logo_url, website_url, primary_contact (admin-only fields), notes
4. `sponsor_campaigns` — id, title, slug, sponsor_id (FK), status, audience_type, starts_at, ends_at, fan_value_points_per_completion, requires_wallet_linked, requires_age_confirmation, max_participations_per_fan, targeting_rules (admin-only json)
5. `campaign_actions` — id, campaign_id (FK), action_type, title, description, is_required, order, config (json)
6. `fan_campaign_participations` — id, campaign_id (FK), fan_user_id, status, completed_at; unique(campaign_id, fan_user_id)
7. `fan_campaign_action_completions` — id, participation_id (FK), campaign_action_id (FK), fan_user_id, validation_status, idempotency_key (unique), metadata (json); unique(participation_id, campaign_action_id)
8. `campaign_reward_definitions` — id, campaign_id (FK), reward_type, title, description, value_json, inventory_limit (nullable), inventory_used, is_active
9. `fan_campaign_rewards` — id, campaign_id (FK), participation_id (FK), fan_user_id, reward_definition_id (FK), reward_type, status, idempotency_key (unique), expires_at, redemption_ref, metadata (json)
10. `wallet_providers` — id, slug (unique), name, status, config_json, sandbox_config_json
11. `fan_wallet_links` — id, fan_user_id, provider_id (FK), status, provider_ref (unique per provider), linked_at, unlinked_at; unique(fan_user_id, provider_id)
12. `fan_wallet_transactions` — id, fan_user_id, link_id (FK), transaction_type, status, amount_points, idempotency_key (unique), provider_tx_ref, metadata (json)
13. `campaign_analytics_snapshots` — id, campaign_id (FK unique), status, participant_count, completion_count, reward_count, conversion_rate (float), avg_actions_per_fan (float), snapshot_date, recalculated_at

**ALTER TYPE additions:**
- `FanValueSourceType`: + CAMPAIGN_REWARD, WALLET_BONUS
- `FanValueType`: + CAMPAIGN_EARN, WALLET_EARN
- `NotificationType`: + CAMPAIGN_STARTED, REWARD_ISSUED, WALLET_LINKED
- `ActivityFeedType`: + CAMPAIGN_JOINED, REWARD_EARNED

**Key constraints:**
- `fan_campaign_participations.@@unique([campaign_id, fan_user_id])` — one participation record per fan per campaign (MVP max = 1)
- `fan_wallet_links.@@unique([fan_user_id, provider_id])` — one link per fan per provider
- `fan_campaign_action_completions.idempotency_key` — global idempotency across all completions
- `fan_campaign_rewards.idempotency_key` — global idempotency across all rewards

**Purpose:** Foundation for media asset management (rights-aware), sponsor profile management, campaign lifecycle with action completion and reward issuance, wallet sandbox integration (no real funds held), and campaign analytics. All wallet operations are sandbox-only; no production financial transactions.
