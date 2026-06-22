# Sprint 10 — Provider Decision

Date: 2026-06-21  
Amended: 2026-06-22

## Current Status: PRIMARY PROVIDER UNDECIDED

**Sportmonks has been rejected and removed from the active provider strategy.**

The Sprint 10 amendment decision (2026-06-22): Sportmonks does not provide the required data points for the PSL One platform and must be removed from active provider consideration.

- `DataProviderService` no longer auto-selects `SportmonksAdapter` when a key is present.
- `SportmonksAdapter` is retained for reference only; it is marked `@deprecated`.
- `SPORTMONKS_API_KEY` is no longer an action item for the owner.

See `docs/data/SPRINT-10-ACTIVE-PROVIDER-STRATEGY.md` for the replacement strategy.  
See `docs/data/SPRINT-10-NEW-PROVIDER-SHORTLIST.md` for provider candidates.

---

## What Was Decided

| Provider | Status |
|----------|--------|
| Sportmonks | **REJECTED** — removed from active strategy |
| SportsDataIO | Secondary candidate — PSL NOT in competition list; UNDECIDED |
| Primary provider | **UNDECIDED** — new shortlist in progress |

## Why Sportmonks Was Rejected

- Owner determination: Sportmonks does not provide the required data points for this platform.
- Validation was further complicated by HTTP 401 on all endpoints (key invalid/plan blocked).
- PSL Premier Soccer League coverage could not be confirmed.

## Required Data Points (for any replacement provider)

Any replacement provider must supply:
1. **PSL Premier Soccer League** fixtures, teams, squads, lineups, live scores
2. **World Cup 2026** fixtures, teams, lineups, live scores
3. `externalId`, `homeTeamName`, `awayTeamName`, `kickoffAt`, `status` fields on every fixture
4. Player-level data: name, position, squad number, team
5. Live match events (goals, cards, substitutions) within acceptable latency
6. Rate limits sufficient for 2 million concurrent fans
7. Commercial licensing that permits downstream display of PSL data

## Owner Decision Gates (UPDATED)

Before activating any provider in production:
- [ ] PSL fixture availability confirmed on chosen provider
- [ ] WC2026 fixture availability confirmed
- [ ] Field mapping verified (all required fields above)
- [ ] Commercial terms reviewed by owner
- [ ] Rate limits understood for 2M fan load
- [ ] EC2 staging migration applied
- [ ] Staging smoke passes against EC2

## What This Document Does NOT Authorize

- Production provider ingestion is NOT enabled
- PSL season is NOT activated
- No provider key is committed or exposed to frontend
