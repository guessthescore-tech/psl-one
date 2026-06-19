# PSL One — PSL Data Mapping
**Last updated:** 2026-06-19 (STORY-FE-PREMIUM-01A)
**Status:** PRELIMINARY — field names to be verified against actual provider API response

This document maps provider API response fields to PSL One domain models. Field names are based on API-Football v3 documentation. All names must be verified against live API responses using `tools/data-provider-spike/api-football-discovery.mjs` before implementation.

---

## Leagues → Competition / Season

**Provider endpoint:** `GET /leagues?country=South Africa`

| Provider field | PSL One model | PSL One field | Notes |
|----------------|---------------|---------------|-------|
| `league.id` | `Competition` | `externalId` | Store as string, namespace `api-football` |
| `league.name` | `Competition` | `name` | e.g., "Premier Soccer League" |
| `league.type` | `Competition` | — | Filter: use only `League` type, not `Cup` initially |
| `league.logo` | `Competition` | — | Logo rights require separate verification |
| `country.name` | `Competition` | — | Filter for South Africa |
| `seasons[].year` | `Season` | `year` | Numeric, e.g., 2025 |
| `seasons[].start` | `Season` | `startDate` | ISO date string |
| `seasons[].end` | `Season` | `endDate` | ISO date string |
| `seasons[].current` | `Season` | `isActive` | Boolean |
| `seasons[].coverage.*` | — | — | Determines which endpoints are available |

---

## Teams → Club (ClubExperience module)

**Provider endpoint:** `GET /teams?league={id}&season={year}`

| Provider field | PSL One model | PSL One field | Notes |
|----------------|---------------|---------------|-------|
| `team.id` | `Club` | `externalId` | Store with source namespace |
| `team.name` | `Club` | `name` | Full name |
| `team.code` | `Club` | `abbr` | 3-letter code |
| `team.logo` | `Club` | — | Not stored directly; logo rights required |
| `team.founded` | `Club` | `founded` | Year founded |
| `venue.name` | `Stadium` | `name` | Home stadium |
| `venue.city` | `Club` | `city` | Home city |
| `venue.capacity` | `Stadium` | `capacity` | Seat count |

**Gap:** PSL One `Club` model has `primaryColor`, `secondaryColor`, `textColor` which are not available from the provider. These must be curated manually or from club brand guidelines.

---

## Players → Player (SquadImport module)

**Provider endpoint:** `GET /players?league={id}&season={year}`

| Provider field | PSL One model | PSL One field | Notes |
|----------------|---------------|---------------|-------|
| `player.id` | `Player` | `externalId` | Unique per provider |
| `player.name` | `Player` | `name` | Full name |
| `player.firstname` | `Player` | — | May use for display |
| `player.lastname` | `Player` | — | May use for display |
| `player.age` | `Player` | — | Derived from DOB |
| `player.birth.date` | `Player` | `dateOfBirth` | ISO date |
| `player.nationality` | `Player` | `nationality` | Country name string |
| `player.height` | `Player` | `height` | e.g., "180 cm" |
| `player.weight` | `Player` | `weight` | e.g., "75 kg" |
| `player.photo` | `Player` | — | URL — rights must be verified |
| `statistics[0].team.id` | `Club` | — | Used to join to imported club |
| `statistics[0].games.position` | `Player` | `position` | Maps: Goalkeeper → GK, Defender → DEF, Midfielder → MID, Attacker → FWD |
| `statistics[0].games.number` | `Player` | `squadNumber` | Jersey number |

**Gap:** `Player.externalId` exists in the schema (see STORY-29, `findFirst` pattern). Store as string. Use `findFirst({ where: { externalId, externalSource } })` — NOT `findUnique` since externalId is not unique across sources.

---

## Fixtures → Fixture (FixtureImport module)

**Provider endpoint:** `GET /fixtures?league={id}&season={year}`

| Provider field | PSL One model | PSL One field | Notes |
|----------------|---------------|---------------|-------|
| `fixture.id` | `Fixture` | `externalId` | Unique per provider |
| `fixture.date` | `Fixture` | `kickoffAt` | ISO datetime with timezone |
| `fixture.status.short` | `Fixture` | — | Maps: NS → SCHEDULED, 1H/HT/2H → LIVE, FT → FINISHED, PST → POSTPONED |
| `fixture.status.elapsed` | `Fixture` | — | Minute if live |
| `fixture.venue.name` | `Fixture` | — | Venue name |
| `fixture.venue.city` | `Fixture` | — | Venue city |
| `league.round` | `Fixture` | `gameweekLabel` | e.g., "Regular Season - 5" |
| `teams.home.id` | `Fixture` | `homeClubId` | Must be already imported as Club |
| `teams.away.id` | `Fixture` | `awayClubId` | Must be already imported as Club |
| `goals.home` | `Fixture` | `homeScore` | Null if not started |
| `goals.away` | `Fixture` | `awayScore` | Null if not started |
| `score.halftime.home` | `Fixture` | — | HT score if needed |

