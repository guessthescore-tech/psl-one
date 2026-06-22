# Sprint 10 — Provider Field Mapping

Date: 2026-06-21

## Sportmonks Field Mapping

Status: CANNOT_VALIDATE — all endpoints return HTTP 401.

| PSL One Field | Raw Provider Value | Status |
|--------------|-------------------|--------|
| **Fixture** | | |
| externalId | (absent — 401) | ❌ MISSING |
| homeTeamName | (absent — 401) | ❌ MISSING |
| awayTeamName | (absent — 401) | ❌ MISSING |
| kickoffAt | (absent — 401) | ❌ MISSING |
| status | (absent — 401) | ❌ MISSING |
| homeScore | (absent — 401) | — OPTIONAL |
| awayScore | (absent — 401) | — OPTIONAL |
| **Team** | | |
| externalId | (absent — 401) | ❌ MISSING |
| name | (absent — 401) | ❌ MISSING |
| shortName | (absent — 401) | ❌ MISSING |

Will be re-run once Sportmonks key is fixed. The adapter expects:
- `fixture.id` → `externalId`
- `fixture.participants[0].name` / `fixture.participants[1].name` → team names
- `fixture.starting_at` → `kickoffAt`
- `fixture.state.state` → `status`

## SportsDataIO Field Mapping

Status: PARTIAL — teams accessible on trial; fixture data not accessible.

| PSL One Field | Raw Provider Value | Status |
|--------------|-------------------|--------|
| **Fixture** | | |
| externalId | (absent — schedules blocked) | ❌ NOT_AVAILABLE_TRIAL |
| homeTeamName | (absent — schedules blocked) | ❌ NOT_AVAILABLE_TRIAL |
| awayTeamName | (absent — schedules blocked) | ❌ NOT_AVAILABLE_TRIAL |
| kickoffAt | (absent — schedules blocked) | ❌ NOT_AVAILABLE_TRIAL |
| status | (absent — schedules blocked) | ❌ NOT_AVAILABLE_TRIAL |
| homeScore | (absent — schedules blocked) | — OPTIONAL |
| awayScore | (absent — schedules blocked) | — OPTIONAL |
| **Team** | | |
| externalId | `509` (TeamId field) | ✅ MAPPED |
| name | `Arsenal FC` (Name field) | ✅ MAPPED |
| shortName | (absent) | ❌ MISSING |

## Field Mapping Gap Summary

| Gap | Provider | Resolution |
|----|----------|------------|
| All Sportmonks fields | Sportmonks 401 | Fix key → re-run field mapping |
| Fixture fields (SDIO) | SportsDataIO trial limit | Paid plan required |
| shortName (SDIO teams) | Missing in SDIO API | Map to abbreviation or derive from name |

## Security Confirmation

No raw API responses were printed. Field values shown above are from teams endpoint only (trial tier).
