# PSL One — Sprint 1 Handover

## 1. Sprint Summary

Sprint 1 delivered the complete fan platform foundation for PSL One — the Digital Operating System of South African Football. All 21 stories were implemented, tested, and accepted. The codebase is a NestJS + Next.js monorepo backed by local PostgreSQL (`psl_identity_dev`). No AWS, Terraform, production databases, or external services were touched during this sprint. All work is local-only.

---

## 2. Completed Stories

| Story | Title | Status |
|-------|-------|--------|
| Issue 0 | Monorepo Foundation | Accepted |
| STORY-01 | Fan Auth MVP | Accepted |
| STORY-02 | Football Core MVP | Accepted |
| STORY-03 | Fan Profile & Preferences MVP | Accepted |
| STORY-04 | Live Fixture Feed / Match State MVP | Accepted |
| STORY-05 | Social Predictions / Peer Challenges MVP | Accepted |
| STORY-06 | Fantasy Team MVP | Accepted |
| STORY-07 | Gameweek & Transfer Deadline MVP | Accepted |
| — | Competition Format Hardening Pass | Accepted |
| STORY-08 | Competition & Season Management MVP | Accepted |
| STORY-09 | Competition Import & Manual Seeding MVP | Accepted |
| STORY-10 | Fixture & Gameweek Assignment MVP | Accepted |
| STORY-11 | Prediction Engine: Lock & Settle MVP | Accepted |
| STORY-12 | Fantasy Deadlines & Transfer Rules MVP | Accepted |
| STORY-13 | Fantasy Chips MVP | Accepted |
| STORY-14 | Fantasy Rules Admin Configuration MVP | Accepted |
| STORY-15 | Fantasy Leagues & Cups MVP | Accepted |
| STORY-16 | Gameweek-level Fantasy Scoring & History MVP | Accepted |
| STORY-17 | Live Match Dashboard & Real-time Score Updates MVP | Accepted |
| STORY-18 | Fantasy Auto-Substitution MVP | Accepted |
| STORY-19 | Fan Value Ledger MVP | Accepted |
| STORY-20 | Achievements & Badges MVP | **Accepted** |

---

## 3. Acceptance Criteria Status

### STORY-20 — Achievements & Badges MVP

| Criterion | Status |
|-----------|--------|
| 5 enums (AchievementStatus, AchievementCategory, AchievementTriggerType, BadgeRarity, FanValueType.ACHIEVEMENT_POINTS) | Pass |
| 5 models (AchievementDefinition, BadgeDefinition, AchievementBadge, FanAchievement, FanBadge) | Pass |
| 17 achievement definitions seeded | Pass |
| 17 badge definitions seeded | Pass |
| All 13 trigger evaluators implemented (MANUAL never auto-awards) | Pass |
| AchievementsService with 20+ methods | Pass |
| Integration hooks in FantasyService, PredictionsService, FanValueLedgerService | Pass |
| API routes at `/achievements/...` and `/achievements/admin/...` | Pass |
| 3 fan web pages + 4 admin web pages | Pass |
| FanValueLedger ACHIEVEMENT_POINTS rows created on award | Pass |
| Re-award idempotency (no duplicate ledger entries) | Pass |
| FAN receives 403 on admin routes | Pass |
| PSL_ADMIN can award/revoke | Pass |
| 604 API tests passing, 8 web tests passing | Pass |
| db:seed, typecheck, test, build — API + web | Pass |

---

## 4. Key Files Changed (STORY-20)

