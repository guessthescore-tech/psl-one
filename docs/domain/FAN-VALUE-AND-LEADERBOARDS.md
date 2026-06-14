# PSL One — Fan Value and Leaderboards Domain

**Purpose:** Fan Value ledger, achievements, rewards, and season-scoped leaderboards  
**Audience:** Backend engineers, product  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Fan Value

Fan Value is a non-financial loyalty score. It has no cash value and cannot be converted to money or gameplay points.

Module: `FanValueModule`  
Model: `FanValueLedger`

### Fan Value Entry Types

| Type | Trigger |
|------|---------|
| `PREDICTION_SUBMITTED` | Fan submits a Guess the Score prediction |
| `PREDICTION_WON` | Fan wins a prediction |
| `FANTASY_TRANSFER` | Fan makes a Fantasy transfer |
| `FANTASY_GAMEWEEK_SCORE` | Fan receives gameweek score |
| `CHALLENGE_PARTICIPATED` | Fan participates in a social challenge |
| `ACHIEVEMENT_UNLOCKED` | Fan unlocks an achievement |
| `PROFILE_COMPLETED` | Fan completes profile |
| (+ additional types per domain) | |

### Season Scope

`FanValueLedger.seasonId` is derived from the related record where possible (e.g., via fixture → gameweek → season). A direct `seasonId` nullable column exists for cases where derivation is not possible.

---

## Achievements and Badges

Module: `AchievementsModule`  
Models: `AchievementDefinition`, `UserAchievement`, `Badge`

### Seeded Definitions (17 total)

Categories: `PREDICTION`, `FANTASY`, `SOCIAL`, `ENGAGEMENT`, `MILESTONE`

Examples:
- First Prediction Submitted
- First Fantasy Team Created
- 10 Predictions Won
- First Challenge Accepted
- Profile Complete

### Achievement Side Effects

When unlocked:
1. `UserAchievement` record created
2. `Badge` associated if defined
3. `Notification` written (admin-configurable type)
4. `FanValueLedger` entry written (achievement Fan Value)

---

## Rewards Readiness

Module: `RewardsModule`  
Models: `RewardReadinessDefinition`, `FanRewardReadiness`

6 seeded reward definitions. Eligibility engine evaluates fans against each definition's criteria. Not yet connected to a real reward delivery provider.

---

## Leaderboards

Module: `EngagementModule`

Season-scoped leaderboards:

| Leaderboard | Ranked by |
|------------|----------|
| Fan Value | Total `FanValueLedger` points for season |
| Prediction | Total `PredictionPointsLedger` points for season |
| Fantasy | Total `FantasyGameweekScore.points` for season |
| Social Prediction | Total `SocialPredictionPointsEntry` net for season |

All leaderboards default to the active season. Historical leaderboards accessible via `?seasonId=`.

### 10th Season-Switching Check

Leaderboard configuration for the target season must be present before season activation.

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/fan-value` | Fan | My Fan Value balance |
| GET | `/fan-value/history` | Fan | Ledger history |
| GET | `/achievements` | Fan | My achievements and badges |
| GET | `/rewards` | Fan | My reward readiness |
| GET | `/leaderboards/fan-value` | Fan | Fan Value leaderboard |
| GET | `/leaderboards/predictions` | Fan | Prediction points leaderboard |
| GET | `/leaderboards/fantasy` | Fan | Fantasy leaderboard |
| GET | `/admin/leaderboards` | Admin | Admin leaderboard overview |
| GET | `/admin/achievements` | Admin | All achievement definitions |
| POST | `/admin/achievements` | Admin | Create achievement definition |
| POST | `/admin/achievements/:id/award` | Admin | Manually award achievement |
