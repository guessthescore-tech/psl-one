# PSL One — Platform Overview

> **Historical Implementation Record** — This document was created during Sprint delivery as a working reference. It may be superseded by content in `docs/architecture/`, `docs/engineering/`, `docs/reference/`, or `docs/domain/`. Do not use as the canonical source for system behaviour.


**Version:** Sprint 2 — STORY-35 complete  
**Date:** 2026-06-12

---

## 1. Product Vision

PSL One is the Digital Operating System of South African Football. It is the official digital home for PSL fans — giving them a place to follow their teams, compete in fantasy football, predict match scores, challenge friends, earn achievements, and engage with the South African football community.

The platform is designed to scale to 2 million concurrent fans and is built on domain-driven, event-driven microservice-ready architecture on AWS.

---

## 2. Sprint 1 Outcome

Sprint 1 delivered the complete fan engagement foundation using World Cup 2026 data for beta validation. By the time the PSL season begins after the World Cup, the platform will be calibrated for the PSL operating model (Sprint 2) and deployed to production with commerce enabled (Sprint 3).

Sprint 1 produced:
- 26 Prisma migrations covering the full data model
- 17 NestJS bounded context modules
- 812 API tests
- 27 fan-facing feature areas
- 58+ admin operational routes
- 108+ web pages (fan + admin)
- Full admin command centre

Sprint 2 (through STORY-36) added:
- Season-scoped leaderboards (Fan Value, Fantasy, Predictions, Achievements) — WC/PSL data isolation
- Admin Engagement Metrics module — 10 routes, season scope audit, activation impact
- Player Match Stats module — authoritative production stats, DRAFT→VERIFIED→PUBLISHED→LOCKED lifecycle
- 11th season-switching readiness check (player stats pipeline)
- Beta Feedback module — computed admin overview, known issues, UX checklist, release notes
- AdminAuditLog model — append-only cross-domain audit trail foundation (no FK to users)
- Performance indexes on 6 high-volume tables for 2M-fan scale
- Auth centralisation — `getBetaToken()` replaces all `dev-token` placeholders across 34 web pages
- Squad Import module — full batch lifecycle (DRAFT→VALIDATED→IMPORTED→PUBLISHED), duplicate detection, idempotent player create/find, SeasonSquadRegistration PROVISIONAL→CONFIRMED
- Fantasy Price Calibration module — bounds-validated price workflow, bulk defaults, FantasyPriceCalibrationBatch lifecycle, `pricesHaveNoCashValue: true` safety flag
- 12th + 13th season-switching readiness checks (squad import, price calibration)
- Activation dry-run pattern — read-only simulation with safety confirmations, no state changes
- FantasyRulesConfig extended with `minPrice`, `maxPrice`, `defaultPrice` bounds
- 1293 API tests passing (up from 812)

---

## 3. User Roles

| Role | Description | Access |
|------|-------------|--------|
| `FAN` | Registered fan user | Fan-facing features: fantasy, predictions, profile, notifications, activity |
| `PSL_ADMIN` | Platform administrator | All fan routes + all admin routes |
| (unauthenticated) | Browse only | Public read routes: competitions, teams, fixtures, standings |

Roles are stored in the `User` model as a string array. `RolesGuard` checks roles via JWT claims. Class-level `@Roles()` decorators on controllers protect entire route groups.

---

## 4. Domain Map

```
PSL One Platform
├── Identity & Auth         User, Role, JWT, password reset
├── Football Core           Competition, Season, Team, Player, Fixture, MatchState
├── Fan Profile             FanProfile, FanPreference, fan preferences
├── Gameweeks               Gameweek, GameweekStage, deadline management
├── Predictions             ScorePrediction, PredictionPointsLedger, lock/settle/void
├── Peer Challenges         PeerChallenge, head-to-head score predictions
├── Fantasy                 FantasyTeam, FantasyTeamPlayer, transfers, chips, scoring
│   ├── Fantasy Rules       FantasyRulesConfig (budget, squad size, formation, deadlines)
│   ├── Fantasy Leagues     FantasyLeague (private/public/global), cups
│   ├── Fantasy Scoring     FantasyGameweekScore, FanValueLedger scoring hooks
│   └── Auto-Substitution   FantasyAutoSubstitution, priority-based bench coverage
├── Competition Admin       CompetitionImportJob, manual seeding, FixtureAssignment
├── Fan Value               FanValueLedger, engagement scoring, non-financial
├── Achievements            AchievementDefinition, Badge, FanAchievement, FanBadge
├── Rewards Readiness       RewardReadinessDefinition, FanRewardReadiness, eligibility
├── Notifications           Notification, NotificationPreference, DeliveryLog
├── Activity Feed           ActivityItem, ActivityReaction, social feed
└── Admin Dashboard         Aggregation-only command centre, no new models
```

