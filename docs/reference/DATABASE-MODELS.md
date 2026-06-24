# PSL One — Database Models Reference

**Purpose:** Accurate database model inventory from actual Prisma schema  
**Audience:** Backend engineers  
**Status:** Current as of STORY-39 (commit `08e3852`)  
**Last verified:** 2026-06-14  
**Total models:** 103
**Source:** `apps/api/prisma/schema.prisma`  
**Authority:** Schema is the single source of truth — this document is a navigational aid only  

---

## Model Count by Domain

| Domain | Models |
|--------|--------|
| Auth & Identity | 6 |
| Football Core | 8 |
| Competition Management | 4 |
| Fixtures | 5 |
| Gameweeks | 2 |
| Fantasy | 17 |
| Predictions | 4 |
| Social Predictions (Marketplace) | 6 |
| Fan Value | 2 |
| Achievements & Badges | 6 |
| Notifications | 3 |
| Activity Feed | 2 |
| Clubs | 5 |
| Player Stats | 2 |
| Media | 2 |
| Campaigns & Sponsors | 6 |
| Wallet & Commerce | 3 |
| Season Management | 6 |
| Rewards | 3 |
| Admin & Audit | 3 |
| Beta Launch | 2 |
| Portal Scoping | 2 |
| **Total** | **103** |

---

## Auth & Identity

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `User` | `id`, `email`, `passwordHash`, `role`, `createdAt` | `role` is `PSL_ADMIN` or `FAN` |
| `FanProfile` | `id`, `userId`, `displayName`, `clubAffiliation`, `avatarUrl` | One-to-one with User |
| `PasswordResetToken` | `id`, `userId`, `token`, `expiresAt`, `usedAt` | Single-use token |
| `AuthAuditLog` | `id`, `userId`, `action`, `ipAddress`, `createdAt` | Append-only |
| `ConsentRecord` | `id`, `userId`, `consentType`, `accepted`, `createdAt` | GDPR consent |
| `AccountDeletionRequest` | `id`, `userId`, `status`, `reason`, `requestedAt`, `cancelledAt` | POPIA deletion request workflow; status is PENDING, CANCELLED, COMPLETED, or REJECTED |

---

## Football Core

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `Competition` | `id`, `name`, `slug`, `countryCode` | e.g., PSL Premiership |
| `Season` | `id`, `competitionId`, `name`, `slug`, `isActive`, `status` | `isActive` controls live data; PSL 2026/27 is `UPCOMING` |
| `Team` | `id`, `name`, `slug`, `externalId` | Club team |
| `SeasonTeam` | `id`, `seasonId`, `teamId`, `homeStadiumId` | Team participation per season |
| `Player` | `id`, `name`, `externalId`, `position` | `externalId` is non-unique — scope by `seasonId` |
| `SeasonSquadRegistration` | `id`, `seasonId`, `playerId`, `teamId`, `jerseyNumber` | Player registration per season |
| `Venue` | `id`, `name`, `city`, `capacitySeated` | Stadium data |
| `TeamFormRecord` | `id`, `teamId`, `seasonId`, `last5` | Recent form |

---

## Competition Management

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `CompetitionStage` | `id`, `seasonId`, `name`, `stageType` | Group, knockout etc. |
| `Group` | `id`, `stageId`, `name` | Group stage group |
| `GroupStanding` | `id`, `groupId`, `teamId`, `points`, `gd` | Standing in group |
| `CompetitionImportJob` | `id`, `seasonId`, `status`, `source` | Batch import tracking |

---

## Fixtures

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `Fixture` | `id`, `seasonId`, `homeTeamId`, `awayTeamId`, `kickoffAt`, `status`, `isPublished` | `isPublished` controls fan visibility |
| `FixtureImportBatch` | `id`, `seasonId`, `status`, `createdAt` | Import batch |
| `FixtureImportRow` | `id`, `batchId`, `rawData`, `validationErrors`, `status` | Per-row validation |
| `MatchEvent` | `id`, `fixtureId`, `eventType`, `minute`, `playerId`, `teamId` | Goals, cards, subs etc. |
| `FixtureLineup` | `id`, `fixtureId`, `teamId`, `playerId`, `position`, `isStarter` | Confirmed line-ups |

---

