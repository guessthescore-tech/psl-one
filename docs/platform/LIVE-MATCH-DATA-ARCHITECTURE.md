# PSL One — Live Match Data Architecture

> **Historical Implementation Record** — This document was created during Sprint delivery as a working reference. It may be superseded by content in `docs/architecture/`, `docs/engineering/`, `docs/reference/`, or `docs/domain/`. Do not use as the canonical source for system behaviour.


**Story:** STORY-38  
**Status:** FOUNDATION_READY (official provider: PROVIDER_REQUIRED)

---

## Provider-Neutral Design

The match centre is designed so that **official provider data can be wired in Sprint 3 without changing any fan-facing routes, domain models, or business logic.**

### Data Source Types

| Source | Description | Status |
|--------|-------------|--------|
| `MANUAL` | Admin-entered via admin UI | Available now |
| `SEEDED` | Injected by seed script | Available now |
| `SANDBOX_PROVIDER` | Simulated provider data via ingest API | Available now |
| `OFFICIAL_PROVIDER` | Real provider feed (Opta, Stats Perform, etc.) | PROVIDER_REQUIRED |

### Data Status

| Status | Meaning |
|--------|---------|
| `PROVISIONAL` | Entered manually, not yet verified |
| `LIVE` | Ingested during live match |
| `VERIFIED` | Post-match verification complete |
| `FINAL` | Signed off, no further changes expected |
| `CORRECTED` | Data updated via correction entry |

### Freshness Status

| Status | Meaning |
|--------|---------|
| `FRESH` | Data updated within expected window |
| `DELAYED` | Provider feed delayed |
| `STALE` | Data overdue |
| `OFFLINE` | Provider feed disconnected |
| `MANUAL` | No live feed — manually maintained |

---

## Models

| Model | Description |
|-------|-------------|
| `LeagueStanding` | Season-scoped standings with provenance |
| `TeamFormRecord` | Team form string (WWDLW) + recentFixtures JSON |
| `PlayerRating` | Per-fixture performance rating (0–10) with version tracking |
| `DataIngestionLog` | Immutable audit of every ingest operation |

All models include `sourceType`, `dataStatus`, and `lastUpdatedAt` for provenance tracking.

---

## Official Provider Swap Strategy

**Do NOT change fan route contracts, domain models, or rebuild the Match Centre when wiring a provider.**

Steps to add an official provider:

1. **Create a new provider adapter** implementing the `MatchDataProviderAdapter` interface
2. **Wire the adapter** to `adminIngestSandboxData` — rename to `adminIngestMatchData` if needed
3. **Fan routes remain unchanged** — `/match-centre/*` contracts are stable
4. **Domain models remain unchanged** — `PlayerRating`, `LeagueStanding`, etc. are provider-neutral
5. **Update `sourceType`** on ingested records from `SANDBOX_PROVIDER` to `OFFICIAL_PROVIDER`
6. **Update `freshnessStatus`** based on provider feed health

The fan experience is identical regardless of data source — only `dataProvenance` metadata changes.

---

## API Routes

### Fan Routes (`/match-centre/`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/match-centre/fixture/:fixtureId` | Full match centre (events, lineups, stats, ratings) |
| GET | `/match-centre/fixture/:fixtureId/line-ups` | Fixture lineups grouped by team |
| GET | `/match-centre/fixture/:fixtureId/stats` | Player match stats |
| GET | `/match-centre/fixture/:fixtureId/player-ratings` | Player ratings |
| GET | `/match-centre/standings/:seasonId` | Season standings table |
| GET | `/match-centre/team-form/:clubId?seasonId=` | Team form record |
| GET | `/match-centre/player/:playerId?seasonId=` | Player profile + season aggregate |

### Admin Routes (`/admin/match-centre/`)

| Method | Path | Description |
|--------|------|-------------|
| PUT | `/admin/match-centre/standings` | Batch upsert standings |
| PATCH | `/admin/match-centre/standings/:seasonId/:clubId` | Single standing upsert |
| PUT | `/admin/match-centre/team-form/:clubId` | Upsert team form |
| POST | `/admin/match-centre/player-ratings` | Upsert player rating |
| POST | `/admin/match-centre/ingest` | Sandbox data ingestion (LINEUP/MATCH_EVENT/PLAYER_RATING/STANDING) |
| GET | `/admin/match-centre/ingestion-log` | Ingestion audit log |
| GET | `/admin/match-centre/provenance/:entityType/:entityId` | Data provenance for entity |
| GET | `/admin/match-centre/capability-status` | Integration capability overview |