---

## 5. App Architecture

```
monorepo root (pnpm workspaces)
├── apps/api/               NestJS API
│   ├── src/                Bounded context modules
│   ├── prisma/schema.prisma  PostgreSQL schema
│   ├── prisma/migrations/  26 applied migrations
│   └── prisma/seed.ts      World Cup 2026 seed data
├── apps/web/               Next.js 14 App Router
│   ├── src/app/            Page components (fan + admin)
│   └── src/lib/            API client functions
├── tsconfig.base.json      Shared strict TypeScript config
└── pnpm-workspace.yaml     Workspace definition
```

**TypeScript config (strict mode):**
- `strict: true`
- `exactOptionalPropertyTypes: true`
- `noUncheckedIndexedAccess: true`
- `noImplicitOverride: true`

---

## 6. API Architecture

- **Framework:** NestJS 10
- **Port:** 4000 (local dev)
- **ORM:** Prisma 5.22 → PostgreSQL
- **Auth:** JWT (`@nestjs/jwt`), `JwtAuthGuard`, `RolesGuard`
- **Pattern:** Each bounded context = 1 NestJS Module with Service + Controller
- **RBAC:** Class-level `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles()` decoration
- **Events:** `FixtureEventPublisher` (console in Sprint 1, Kafka-ready interface)
- **Sports data:** `LiveMatchProviderInterface` adapter (provider-neutral)

Request flow:
```
Client → JwtAuthGuard (validates JWT) → RolesGuard (checks roles) → Controller → Service → Prisma → PostgreSQL
```

---

## 7. Web Architecture

- **Framework:** Next.js 14 App Router
- **Port:** 3001 (local dev)
- **Auth:** Bearer token (passed as prop from local state, dev-token placeholder)
- **Data fetching:** `use client` + `useEffect` + fetch (API client helpers in `src/lib/`)
- **Styling:** Tailwind CSS
- **State:** TanStack Query (configured, limited usage in Sprint 1)
- **Pages:** Both `'use client'` (interactive) and static pages
- **API clients:** 26 typed client modules in `apps/web/src/lib/`

---

## 8. Database Architecture

- **Engine:** PostgreSQL (local: `psl_identity_dev`)
- **ORM:** Prisma 5.22
- **Migrations:** 26 sequential migrations (`apps/api/prisma/migrations/`)
- **Schema:** `apps/api/prisma/schema.prisma`

Key schema areas:
- Identity: `User`, `Role` (string-enum)
- Football: `Competition`, `Season`, `Team`, `Player`, `Fixture`, `MatchState`, `MatchEvent`, `LineupEntry`, `MatchStats`, `Standing`, `Stage`
- Gameweeks: `Gameweek`, `GameweekStage`
- Predictions: `ScorePrediction`, `PredictionPointsLedger`
- Challenges: `PeerChallenge`
- Fantasy: `FantasyTeam`, `FantasyTeamPlayer`, `FantasyTransfer`, `FantasyChip`, `FantasyRulesConfig`, `FantasyLeague`, `FantasyLeagueMembership`, `FantasyAutoSubstitution`, `FantasyGameweekScore`
- Fan Value: `FanValueLedger`
- Achievements: `AchievementDefinition`, `Badge`, `FanAchievement`, `FanBadge`
- Rewards: `RewardReadinessDefinition`, `FanRewardReadiness`
- Notifications: `Notification`, `NotificationPreference`, `NotificationDeliveryLog`
- Activity: `ActivityItem`, `ActivityReaction`
- Admin: `CompetitionImportJob`, `ImportJobItem`

---

## 9. Auth and RBAC

**Registration flow:**
1. `POST /auth/register` → creates `User` with hashed password, assigns `FAN` role, creates `FanProfile`
2. `POST /auth/login` → returns JWT `accessToken` containing `userId`, `roles`
3. `GET /auth/me` → returns current user (no password fields)

**Role checking:**
- `JwtAuthGuard` validates signature and expiry
- `RolesGuard` checks `user.roles` array against `@Roles()` metadata
- Class-level guards cover all routes in a controller
- Fan routes: `@Roles('FAN')` or no role requirement (public read)
- Admin routes: `@Roles('PSL_ADMIN')`

**Password reset:**
- `POST /auth/password-reset/request` → generates token, returns it (email delivery is Sprint 3)
- `POST /auth/password-reset/confirm` → validates token, updates password