## Gameweeks

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `Gameweek` | `id`, `seasonId`, `number`, `status`, `deadlineAt`, `lockedAt` | `status`: SCHEDULED, ACTIVE, LOCKED, SCORING, COMPLETE |
| `GameweekPointsAllocation` | `id`, `gameweekId`, `userId`, `allocatedPoints` | Social prediction allocation per gameweek |

---

## Fantasy

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `FantasyTeam` | `id`, `userId`, `seasonId`, `name`, `totalPoints` | One per user per season |
| `FantasyTeamPlayer` | `id`, `fantasyTeamId`, `playerId`, `position`, `isCaptain`, `isViceCaptain` | Player slot |
| `FantasyTransfer` | `id`, `fantasyTeamId`, `gameweekId`, `playerInId`, `playerOutId`, `cost` | Transfer record |
| `FantasyPlayerPrice` | `id`, `playerId`, `seasonId`, `gameweekId`, `price` | Price at GW |
| `FantasyPlayerPriceHistory` | `id`, `playerId`, `seasonId`, `price`, `effectiveFrom` | Price history |
| `FantasyRulesConfig` | `id`, `seasonId`, `squadSize`, `maxPerClub`, `transfersPerGW`, `wildcard` | Config-driven rules |
| `FantasyGameweekScore` | `id`, `fantasyTeamId`, `gameweekId`, `points`, `rank` | GW score record |
| `FantasyPlayerGameweekScore` | `id`, `playerId`, `gameweekId`, `points`, `bonusPoints` | Player score |
| `FantasyPlayerMatchStat` | `id`, `playerId`, `fixtureId`, `goals`, `assists`, `cleanSheet`, `minutesPlayed` | Match stats for scoring |
| `FantasyAutoSubstitution` | `id`, `fantasyTeamId`, `gameweekId`, `playerOutId`, `playerInId`, `reason` | Auto-sub record |
| `FantasyChip` | `id`, `fantasyTeamId`, `chipType`, `gameweekId`, `activatedAt` | Triple captain, wildcard etc. |
| `FantasyFreeHitSnapshot` | `id`, `fantasyTeamId`, `gameweekId`, `snapshot` | Team snapshot for free hit |
| `FantasyGameweekLineupSnapshot` | `id`, `fantasyTeamId`, `gameweekId`, `lineup` | Locked lineup |
| `FantasyLeague` | `id`, `name`, `code`, `type`, `seasonId`, `createdByUserId` | `type`: PRIVATE, PUBLIC, GLOBAL |
| `FantasyLeagueMember` | `id`, `leagueId`, `userId`, `joinedAt`, `rank` | League membership |
| `FantasyCup` | `id`, `seasonId`, `name`, `type` | Cup competition |
| `FantasyCupRound` | `id`, `cupId`, `roundNumber`, `gameweekId` | Cup round |
| `FantasyCupTie` | `id`, `roundId`, `team1Id`, `team2Id`, `winnerId` | Head-to-head tie |
| `FantasyHeadToHeadFixture` | `id`, `cupTieId`, `gameweekId`, `team1Points`, `team2Points` | GW result |
| `FantasyPriceCalibrationBatch` | `id`, `seasonId`, `status`, `proposedPrices` | Price calibration |
| `FantasyPointsLedger` | `id`, `fantasyTeamId`, `gameweekId`, `source`, `points` | Fantasy points ledger |

---

## Predictions

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `ScorePrediction` | `id`, `userId`, `fixtureId`, `homeScore`, `awayScore`, `status`, `points` | Guess the Score submission |
| `PredictionPointsLedger` | `id`, `userId`, `fixtureId`, `points`, `source` | Immutable — append-only |
| `PredictionRulesConfig` | `id`, `seasonId`, `exactScore`, `correctResult`, `penalties` | Points config per season |
| `FixturePredictionMarket` | `id`, `fixtureId`, `status`, `lockedAt`, `settledAt` | Market lifecycle per fixture |
| `PredictionMarketConfig` | `id`, `seasonId`, `maxStake`, `minStake` | Social prediction market config |

---

