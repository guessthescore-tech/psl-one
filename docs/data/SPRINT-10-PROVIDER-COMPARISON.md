# Sprint 10 — Provider Comparison

Date: 2026-06-21  
Amended: 2026-06-22 — Sportmonks REJECTED; removed from active strategy

## Head-to-Head

| Criterion | Sportmonks | SportsDataIO | Notes |
|-----------|-----------|--------------|-------|
| Key present | ✅ PRESENT (length 60) | ✅ PRESENT (length 32) | Both server-side |
| Health check | ❌ HTTP 401 | ✅ HTTP 200 | SportsDataIO wins trial |
| Auth method | `Authorization: Bearer` | `Ocp-Apim-Subscription-Key` | Both server-side only |
| Frontend exposure | NEVER ✅ | NEVER ✅ | PSL One rule enforced |
| Adapter status | DEPRECATED (retained) ⚠️ | Skeleton / not wired ⚠️ | Both out of active wiring |
| DataProviderService | NOT WIRED (removed) ❌ | Not wired ⚠️ | Primary provider UNDECIDED |
| Competitions | BLOCKED (401) | ✅ 93 competitions | SportsDataIO wins |
| Teams | BLOCKED (401) | ✅ 258 teams (UCL) | SportsDataIO wins |
| Schedules/Fixtures | BLOCKED (401) | ❌ 401 (trial) | Both blocked |
| Players | BLOCKED (401) | ❌ 404 (trial) | Both blocked |
| Standings | BLOCKED (401) | ❌ 401 (trial) | Both blocked |
| PSL coverage | ❓ UNKNOWN | ❓ UNKNOWN (paid plan) | Neither confirmed |
| WC2026 coverage | ❓ UNKNOWN | ❓ UNKNOWN (paid plan) | Neither confirmed |
| Field mapping (teams) | BLOCKED | ✅ externalId + name | SportsDataIO partial |
| Field mapping (fixtures) | BLOCKED | ❌ trial blocked | Both blocked |
| Rate limits | UNKNOWN | UNKNOWN | Neither validated |
| Commercial terms | UNKNOWN | UNKNOWN | Owner must review |
| Betting/odds | PROHIBITED ✅ | PROHIBITED ✅ | Both safe |
| PSL One adapter tests | 20 tests ✅ | 0 tests ⚠️ | Sportmonks ahead |

## Situation Summary (Amended 2026-06-22)

**Sportmonks has been REJECTED** — removed from the active provider strategy (Sprint 10 amendment).  
Owner determination: Sportmonks does not provide the required data points for the platform.

**SportsDataIO is a secondary candidate** but PSL Premier Soccer League is NOT in its competition list on the current trial. A paid plan and explicit PSL coverage confirmation are required before SportsDataIO can be considered.

**Primary provider: UNDECIDED.** See `SPRINT-10-ACTIVE-PROVIDER-STRATEGY.md` and `SPRINT-10-NEW-PROVIDER-SHORTLIST.md`.