---

## 10. Local Development Model

```bash
# Prerequisites
# - Node.js 20+
# - pnpm 8+
# - PostgreSQL running locally (psl_identity_dev database)

# Install dependencies
pnpm install

# Apply migrations
cd apps/api && npx prisma migrate dev

# Seed World Cup 2026 data
pnpm --filter @psl-one/api db:seed

# Start API (dev mode with hot reload)
pnpm --filter @psl-one/api dev
# → API available at http://localhost:4000

# Start web (dev mode with hot reload)
pnpm --filter @psl-one/web dev
# → Web available at http://localhost:3001

# Run tests
pnpm --filter @psl-one/api test
pnpm --filter @psl-one/web test

# Type check
pnpm --filter @psl-one/api typecheck
pnpm --filter @psl-one/web typecheck
```

---

## 11. World Cup Beta Mode

The platform is seeded with World Cup 2026 data:
- 32 group stage teams + extras (48 total)
- 1200 players (25 per team average)
- 104 fixtures (group + knockout stages)
- 9 gameweeks aligned to tournament stages
- 12 groups (A–L)

Fans can build fantasy squads from WC 2026 players, make score predictions on WC fixtures, and compete with friends during the tournament. This validates all platform mechanics before the PSL season begins.

---

## 12. PSL Season Mode

After the World Cup, Sprint 2 will:
1. Import official PSL club data (existing clubs + promoted/relegated)
2. Import official PSL squad data (player transfers, new registrations)
3. Import the official PSL fixture calendar
4. Calibrate fantasy rules for PSL season (budget values, scoring weights)
5. Align gameweeks to PSL rounds (30 matchdays)
6. Prepare editorial and club content

The platform supports multiple competitions simultaneously. World Cup data can be archived; a new `ACTIVE` PSL season can be created alongside it.

**Important:** Do not hardcode team counts or round assumptions. Season-specific club participation must drive which clubs, players, and fixtures are active. Promoted and relegated clubs can be added after official confirmation.

---

## 13. Non-Financial Compliance Posture

**Fan Value** is a non-financial engagement metric. Points are awarded for platform activities (predictions, fantasy, achievements). There is no cash value, no exchange rate, and no withdrawal mechanism.

**Guess the Score** is a skill-based prediction game with no stakes, no entry fees, no payouts, and no gambling mechanics.

**Peer Challenges** are social wagering of Fan Value points only — not real money.

**Rewards Readiness** checks eligibility for sponsor-provided rewards (discounts, merchandise, experiences) — not cash payments.

No financial transactions, deposits, withdrawals, fiat currencies, cryptocurrency, betting odds, or gambling mechanics of any kind exist in the codebase.

---

## 14. Provider-Neutral Sports Data Approach

`LiveMatchProviderInterface` defines a standard contract for live match data:
- `getMatchState(fixtureId)`
- `getMatchEvents(fixtureId)`
- `getLineups(fixtureId)`
- `getPlayerStats(fixtureId)`

In Sprint 1, this interface is implemented by a stub/mock. In Sprint 2/3, a real provider (e.g., Opta, Stats Perform, Sportradar) can be wired via dependency injection without changing any service or controller code.

---

## 15. Admin Command Centre Summary

The admin command centre (`/admin/dashboard`) aggregates operational data across all domains into a single PSL_ADMIN-only dashboard.

27 GET routes under `/admin-dashboard` cover:
- Platform overview and health
- Action-required alerts
- Quick links to deep admin pages
- 11 operational sections (Guess the Score, Fantasy Rules, Fantasy League, League Management, Fixture Management, Sponsor Management, Content Moderation, Reporting, Compliance, User Audience, System Operations)
- Domain summaries (football, fans, fantasy, predictions, challenges, fan value, achievements, rewards, notifications, activity)

All queries are aggregation-only (count, groupBy, aggregate) — no new Prisma models were required.

---

## 16. Gameweek & Matchday Operations Readiness (STORY-31)

`GameweekOperationsModule` is the operational bridge between imported fixtures and fan-facing gameplay. It gives PSL_ADMIN users a full read on whether each matchday is ready to open to fans.

**15 admin API routes** under `/gameweeks/admin/operations/`:
- Season list, overview, per-gameweek status, single-gameweek detail
- Readiness, deadlines, fixture assignment, fantasy impact, prediction impact, publication readiness, activation impact, matchday control panel
- Actions: derive gameweeks, derive deadlines (MISSING_ONLY | OVERWRITE_DERIVED_ONLY), validate