```
apps/api/src/achievements/
  achievements.controller.ts   — @Controller('achievements'), JWT+RBAC guards, 20 routes
  achievements.module.ts       — imports AuthModule, PrismaModule, FanValueModule
  achievements.service.ts      — 20+ methods, 13 trigger evaluators, FanValueLedger integration
  achievements.service.spec.ts — 42 tests
  achievements.controller.spec.ts — 20 tests (RolesGuard + dispatch)

apps/web/src/lib/achievements-client.ts — achievementsClient object, JWT Bearer auth
apps/web/src/app/achievements/page.tsx
apps/web/src/app/achievements/badges/page.tsx
apps/web/src/app/achievements/progress/page.tsx
apps/web/src/app/admin/achievements/page.tsx
apps/web/src/app/admin/achievements/definitions/page.tsx
apps/web/src/app/admin/achievements/badges/page.tsx
apps/web/src/app/admin/achievements/users/[userId]/page.tsx
```

---

## 5. Database Changes

All changes applied via Prisma migrations to local PostgreSQL (`psl_identity_dev`). No production database was touched.

New tables (STORY-20, migration `20260610000008_achievements_badges`):
- `achievement_definitions`
- `badge_definitions`
- `achievement_badges` (join)
- `fan_achievements`
- `fan_badges`

New column on `fan_value_ledger`:
- `achievement_id` (nullable String) — added in `20260610000007_fan_value_ledger_v2` or `20260610000008`

---

## 6. Prisma Migrations Created

All 23 migrations are in `apps/api/prisma/migrations/`:

| Migration | Content |
|-----------|---------|
| `20260609045934_init_auth_schema` | Users, auth, consents |
| `20260609054914_add_football_core` | Teams, players, competitions, fixtures |
| `20260609063037_add_fan_profile` | Fan profiles, preferences |
| `20260609070826_add_match_state` | Match events, live state |
| `20260609073452_add_predictions` | Predictions, challenges |
| `20260609100000_add_provider_fields` | Sports data provider fields |
| `20260609120000_add_fantasy` | Fantasy teams, picks |
| `20260609130000_add_fantasy_formation_transfers` | Formation, transfers |
| `20260609140000_add_gameweeks` | Gameweeks |
| `20260609150000_add_competition_format_and_stages` | Competition format, stages |
| `20260609160000_add_competition_season_management` | Season management |
| `20260609170000_add_competition_import_jobs` | Import jobs |
| `20260609180000_add_fixture_assignment_status` | Fixture assignment |
| `20260609190000_add_prediction_void_status` | PredictionStatus.VOID |
| `20260610000000_add_fantasy_rules_engine` | Fantasy rules engine |
| `20260610000001_add_fantasy_rules_config` | FantasyRulesConfig |
| `20260610000002_fantasy_leagues_v2` | Leagues and cups |
| `20260610000004_fantasy_gameweek_scoring` | Gameweek scoring |
| `20260610000005_live_match_dashboard` | Live match |
| `20260610000006_fantasy_auto_substitution` | Auto-substitution |
| `20260610000007_fan_value_ledger_v2` | Fan Value Ledger |
| `20260610000008_achievements_badges` | Achievements & Badges |

No manual SQL steps were required. All migrations run via `pnpm --filter @psl-one/api db:migrate` or were applied in the initial `db:push` flow.

---

## 7. Seed Data Changes

Seed file: `apps/api/prisma/seed.ts`

Sprint 1 seed includes:
- FIFA World Cup 2026 competition (active)
- 48 teams, 1200 players, 104 fixtures, 9 gameweeks, 16 venues
- 12 groups, 48 standing rows (zeroed)
- 7 competition stages
- PSL Premiership shell (inactive)
- 17 achievement definitions (16 auto-trigger + 1 MANUAL `early-supporter`)
- 17 badge definitions (1-to-1 with achievement definitions)
- Badge↔achievement links seeded

Seed command: `pnpm --filter @psl-one/api db:seed`

---

## 8. API Contracts Delivered

### Auth
- `POST /auth/register` — fan registration with consent
- `POST /auth/login` — returns `{ accessToken, user }`
- `GET /auth/me` — current user

