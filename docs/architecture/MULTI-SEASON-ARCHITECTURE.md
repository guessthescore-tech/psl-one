# PSL One — Multi-Season Architecture

**Purpose:** How PSL One supports multiple concurrent and historical seasons  
**Audience:** Backend engineers, architects  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Season State Machine

```
UPCOMING → ACTIVE → COMPLETED
              ↑
        (only one at a time)
```

- `UPCOMING`: Season is prepared — clubs, fixtures, rules configured. `isActive: false`.
- `ACTIVE`: Current live season. `isActive: true`. Exactly one at a time.
- `COMPLETED`: Historical. `isActive: false`. Data read-only.

---

## Current Season State

| Competition | Status | `isActive` |
|-------------|--------|-----------|
| FIFA World Cup 2026 | ACTIVE | `true` |
| PSL Premiership 2026/27 | UPCOMING | `false` |

The PSL season is prepared but not activated. Season activation is a controlled operation requiring all 13 readiness checks plus explicit admin trigger. This has not yet been performed.

---

## Season Scope in Queries

Most domain queries default to the active season. The pattern:

```typescript
const season = await this.prisma.season.findFirst({
  where: { isActive: true },
});
```

For historical or non-active season queries, `seasonId` is passed explicitly:

```typescript
const score = await this.prisma.fantasyGameweekScore.findFirst({
  where: { fantasyTeam: { userId, seasonId: explicitSeasonId } },
});
```

Fan-facing API routes support `?seasonId=` query param for historical data access.

---

## Season-Scoped Models

These models carry `seasonId` directly or are scoped via a relation:

| Model | Season scope |
|-------|-------------|
| `Season` | Identity |
| `SeasonTeam` | `seasonId` |
| `SeasonTeamPlayer` | `seasonId` |
| `FantasyTeam` | `seasonId` |
| `FantasyRulesConfig` | `seasonId` |
| `PredictionRulesConfig` | `seasonId` |
| `Gameweek` | `seasonId` |
| `FantasyCalibration` | `seasonId` |
| `BetaCohort` | `seasonId` |
| `SeasonActivationApproval` | `seasonId` |

---

## Season Switching — 13-Check Gate

`SeasonSwitchingService` performs 13 readiness checks before activation is allowed. These are executed by `BetaLaunchModule` without duplication (delegates to `SeasonSwitchingService`).

| # | Check Key | Description |
|---|-----------|-------------|
| 1 | `clubs` | Minimum required clubs registered for target season |
| 2 | `fixtures_published` | Minimum published fixtures in target season |
| 3 | `gameweeks_configured` | Gameweeks created with valid deadlines |
| 4 | `fantasy_rules` | `FantasyRulesConfig` exists for target season |
| 5 | `prediction_rules` | `PredictionRulesConfig` exists for target season |
| 6 | `squad_import` | Squad import completed successfully |
| 7 | `player_prices` | Player prices set in `SeasonTeamPlayer` |
| 8 | `prediction_calibration` | Prediction config promoted from PROVISIONAL |
| 9 | `gameweek_ops` | Gameweek operational readiness confirmed |
| 10 | `leaderboards` | Season-scoped leaderboard configuration present |
| 11 | `player_stats` | Player stats module operational for target season |
| 12 | `media_campaigns` | Campaign definitions available |
| 13 | `beta_cohort` | At least one beta cohort defined |

---

## Season Switching Operation

`SeasonSwitchingService.switchSeason(fromSeasonId, toSeasonId, adminUserId)`:

1. Verify all 13 checks pass
2. Open transaction:
   - Set `from` season `isActive: false`
   - Set `to` season `isActive: true`
   - Write `SeasonSwitchAudit` record
3. If transaction fails, full rollback — no partial state

A dry-run mode (`dryRun: true`) describes what *would* happen without performing any writes. Dry-run responses carry `dryRunOnly: true` and `activationWillNotBePerformed: true`.

---

## World Cup History Preservation

**Rule:** The FIFA World Cup 2026 data must be preserved in full when the PSL season is activated.

Implementation:
- Switching sets `from.isActive: false` — it does NOT delete or archive the season
- All World Cup fixtures, predictions, Fantasy scores, achievements, leaderboard entries remain queryable
- Historical views accessible via `?seasonId=<wc-season-id>` query param
- Rollback dry-run response carries `worldCupHistoryPreserved: true`

---

## Fantasy Season Isolation

Each `FantasyTeam` belongs to one season. A fan has a separate Fantasy team per season. Transfers, chips, and scores do not carry across seasons.

## Prediction Season Isolation

`Prediction` records are tied to a `Fixture`, which is tied to a `Gameweek`, which has a `seasonId`. Historical predictions are queryable but not modifiable after the season ends.

## Leaderboard Season Isolation

`EngagementModule` scopes all leaderboard queries to a `seasonId`. No cross-season aggregation on fan-facing leaderboards.

---

## Season Activation Approval

`SeasonActivationApproval` records admin confirmation that readiness is verified:

- `approvalStatus: APPROVED` — all checks reviewed
- **Does NOT activate the season** — `Season.isActive` is not changed
- `activationPerformedAt` is never set in STORY-39
- Actual season switch is a separate `switchSeason()` call not yet available via API

This separation is intentional. Approval is a sign-off record. Activation is a controlled operational step.
