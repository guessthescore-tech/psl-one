# PSL One — Bounded Context Map

**Purpose:** Module inventory, responsibilities, and inter-module dependencies  
**Audience:** Backend engineers, architects  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Bounded Contexts

All contexts live in `apps/api/src/`. Each is a NestJS module with its own service, controller, and DTOs. Contexts are grouped below by functional domain.

---

### Identity & Access

| Module | Directory | Responsibility |
|--------|-----------|---------------|
| `AuthModule` | `auth/` | JWT auth, login, register, password reset, token refresh. `getBetaToken()` utility centralised here. |
| `UsersModule` | `users/` | Fan profile, preferences, POPIA consent, user data access. |

---

### Football Core

| Module | Directory | Responsibility |
|--------|-----------|---------------|
| `CompetitionsModule` | `competitions/` | Competition and season CRUD. Season state machine (UPCOMING/ACTIVE/COMPLETED). Season activation readiness gate (13 checks). |
| `TeamsModule` | `teams/` | Club and SeasonTeam management. |
| `PlayersModule` | `players/` | Player registration, pricing, squad management. `externalId` non-unique (findFirst pattern). |
| `FixturesModule` | `fixtures/` | Fixture CRUD, publish/unpublish, lifecycle (SCHEDULED/LIVE/FINISHED). |
| `VenuesModule` | `venues/` | Stadium management. |
| `ClubExperienceModule` | `club-experience/` | 16 PSL clubs, fan-facing club pages, squad views. Requires `AuthModule`. |

---

### Fantasy Football

| Module | Directory | Responsibility |
|--------|-----------|---------------|
| `FantasyModule` | `fantasy/` | Fantasy team selection, player pool queries. |
| `FantasyTransfersModule` | `fantasy-transfers/` | Transfer validation — budget, squad limits, window open. `assertFantasyOpen` guard. |
| `FantasyChipsModule` | `fantasy-chips/` | One-time chips (wildcard, triple captain, bench boost, free hit). |
| `FantasyRulesModule` | `fantasy-rules/` | `FantasyRulesConfig` model — all scoring rules config-driven. |
| `FantasyLeaguesModule` | `fantasy-leagues/` | Private, public, and global leagues. Standings with transfer tie-breaker. |
| `FantasyScoringModule` | `fantasy-scoring/` | Gameweek scoring, `FantasyGameweekScore`. Provisional vs. official scoring. |
| `FantasyAutoSubModule` | `fantasy-auto-sub/` | Auto-substitution — priority bench coverage for starters scoring 0. |
| `FantasyCalibrationModule` | `fantasy-calibration/` | Provisional PSL player prices. Activation dry-run. |

---

### Predictions

| Module | Directory | Responsibility |
|--------|-----------|---------------|
| `PredictionsModule` | `predictions/` | Guess the Score — submit, lock, settle, void. `PredictionPointsLedger` (immutable). |
| `PredictionRulesModule` | `prediction-rules/` | `PredictionRulesConfig` — scoring windows, point values. Admin-configurable. |

---

### Social Prediction Gaming

| Module | Directory | Responsibility |
|--------|-----------|---------------|
| `SocialPredictionModule` | `social-prediction/` | Challenge listings, marketplace, direct challenges, FIFO matching, atomic acceptance, `SocialPredictionPointsEntry` (immutable). |
| `MatchCentreModule` | `match-centre/` | Live match intelligence — live events, timeline, commentary feed. Admin result entry. |

---

### Fan Engagement

| Module | Directory | Responsibility |
|--------|-----------|---------------|
| `FanValueModule` | `fan-value/` | `FanValueLedger` — non-financial loyalty score, engagement tracking. |
| `AchievementsModule` | `achievements/` | Badges, achievement definitions, fan achievement records. 17 seeded definitions. |
| `RewardsModule` | `rewards/` | `RewardReadinessDefinition`, eligibility engine. 6 seeded definitions. |
| `NotificationsModule` | `notifications/` | In-app notification records. Event hooks in 5 services. |
| `ActivityFeedModule` | `activity-feed/` | Social activity feed items — fan-visible engagement timeline. |
| `EngagementModule` | `engagement/` | Season-scoped leaderboards. Fan Value leaderboard. |