### Achievements (STORY-20)
Fan routes (JWT required):
- `GET /achievements` — fan's achievement list
- `GET /achievements/summary` — counts, points, recent unlocks
- `GET /achievements/progress` — in-progress achievements
- `GET /achievements/badges` — fan's earned badges
- `POST /achievements/evaluate` — trigger self-evaluation

Public routes:
- `GET /achievements/definitions` — all active definitions
- `GET /achievements/definitions/badges` — all active badge definitions

Admin routes (PSL_ADMIN role + JWT required):
- `GET /achievements/admin/stats` — platform-wide stats
- `GET /achievements/admin/definitions` — all definitions (with inactive)
- `POST /achievements/admin/definitions` — create definition
- `PATCH /achievements/admin/definitions/:id` — update definition
- `GET /achievements/admin/badges` — all badge definitions
- `POST /achievements/admin/badges` — create badge definition
- `PATCH /achievements/admin/badges/:id` — update badge definition
- `POST /achievements/admin/link-badge` — link badge to achievement
- `GET /achievements/admin/users/:userId` — user's achievements
- `POST /achievements/admin/users/:userId/award` — manual award
- `POST /achievements/admin/users/:userId/revoke-achievement/:id` — revoke achievement
- `POST /achievements/admin/users/:userId/revoke-badge/:id` — revoke badge
- `POST /achievements/admin/evaluate/:userId` — re-evaluate user

Other delivered route families: `/auth`, `/football`, `/fan`, `/predictions`, `/challenges`, `/fantasy`, `/gameweeks`, `/fan-value`, `/leaderboards`, `/admin`, `/live`

---

## 9. Frontend Routes / Screens Delivered

### Fan-facing
| Route | Description |
|-------|-------------|
| `/` | Home |
| `/login`, `/register`, `/reset-password` | Auth |
| `/profile`, `/profile/edit`, `/profile/preferences` | Profile |
| `/predictions`, `/predictions/fixtures`, `/predictions/fixtures/[id]`, `/predictions/me` | Predictions |
| `/fantasy`, `/fantasy/team`, `/fantasy/transfers` | Fantasy team |
| `/fantasy/gameweeks/[gameweekId]` | Gameweek history |
| `/fantasy/leagues/[id]` | League detail |
| `/football/match-centre` | Match centre |
| `/gameweeks/[id]` | Gameweek |
| `/leaderboards/predictions` | Leaderboard |
| `/achievements` | Fan achievements |
| `/achievements/badges` | Fan badges |
| `/achievements/progress` | Achievement progress |

### Admin-facing
| Route | Description |
|-------|-------------|
| `/admin/achievements` | Achievements stats + evaluate user |
| `/admin/achievements/definitions` | Create/manage achievement definitions |
| `/admin/achievements/badges` | Create/manage badge definitions, link badges |
| `/admin/achievements/users/[userId]` | Award/revoke/evaluate per-user |
| `/admin/fan-value/users` | Fan value ledger admin |
| `/admin` | Admin home |

---

## 10. Environment Variable Changes

No new environment variables were added during Sprint 1. All required variables are documented in `.env.example`.

Key local variables:
```
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user@localhost:5432/psl_identity_dev
JWT_SECRET=<minimum-32-char secret>
```

Variables present but not wired (local stubs):
- `KAFKA_BROKERS` — Kafka not used locally; events not published in Sprint 1
- `REDIS_URL` — Redis not used in Sprint 1
- `COGNITO_USER_POOL_ID/CLIENT_ID/CLIENT_SECRET` — not used; local JWT only
- `API_FOOTBALL_KEY` — not used; all data is seeded locally

---

## 11. Local Run Instructions

### Prerequisites
- Node.js 20 (see `.nvmrc`)
- pnpm 9+
- PostgreSQL 16 running locally (Homebrew)
- Database `psl_identity_dev` created

### Install
```bash
nvm use
pnpm install
```

### Database setup
```bash
pnpm --filter @psl-one/api db:migrate   # apply all migrations
pnpm --filter @psl-one/api db:seed      # seed competition + achievements data
```