## Social Predictions (Marketplace)

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `ChallengeListing` | `id`, `creatorId`, `fixtureId`, `marketId`, `stake`, `type`, `status` | A prediction put on the marketplace |
| `ChallengeMatch` | `id`, `listingId`, `acceptorId`, `status`, `matchedAt` | Atomic match between two fans — see ADR-020 |
| `ChallengeScore` | `id`, `matchId`, `winnerId`, `payoutAmount`, `settledAt` | Settlement record |
| `PeerChallenge` | `id`, `listingId`, `challengerId`, `recipientId`, `status` | Direct P2P challenge — see ADR-021 |
| `PredictionChallenge` | `id`, `token`, `fixtureId`, `creatorUserId`, `acceptorUserId`, `status`, `expiresAt` | Token-based shareable challenge — Sprint 6 |
| `SocialPredictionPointsEntry` | `id`, `userId`, `matchId`, `amount`, `type`, `createdAt` | Immutable gameplay ledger |
| `ComplianceDomainConfig` | `id`, `domain`, `rules`, `updatedAt` | Compliance configuration |

---

## Fan Value

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `FanValueLedger` | `id`, `userId`, `amount`, `source`, `type`, `createdAt` | Immutable — append-only; non-financial |
| `LeagueStanding` | `id`, `leagueId`, `userId`, `seasonId`, `fanValue` | Season-scoped Fan Value standing |

---

## Achievements & Badges

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `AchievementDefinition` | `id`, `name`, `slug`, `criteria`, `points` | What constitutes the achievement |
| `FanAchievement` | `id`, `userId`, `definitionId`, `earnedAt` | Fan's earned achievement |
| `BadgeDefinition` | `id`, `name`, `imageUrl`, `tier` | Visual badge |
| `AchievementBadge` | `id`, `achievementId`, `badgeId` | Links achievement to badge |
| `FanBadge` | `id`, `userId`, `badgeId`, `awardedAt` | Fan's earned badge |
| `FanReward` | `id`, `userId`, `definitionId`, `status`, `earnedAt` | Fan's reward status |

---

## Notifications

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `Notification` | `id`, `userId`, `type`, `title`, `body`, `readAt`, `archivedAt` | Notification record |
| `NotificationPreference` | `id`, `userId`, `type`, `enabled`, `channel` | Per-type preference |
| `NotificationDeliveryLog` | `id`, `notificationId`, `channel`, `status`, `deliveredAt` | Delivery audit |

---

## Activity Feed

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `ActivityFeedItem` | `id`, `userId`, `type`, `payload`, `isHidden`, `createdAt` | Feed entry |
| `ActivityReaction` | `id`, `feedItemId`, `userId`, `reactionType`, `createdAt` | Reaction on a feed item |

---

## Clubs

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `ClubProfile` | `id`, `teamId`, `bio`, `colors`, `logoUrl`, `founded` | Club metadata |
| `ClubExperienceStatus` | `id`, `teamId`, `seasonId`, `status` | Readiness status per season |
| `ClubContentItem` | `id`, `teamId`, `type`, `title`, `content`, `publishedAt` | Club news/content |
| `ClubShopProduct` | `id`, `teamId`, `name`, `price`, `imageUrl`, `available` | Shop product (stub) |
| `PlayerRating` | `id`, `fixtureId`, `playerId`, `rating`, `source` | Post-match player rating |

---

## Player Stats

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `PlayerMatchStats` | `id`, `playerId`, `fixtureId`, `seasonId`, `goals`, `assists`, `minutesPlayed`, `rating` | Match-level stats |
| `DataIngestionLog` | `id`, `source`, `fixtureId`, `status`, `ingestedAt`, `payload` | Data ingestion audit |

---

## Media

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `MediaAsset` | `id`, `title`, `slug`, `type`, `url`, `clubId`, `publishedAt` | Video, article, image |
| `MediaEngagementEvent` | `id`, `assetId`, `userId`, `eventType`, `createdAt` | View / completion event |

---

## Campaigns & Sponsors

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `Sponsor` | `id`, `name`, `slug`, `logoUrl`, `contractEnd` | Commercial sponsor |
| `SponsorCampaign` | `id`, `sponsorId`, `name`, `type`, `status`, `startAt`, `endAt` | Sponsor campaign |
| `CampaignAction` | `id`, `campaignId`, `type`, `description`, `fanValueReward` | Action within campaign |
| `FanCampaignParticipation` | `id`, `userId`, `campaignId`, `startedAt`, `completedAt` | Fan's participation |
| `FanCampaignActionCompletion` | `id`, `participationId`, `actionId`, `completedAt` | Completed action |
| `CampaignAnalyticsSnapshot` | `id`, `campaignId`, `date`, `participants`, `completions` | Daily analytics |
| `CampaignTriggerEvent` | `id`, `campaignId`, `triggerType`, `entityId`, `firedAt` | Campaign trigger log |

