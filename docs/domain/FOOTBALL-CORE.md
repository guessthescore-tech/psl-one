# PSL One — Football Core Domain

**Purpose:** Football data model, competition and season management  
**Audience:** Backend engineers, product  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Domain Overview

Football Core is the foundation layer. All other domains (Fantasy, Predictions, Challenges) depend on Competitions, Seasons, Teams, Fixtures, and Players.

Modules: `CompetitionsModule`, `TeamsModule`, `PlayersModule`, `FixturesModule`, `VenuesModule`

---

## Competition and Season Model

```
Competition (e.g., PSL Premiership)
  └── Season (e.g., 2026/27)
        └── Gameweek (e.g., Gameweek 1, deadline Sep 12)
              └── Fixture (e.g., Chiefs vs Pirates, Sep 13)
```

**One season is `isActive: true` at all times.** Switching seasons is a controlled 13-check operation.

### Current Season State

| Competition | Season | `isActive` | `status` |
|------------|--------|-----------|---------|
| FIFA World Cup 2026 | 2026 | `true` | ACTIVE |
| PSL Premiership | 2026/27 | `false` | UPCOMING |

---

## API Routes

### Competitions

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/competitions` | Fan | List competitions |
| GET | `/competitions/:id` | Fan | Get competition |
| POST | `/admin/competitions` | Admin | Create competition |
| PATCH | `/admin/competitions/:id` | Admin | Update competition |
| GET | `/admin/seasons/:id/readiness` | Admin | Season readiness checks |

### Teams and Clubs

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/teams` | Fan | List teams |
| GET | `/teams/:id` | Fan | Get team |
| POST | `/admin/teams` | Admin | Create team |
| POST | `/admin/seasons/:id/teams` | Admin | Register club to season |

### Fixtures

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/fixtures` | Fan | List fixtures (active season) |
| GET | `/fixtures/:id` | Fan | Get fixture |
| POST | `/admin/fixtures` | Admin | Create fixture |
| PATCH | `/admin/fixtures/:id` | Admin | Update fixture |
| POST | `/admin/fixtures/:id/publish` | Admin | Publish fixture |
| POST | `/admin/fixtures/:id/unpublish` | Admin | Unpublish fixture |
| PATCH | `/admin/fixtures/:id/status` | Admin | Update fixture lifecycle status |

### Players

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/players` | Fan | List players |
| GET | `/players/:id` | Fan | Get player |
| POST | `/admin/players` | Admin | Create player |
| PATCH | `/admin/players/:id` | Admin | Update player |

---

## Key Rules

**Fixture publish gate:** A fixture must have `isPublished: true` for fans to make predictions against it.

**Player externalId:** `Player.externalId` is non-unique — multiple seasons may reference the same external player. Always scope queries with `seasonId`.

**Season immutability:** Completed seasons are not deleted. Historical data is always queryable.

**Gameweek deadlines:** `Gameweek.deadlineAt` is the Fantasy transfer deadline. No transfers allowed after this time.

---

## Seeded Data

As of STORY-39 seed:

- 2 competitions (FIFA World Cup 2026, PSL Premiership)
- 2 seasons
- 16 PSL clubs (Chiefs, Pirates, Sundowns, etc.)
- World Cup teams
- PSL Premiership 2026/27 fixtures (provisional — not yet official)
- Gameweeks with deadlines