### Run API
```bash
pnpm --filter @psl-one/api build        # compile
node apps/api/dist/main.js              # start on :4000
# or for dev watch mode:
pnpm --filter @psl-one/api dev
```

### Run Web
```bash
pnpm --filter @psl-one/web dev          # start on :3000
```

### Login (default admin)
```
Email:    admin@psl.co.za
Password: Admin1234!
```

---

## 12. Quality Gates Run

All gates were run and passed at end of Sprint 1:

| Command | Result |
|---------|--------|
| `pnpm --filter @psl-one/api prisma validate` | Pass |
| `pnpm --filter @psl-one/api db:seed` | Pass — 17 achievement defs, 17 badge defs |
| `pnpm --filter @psl-one/api typecheck` | Pass — 0 errors |
| `pnpm --filter @psl-one/api test` | Pass — 604/604 |
| `pnpm --filter @psl-one/api build` | Pass |
| `pnpm --filter @psl-one/web typecheck` | Pass — 0 errors |
| `pnpm --filter @psl-one/web test` | Pass — 8/8 |
| `pnpm --filter @psl-one/web build` | Pass |

---

## 13. Test Results

### API (`apps/api`)
- **Test files:** 21 passed
- **Tests:** 604 passed, 0 failed
- **Test runner:** Vitest 4.1.8

Spec files include:
- `auth.service.spec.ts`, `auth.controller.spec.ts`
- `football.service.spec.ts`
- `fan.service.spec.ts`
- `predictions.service.spec.ts`
- `challenges.service.spec.ts`
- `fantasy.service.spec.ts`
- `fantasy-chips.service.spec.ts`
- `fantasy-rules.service.spec.ts`
- `fantasy-leagues.service.spec.ts`
- `fantasy-scoring.service.spec.ts`
- `fantasy-autosubstitution.service.spec.ts`
- `live-match.service.spec.ts`
- `gameweek-deadline.service.spec.ts`
- `fan-value-ledger.service.spec.ts`
- `achievements.service.spec.ts` (42 tests)
- `achievements.controller.spec.ts` (20 tests — RolesGuard + dispatch)
- `roles.guard.spec.ts`
- `leaderboards.service.spec.ts`
- `health.controller.spec.ts`

### Web (`apps/web`)
- **Test files:** 3 passed
- **Tests:** 8 passed, 0 failed
- **Test runner:** Vitest 4.1.8

---

## 14. Known Issues

1. **Kafka events not published** — `ALWAYS_PUBLISH_KAFKA_EVENTS` rule from CLAUDE.md is not yet implemented. All domain events are fire-and-forget or synchronous. Kafka is stubbed but not wired. This is a known Sprint 1 gap and must be addressed before production.

2. **Web tests are shallow** — The 8 web tests cover utility logic only. No component tests, no E2E tests. All web page verification was manual.

3. **AchievementsModule previously missing AuthModule import** — Fixed at end of Sprint 1 session. The `dist/` build now includes the fix. Any previous `dist/` must be rebuilt.

4. **FanValueLedger `idempotencyKey` null in API response** — The ledger entry is created correctly with an idempotency key in the database, but the GET `/fan-value/admin/users/:userId/ledger` response shows `null` for `idempotencyKey`. This is a display/serialisation issue, not a data integrity issue. Idempotency is enforced at the DB unique constraint level.

5. **No route smoke-test script** — Routes are verified manually. A scripted smoke test is missing (see Improvement Opportunities).

---

## 15. Technical Debt

- Kafka event publishing not implemented
- No E2E or integration test suite (all tests are unit/service-level)
- Web tests cover only utility logic; no component or page tests
- No API versioning strategy
- No rate limiting on public endpoints
- Auth uses local JWT; Cognito integration is stubbed
- Redis not wired; no caching layer
- No error boundary components in web app
- Admin pages have no pagination on large lists
- FanValueLedger `idempotencyKey` not returned in list responses