**Computed operational status** (not persisted, derived at request time):
- `GameweekOperationalStatus`: DRAFT → READY_TO_REVIEW → READY_TO_PUBLISH → OPEN → LOCKED → IN_PROGRESS → FINALIZING → COMPLETE; plus NEEDS_REVIEW, HISTORICAL
- `MatchdayReadinessStatus`: READY | READY_WITH_WARNINGS | BLOCKED | IN_PROGRESS | CLOSED | HISTORICAL

Season switching now has **9 readiness checks** (matchday operations is the 9th, WARNING severity).

No new Prisma models or migrations — all status is derived from existing `Gameweek`, `Fixture`, and calibration data.

---

## 17. Future Commerce Readiness

Sprint 3 will introduce:
- **Sponsor Management:** Campaign creation, activation, fan targeting
- **Reporting Centre:** Export builder, scheduled reports
- **Compliance Workflows:** POPIA data requests, case management
- **Commerce Foundation:** Non-gambling digital goods, rewards redemption
- **Production Deployment:** AWS ECS, CloudFront, RDS, Secrets Manager
- **CI/CD Pipeline:** Automated quality gates on every PR

The platform architecture already supports these additions without breaking existing bounded contexts.

---

## Commercial Readiness (Sprint 2, STORY-32)

All commercial modules are **production-disabled by default**. The `IntegrationProviderConfig` model stores non-sensitive readiness state only — no credentials, API keys, or secrets.

| Module | Status | Notes |
|---|---|---|
| Wallet | SANDBOX_READY | Provider contract + compliance required before production |
| Payments | PROVIDER_REQUIRED | No provider selected |
| Checkout | PRODUCTION_DISABLED | Explicitly disabled; sandbox config seeded |
| Ticketing | PROVIDER_REQUIRED | Ticketing provider RFP Sprint 3+ |
| Live Data | PROVIDER_REQUIRED | LiveMatchProviderInterface ready; stub only |
| Sponsor Activation | INTEGRATION_READY | Admin shell; no live activation |
| Rewards Redemption | COMPLIANCE_REQUIRED | Eligibility engine built; provider Sprint 3+ |
| Notifications | SANDBOX_READY | Provider wiring Sprint 3+ |
| Analytics | SANDBOX_READY | DataDog/Amplitude integration Sprint 3+ |

**Gameplay Economy:** Fantasy and Guess the Score are POINTS-ONLY — no paid entry, no real-money mechanics.

**Commercial Economy:** Disabled for Sprint 2 beta. All commercial capabilities require provider contracts and/or compliance approval before production activation.

---

## STORY-38 — Live Match Intelligence & Social Prediction Gaming (Sprint 2)

**Status:** MVP Accepted  
**Tests:** 1528 API unit tests (53 files); 1 PostgreSQL concurrency integration test  
**Pages:** 319 web pages total

### What was built

**Migration integrity:**
- New compatibility migration `20260609063038_drop_old_notification_prefs` ensures clean `migrate deploy` from empty DB
- Full 37-migration replay verified on `psl_migration_proof` database

**Direct Fan-to-Fan Challenges:**
- `ChallengeMode` enum: `PUBLIC_MARKETPLACE`, `DIRECT_USER`, `FRIEND`, `PRIVATE_LEAGUE`
- `InvitationStatus` enum: `PENDING`, `ACCEPTED`, `DECLINED`, `WITHDRAWN`, `EXPIRED`
- Fully atomic acceptance in a single `$transaction`: conditional `updateMany` on listing + allocation → both must satisfy their WHERE clauses or the whole transaction rolls back
- Deterministic idempotency key: `direct-accept:${listingId}:${fanUserId}` — retry-safe
- Immutable history: decline/withdraw sets `invitationStatus` only; never re-publishes to marketplace
- 6 new fan API routes + 7 new web client functions + 5 social-challenges pages

**Campaign Trigger Engine:**
- `CampaignTriggerType` enum with 9 types
- `CampaignTriggerEvent` model with idempotency unique index
- `CampaignTriggerService` — fire-and-forget, failure-isolated, time-window-enforced
- Integrated into `MatchCentreService.adminIngestSandboxData` for match lifecycle events
- Published demo campaign `match-day-trigger-demo` seeded for local testing

**Rich Match Centre Fan Experience (10 pages):**
- `/matches` — fixture list
- `/matches/live` — auto-poll live feed
- `/matches/[fixtureId]` — overview with tab navigation
- `/matches/[fixtureId]/lineups` — team lineups
- `/matches/[fixtureId]/timeline` — event timeline
- `/matches/[fixtureId]/stats` — player match stats
- `/matches/[fixtureId]/players` — player ratings
- `/matches/[fixtureId]/fantasy` — estimated fantasy points (provisional)
- `/matches/[fixtureId]/predictions` — lock state, live score, marketplace link
- `/matches/[fixtureId]/social` — marketplace + direct challenges for fixture

