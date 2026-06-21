# Sprint 8 — Provider Field Mapping Results

## Status: PENDING — BLOCKED_BY_REPLACEMENT_TOKEN

This document is a template. Fill in results after owner provides replacement Sportmonks API token.

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
