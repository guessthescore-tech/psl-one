# PSL One — Adding a New Season

**Purpose:** How to prepare and activate a new competition season  
**Audience:** Backend engineers, platform operators  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Overview

A "new season" means creating a new `Season` record for either an existing or new `Competition`, configuring all domain settings for it, and eventually activating it as the live season.

The current state: FIFA World Cup 2026 is ACTIVE, PSL Premiership 2026/27 is UPCOMING.

---

## Readiness Gate

Before a season can be activated, all 13 readiness checks must pass. Checks are run by `SeasonSwitchingService`. Status is visible at:

```
GET /admin/beta-launch/:seasonId/readiness
GET /admin/season-switching/:seasonId/readiness
```

See [Multi-Season Architecture](../architecture/MULTI-SEASON-ARCHITECTURE.md) for the full 13-check list.

---

## Step-by-Step: Preparing a New Season

### 1. Create Competition (if new)

```
POST /admin/competitions
{ "name": "PSL Premiership", "country": "South Africa", "type": "LEAGUE" }
```

### 2. Create Season

```
POST /admin/seasons
{
  "competitionId": "<competition-id>",
  "name": "2026/27",
  "startDate": "2026-09-01",
  "endDate": "2027-05-31",
  "status": "UPCOMING"
}
```

`isActive` must be `false` on creation.

### 3. Register Clubs

For each of the 16 PSL clubs:

```
POST /admin/seasons/:seasonId/teams
{ "teamId": "<team-id>" }
```

This creates `SeasonTeam` records.

### 4. Import Squad

Use the Squad Import pipeline:

```
POST /admin/squad-import/batches
{ "seasonId": "<season-id>", "source": "manual" }
```

Then add players via batch rows. Or use the bulk import with a CSV/JSON payload.

### 5. Set Player Prices

After squad import, set Fantasy prices in `SeasonTeamPlayer`:

```
POST /admin/fantasy-calibration/:seasonId/prices
{ "prices": [{ "playerId": "...", "price": 6.5 }] }
```

### 6. Configure Fantasy Rules

```
POST /admin/fantasy-rules/:seasonId
{
  "budget": 100,
  "squadSize": 15,
  "startingXI": 11,
  "transfersPerWeek": 1,
  "pointsPerGoal": 6,
  ...
}
```

### 7. Configure Prediction Rules

```
POST /admin/prediction-rules/:seasonId
{
  "exactScorePoints": 3,
  "correctResultPoints": 1,
  "predictionWindowMinutes": 60
}
```

### 8. Import Fixtures

Use fixture import pipeline:

```
POST /admin/fixture-import/batches
{ "seasonId": "<season-id>" }
```

Then publish fixtures:

```
POST /admin/fixtures/:id/publish
```

Minimum fixture count must be met for readiness check 2.

### 9. Create Gameweeks

```
POST /admin/gameweeks
{
  "seasonId": "<season-id>",
  "number": 1,
  "deadlineAt": "2026-09-12T12:00:00Z",
  "startDate": "2026-09-13",
  "endDate": "2026-09-15"
}
```

### 10. Verify All 13 Readiness Checks

```
GET /admin/season-switching/:seasonId/readiness
```

All 13 must be `status: "PASS"`.

### 11. Run Dry Run

```
POST /admin/beta-launch/:seasonId/dry-run
```

Response will carry `dryRunOnly: true` and describe what the activation would do.

### 12. Create Activation Approval Record

```
POST /admin/beta-launch/:seasonId/approve
{ "notes": "All checks verified, ready for PSL season activation" }
```

This creates `SeasonActivationApproval` with `approvalStatus: "APPROVED"`. **Does NOT activate the season.**

### 13. Activate Season (Separate Controlled Operation)

Season activation is not yet available via the API. It requires:

- STORY-40 completed (official PSL data)
- All 13 checks passing
- Explicit admin trigger from a dedicated activation endpoint

When the endpoint exists, it will call `SeasonSwitchingService.switchSeason()`.

---

## Season Switching Logic

`switchSeason(fromSeasonId, toSeasonId, adminUserId)`:

1. All 13 checks verified
2. Transaction:
   - `from.isActive = false`
   - `to.isActive = true`
   - Write `SeasonSwitchAudit`
3. World Cup data preserved — `from` season is not deleted

---

## Adding a Competition Type

If the new competition is not currently supported (e.g., a cup competition, international friendly series), you may need to:

1. Add a `CompetitionType` enum value in `schema.prisma`
2. Create migration
3. Seed the new competition type
4. Update any competition-type-specific UI

Always create an ADR for new competition types if they require structural changes.
