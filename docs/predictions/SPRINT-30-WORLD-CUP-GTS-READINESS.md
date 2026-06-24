# Sprint 30 — World Cup 2026 Guess the Score Readiness

**Status:** GO | PSL INACTIVE | POINTS_ONLY | NON-FINANCIAL
**Date:** 2026-06-24

## Summary

Guess the Score (GTS) is **READY** for World Cup 2026 beta user testing.
All 104 WC matches can appear as prediction cards.

| Feature | Status | Notes |
|---------|--------|-------|
| Prediction cards (all 104 matches) | ✅ READY | ScorePrediction model exists |
| Lock timing | ✅ READY | Calculated from kickoffAt |
| Score settlement | ✅ READY | PredictionsModule handles FINISHED status |
| Challenge settlement | ✅ READY | ChallengesModule + ChallengeSettlementService |
| Points ledger | ✅ READY | PredictionPointsLedger |
| Leaderboards | ✅ READY | EngagementModule, points-only |
| Direct peer challenges | ✅ READY | PredictionChallenge model |

## Prediction Card Availability

Every WC2026 fixture with `status = SCHEDULED` and `isPublished = true` is eligible to appear as a GTS prediction card.

**Admin must publish fixtures** before they appear in the fan view:
- Route: `POST /admin/fixtures/:id/publish`
- Bulk: `POST /admin/fixtures/publish-batch`
- Safety check: `isPublished` flag gates fan-facing display

## Lock Timing

Prediction lock is applied at `fixture.kickoffAt - lockMinutes` where `lockMinutes` is from `FantasyRulesConfig`.

Default lock: 60 minutes before kickoff.

Lock workflow:
1. Fixture created with `status: SCHEDULED`
2. Fan submits prediction (if `now < kickoffAt - lockMinutes`)
3. At `kickoffAt - lockMinutes` → predictions lock (`PredictionService.lockPredictions()`)
4. Admin or automation: update fixture score at FT → `status: FINISHED`
5. Settlement runs → `PredictionsModule.settlePredictions(fixtureId)`

## Score Settlement

Settlement triggered by:
- `POST /admin/fixtures/:id/result` (manual — safe for beta, no auto-trigger)
- Settlement logic: exact score = 3 points, correct result = 1 point (or per FantasyRulesConfig)
- Points credited to `PredictionPointsLedger` (non-financial)

Settlement simulation for testing:
1. Admin sets fixture score via `/admin/fixtures/:id/result`
2. System runs `PredictionsModule.settlePredictions()`
3. Leaderboard updates automatically

## Challenge Settlement

Peer challenges via `PredictionChallenge`:
1. Fan A challenges Fan B on a specific fixture
2. Both submit scores before lock
3. Settlement: whoever predicted closest score wins the challenge
4. Points credited from `PredictionPointsLedger` (non-financial engagement points)
5. Social feed item created via `ActivityFeedModule`

**No financial wagers** — points only.

## Social Features (Connected)

- `ActivityFeedModule`: predictions and challenges appear in social feed
- `NotificationsModule`: fan notified when challenged, when result is in
- `SocialPredictionModule`: prediction markets, leaderboards, social sharing

## Points System (POINTS_ONLY)

| Prediction Outcome | Points |
|-------------------|--------|
| Exact score | 3 |
| Correct result (win/draw/loss) | 1 |
| Incorrect | 0 |
| Challenge win | Configurable (default: stake-equivalent in points) |

All via `PredictionPointsLedger`. No financial settlement. No cash prizes.

## Safety Confirmations

- ✅ POINTS_ONLY — no betting, no odds, no wagers, no stakes, no payouts
- ✅ NON_FINANCIAL — PredictionPointsLedger is engagement-only
- ✅ No gambling mechanics — no house edge, no bookmaker functionality
- ✅ PSL INACTIVE — WC2026 context only
- ✅ WALLET SANDBOX — no real money movement

## Beta Test Readiness

**Ready for tester access:**
1. Admin publishes WC2026 fixtures via admin panel
2. Fans receive notifications as fixtures approach
3. Fans submit score predictions
4. Admin enters match results (manual for beta)
5. System auto-settles and updates leaderboard
6. Fans can challenge each other on specific matches

**No owner gate required** before this flow is tested.

---

*PSL INACTIVE | WALLET SANDBOX | POINTS_ONLY | NO BETTING | NO GAMBLING | BETA ONLY*