---

## 16. Security Notes

- RBAC enforced via `RolesGuard` + `@Roles('PSL_ADMIN')` on all admin routes. Never bypassed.
- Audit logs enforced via `AuditEvent` table on all auth operations. Never bypassed.
- No business logic in frontend — all state changes go through API.
- No financial instruments, real money, deposits, withdrawals, betting, or gambling mechanics implemented. Fan Value is explicitly non-financial (points only).
- No seeds or code reference real user PII beyond test accounts.
- JWT secret is local-only (`psl-one-local-dev-secret-minimum-32-characters`). Must be rotated for production.
- No AWS credentials, Terraform state, or production secrets in the codebase.
- `.env` is not committed to git (confirmed via `.gitignore`).

---

## 17. Deployment Notes

**Not deployed.** Sprint 1 is local-only. No AWS, ECS, CloudFront, EventBridge, or Terraform was touched.

For future deployment:
- All migrations must be run against the target database before deploying new API builds
- `JWT_SECRET` must be set from AWS Secrets Manager
- `DATABASE_URL` must point to RDS instance
- `KAFKA_BROKERS` must be set for MSK
- `COGNITO_USER_POOL_ID/CLIENT_ID/CLIENT_SECRET` must be set
- Seed data should be run once against production DB for competition and achievement definitions

---

## 18. Recommended Next Sprint / Next Story

**STORY-21 — Rewards Readiness MVP**

Scope (suggested):
- Non-financial reward catalogue (redeemable with Fan Value Points)
- Reward redemption flow (points deducted from FanValueLedger)
- Admin reward management
- Reward eligibility rules (minimum points threshold)
- No real money, no fiat, no gambling mechanics

Do not implement:
- Real-money wallet
- Deposits or withdrawals
- Betting, stakes, odds, or payouts
- Rewards marketplace with external payment providers

---

## Platform Documentation Snapshot

### Product Purpose
PSL One is the Digital Operating System of South African Football. It combines fantasy football, social predictions, peer challenges, live match data, fan engagement, and achievement/reward systems into a single platform for PSL fans.

### Bounded Contexts
1. **Identity & Auth** — user registration, login, RBAC, consents, audit
2. **Football Core** — competitions, seasons, teams, players, fixtures, standings
3. **Fan Profile** — fan preferences, display names, profile completion
4. **Predictions** — match predictions, peer challenges, scoring/settlement
5. **Fantasy** — team building, gameweek scoring, transfers, chips, leagues, auto-substitution
6. **Live Match** — real-time match events, live score, commentary adapter
7. **Gameweeks** — deadline management, fixture assignment, open/lock/close lifecycle
8. **Fan Value Ledger** — non-financial points economy, source-typed ledger entries
9. **Achievements & Badges** — trigger-based achievement engine, badge awards, admin config
10. **Admin** — cross-cutting admin surfaces for each domain

### Current Local Tech Stack
- **Runtime:** Node.js 20
- **API framework:** NestJS 10 with Prisma 5 ORM
- **Database:** PostgreSQL 16 (Homebrew, `psl_identity_dev`)
- **Web framework:** Next.js 15 (App Router), TypeScript, Tailwind CSS, TanStack Query
- **Monorepo:** Turborepo + pnpm workspaces
- **Test runner:** Vitest 4
- **Auth:** Local JWT (HS256, `JWT_SECRET` env var)

### Local PostgreSQL Usage
All data lives in `psl_identity_dev` on the local Homebrew PostgreSQL instance. No cloud databases, RDS, or external connections are used in Sprint 1.

### Auth / RBAC Model
- JWT Bearer tokens issued by `/auth/login`
- `JwtAuthGuard` validates tokens via `LocalJwtProvider.verifyToken`
- `RolesGuard` + `@Roles('PSL_ADMIN')` enforces admin-only routes
- `@CurrentUser()` decorator extracts `user.sub` from JWT payload
- Roles: `FAN` (default), `PSL_ADMIN`
- Fan routes require JWT; admin routes require JWT + PSL_ADMIN role
- Auth operations write to `AuditEvent` table (never bypassed)