---

### Player Performance

| Module | Directory | Responsibility |
|--------|-----------|---------------|
| `PlayerStatsModule` | `player-stats/` | `PlayerMatchStats`, `PositionGroup`, `StatCategory`. 17 API routes. |

---

### Media & Campaigns

| Module | Directory | Responsibility |
|--------|-----------|---------------|
| `MediaModule` | `media/` | Media items, sponsor content, editorial. Stub adapter for CDN. |
| `CampaignsModule` | `campaigns/` | Campaign definitions, rules, triggers. `CampaignTriggerService` for lifecycle events. |
| `WalletModule` | `wallet/` | Wallet provider adapter pattern. `SiliconEnterpriseSandboxWalletAdapter` (no real API calls). |

---

### Season Operations

| Module | Directory | Responsibility |
|--------|-----------|---------------|
| `SeasonSwitchingModule` | `season-switching/` | 13-check gate for season activation. Transactional switch with rollback. Audit trail. |
| `SquadImportModule` | `squad-import/` | Import pipeline for PSL squad data. Validation, batch tracking. |
| `FixtureImportModule` | `fixture-import/` | `FixtureImportBatch`, `FixtureImportRow`. 21 API routes. |
| `GameweekOpsModule` | `gameweek-ops/` | Gameweek and matchday operational readiness. 9th season-switching check. |

---

### Admin

| Module | Directory | Responsibility |
|--------|-----------|---------------|
| `AdminOperationsModule` | `admin-operations/` | Control plane — capability map, provider configs, launch readiness checklist. 9 seeded integration configs. |
| `AdminDashboardModule` | `admin-dashboard/` | Aggregation dashboard — fan counts, season health, cross-domain summaries. |
| `BetaFeedbackModule` | `beta-feedback/` | Feedback collection, programme state, release notes, `getBetaToken()` delegation. |
| `BetaLaunchModule` | `beta-launch/` | 27 routes — readiness review, dry-run, rollback dry-run, approval, cohort management, smoke tests, runbook. `ACTIVATION_DISABLED_NOTICE` constant. |

---

## Context Dependency Map

Key dependencies (caller → dependency):

```
BetaLaunchModule → SeasonSwitchingModule (13-check gate, no duplication)
BetaFeedbackModule → AuthModule (getBetaToken)
ClubExperienceModule → AuthModule (required in module)
SocialPredictionModule → CampaignTriggerService (lifecycle events)
MatchCentreModule → SocialPredictionModule (match result flow)
FantasyScoringModule → FanValueModule (engagement points on score)
PredictionsModule → FanValueModule (engagement points on predict)
AchievementsModule → FanValueModule (Fan Value on unlock)
AchievementsModule → NotificationsModule (notification on unlock)
ActivityFeedModule → PredictionsModule, FantasyModule, SocialPredictionModule (feed items)
AdminDashboardModule → [most domain modules] (aggregation reads)
```

---

## Module Registration Pattern

All modules are registered in `apps/api/src/app.module.ts`. Each module declares its own imports, providers, and exports — no global service injection except `PrismaService` and `AuthModule`.

---

## Cross-Cutting Concerns

| Concern | Implementation |
|---------|---------------|
| Authentication | `JwtAuthGuard` from `AuthModule` — all non-public routes |
| Admin RBAC | `RolesGuard` + `@Roles('PSL_ADMIN')` — all `/admin/*` routes |
| Audit | `AdminAuditLog` — written in every admin mutation service |
| Prisma | `PrismaService` injected into each module's service directly |
| Season context | `SeasonSwitchingService.getActiveSeasonId()` called where needed |
| Fan Value side effects | Called directly from domain services (no Kafka yet) |
| Notifications | Written directly in event-generating services (no Kafka yet) |