---

## Wallet & Commerce

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `WalletProviderDetail` | `id`, `slug`, `name`, `adapterClass`, `isSandbox` | Provider registry |
| `WalletLink` | `id`, `userId`, `providerId`, `externalRef`, `status`, `linkedAt` | Fan's wallet link |
| `WalletTransaction` | `id`, `walletLinkId`, `amount`, `currency`, `type`, `status` | Transaction record (sandbox only) |

---

## Season Management

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `SeasonSwitchAudit` | `id`, `fromSeasonId`, `toSeasonId`, `status`, `switchedAt` | Switch audit record |
| `SeasonActivationApproval` | `id`, `seasonId`, `approvalStatus`, `approvedBy`, `approvedAt` | Approval record; status is `APPROVED` never `ACTIVATED` per ADR-026 |
| `IntegrationProviderConfig` | `id`, `domain`, `providerSlug`, `isEnabled`, `isSandbox` | Provider config per domain |
| `SquadImportBatch` | `id`, `seasonId`, `status`, `source`, `createdAt` | Squad import batch |
| `SquadImportRow` | `id`, `batchId`, `rawData`, `validationErrors`, `status` | Per-row validation |

---

## Rewards

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `RewardDefinition` | `id`, `name`, `type`, `criteria`, `fanValueThreshold` | What unlocks a reward |
| `RewardReadinessDefinition` | `id`, `name`, `criteria`, `priority` | Readiness gate definition |
| `FanRewardReadiness` | `id`, `userId`, `definitionId`, `status`, `evaluatedAt` | Fan's readiness status |

---

## Admin & Audit

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `AdminAuditLog` | `id`, `userId`, `action`, `entityType`, `entityId`, `payload`, `createdAt` | Append-only admin action log |
| `BetaCohort` | `id`, `seasonId`, `name`, `status`, `startedAt`, `completedAt` | Beta user cohort |
| `BetaCohortMember` | `id`, `cohortId`, `userId`, `addedAt` | Cohort membership |

---

## Portal Scoping

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `ClubMembership` | `id`, `userId`, `teamId`, `role`, `isActive`, `createdAt` | DB-backed user-to-club scoping (Sprint 28 — ADR-032) |
| `SponsorMembership` | `id`, `userId`, `sponsorId`, `role`, `isActive`, `createdAt` | DB-backed user-to-sponsor scoping (Sprint 28 — ADR-032) |

---

## Integrity Rules

- `FanValueLedger` — append-only; no update or delete
- `PredictionPointsLedger` — append-only; no update or delete
- `SocialPredictionPointsEntry` — append-only; no update or delete
- `AdminAuditLog` — append-only; no update or delete
- `AuthAuditLog` — append-only; no update or delete
- `SeasonActivationApproval.approvalStatus` — never set to `ACTIVATED` (ADR-026)
- `Player.externalId` — non-unique; always scope queries with `seasonId` (ADR-014)
- Cross-domain table access is prohibited — only access models owned by your module

---

## Key Relations

```
User ──1:1──> FanProfile
User ──1:*──> ScorePrediction
User ──1:*──> FanValueLedger
User ──1:*──> FantasyTeam (one per season)
User ──1:*──> FanAchievement
User ──1:*──> Notification
User ──1:*──> ClubMembership (portal scoping)
User ──1:*──> SponsorMembership (portal scoping)

Season ──1:*──> Gameweek
Season ──1:*──> Fixture
Season ──1:*──> FantasyRulesConfig (via FantasyCalibrationModule)
Season ──1:1──> PredictionRulesConfig

Fixture ──1:1──> FixturePredictionMarket
Fixture ──1:*──> ScorePrediction
Fixture ──1:*──> PlayerMatchStats
Fixture ──1:*──> MatchEvent

FantasyTeam ──1:*──> FantasyTeamPlayer
FantasyTeam ──1:*──> FantasyGameweekScore

ChallengeListing ──1:*──> ChallengeMatch (FIFO matching — ADR-020)
ChallengeMatch ──1:1──> ChallengeScore
```

---

## Schema File

`apps/api/prisma/schema.prisma` — 103 models, 43 migrations applied (includes Sprint 28 ClubMembership + SponsorMembership)