---

## Capability Status

`GET /admin/match-centre/capability-status` returns:

```json
{
  "richUI": "ENABLED",
  "sandboxIngestion": "ENABLED",
  "productionIngestion": "DISABLED",
  "officialProviderFeed": "PROVIDER_REQUIRED",
  "officialProviderSwapStrategy": [
    "Do NOT change fan route contracts",
    "Do NOT replace domain models",
    "Do NOT rebuild Match Centre",
    "Wire provider adapter only at the ingestion layer"
  ]
}
```

---

## Safety Boundaries

- Do NOT call Opta, Stats Perform, Sportradar, API-Football, FIFA, or PSL from the sandbox ingestion endpoint
- Do NOT use copyrighted player images
- Do NOT scrape external sites
- Sandbox ingestion (`sourceType: SANDBOX_PROVIDER`) is for testing only
- All ingestion is logged to `DataIngestionLog` for audit purposes
- Production ingestion requires Sprint 3+ provider contract

---

## STORY-38: Campaign Trigger Integration

### CampaignTriggerService

Location: `apps/api/src/campaigns/campaign-trigger.service.ts`

Fires `CampaignTriggerEvent` records when match lifecycle events occur during sandbox ingestion. Used to activate sponsor campaigns on match events without coupling the campaign engine to the match ingestion path.

**9 trigger types:**

| Type | Fired When | Idempotency |
|------|-----------|-------------|
| `LINEUP_CONFIRMED` | Lineup ingested | `${campaignId}:${fixtureId}:LINEUP_CONFIRMED` |
| `MATCH_STARTED` | KICKOFF event ingested | `${campaignId}:${fixtureId}:MATCH_STARTED` |
| `GOAL_SCORED` | GOAL or PENALTY_SCORED event | `${campaignId}:${fixtureId}:GOAL_SCORED:${sourceEventId}` |
| `HALF_TIME` | HALF_TIME event | `${campaignId}:${fixtureId}:HALF_TIME` |
| `FULL_TIME` | FULL_TIME event | `${campaignId}:${fixtureId}:FULL_TIME` |
| `PLAYER_OF_MATCH_VOTE_OPEN` | Manual via service | `${campaignId}:${fixtureId}:PLAYER_OF_MATCH_VOTE_OPEN` |
| `CLEAN_SHEET_COMPLETED` | Manual via service | `${campaignId}:${fixtureId}:CLEAN_SHEET_COMPLETED` |
| `FANTASY_MILESTONE` | Fantasy service hook (explicit key) | Caller-supplied `idempotencyKey` |
| `PREDICTION_RESULT_AVAILABLE` | FULL_TIME event (co-fired) | `${campaignId}:${fixtureId}:PREDICTION_RESULT_AVAILABLE` |

**Design principles:**
- `upsert` with `update: {}` → duplicate triggers silently ignored
- All failures caught inside `_upsertTrigger` — never propagates to ingestion
- Callers use `void campaignTriggerService.fire...()` (fire-and-forget)
- Queries only `CampaignStatus.PUBLISHED` campaigns within `startsAt ≤ now ≤ endsAt`
- `FANTASY_MILESTONE` uses `findUnique` per campaign (not `findMany` by fixture) — targeted, explicit

**Integration:**

`MatchCentreService.adminIngestSandboxData()` calls trigger methods after ingesting:
- `LINEUP` → `fireLineupConfirmed`
- `KICKOFF` event → `fireMatchStarted`
- `GOAL`/`PENALTY_SCORED` event → `fireGoalScored(fixtureId, sourceEventId)`
- `HALF_TIME` event → `fireHalfTime`
- `FULL_TIME` event → `fireFullTime` + `firePredictionResultAvailable`

**Demo seed:** `match-day-trigger-demo` campaign (PUBLISHED, 2026–2027 window) is seeded as the trigger-ready demo campaign for local testing.
