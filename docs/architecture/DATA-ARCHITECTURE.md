# PSL One — Data Architecture

**Purpose:** Database model groups, key relationships, and data integrity rules  
**Audience:** Backend engineers, database engineers, architects  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Primary Data Store

PostgreSQL 16 via Prisma ORM.

- Dev database: `psl_identity_dev` on `localhost:5432`
- Schema source of truth: `apps/api/prisma/schema.prisma`
- Migration history: `apps/api/prisma/migrations/` (38 migrations as of STORY-39)
- Seed: `apps/api/prisma/seed.ts`

---

## Model Groups

### Identity

| Model | Key fields | Notes |
|-------|-----------|-------|
| `User` | `id`, `email`, `passwordHash`, `role` | Roles: `FAN`, `PSL_ADMIN` |
| `UserPreferences` | `userId`, `notificationPrefs` | Per-user consent and preference record |

---

### Football Core

| Model | Key fields | Notes |
|-------|-----------|-------|
| `Competition` | `id`, `name`, `country` | Top-level — FIFA World Cup, PSL Premiership |
| `Season` | `competitionId`, `isActive`, `status` | Only one `isActive: true` at a time |
| `Team` | `id`, `name`, `shortCode` | Club-level |
| `SeasonTeam` | `seasonId`, `teamId` | Season-scoped club registration |
| `Venue` | `id`, `name`, `city`, `capacity` | Stadium |
| `Fixture` | `id`, `homeTeamId`, `awayTeamId`, `gameweekId`, `isPublished`, `status` | Must be published for predictions |
| `Gameweek` | `id`, `seasonId`, `number`, `deadlineAt` | Transfer deadline scope |
| `Player` | `id`, `teamId`, `externalId`, `position` | `externalId` non-unique — use `findFirst` pattern |
| `SeasonTeamPlayer` | `seasonId`, `playerId`, `price` | Season-scoped player with Fantasy price |

---

### Fantasy Football

| Model | Key fields | Notes |
|-------|-----------|-------|
| `FantasyTeam` | `userId`, `seasonId` | One per user per season |
| `FantasyTeamPlayer` | `fantasyTeamId`, `playerId`, `isCaptain`, `isViceCaptain` | Squad selection |
| `FantasyTransfer` | `fantasyTeamId`, `playerInId`, `playerOutId`, `gameweekId` | Transfer record |
| `FantasyChip` | `fantasyTeamId`, `type`, `usedGameweekId` | One-time chip state |
| `FantasyRulesConfig` | `seasonId`, `pointsPerGoal`, `transfersPerWeek` | Admin-configurable rules |
| `FantasyLeague` | `id`, `type` (PRIVATE/PUBLIC/GLOBAL), `name` | League definition |
| `FantasyLeagueMember` | `leagueId`, `userId` | Membership |
| `FantasyGameweekScore` | `fantasyTeamId`, `gameweekId`, `points`, `isProvisional` | Scored per gameweek |
| `FantasyAutoSubstitution` | `fantasyTeamId`, `gameweekId`, `playerOutId`, `playerInId` | Auto-sub record |
| `FantasyCalibration` | `seasonId`, `status` | Calibration state for provisional prices |

---

### Predictions

| Model | Key fields | Notes |
|-------|-----------|-------|
| `Prediction` | `userId`, `fixtureId`, `homeScore`, `awayScore`, `status` | PENDING/WON/LOST/VOID |
| `PredictionPointsLedger` | `predictionId`, `userId`, `points`, `type` | Immutable — never updated |
| `PredictionRulesConfig` | `seasonId`, `exactScorePoints`, `correctResultPoints` | Admin-configurable |

---

### Social Prediction Gaming

| Model | Key fields | Notes |
|-------|-----------|-------|
| `SocialPredictionListing` | `userId`, `fixtureId`, `position`, `stakeAmount`, `capacity` | Challenge offer |
| `SocialPredictionMatch` | `listingId`, `challengerUserId`, `stakeAmount`, `status` | Match acceptance |
| `SocialPredictionPointsEntry` | `userId`, `type`, `amount`, `listingId` | Immutable — `POINTS_COMMITTED/AWARDED/FORGONE/VOID_RESTORED` |
| `SocialPredictionGameplayPointsAllocation` | `userId`, `gameweekId`, `amount` | Admin grant of gameplay points |
| `MarketplaceListing` | `listingId` | Public view of a listing |
| `DirectChallenge` | `listingId`, `challengedUserId` | User-to-user direct challenge |
| `ChallengeIdempotency` | `key` | Prevents duplicate acceptance |

---

### Match Centre

| Model | Key fields | Notes |
|-------|-----------|-------|
| `MatchEvent` | `fixtureId`, `type`, `minute`, `playerId` | Goal, card, substitution etc. |
| `MatchTimeline` | `fixtureId`, `events[]` | Ordered event list |
| `MatchCommentary` | `fixtureId`, `minute`, `text` | Commentary entries |
| `LiveMatchSession` | `fixtureId`, `adminUserId`, `startedAt` | Admin-started live session |

---

### Fan Engagement

