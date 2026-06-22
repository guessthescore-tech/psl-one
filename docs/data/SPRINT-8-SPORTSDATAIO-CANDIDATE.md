# SportsDataIO — Provider Candidate Assessment

**Status:** SECONDARY CANDIDATE — PSL NOT in competition list on trial; paid plan + PSL confirmation required  
**Sprint:** 8 (amendment) | Superseded context: 2026-06-22 — Sportmonks REJECTED; primary provider UNDECIDED  
**Date:** 2026-06-21

---

## Summary

SportsDataIO offers a soccer v4 API that can serve as a secondary provider candidate alongside Sportmonks. PSL One has added a no-key-safe adapter skeleton (`SportsDataIoSoccerAdapter`) to the provider boundary. It is not yet wired into production ingestion.

**SUPERSEDED (2026-06-22):** Sportmonks has been rejected. SportsDataIO is a secondary candidate — PSL not found in competition list on current trial. Primary provider is UNDECIDED.

---

## Authentication

| Property | Detail |
|----------|--------|
| Method | API key via request header (preferred) or query parameter |
| Header name | `Ocp-Apim-Subscription-Key` |
| Query param | `key={value}` (less preferred) |
| PSL One env variable | `SPORTSDATAIO_SOCCER_API_KEY` |
| Storage | Server-side only — local `.env` or staging SSM parameter |
| Frontend exposure | NEVER — no `NEXT_PUBLIC_SPORTSDATAIO_*` |

---

## Trial Access

| Property | Detail |
|----------|--------|
| Free trial | Available at https://sportsdata.io |
| Trial scope | UEFA Champions League only (Competition ID 3) |
| PSL Premier League | Requires paid subscription (tier unknown) |
| World Cup 2026 | Requires paid subscription (tier unknown) |
| Trial registration | Self-service at sportsdata.io |

---

## Key Soccer Endpoints (v4)

| Endpoint | URL pattern | Notes |
|----------|-------------|-------|
| Competitions | `/v4/soccer/scores/json/Competitions` | Lists all available competitions |
| Competition detail | `/v4/soccer/scores/json/CompetitionDetails/{id}` | Seasons, teams |
| Schedules/fixtures | `/v4/soccer/scores/json/SchedulesBasic/{competition}/{season}` | Matches |
| Teams | `/v4/soccer/scores/json/Teams/{competition}` | Competition-scoped |
| Players by team | `/v4/soccer/scores/json/PlayersByTeam/{teamId}` | |
| Standings | `/v4/soccer/scores/json/Standings/{competition}/{season}` | |
| Live scores | `/v4/soccer/scores/json/LiveScores/{competition}` | |

---

## Prohibited Endpoints

SportsDataIO also offers betting/odds/wagering APIs. PSL One must NEVER use:

- Odds feeds
- Betting lines
- Wagering data
- Fixed-odds endpoints
- Any endpoint path containing: `/odds/`, `/betting/`, `/wager/`

PSL One is a points-only platform. No betting or gambling adjacency is permitted.

---

## PSL One Field Coverage (estimated, unvalidated)

| Field | Sportmonks v3 | SportsDataIO v4 | Notes |
|-------|--------------|-----------------|-------|
| Fixture list | ✅ | ✅ (UCL trial) | PSL coverage unvalidated on both |
| Final score | ✅ | ✅ | |
| Live score | ✅ | ✅ | |
| Team list | ✅ | ✅ | |
| Player list | ✅ | ✅ | |
| Standings | ✅ | ✅ | |
| PSL (Premier Soccer League ZA) | Unknown | Unknown | Requires paid plan on both |
| World Cup 2026 | Unknown | Unknown | Requires trial + plan check |

---

## How to Activate SportsDataIO Trial

1. Register at https://sportsdata.io
2. Navigate to API dashboard and generate a soccer API key
3. Place in `.env` as `SPORTSDATAIO_SOCCER_API_KEY=<value>` (never commit)
4. Run: `GET https://api.sportsdata.io/v4/soccer/scores/json/Competitions` with header `Ocp-Apim-Subscription-Key: <value>`
5. Record results (without key value) in `SPRINT-8-PROVIDER-COVERAGE-RESULTS.md`

---

## Recommendation (SUPERSEDED — Sprint 10 amendment 2026-06-22)

**Sportmonks has been REJECTED.** SportsDataIO is a secondary candidate only — PSL not found in competition list on current trial. Primary provider is UNDECIDED. See `docs/data/SPRINT-10-ACTIVE-PROVIDER-STRATEGY.md`.

See `SPRINT-8-PROVIDER-COMPARISON-ADDENDUM.md` for the full comparison matrix.
