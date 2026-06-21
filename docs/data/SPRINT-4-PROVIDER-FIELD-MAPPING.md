# PSL One — Sprint 4 Provider Field Mapping (Sportmonks)
**Last updated:** 2026-06-20 (Sprint 4 data-provider research)
**Status:** PRELIMINARY — field names based on Sportmonks public documentation; must be verified against live API responses before implementation
**Recommended provider:** Sportmonks (see `SPRINT-4-PROVIDER-RECOMMENDATION.md`)
**Fallback reference:** For API-Football field mapping see `PSL-DATA-MAPPING.md`

**Important:** This document shows the transformation layer needed between Sportmonks API responses and PSL One domain models. Actual Sportmonks field paths must be verified against the live API before writing production code. Do not hard-code IDs — all provider entity IDs must be discovered at runtime.

---

## 0. Transformation Layer Overview

The `FootballDataTransformer` service sits between the raw provider response and the PSL One domain. It:

1. Receives typed raw provider response objects (see `adapter-interface.ts`)
2. Maps field-by-field to PSL One domain types
3. Returns normalised domain objects ready for database upsert
4. Logs unmapped or null fields for monitoring

No business logic lives in the transformer. It is a pure data-shape mapping layer.

```
[Sportmonks API] → SportmonksAdapter → SportmonksRawResponse
                                              │
                                    FootballDataTransformer
                                              │
                                    PSL One Domain Objects
                                    (Fixture, Club, Player, …)
                                              │
                                    Prisma upsert via respective service
```

---

## 1. Leagues / Competition / Season

**Sportmonks endpoint (approximate):** `GET /v3/football/leagues/{id}` or `/v3/football/leagues`

| Sportmonks field (approximate) | PSL One model | PSL One field | Transformation | Notes |
|-------------------------------|---------------|---------------|----------------|-------|
| `data.id` | `Competition` | `externalId` | `String(id)` | Namespace as `sportmonks:{id}` |
| `data.name` | `Competition` | `name` | direct | e.g., "Premier Soccer League" |
| `data.short_code` | `Competition` | `slug` | `slugify(short_code)` | May not exist; fallback slugify(name) |
| `data.image_path` | — | — | NOT stored | Logo rights require separate confirmation |
| `data.country.name` | — | — | Filter: South Africa only | |
| `data.seasons[n].id` | `Season` | `externalId` | `String(id)` | Namespace as `sportmonks:season:{id}` |
| `data.seasons[n].name` | `Season` | `name` | direct | e.g., "2025/2026" |
| `data.seasons[n].starting_at` | `Season` | `startDate` | ISO date parse | String to Date |
| `data.seasons[n].ending_at` | `Season` | `endDate` | ISO date parse | |
| `data.seasons[n].is_current_season` | `Season` | `isActive` | Boolean | |

**Known gap:** Sportmonks `short_code` field availability varies by league. If absent, derive slug from `slugify(data.name)`.

---

## 2. Teams → Club

**Sportmonks endpoint (approximate):** `GET /v3/football/teams?filters=leagueId:{id}` or season-scoped

| Sportmonks field (approximate) | PSL One model | PSL One field | Transformation | Notes |
|-------------------------------|---------------|---------------|----------------|-------|
| `data[n].id` | `Club` | `externalId` | `String(id)` prefixed `sportmonks:{id}` | |
| `data[n].name` | `Club` | `name` | direct | Full name |
| `data[n].short_name` | `Club` | `shortName` | direct or truncate to 20 | |
| `data[n].image_path` | — | — | NOT stored | Logo rights unconfirmed |
| `data[n].founded` | `Club` | `founded` | Integer year | May be null for some PSL clubs |
| `data[n].venue.name` | `Stadium` | `name` | direct | Home stadium |
| `data[n].venue.city` | `Club` | `city` | direct | |
| `data[n].venue.capacity` | `Stadium` | `capacity` | Integer | |

**Gaps:**
- `Club.primaryColor`, `Club.secondaryColor`, `Club.textColor` — NOT available from Sportmonks. Must be manually curated from club brand guidelines (16 clubs already seeded in STORY-26 with approximate colours).
- `Club.abbr` (3-letter) — may need to derive from `short_name` or manual curation.
- SVG crests — not available from provider; obtain directly from PSL or clubs.

