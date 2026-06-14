# PSL One — Module Dependency Graph

**Purpose:** NestJS module import graph and cross-module dependency rules  
**Audience:** Backend engineers  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## App Module Registration Order

All modules registered in `apps/api/src/app.module.ts`. Order:

```
AppModule imports:
  PrismaModule
  AuthModule
  UsersModule
  CompetitionsModule
  TeamsModule
  PlayersModule
  FixturesModule
  VenuesModule
  GameweekModule
  FantasyModule
  FantasyTransfersModule
  FantasyChipsModule
  FantasyRulesModule
  FantasyLeaguesModule
  FantasyScoringModule
  FantasyAutoSubModule
  FantasyCalibrationModule
  PredictionsModule
  PredictionRulesModule
  SocialPredictionModule
  MatchCentreModule
  FanValueModule
  AchievementsModule
  RewardsModule
  NotificationsModule
  ActivityFeedModule
  EngagementModule
  PlayerStatsModule
  ClubExperienceModule
  FixtureImportModule
  SquadImportModule
  SeasonSwitchingModule
  GameweekOpsModule
  MediaModule
  CampaignsModule
  WalletModule
  AdminOperationsModule
  AdminDashboardModule
  BetaFeedbackModule
  BetaLaunchModule
```

---

## Cross-Module Dependencies

Key import relationships (who imports what):

```
BetaLaunchModule
  → SeasonSwitchingModule (13-check gate)
  → AuthModule (JwtAuthGuard)

BetaFeedbackModule
  → AuthModule (getBetaToken utility)

ClubExperienceModule
  → AuthModule (required — guard registration)

SocialPredictionModule
  → CampaignsModule (CampaignTriggerService)
  → FanValueModule (points side effects)

MatchCentreModule
  → SocialPredictionModule (challenge result flow)

FantasyScoringModule
  → FanValueModule (engagement on score)
  → NotificationsModule (score notification)

PredictionsModule
  → FanValueModule (engagement on predict)
  → NotificationsModule (prediction notification)
  → ActivityFeedModule (feed item on predict)

AchievementsModule
  → FanValueModule (Fan Value on unlock)
  → NotificationsModule (notification on unlock)

AdminDashboardModule
  → CompetitionsModule (season summary)
  → FantasyModule (team counts)
  → PredictionsModule (prediction counts)
  → FanValueModule (leaderboard summary)
  → BetaFeedbackModule (feedback summary)

SeasonSwitchingModule
  → CompetitionsModule (season state update)
  → [reads all domain modules for readiness checks]

FixtureImportModule
  → FixturesModule (fixture upsert)
  → TeamsModule (team lookup)
  → VenuesModule (venue lookup)

SquadImportModule
  → PlayersModule (player upsert)
  → SeasonSwitchingModule (readiness check update)
```

---

## Shared Infrastructure

| Provider | Scope | Used by |
|----------|-------|---------|
| `PrismaService` | Global via `PrismaModule` | All modules |
| `JwtAuthGuard` | Exported from `AuthModule` | All modules needing auth |
| `RolesGuard` | Registered per-controller | Admin controllers |
| `CampaignTriggerService` | Exported from `CampaignsModule` | SocialPredictionModule |

---

## Circular Dependency Prevention

NestJS detects circular module dependencies at startup. To avoid them:

- Domain services should call sibling services via injected service instances, not via module re-imports
- If Module A needs Module B's service AND Module B needs Module A's service, extract shared logic into a third `SharedModule`
- No circular imports exist in the current codebase

---

## Module Boundary Rules

1. **Own your data**: Each module owns its Prisma queries. Do not import another module's repository or service to do its data access.
2. **Export selectively**: Only export what other modules need. Internal services should not be in `exports[]`.
3. **No cross-cutting writes**: Module A must not write to Module B's primary table directly. Call Module B's service.
4. **Admin isolation**: Admin operations in a domain module should be in the same module's controller under `/admin/` prefix, not in a separate admin-only module (except `AdminDashboardModule` which is aggregation-only).