**Import order dependency:** Teams must be imported before fixtures. Fixture import fails if referenced team externalId is not found in the Club table.

---

## Standings → LeagueStanding

**Provider endpoint:** `GET /standings?league={id}&season={year}`

| Provider field | PSL One model | PSL One field | Notes |
|----------------|---------------|---------------|-------|
| `league.standings[0][n].rank` | `LeagueStanding` | `position` | 1-indexed |
| `league.standings[0][n].team.id` | `Club` | — | Join via externalId |
| `league.standings[0][n].points` | `LeagueStanding` | `points` | |
| `league.standings[0][n].all.played` | `LeagueStanding` | `played` | |
| `league.standings[0][n].all.win` | `LeagueStanding` | `won` | |
| `league.standings[0][n].all.draw` | `LeagueStanding` | `drawn` | |
| `league.standings[0][n].all.lose` | `LeagueStanding` | `lost` | |
| `league.standings[0][n].all.goals.for` | `LeagueStanding` | `goalsFor` | |
| `league.standings[0][n].all.goals.against` | `LeagueStanding` | `goalsAgainst` | |
| `league.standings[0][n].goalsDiff` | `LeagueStanding` | `goalDifference` | |
| `league.standings[0][n].form` | `LeagueStanding` | `form` | String like "WWDLW" |

---

## Match Events → MatchEvent (LiveMatchService)

**Provider endpoint:** `GET /fixtures/events?fixture={id}`

| Provider field | PSL One model | PSL One field | Notes |
|----------------|---------------|---------------|-------|
| `events[n].time.elapsed` | `MatchEvent` | `minute` | |
| `events[n].type` | `MatchEvent` | `eventType` | Maps: Goal → GOAL, Card → CARD, subst → SUBSTITUTION, Var → VAR |
| `events[n].detail` | `MatchEvent` | `detail` | e.g., "Normal Goal", "Yellow Card" |
| `events[n].team.id` | `Club` | — | |
| `events[n].player.id` | `Player` | — | |
| `events[n].player.name` | `MatchEvent` | `playerName` | Denormalised for display |
| `events[n].assist.id` | `Player` | — | Assist player if goal |

---

## Player Statistics → PlayerMatchStats

**Provider endpoint:** `GET /fixtures/statistics?fixture={id}` (team stats) or `GET /players?fixture={id}` (individual)

| Provider field | PSL One model | PSL One field | Notes |
|----------------|---------------|---------------|-------|
| `statistics[n].team.id` | — | — | Match to imported Club |
| `statistics[n].statistics` | `PlayerMatchStats` | varies | Array of {type, value} pairs |

Stats types from provider: `Shots on Goal`, `Shots off Goal`, `Fouls`, `Corner Kicks`, `Offsides`, `Ball Possession`, `Yellow Cards`, `Red Cards`, `Saves`, `Passes Total`, `Passes Accurate`, `Pass Accuracy`.

Map to existing `PlayerMatchStat` enum values in the PSL One domain.

---

## Import Order (Dependency Graph)

```
1. Competitions (leagues)
2. Seasons
3. Teams (depends on competitions + seasons)
4. Players (depends on teams)
5. Fixtures (depends on teams)
6. Standings (depends on fixtures + teams)
7. Lineups (depends on fixtures + players)
8. Match Events (depends on fixtures + players + teams)
9. Player Statistics (depends on fixtures + players)
```

---

## Unmapped / Gap Fields

| Need | Provider availability | Resolution |
|------|----------------------|------------|
| Club primary/secondary colours | Not available | Manual curation from club brand guidelines |
| Club crest SVG | Logos available as PNG URLs, rights unclear | Request SVG from PSL or clubs directly |
| Player profile image | Available as URL, rights unclear for redistribution | Verify rights before displaying |
| Fantasy player price | Not available from provider | Calculated internally by FantasyCalibrationModule |
| Fantasy player points | Not available from provider | Calculated internally from match events |
| Fan value breakdown | Not football data | PSL One internal calculation |
| Injury/suspension status | Partial coverage for PSL | Monitor per season |
| Player nationality flag images | Not provided | Use text nationality or CSS-based flags |