---

## 3. Players → Player

**Sportmonks endpoint (approximate):** `GET /v3/football/players?filters=teamId:{id}` or season-scoped squad endpoint

| Sportmonks field (approximate) | PSL One model | PSL One field | Transformation | Notes |
|-------------------------------|---------------|---------------|----------------|-------|
| `data[n].id` | `Player` | `externalId` | `String(id)` | Use `findFirst` not `findUnique` — externalId is not unique across sources |
| `data[n].display_name` | `Player` | `name` | direct | Full name for display |
| `data[n].firstname` | — | — | Not stored separately | |
| `data[n].lastname` | — | — | Not stored separately | |
| `data[n].date_of_birth` | `Player` | `dateOfBirth` | ISO date parse | |
| `data[n].nationality.name` | `Player` | `nationality` | direct string | |
| `data[n].height` | `Player` | `height` | `${value} cm` string | May be numeric from API |
| `data[n].weight` | `Player` | `weight` | `${value} kg` string | May be numeric from API |
| `data[n].image_path` | — | — | NOT stored | Player image rights must be confirmed |
| `statistics[0].position.developer_name` | `Player` | `position` | Enum map (see below) | |
| `statistics[0].jersey_number` | `Player` | `squadNumber` | Integer | |
| `statistics[0].team_id` | — | — | Use to join to imported Club via externalId | |

**Position enum mapping:**

| Sportmonks position | PSL One `PlayerPosition` enum |
|---------------------|-------------------------------|
| Goalkeeper | `GK` |
| Defender | `DEF` |
| Midfielder | `MID` |
| Attacker / Forward | `FWD` |
| Unknown / null | `MID` (fallback; flag for manual review) |

**Note on externalId uniqueness:** As established in STORY-29, `Player.externalId` is NOT a unique constraint. Always use `prisma.player.findFirst({ where: { externalId, externalSource: 'sportmonks' } })`, not `findUnique`.

---

## 4. Fixtures → Fixture

**Sportmonks endpoint (approximate):** `GET /v3/football/fixtures?filters=leagueId:{id};seasonId:{id}`

| Sportmonks field (approximate) | PSL One model | PSL One field | Transformation | Notes |
|-------------------------------|---------------|---------------|----------------|-------|
| `data[n].id` | `Fixture` | `externalId` | `String(id)` | |
| `data[n].starting_at` | `Fixture` | `kickoffAt` | ISO datetime parse | Include timezone (South Africa: UTC+2) |
| `data[n].state.short_name` | `Fixture` | — | Map to FixtureStatus (see below) | |
| `data[n].minute` | — | — | currentMinute on live updates | |
| `data[n].venue.name` | — | — | Venue name for display | |
| `data[n].round.name` | `Fixture` | `gameweekLabel` | direct | e.g., "Matchday 5" |
| `data[n].participants[home].id` | `Fixture` | `homeClubId` | Look up Club.externalId = `sportmonks:{id}` | Teams must be imported first |
| `data[n].participants[away].id` | `Fixture` | `awayClubId` | Look up Club.externalId = `sportmonks:{id}` | |
| `data[n].scores.current[home]` | `Fixture` | `homeScore` | Integer or null | Null if not started |
| `data[n].scores.current[away]` | `Fixture` | `awayScore` | Integer or null | |
| `data[n].scores.ht[home]` | — | — | Half-time score for display only | |

**FixtureStatus mapping:**

| Sportmonks state | PSL One `FixtureStatus` |
|-----------------|------------------------|
| `NS` (Not Started) | `SCHEDULED` |
| `LIVE` / `1H` / `2H` / `HT` / `ET` / `PEN` | `LIVE` |
| `FT` / `AET` / `PENALT` | `FINISHED` |
| `PST` (Postponed) | `POSTPONED` |
| `CANC` (Cancelled) | `CANCELLED` |
| `TBA` | `SCHEDULED` (with no kickoffAt) |

**Import dependency:** Club records must exist before Fixture import. The transformer rejects fixtures where `homeClubId` or `awayClubId` cannot be resolved to an existing Club via externalId.

---

## 5. Standings → LeagueStanding