### Football Core
Competition → Season → Stage → Group → Fixture hierarchy. Teams and Players are competition-scoped. Fixture states: `SCHEDULED → LIVE → FINISHED`. Provider-neutral: `providerKey` / `externalId` fields allow any sports data source. FIFA World Cup 2026 is the Sprint 1 seed dataset.

### Fixture / Gameweek System
Fixtures are assigned to Gameweeks. Gameweek status: `UPCOMING → OPEN → LOCKED → CLOSED`. Deadline management via `GameweekDeadlineService`. Fantasy transfers and predictions are locked at gameweek close.

### Live Match Dashboard
`LiveMatchService` provides 16 read-only methods covering match events, scores, timelines, player stats, and fantasy score previews. Provider-neutral adapter pattern — no live data provider is hard-coded.

### Predictions / Challenges
Fans predict exact scores or outcomes for fixtures. Predictions lock at fixture kickoff. Settlement runs `CORRECT / INCORRECT / VOID` via `PredictionPointsLedger`. Peer challenges allow fan-vs-fan wagers on prediction outcomes (non-financial — points only).

### Fantasy Team / Scoring / Chips / Leagues / Auto-Subs
Full fantasy football engine: squad selection, formation, captain/vice, transfers, chips (Wildcard, Free Hit, Triple Captain, Bench Boost), gameweek scoring, season history, private/public/global leagues with standings, priority-based auto-substitution on bench.

### Fan Value Ledger
Non-financial points economy. `FanValueLedger` records every points transaction with `sourceType`, `valueType`, `idempotencyKey`, and `status`. Source types include: `FANTASY`, `PREDICTION`, `CHALLENGE`, `ACHIEVEMENT`, `SPONSOR_ENGAGEMENT_READY`, and others. Points are not redeemable for money. No gambling mechanics.

### Achievements & Badges
Trigger-based achievement engine with 13 trigger types. 17 pre-seeded definitions, 17 badge definitions. Admin can create, update, and link badges to achievements. Fans earn achievements automatically (except MANUAL trigger) via integration hooks in Fantasy, Predictions, and Fan Value services. FanValueLedger gets an ACHIEVEMENT_POINTS entry on award. Awards are idempotent (`@@unique` on userId + definitionId).

### Admin Surfaces
Each domain has admin routes at `/<domain>/admin/...` protected by `PSL_ADMIN` role. Admin web pages provide basic CRUD, stats, and per-user management for: achievements, fan-value, fantasy rules, and competition management.

### Web App Routes
Fan pages: `/`, `/login`, `/register`, `/profile`, `/predictions`, `/fantasy`, `/gameweeks`, `/football/match-centre`, `/leaderboards`, `/achievements`

Admin pages: `/admin`, `/admin/achievements`, `/admin/fan-value`

### API Route Families
`/auth`, `/football`, `/fan`, `/predictions`, `/challenges`, `/fantasy`, `/gameweeks`, `/fan-value`, `/achievements`, `/leaderboards`, `/admin`, `/live`, `/health`

### Database / Migration Strategy
Prisma Migrate (dev) for schema changes. All migrations are in `apps/api/prisma/migrations/`. Each migration maps to a story. No raw SQL outside migrations. Migration naming convention: `YYYYMMDDHHMMSS_description`.

### Seed Dataset Strategy
Single seed file (`prisma/seed.ts`). Idempotent upserts throughout. Competition + season + teams + players + fixtures + gameweeks + achievements + badges all seeded. Cleanup order respects foreign key constraints.

### Non-Financial Compliance Posture
Fan Value Points are explicitly non-financial. No money, no deposits, no withdrawals, no betting, no gambling mechanics. All copy uses "points" not "cash" or "money". `FanValueType.ACHIEVEMENT_POINTS` signals non-financial nature.

