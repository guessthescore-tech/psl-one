# Sprint 10 — Active Provider Strategy

Date: 2026-06-22

## Status: PRIMARY PROVIDER UNDECIDED

---

## Provider Decision Matrix

| Provider | Status | Reason |
|----------|--------|--------|
| Sportmonks | **REJECTED** | Does not provide the required data points for the PSL One platform |
| SportsDataIO | **SECONDARY CANDIDATE** | PSL NOT in competition list on trial; requires paid plan + PSL confirmation |
| Primary provider | **UNDECIDED** | Pending selection from shortlist |

---

## Why Sportmonks Was Rejected

Owner determination (Sprint 10 amendment, 2026-06-22):
> Sportmonks does not provide the required data points for the platform.

Contributing factors:
- HTTP 401 on all endpoints during Sprint 10 validation (key invalid/plan blocked)
- PSL Premier Soccer League coverage could not be confirmed
- Unable to validate field mapping for required PSL One fixture fields
- Owner concluded capability fit is insufficient regardless of key resolution

**Code impact:**
- `DataProviderService` no longer auto-selects `SportmonksAdapter`; always uses `NoOpAdapter`
- `SportmonksAdapter` marked `@deprecated` — retained for reference only
- `SPORTMONKS_API_KEY` is not an owner action item

---

## What the Active Strategy Requires

The platform requires a data provider that supplies ALL of the following:

### Competitions
1. **PSL Premier Soccer League** (South Africa) — fixtures, teams, standings, live scores
2. **World Cup 2026** — fixtures, teams, standings, live scores

### Data Points Per Fixture
- `externalId` — unique fixture identifier from the provider
- `homeTeamName`, `awayTeamName`
- `kickoffAt` (ISO 8601 timestamp)
- `status` (scheduled / live / finished / postponed / cancelled)
- `homeScore`, `awayScore` (live + final)
- Live match events: goals, cards, substitutions

### Data Points Per Team
- `externalId`, `name`, `shortName`
- Squad list with player names, positions, squad numbers

### Data Points Per Player
- `externalId`, `name`, `position`, squad number, team association
- Match statistics: goals, assists, yellow cards, red cards, minutes played

### Operational Requirements
- Rate limits sufficient for **2 million concurrent fans** at peak match time
- Data freshness: live events within acceptable latency (target ≤ 60s)
- Commercial licensing that permits downstream display of PSL data
- No betting, odds, or wagering feeds (PSL One policy — strictly prohibited)

---

## Current Live Provider (Default)

`NoOpAdapter` — returns safe empty arrays for all provider calls.  
No fixture data is ingested until a provider is wired to `DataProviderService`.

This is intentional. Safe empty returns mean the platform operates with seeded WC2026 data and no live provider ingestion until a validated provider is explicitly wired.

---

## Path to Wiring a New Provider

1. Select a provider from `docs/data/SPRINT-10-NEW-PROVIDER-SHORTLIST.md`
2. Confirm PSL coverage (run `tools/discovery/provider-coverage-check.mjs` with a trial key)
3. Confirm WC2026 coverage
4. Verify field mapping: `tools/discovery/provider-field-mapping-check.mjs`
5. Review commercial terms — owner must authorize
6. Implement adapter (if new provider) or update existing adapter
7. Wire to `DataProviderService` constructor with explicit env-var check
8. Apply EC2 staging migration
9. Run full staging smoke suite
10. Owner authorizes production ingestion

---

## What Is NOT Authorized

- Production provider ingestion
- PSL season activation
- Provider key committed to git
- `NEXT_PUBLIC_*` provider keys
- Betting, odds, or wagering feeds
- Wallet production