**Sportmonks endpoint (approximate):** `GET /v3/football/standings?filters=leagueId:{id};seasonId:{id}`

| Sportmonks field (approximate) | PSL One model | PSL One field | Transformation | Notes |
|-------------------------------|---------------|---------------|----------------|-------|
| `data[n].position` | `LeagueStanding` | `position` | Integer | 1-indexed |
| `data[n].participant_id` | `Club` | — | Look up via externalId | |
| `data[n].points` | `LeagueStanding` | `points` | Integer | |
| `data[n].details.played` | `LeagueStanding` | `played` | Integer | May be under `overall` key |
| `data[n].details.won` | `LeagueStanding` | `won` | Integer | |
| `data[n].details.draw` | `LeagueStanding` | `drawn` | Integer | |
| `data[n].details.lost` | `LeagueStanding` | `lost` | Integer | |
| `data[n].details.goals_for` | `LeagueStanding` | `goalsFor` | Integer | |
| `data[n].details.goals_against` | `LeagueStanding` | `goalsAgainst` | Integer | |
| `data[n].details.goal_difference` | `LeagueStanding` | `goalDifference` | Integer | |
| `data[n].form` | `LeagueStanding` | `form` | String e.g. "WWDLW" | |

**Note:** Sportmonks structures standings under `details` or `overall` depending on the include parameter. The transformer must handle both shapes.

---

## 6. Match Events → MatchEvent

**Sportmonks endpoint (approximate):** `GET /v3/football/fixtures/{id}?include=events`

| Sportmonks field (approximate) | PSL One model | PSL One field | Transformation | Notes |
|-------------------------------|---------------|---------------|----------------|-------|
| `events[n].id` | `MatchEvent` | `externalId` | `String(id)` | For idempotent upsert |
| `events[n].minute` | `MatchEvent` | `minute` | Integer | |
| `events[n].extra_minute` | `MatchEvent` | `stoppageMinute` | Integer or null | Stoppage time |
| `events[n].type.developer_name` | `MatchEvent` | `eventType` | Map to MatchEventType (see below) | |
| `events[n].detail` | `MatchEvent` | `detail` | direct string | e.g., "Normal Goal" |
| `events[n].team_id` | — | — | Look up Club via externalId | |
| `events[n].player_id` | — | — | Look up Player via externalId | |
| `events[n].player_name` | `MatchEvent` | `playerName` | direct (denormalised for display) | Fallback if player lookup fails |
| `events[n].related_player_id` | — | — | Look up as assist/substituted player | |
| `events[n].period.name` | `MatchEvent` | `period` | `1H` / `2H` / `ET1` / `ET2` | |

**MatchEventType mapping:**

| Sportmonks event type | PSL One `MatchEventType` |
|----------------------|--------------------------|
| `goal` (Normal Goal) | `GOAL` |
| `goal` (Penalty) | `PENALTY_SCORED` |
| `goal` (Own Goal) | `OWN_GOAL` |
| `card` (Yellow Card) | `YELLOW_CARD` |
| `card` (Red Card) | `RED_CARD` |
| `card` (Yellow Red Card) | `SECOND_YELLOW` |
| `substitution` | `SUBSTITUTION` |
| `var` | `VAR` |
| `penalty_missed` | `PENALTY_MISSED` |

**Unknown event types:** Log a warning and skip — do not create a `MatchEvent` record with an unmapped type.

---

## 7. Lineups → FixtureLineup

**Sportmonks endpoint (approximate):** `GET /v3/football/fixtures/{id}?include=lineups`

| Sportmonks field (approximate) | PSL One model | PSL One field | Transformation | Notes |
|-------------------------------|---------------|---------------|----------------|-------|
| `lineups[n].player_id` | `FixtureLineup` | `playerId` | Look up Player.id via externalId | |
| `lineups[n].team_id` | `FixtureLineup` | `teamId` | Look up Club.id via externalId | |
| `lineups[n].type.name` | `FixtureLineup` | `status` | Map to lineup status (see below) | |
| `lineups[n].jersey_number` | `FixtureLineup` | `shirtNumber` | Integer or null | |
| `lineups[n].formation_position` | `FixtureLineup` | `position` | Position string e.g. "GK" | |

**Lineup status mapping:**