### Provider-Neutral Sports Data Approach
`externalId` and `providerKey` fields on Teams, Players, Competitions, and Fixtures allow any sports data provider to be mapped without schema changes. `LiveMatchService` uses an adapter pattern — no specific provider SDK is imported.

---

## Project Learnings

1. **Always inspect the working tree after a Claude session interruption.** Sessions can end mid-edit. Running `git status` and checking for partial writes or missing imports is the first step of any continuation session.

2. **Restart stale API/web servers after route changes.** NestJS compiles to `dist/`. If the server is running an old build, route changes won't be visible. Always rebuild and restart after controller or module changes.

3. **Do not edit `.next/`.** Next.js build output is generated. Editing it directly causes inconsistent behaviour and lost work on the next build.

4. **Keep provider-neutral abstractions.** Hard-coding a sports data provider SDK into the core domain makes it very expensive to switch providers. The adapter pattern (`providerKey` fields + service interfaces) keeps the domain clean.

5. **Avoid gambling / financial terminology.** "Fan Value Points" not "credits". "Non-financial" in all copy and comments. This protects the product from gambling regulation risk.

6. **Run the full API + web gate after dependency injection changes.** Adding `AuthModule` to `AchievementsModule` is a small change, but if missed, the server fails to start with a cryptic DI error. The typecheck alone does not catch this — only a build + runtime start does.

7. **Keep seed cleanup order aligned with foreign keys.** Seeding fails silently or with FK violations if child tables are truncated before parent tables. Always delete in reverse dependency order.

8. **Avoid starting new stories before completing the handover.** The handover is the formal acceptance record. Starting STORY-21 before STORY-20 is in the handover creates ambiguity about sprint scope.

9. **Use local PostgreSQL only unless explicitly instructed otherwise.** All sprint work uses `psl_identity_dev` on the local Homebrew instance. No RDS, no cloud DB, no production data.

10. **The `.catch(() => null)` pattern in service integrations silently swallows errors.** The FanValueLedger call in `awardAchievement` uses `.catch(() => null)` to prevent achievement award failures from rolling back due to a ledger error. This is intentional but means ledger failures are invisible. Add monitoring in production.

---

## Improvement Opportunities

1. **Add a single root-level quality gate script.** Currently the developer must run 7 separate commands. A `scripts/gate.sh` that runs all checks in sequence and reports a summary would reduce friction.

2. **Add a route smoke-test script.** A `scripts/smoke-test.sh` that curls every API route and reports HTTP status codes would catch broken modules before local verification.

3. **Add migration inventory automation.** A script that lists all migrations, their dates, and which story they belong to would make the handover database section easier to maintain.

4. **Add seed integrity checks.** A `scripts/check-seed.ts` that queries the DB and asserts expected row counts (17 achievement defs, 17 badge defs, etc.) would catch seed regressions.

5. **Add a story acceptance checklist template.** A `docs/templates/story-acceptance.md` would standardise the acceptance gate for every story.

6. **Add Architecture Decision Records.** ADRs for key decisions (NestJS, Prisma, provider-neutral abstraction, non-financial fan value posture) would help future developers understand the "why".

7. **Add lightweight API contract documentation.** An OpenAPI spec or a hand-maintained `docs/api-contracts.md` would help frontend and integration developers.

8. **Add admin route RBAC audit tests.** Currently RBAC is tested via unit tests on `RolesGuard`. An integration-level test that actually sends requests to each admin route with a FAN token would be more robust.

9. **Add error boundary / loading consistency for web pages.** Several pages have inconsistent loading/error states. A shared `PageWrapper` component with standard skeleton and error UI would improve consistency.

10. **Add a repo health dashboard for Sprint 2.** A simple CI check that reports test count, typecheck status, and build status on every PR would give the team fast feedback without a full CI pipeline.
