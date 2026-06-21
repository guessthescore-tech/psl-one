# Sprint 8 — Provider Field Mapping Results

## Status

| Provider | Status |
|----------|--------|
| Sportmonks | PENDING — BLOCKED_BY_REPLACEMENT_TOKEN |
| SportsDataIO | PENDING — trial not yet run |

This document covers field mapping for both provider candidates.
The Sportmonks section is pre-filled based on adapter implementation. SportsDataIO section is pre-filled from v4 API docs.

## SportsDataIO Field Mapping (pre-filled from adapter, unvalidated)

| PSL One Field | SportsDataIO Field | Type | Confirmed | Notes |
|--------------|-------------------|------|-----------|-------|
| fixture.id | GameId | number→string | - | |
| fixture.kickoffAt | Day | ISO8601 | - | |
| fixture.status | Status | string | - | Map: Final→FINISHED, InProgress→LIVE, Scheduled→SCHEDULED |
| fixture.homeScore | HomeTeamScore | number\|null | - | |
| fixture.awayScore | AwayTeamScore | number\|null | - | |
| fixture.homeTeam.name | HomeTeamName | string | - | |
| fixture.awayTeam.name | AwayTeamName | string | - | |
| team.externalId | TeamId | number→string | - | |
| team.name | Name | string | - | |
| team.shortName | ShortName | string | - | |
| player.externalId | PlayerId | number→string | - | |
| player.name | CommonName \| Name | string | - | CommonName preferred |
| player.position | Position | string | - | Raw string, not mapped |
| standings.position | Order | number | - | |
| standings.points | Points | number | - | |

## Fixture Field Mapping

| PSL One Field | Sportmonks Field | Type | Confirmed | Notes |
|--------------|-----------------|------|-----------|-------|
| fixture.id | fixture.id | string | - | |
| fixture.kickoffAt | fixture.starting_at | ISO8601 | - | |
| fixture.status | fixture.state.state | string | - | Map LIVE→LIVE, FT→FINISHED |
| fixture.homeScore | fixture.scores.localteam_score | number | - | |
| fixture.awayScore | fixture.scores.visitorteam_score | number | - | |
| fixture.homeTeam.name | fixture.localTeam.data.name | string | - | |
| fixture.awayTeam.name | fixture.visitorTeam.data.name | string | - | |
| fixture.group | fixture.group.data.name | string | - | WC2026 groups only |
| fixture.stage | fixture.stage.data.name | string | - | |
| fixture.currentMinute | fixture.time.minute | number | - | live only |

## Team Field Mapping

| PSL One Field | Sportmonks Field | Type | Confirmed | Notes |
|--------------|-----------------|------|-----------|-------|
| team.name | team.name | string | - | |
| team.shortName | team.short_code | string | - | may not exist |
| team.slug | derived from team.name | string | - | derive on import |

## Player Field Mapping

| PSL One Field | Sportmonks Field | Type | Confirmed | Notes |
|--------------|-----------------|------|-----------|-------|
| player.name | player.display_name | string | - | |
| player.position | player.position.data.name | string | - | |
| player.number | player.number | number | - | may be null |

## Status Mapping

| Sportmonks State | PSL One FixtureStatus |
|-----------------|----------------------|
| NS | SCHEDULED |
| LIVE | LIVE |
| HT | LIVE |
| FT | FINISHED |
| AET | FINISHED |
| PEN | FINISHED |
| PST | POSTPONED |
| CANC | CANCELLED |
| SUSP | POSTPONED |

## Completeness Score
_To be filled after trial validation: X/Y fields mapped successfully_