**Live Match Admin Operations (11 pages):**
- `/admin/live-match` — index with LIVE/ALL filter
- `/admin/live-match/provider-readiness` — capability status
- `/admin/live-match/ingestion-batches` — audit log + sandbox ingest
- `/admin/live-match/[fixtureId]` — overview with lifecycle actions
- `/admin/live-match/[fixtureId]/readiness` — player availability + capability
- `/admin/live-match/[fixtureId]/lineups` — lineup view + confirm button
- `/admin/live-match/[fixtureId]/events` — event add/delete form
- `/admin/live-match/[fixtureId]/team-stats` — aggregated team stats
- `/admin/live-match/[fixtureId]/player-stats` — per-player stat upsert
- `/admin/live-match/[fixtureId]/fantasy-impact` — estimated impact with high-scorer summary
- `/admin/live-match/[fixtureId]/prediction-impact` — settlement status + timeline

**Safety:** All gameplay remains points-only. No financial mechanics, no live provider calls, no external API calls. `POINTS_BASED_SOCIAL_PREDICTION_COMPLIANCE` status: `INTERNAL_REVIEW_REQUIRED`.

## STORY-39 — PSL Season Activation, Frontend Showcase & Beta Launch Readiness (Sprint 2)

**Status:** MVP Accepted  
**Tests:** 1560 API unit tests (54 files)  
**Pages:** 336 web pages total (+ 17 admin beta-launch + 1 fan /beta)

### What was built

**BetaLaunchModule:**
- `BetaLaunchService` — delegates 13-check gate to existing `SeasonSwitchingService` (no duplication); activation dry-run (`dryRunOnly:true`); rollback dry-run (`rollbackWillNotBePerformed:true`); `createApproval()` → status `APPROVED` never `ACTIVATED`; `ACTIVATION_DISABLED_NOTICE` constant present in all dry-run responses
- `BetaLaunchSmokeTestService` — 24-item registry; programmatic confirmation that `activationRouteAbsent: true` and `allNonDestructive: true`
- `BetaLaunchController` — 27 routes; static routes before dynamic `:seasonId` routes (NestJS routing requirement)
- 3 new DTOs: `CreateCohortDto`, `AddCohortMemberDto`, `CreateApprovalDto`
- 3 new schema models: `BetaCohort`, `BetaCohortMember`, `SeasonActivationApproval`
- Migration `20260614000001_beta_launch_readiness` — 3 enums, 3 tables, no destructive SQL

**AdminOperations integration:**
- 8 new module readiness entries covering all beta-launch dimensions: `PSL_BETA_LAUNCH_READINESS`, `FRONTEND_BETA_READINESS`, `DATA_BETA_READINESS`, `SECURITY_BETA_READINESS`, `OPERATIONS_BETA_READINESS`, `BETA_COHORT_READINESS`, `ROLLBACK_READINESS`, `ACTIVATION_APPROVAL`

**BetaFeedback updates:**
- `completedStories`: 13 → 14
- `apiTestCount`: 1528 → 1560
- `webPageCount`: 319 → 336
- `currentVersion`: `Sprint 2 — STORY-38` → `Sprint 2 — STORY-39`
- STORY-39 release note added

**Web client & pages:**
- `apps/web/src/lib/beta-launch-client.ts` — 22 typed client functions
- 17 admin pages: `/admin/beta-launch` hub + 14 `[seasonId]/*` sub-pages + `smoke-tests`
- 1 fan page: `/beta` — cohort invite landing with points-only safety notices

**Documentation:**
- `PSL-BETA-LAUNCH-RUNBOOK.md` — 7-phase pre-launch checklist
- `PSL-BETA-ROLLBACK-RUNBOOK.md` — rollback scope, World Cup preservation guarantees
- `PSL-BETA-HYPERCARE-PLAN.md` — 14-day hypercare monitoring plan
- `PSL-BETA-FRONTEND-WALKTHROUGH.md` — 19-domain sign-off matrix
- `PSL-BETA-SMOKE-TEST-PLAN.md` — 24-item registry with safety confirmation table

**Safety:** PSL season activation has NOT been performed. `SeasonActivationApproval.approvalStatus` is `APPROVED`. `activationPerformedAt` is null. World Cup history untouched. No real-money mechanics. No external provider calls.
