# PSL One — Migration Reference

**Purpose:** Ordered list of all 42 database migrations
**Audience:** Backend engineers
**Status:** Current as of Sprint 7 (Provider Trial Activation & Challenge Settlement)
**Last verified:** 2026-06-21

---

## Migration Count

**Total migrations:** 42 (as of Sprint 7)

---

## Sprint 1 Migrations (STORY-01 through STORY-25)

These early migrations establish the core schema. Exact timestamps vary; see `apps/api/prisma/migrations/` for exact file names.

| Story group | Migrations cover |
|------------|-----------------|
| STORY-01 | User, UserPreferences, auth tables |
| STORY-02 | Competition, Season, Team, Fixture, Gameweek, Venue, Player |
| STORY-03 | UserPreferences extensions |
| STORY-05 | Prediction, PredictionPointsLedger |
| STORY-06 | FantasyTeam, FantasyTeamPlayer, SeasonTeamPlayer |
| STORY-07 | Transfer, deadline fields |
| STORY-08 | Season status fields |
| STORY-11 | Prediction status lifecycle, PredictionStatus enum |
| STORY-12 | Fantasy lock fields, lockReason |
| STORY-13 | FantasyChip |
| STORY-14 | FantasyRulesConfig |
| STORY-15 | FantasyLeague, FantasyLeagueMember |
| STORY-16 | FantasyGameweekScore, FanValueLedger |
| STORY-18 | FantasyAutoSubstitution |
| STORY-19 | FanValueLedger extensions |
| STORY-20 | AchievementDefinition, UserAchievement, Badge |
| STORY-21 | RewardReadinessDefinition, FanRewardReadiness |
| STORY-22 | Notification, NotificationPreference |
| STORY-23 | ActivityFeedItem |

---

## Sprint 2 Migrations (STORY-26 through STORY-39)

| Migration | Story | Description |
|----------|-------|-------------|
| `..._psl_clubs_and_season_teams` | STORY-26 | ClubProfile, ClubNews, ClubFanFollow |
| `..._fixture_import` | STORY-27 | FixtureImportBatch, FixtureImportRow, isPublished on Fixture |
| `..._season_switch_audit` | STORY-28 | SeasonSwitchAudit |
| `..._fantasy_calibration` | STORY-29 | FantasyCalibration |
| `..._prediction_rules_config` | STORY-30 | PredictionRulesConfig |
| `..._gameweek_ops` | STORY-31 | Gameweek operations fields |
| `..._integration_provider_config` | STORY-32 | IntegrationProviderConfig |
| `..._squad_import` | STORY-36 | SquadImportBatch, SquadImportRow |
| `..._fantasy_price_calibration` | STORY-36 | FantasyPriceCalibration extensions |
| `..._media_campaigns_wallet` | STORY-37 | MediaItem, SponsorCampaign, CampaignRule, CampaignTriggerLog, WalletLink |
| `..._admin_audit_log` | STORY-35 | AdminAuditLog |
| `..._beta_feedback` | STORY-35 | BetaFeedbackEntry |
| `20260609063038_drop_old_notification_prefs` | STORY-35 | Drop old notification preference columns |
| `20260613000001_social_prediction_match_centre` | STORY-38 | SocialPredictionListing, SocialPredictionMatch, SocialPredictionPointsEntry, MatchEvent, LiveMatchSession |
| `20260613000002_direct_challenges_campaign_triggers` | STORY-38 | DirectChallenge, MarketplaceListing, ChallengeIdempotency, CampaignTriggerLog extensions |
| `20260614000001_beta_launch_readiness` | STORY-39 | BetaCohort, BetaCohortMember, SeasonActivationApproval |
| `20260615000001_security_performance_hardening` | S3-INFRA-00 | Additive indexes for confirmed high-volume query paths: match_events(fixture_id, minute), fantasy_points_ledger(fantasy_team_id, fixture_id), prediction_points_ledger(fixture_id) |
| `20260621000001_account_security_trust` | Sprint 5 | AuditEvent enum extensions (PASSWORD_CHANGED, PASSWORD_CHANGE_FAILED, ACCOUNT_DELETION_REQUESTED, ACCOUNT_DELETION_CANCELLED); DeletionRequestStatus enum; AccountDeletionRequest table |
| `20260621000002_prediction_challenge_token` | Sprint 6 | PredictionChallengeStatus enum; AuditEvent extensions (CHALLENGE_TOKEN_CREATED, CHALLENGE_TOKEN_ACCEPTED); prediction_challenges table |
| `20260621000003_challenge_settlement` | Sprint 7 | PredictionChallengeStatus.SETTLED; AuditEvent.CHALLENGE_SETTLED; settlement columns on prediction_challenges (settled_at, creator_points, acceptor_points, winner_user_id, settlement_reason) |

---

## How to View All Migrations

```bash
ls apps/api/prisma/migrations/
```

```bash
# View pending migration status
pnpm --filter @psl-one/api exec -- prisma migrate status
```

---

## Migration Rules

- Never edit existing migration files
- Never drop columns with data without a plan
- New required fields need migration-time defaults
- Use additive changes only
- See [Migration Operations](../operations/MIGRATION-OPERATIONS.md) for full workflow
