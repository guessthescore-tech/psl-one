# Sprint 9 — Provider Comparison

## Comparison Matrix

| Feature | Sportmonks | SportsDataIO | Notes |
|---------|-----------|--------------|-------|
| **Auth method** | `Authorization: Bearer <key>` | `Ocp-Apim-Subscription-Key: <key>` | Both server-side only |
| **Key env var** | `SPORTMONKS_API_KEY` | `SPORTSDATAIO_SOCCER_API_KEY` | Neither committed |
| **NEXT_PUBLIC_*** | NEVER | NEVER | PSL One rule |
| **Adapter status** | Fully implemented ✅ | Skeleton/candidate only ⚠️ | Sportmonks advantage |
| **DataProviderService** | Wired in ✅ | Not yet wired ⚠️ | Sportmonks advantage |
| **Trial scope** | Full API (key 401 — see validation results) | UCL only (comp ID 3) free | Sportmonks key invalid; SportsDataIO trial limited |
| **PSL Premier League coverage** | UNKNOWN — key returns 401 | UNKNOWN — trial UCL only | Unknown for both |
| **WC2026 coverage** | UNKNOWN — key returns 401 | UNKNOWN — trial UCL only | Unknown for both |
| **Live health check result** | ❌ HTTP 401 (key invalid) | ✅ HTTP 200 (93 competitions) | As of 2026-06-21 |
| **fixtures endpoint** | `GET /v3/football/fixtures` | `GET /v4/soccer/scores/json/SchedulesBasic` | Both implemented |
| **standings endpoint** | `GET /v3/football/standings/seasons/:id` | `GET /v4/soccer/scores/json/Standings/:comp/:season` | Both implemented |
| **teams endpoint** | `GET /v3/football/teams/seasons/:id` | `GET /v4/soccer/scores/json/Teams/:comp` | Both implemented |
| **players endpoint** | `GET /v3/football/players` | `GET /v4/soccer/scores/json/PlayersByTeam/:teamId` | Both implemented |
| **Rate limit handling** | 429 handled (safe empty return) | 429 handled (safe empty return) | Both safe |
| **401/403 handling** | Logs warn, returns empty | Logs warn, returns empty | Both safe |
| **No-key safe mode** | All methods return `[]` | All methods return `[]` | Both safe |
| **Betting/odds endpoints** | PROHIBITED | PROHIBITED | PSL policy |
| **Commercial terms** | Unknown — owner must verify | Unknown — owner must verify | Gate before production |
| **getStandings()** | Implemented ✅ | Implemented ✅ | Both ready |
| **Live match data** | Pending trial | Pending trial | Unknown |
| **Injury/suspension data** | Pending trial | Pending trial | Unknown |

## Key Unknowns (pending trial validation)

1. PSL Premier League fixture availability on Sportmonks
2. WC2026 fixture availability on Sportmonks
3. SportsDataIO PSL/WC2026 coverage on paid plan (not free trial)
4. Rate limits under production load
5. Field completeness for PSL-specific data (jersey numbers, squad numbers)
6. Commercial pricing and licensing for both providers
7. Data freshness (how quickly fixtures update after kick-off)

## Amendment Notice (2026-06-22)

> This document is superseded by the Sprint 10 amendment. Sportmonks has been **REJECTED** and removed from the active provider strategy. See `docs/data/SPRINT-10-ACTIVE-PROVIDER-STRATEGY.md`.

## Historical Preliminary Assessment (SUPERSEDED)

**Sportmonks is the preferred primary candidate** because:
- Adapter is fully implemented and wired to `DataProviderService`
- Uses standard `Authorization: Bearer` header (not query param)
- Prior spike investigation (`tools/data-provider-spike/`) also favored Sportmonks
- SportsDataIO trial scope is limited to UCL — insufficient to validate PSL/WC2026 coverage

**SportsDataIO remains a valid backup candidate** because:
- Adapter skeleton exists and handles auth correctly
- UCL trial validates the auth model and endpoint structure
- Would require paid plan for PSL/WC2026 coverage validation

## Decision Gate

See `docs/data/SPRINT-9-PROVIDER-GO-NOGO.md` for go/no-go criteria.
See `docs/data/SPRINT-9-PROVIDER-DECISION-RECOMMENDATION.md` for the full recommendation.