| Model | Key fields | Notes |
|-------|-----------|-------|
| `FanValueLedger` | `userId`, `type`, `points`, `seasonId?` | Non-financial. Season derived from FK where possible. |
| `AchievementDefinition` | `key`, `category`, `pointValue` | 17 seeded definitions |
| `UserAchievement` | `userId`, `definitionId`, `unlockedAt` | Fan achievement record |
| `Badge` | `achievementDefinitionId`, `imageUrl` | Badge asset reference |
| `RewardReadinessDefinition` | `key`, `category`, `criteria` | 6 seeded definitions |
| `FanRewardReadiness` | `userId`, `definitionId`, `eligible` | Eligibility state |
| `Notification` | `userId`, `type`, `title`, `body`, `readAt?` | In-app notification |
| `NotificationPreference` | `userId`, `type`, `enabled` | Per-type opt-out |
| `ActivityFeedItem` | `userId`, `type`, `payload` | Fan activity timeline |

---

### Player Stats

| Model | Key fields | Notes |
|-------|-----------|-------|
| `PlayerMatchStats` | `playerId`, `fixtureId`, `goals`, `assists`, `minutesPlayed`, `positionGroup` | Per-match performance |

---

### Clubs

| Model | Key fields | Notes |
|-------|-----------|-------|
| `ClubProfile` | `teamId`, `bio`, `socialLinks`, `badgeUrl` | Club experience data |
| `ClubNews` | `teamId`, `title`, `body`, `publishedAt` | Admin-managed club news |
| `ClubFanFollow` | `userId`, `teamId` | Fan-to-club follow |

---

### Fixture Import

| Model | Key fields | Notes |
|-------|-----------|-------|
| `FixtureImportBatch` | `id`, `status`, `source`, `seasonId` | Import run |
| `FixtureImportRow` | `batchId`, `rowData`, `status`, `errors` | Per-row validation result |

---

### Season Operations

| Model | Key fields | Notes |
|-------|-----------|-------|
| `SeasonSwitchAudit` | `fromSeasonId`, `toSeasonId`, `performedAt`, `userId` | Switch audit trail |
| `IntegrationProviderConfig` | `key`, `provider`, `status`, `credentials?` | 9 integration configs seeded |

---

### Media & Campaigns

| Model | Key fields | Notes |
|-------|-----------|-------|
| `MediaItem` | `id`, `type`, `url`, `title`, `seasonId?` | Editorial/sponsor content |
| `SponsorCampaign` | `id`, `sponsorName`, `budget`, `status` | Campaign definition |
| `CampaignRule` | `campaignId`, `triggerType`, `rewardType` | Rule definition |
| `CampaignTriggerLog` | `campaignId`, `userId`, `triggeredAt` | Fan campaign trigger record |
| `WalletLink` | `userId`, `providerId`, `externalRef` | Fan wallet link (no funds custody) |

---

### Beta Launch

| Model | Key fields | Notes |
|-------|-----------|-------|
| `BetaCohort` | `id`, `seasonId`, `name`, `status` | PENDING/ACTIVE/PAUSED/COMPLETED |
| `BetaCohortMember` | `cohortId`, `userId` | Cohort membership |
| `SeasonActivationApproval` | `seasonId`, `approvedBy`, `approvalStatus` | `APPROVED` — does not activate season |

---

### Admin

| Model | Key fields | Notes |
|-------|-----------|-------|
| `AdminAuditLog` | `userId`, `action`, `target`, `payload`, `performedAt` | Immutable audit record for every admin mutation |
| `BetaFeedbackEntry` | `userId`, `category`, `rating`, `body` | Fan-submitted beta feedback |

---

## Key Data Integrity Rules

1. **One active season**: `Season.isActive` must be `true` on exactly one record at any time. Enforced in `SeasonSwitchingService`.
2. **Prediction points immutable**: `PredictionPointsLedger` rows are never updated or deleted. Corrections are new rows.
3. **Social prediction points immutable**: `SocialPredictionPointsEntry` rows are never updated. Corrections are new entries.
4. **Admin audit mandatory**: Every admin mutation must write an `AdminAuditLog` row. No exceptions.
5. **Fixture publish gate**: `Prediction` creation requires `fixture.isPublished: true`.
6. **Fantasy open guard**: `assertFantasyOpen` must be called before any Fantasy mutation. Checked via `FantasyRulesConfig`.
7. **No funds custody**: `WalletLink` stores only a reference ID. No balance, no funds transfer.
8. **Fan Value is non-financial**: `FanValueLedger` has no monetary value. Never used for payments.
9. **Player externalId non-unique**: Multiple players may share `externalId` across seasons. Always use `findFirst` with seasonId scope.
10. **Approval ≠ Activation**: `SeasonActivationApproval.approvalStatus = APPROVED` does not set `Season.isActive`. They are separate operations.

---

## Prisma Migration Rules

- Migrations run via `pnpm --filter @psl-one/api db:migrate`
- Never edit existing migration files
- Additive changes only — no dropping columns that may have data
- All new boolean fields require a default value
- All new required fields require a migration default for existing rows
- Migration naming: `YYYYMMDDHHMMSS_descriptive_name`
