# Sprint 11 — Required Data Points for PSL One

Date: 2026-06-22

## Purpose

This document defines the complete set of data points that any football data provider must supply to power PSL One. These requirements drive provider selection, adapter field mapping, and the coverage validation gate that must be passed before production ingestion is authorised.

---

## Coverage Scope Requirements

### Non-Negotiable Coverage

| Requirement | Rationale |
|-------------|-----------|
| South African PSL Premier Soccer League | Core competition of the platform; mandatory for all features |
| World Cup 2026 | PSL One scope includes WC2026; a confirmed fallback is acceptable if no single provider covers both |
| Commercial license for downstream display | Legal requirement; must be reviewed before production |
| Server-side API access only | Keys must never be exposed to the browser or `NEXT_PUBLIC_*` env vars |
| No betting or odds dependency | PSL One platform policy; any provider that bundles odds must confirm odds endpoints are not called |

### Coverage Fallback Rule

If no single provider covers both PSL and WC2026, a dual-provider strategy is permitted:
- Primary provider: PSL coverage (mandatory)
- Secondary provider: WC2026 coverage only (constrained, additive)

Any dual-provider strategy requires a new ADR before implementation.

---

## Required Data Points

### Competitions and Structure

| Data Point | Field Name(s) | Notes |
|------------|--------------|-------|
| Competition list | `id`, `name`, `countryCode` | Must include PSL (South Africa) and WC2026 |
| Season / edition | `seasonId`, `year`, `startDate`, `endDate` | Active season identification |
| Venues | `venueId`, `venueName`, `city`, `country`, `capacity` | Needed for fixture display |

### Fixtures

| Data Point | Field Name(s) | Notes |
|------------|--------------|-------|
| Fixture identity | `externalId`, `competitionId`, `seasonId` | `externalId` mapped to `Fixture.externalId` |
| Home team | `homeTeamId`, `homeTeamName` | Mapped to `Fixture.homeTeamName` |
| Away team | `awayTeamId`, `awayTeamName` | Mapped to `Fixture.awayTeamName` |
| Kickoff time | `kickoffAt` (UTC ISO 8601) | Mapped to `Fixture.kickoffAt` |
| Match status | `status` | Values: SCHEDULED, LIVE, FINISHED, POSTPONED, CANCELLED |
| Fixture changes / postponements | `rescheduledTo`, `cancellationReason` | Required for fixture validation workflow |
| Historical results | `homeScore`, `awayScore`, `winner` | Available on FINISHED fixtures |

### Teams

| Data Point | Field Name(s) | Notes |
|------------|--------------|-------|
| Team identity | `teamId`, `teamName`, `shortName`, `logoUrl` | Mapped to PSL club records |
| Home venue | `venueId` | FK to venues |

### Players

| Data Point | Field Name(s) | Notes |
|------------|--------------|-------|
| Player identity | `playerId`, `playerName`, `dateOfBirth`, `nationality` | Core player record |
| Position | `position` | GK / DEF / MID / FWD |
| Squad number | `squadNumber` | Current season squad number |
| Team | `teamId` | FK to teams |

### Squads

| Data Point | Field Name(s) | Notes |
|------------|--------------|-------|
| Squad list | Array of players per team per season | Must include squad number and position |
| Injuries | `injuryStatus`, `injuryDescription`, `expectedReturn` | Player availability |
| Suspensions | `suspensionStatus`, `suspensionMatches` | Cards / disciplinary bans |
| Player availability | `available` boolean or composite status | Pre-match squad availability |

### Lineups

| Data Point | Field Name(s) | Notes |
|------------|--------------|-------|
| Starting lineup | `startingXI` — array of `{ playerId, squadNumber, position, formationSlot }` | Per team per fixture |
| Bench / substitutes | `bench` — array of `{ playerId, squadNumber }` | Per team per fixture |
| Formation | `formation` (e.g. `4-3-3`) | Coach tactical setup |
| Coach | `coachId`, `coachName` | Per team per fixture |

### Live Match

| Data Point | Field Name(s) | Notes |
|------------|--------------|-------|
| Live match clock | `minute`, `extraTimeMinute` | Current match time |
| Live score | `homeScore`, `awayScore` | Real-time updated |
| Final score | `homeScore`, `awayScore` on `status=FINISHED` | Immutable after FT |
| Match status | `status` | LIVE / HT / FT / ET / PENS |

### Match Events

| Data Point | Field Name(s) | Notes |
|------------|--------------|-------|
| Goals | `eventType=GOAL`, `minute`, `playerId`, `teamId`, `assistPlayerId` | Goals for fantasy scoring |
| Assists | Derived from goal event `assistPlayerId` | Fantasy points trigger |
| Yellow cards | `eventType=YELLOW_CARD`, `minute`, `playerId`, `teamId` | Fantasy deduction trigger |
| Red cards | `eventType=RED_CARD`, `minute`, `playerId`, `teamId` | Fantasy deduction trigger |
| Substitutions | `eventType=SUBSTITUTION`, `minute`, `playerOutId`, `playerInId`, `teamId` | Fantasy auto-sub trigger |

### Standings

| Data Point | Field Name(s) | Notes |
|------------|--------------|-------|
| League standings | `rank`, `teamId`, `played`, `won`, `drawn`, `lost`, `goalsFor`, `goalsAgainst`, `goalDifference`, `points` | Per competition per season |
| Form guide | Last 5 results per team | Display only; derived acceptable |

---

## Field Mapping Validation Checklist

Before activating a provider, confirm the following fields are present and non-null in a real API response:

- [ ] `externalId` on each fixture (unique, stable across requests)
- [ ] `homeTeamName` and `awayTeamName` on each fixture
- [ ] `kickoffAt` as a parseable UTC timestamp
- [ ] `status` maps to one of: SCHEDULED / LIVE / HT / FINISHED / POSTPONED / CANCELLED
- [ ] `homeScore` and `awayScore` present on FINISHED fixtures
- [ ] Player `position` maps to GK / DEF / MID / FWD
- [ ] Starting lineup array contains at least 11 players per team
- [ ] Match events include `minute` and `playerId`
- [ ] Standings include `points` and `goalDifference`

---

## What This Document Does NOT Authorise

- Production ingestion is NOT enabled by documenting data points
- PSL season is NOT activated
- No API key is committed to any file
- Betting or odds data is NOT requested from any provider
