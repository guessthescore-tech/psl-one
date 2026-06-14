# PSL One — Fixtures and Matchday Domain

**Purpose:** Fixture lifecycle, import, publication, and live match operations  
**Audience:** Backend engineers, platform operators  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Fixture Lifecycle

```
SCHEDULED → LIVE → FINISHED
         ↑
    (published by admin)
```

States:

| State | Description |
|-------|-------------|
| `SCHEDULED` | Fixture created, not yet kicked off |
| `LIVE` | Match in progress |
| `FINISHED` | Match complete, result official |
| `POSTPONED` | Match postponed (future) |
| `CANCELLED` | Match cancelled |

### isPublished

Separately from status, a fixture must have `isPublished: true` for fans to make predictions. Admin publishes fixtures when confident in date/time accuracy.

---

## Fixture Import

`FixtureImportModule` handles bulk fixture ingestion from external sources.

### Import Batch Lifecycle

1. Admin creates batch: `POST /admin/fixture-import/batches`
2. Admin adds fixture rows: `POST /admin/fixture-import/batches/:id/rows`
3. System validates each row (team lookup, date validation, no duplicates)
4. Admin processes: `POST /admin/fixture-import/batches/:id/process`
5. `Fixture` records created

### FixtureImportRow Validation

| Check | Description |
|-------|-------------|
| Home team exists | `Team` record found |
| Away team exists | `Team` record found |
| Kickoff date valid | Future date, ISO format |
| No duplicate | Same teams on same date not already imported |
| Gameweek assigned | Valid `Gameweek` for season |

---

## Gameweeks

`Gameweek` scopes fixtures for Fantasy and prediction purposes:

| Field | Description |
|-------|-------------|
| `seasonId` | Season reference |
| `number` | Gameweek number (1, 2, 3...) |
| `deadlineAt` | Fantasy transfer deadline |
| `startDate` | First fixture date |
| `endDate` | Last fixture date |

**Fantasy transfers close at `deadlineAt`.** No transfers allowed after this time until next gameweek opens.

---

## Live Match Operations

`MatchCentreModule` manages live match state:

### Admin Live Session

Admin starts a live session for a fixture:

```
POST /admin/match-centre/sessions
{ "fixtureId": "..." }
```

Then enters events:

```
POST /admin/match-centre/:sessionId/events
{ "type": "GOAL", "minute": 23, "playerId": "...", "teamId": "..." }
```

Event types: `GOAL`, `ASSIST`, `YELLOW_CARD`, `RED_CARD`, `SUBSTITUTION`, `PENALTY_SCORED`, `PENALTY_MISSED`

### Commentary

```
POST /admin/match-centre/:sessionId/commentary
{ "minute": 23, "text": "GOAL! Chiefs take the lead!" }
```

### Match Result Entry

```
POST /admin/match-centre/:sessionId/result
{ "homeScore": 2, "awayScore": 1 }
```

This triggers social prediction settlement for all challenges on this fixture.

---

## Gameweek Operations Readiness

`GameweekOpsModule` tracks operational state per gameweek:

- Readiness check 9 in the 13-check season switching gate
- Confirms gameweeks are configured with valid deadlines
- Confirms all fixtures in current gameweek are assigned

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/fixtures` | Fan | Active season fixtures |
| GET | `/fixtures/:id` | Fan | Get fixture |
| GET | `/admin/fixtures` | Admin | All fixtures |
| POST | `/admin/fixtures` | Admin | Create fixture |
| PATCH | `/admin/fixtures/:id` | Admin | Update fixture |
| POST | `/admin/fixtures/:id/publish` | Admin | Publish |
| POST | `/admin/fixtures/:id/unpublish` | Admin | Unpublish |
| GET | `/admin/fixture-import/batches` | Admin | Import batches |
| POST | `/admin/fixture-import/batches` | Admin | Start import |
| POST | `/admin/fixture-import/batches/:id/rows` | Admin | Add rows |
| POST | `/admin/fixture-import/batches/:id/process` | Admin | Process batch |
| GET | `/admin/match-centre/sessions` | Admin | Live sessions |
| POST | `/admin/match-centre/sessions` | Admin | Start session |
| POST | `/admin/match-centre/:sessionId/events` | Admin | Add event |
| POST | `/admin/match-centre/:sessionId/commentary` | Admin | Add commentary |
| POST | `/admin/match-centre/:sessionId/result` | Admin | Enter result |
| GET | `/admin/gameweek-ops/:seasonId/readiness` | Admin | Gameweek readiness |