| Sportmonks type | PSL One `LineupStatus` |
|----------------|------------------------|
| `formation` / `starting` | `STARTING` |
| `bench` | `SUBSTITUTE` |
| `missing` / `coach` | `UNAVAILABLE` |

---

## 8. Player Statistics → PlayerMatchStats

**Sportmonks endpoint (approximate):** `GET /v3/football/fixtures/{id}?include=participants.statistics` or `/v3/football/statistics/seasons/{id}` for season aggregates

| Sportmonks field (approximate) | PSL One model | PSL One field | Transformation | Notes |
|-------------------------------|---------------|---------------|----------------|-------|
| `statistics[n].type.developer_name` | `PlayerMatchStats` | `statType` | Map to StatType enum | |
| `statistics[n].data.value` | `PlayerMatchStats` | `value` | Numeric | May be string — parse to Float |
| `statistics[n].participant_id` | — | — | Look up Player or Club by type | Statistics can be team-level or player-level |

**Stat type mapping (selected):**

| Sportmonks developer_name | PSL One `PlayerStatType` / domain field |
|--------------------------|------------------------------------------|
| `goals` | `GOALS` |
| `assists` | `ASSISTS` |
| `minutes_played` | `MINUTES_PLAYED` |
| `yellowcards` | `YELLOW_CARDS` |
| `redcards` | `RED_CARDS` |
| `saves` | `SAVES` |
| `clean_sheets` | `CLEAN_SHEETS` |
| `shots_on_target` | `SHOTS_ON_TARGET` |
| `passes_accuracy` | `PASS_ACCURACY` |
| `tackles` | `TACKLES` |

Unknown stat types from the provider: log and skip. Do not fail the import for unknown types.

---

## 9. Match Timeline (Live)

For live match use via `LiveMatchService`, the transformer produces a `MatchTimelineEntry[]` from the events and state data:

| Timeline event | Source fields | Output shape |
|----------------|--------------|-------------|
| Match start | `fixture.state = LIVE, minute = 0` | `{ type: 'KICKOFF', minute: 0 }` |
| Goal | `events[n].type = goal, minute, player_name` | `{ type: 'GOAL', minute, team, scorer, assister }` |
| Card | `events[n].type = card, minute, player_name` | `{ type: 'CARD', cardType, minute, team, player }` |
| Substitution | `events[n].type = substitution` | `{ type: 'SUBSTITUTION', minute, off, on, team }` |
| Half time | `fixture.state = HT` | `{ type: 'HALFTIME', minute: 45 }` |
| Full time | `fixture.state = FT` | `{ type: 'FULLTIME', minute: 90, homeScore, awayScore }` |

---

## 10. Import Dependency Order

```
1. Competition (league metadata)
2. Season (linked to competition)
3. Club / Team (depends on competition + season)
4. Player (depends on club)
5. Fixture (depends on club)
6. LeagueStanding (depends on fixture + club)
7. FixtureLineup (depends on fixture + player + club)
8. MatchEvent (depends on fixture + player + club)
9. PlayerMatchStats (depends on fixture + player + club)
```

Importing in any other order will result in foreign key resolution failures in the transformer. The `FootballDataImportOrchestrator` enforces this order.

---

## 11. Unmapped / Gap Fields

| PSL One need | Sportmonks availability | Resolution |
|-------------|------------------------|------------|
| `Club.primaryColor` | Not available | Manual curation (already seeded for 16 clubs in STORY-26) |
| `Club.secondaryColor` | Not available | Manual curation |
| `Club.textColor` | Not available | Manual curation |
| Club crest SVG | Raster PNG URL only (rights unclear) | Obtain from PSL or clubs directly; use colour badges as fallback |
| Player profile image | Available as URL (rights unclear) | Verify redistribution rights before displaying |
| Fantasy player price | Not available | Calculated by `FantasyCalibrationModule` |
| Fantasy player points | Not available | Calculated from MatchEvent records internally |
| Fan value data | Not football data | PSL One internal ledger (`FanValueLedger`) |
| Injury / availability status | May be available as add-on | Verify with Sportmonks account; not in base plan |
| Player nationality flag image | Not provided | Use text nationality or ISO code for CSS flags |
| Stadium images | Not provided | License separately or use placeholder |
