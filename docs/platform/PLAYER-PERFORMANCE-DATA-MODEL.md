# PSL One — Player Performance Data Model

**Story:** STORY-38  
**Status:** FOUNDATION_READY

---

## Overview

Player performance data in PSL One is stored across four models:

| Model | Scope | Purpose |
|-------|-------|---------|
| `PlayerMatchStats` | Per fixture | Goals, assists, cards, saves (STORY-34) |
| `PlayerRating` | Per fixture | Performance rating 0–10 with provenance |
| `FixtureLineup` | Per fixture | Starting XI and bench |
| `MatchEvent` | Per fixture | Goal, card, substitution events |

All models support provider-neutral data sourcing via `DataSourceType`, `DataStatus`, and `FreshnessStatus` fields.

---

## PlayerRating

```prisma
model PlayerRating {
  playerId          String          // FK → Player
  fixtureId         String          // FK → Fixture
  performanceRating Float           // 0.0 – 10.0
  minutesPlayed     Int
  goals             Int
  assists           Int
  yellowCards       Int
  redCards          Int
  sourceType        DataSourceType  // MANUAL / SEEDED / SANDBOX_PROVIDER / OFFICIAL_PROVIDER
  ratingSource      String          // "MANUAL", "SANDBOX_PROVIDER", provider slug
  providerKey       String?         // Provider's rating identifier
  ratingStatus      DataStatus
  ratingVersion     Int             // Increments on each update
  lastUpdatedAt     DateTime

  @@unique([playerId, fixtureId])
}
```

### Version Tracking

Each upsert increments `ratingVersion`. This allows:
- Auditing rating changes over time
- Detecting provider updates vs admin corrections
- Rolling back to previous version (via `DataIngestionLog`)

---

## PlayerMatchStats (STORY-34, extended in STORY-38)

Used for fantasy scoring and the match centre. Contains:
- `goals`, `assists`, `yellowCards`, `redCards`, `saves`, `cleanSheet`
- `minutesPlayed`, `xG`, `xA` (expected goals/assists — nullable for manual entry)
- `ownGoals`, `penaltiesMissed`, `penaltiesSaved`

---

## FixtureLineup

```prisma
model FixtureLineup {
  fixtureId    String
  teamId       String
  playerId     String
  status       LineupStatus  // STARTING / SUBSTITUTE / UNUSED_SUBSTITUTE
  shirtNumber  Int?
  position     String?       // "GK", "CB", "LB", etc.
}
```

Lineups are seeded/ingested before kickoff and are central to fantasy auto-substitution (STORY-18).

---

## Data Provenance Contract

Every entity exposed via `/match-centre/*` includes a `dataProvenance` object:

```json
{
  "sourceType": "MANUAL",
  "dataStatus": "PROVISIONAL",
  "freshnessStatus": "MANUAL",
  "lastUpdatedAt": "2026-06-13T00:00:00.000Z",
  "providerKey": null,
  "note": "Data sourced from manual entry or seeded sandbox data. Official provider integration is INTEGRATION_READY."
}
```

This contract is stable — it will remain the same shape after an official provider is wired.

---

## Fan Profile Aggregates

`GET /match-centre/player/:playerId?seasonId=` returns season-aggregate stats:

```json
{
  "player": { "id": "...", "name": "...", "position": "FORWARD", "team": {...} },
  "seasonAggregate": {
    "appearances": 12,
    "goals": 7,
    "assists": 3,
    "yellowCards": 1,
    "redCards": 0,
    "minutesPlayed": 1023,
    "saves": 0,
    "cleanSheets": 0
  },
  "recentRatings": [...],
  "dataProvenance": {...}
}
```

---

## What Is NOT Implemented

- Live provider ingestion (requires Sprint 3+ contract)
- Real-time push updates (requires WebSocket/SSE infrastructure)
- Copyrighted player images (policy: do not use copyrighted images)
- External API calls to Opta, Stats Perform, Sportradar, or any provider
- xG/xA data (nullable, not seeded in STORY-38)
