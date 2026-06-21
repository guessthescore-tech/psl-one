# Sprint 10 — Provider Comparison

Date: 2026-06-21

## Head-to-Head

| Criterion | Sportmonks | SportsDataIO | Notes |
|-----------|-----------|--------------|-------|
| Key present | ✅ PRESENT (length 60) | ✅ PRESENT (length 32) | Both server-side |
| Health check | ❌ HTTP 401 | ✅ HTTP 200 | SportsDataIO wins trial |
| Auth method | `Authorization: Bearer` | `Ocp-Apim-Subscription-Key` | Both server-side only |
| Frontend exposure | NEVER ✅ | NEVER ✅ | PSL One rule enforced |
| Adapter status | Fully implemented ✅ | Skeleton / not wired ⚠️ | Sportmonks ahead |
| DataProviderService | Wired ✅ | Not wired ⚠️ | Sportmonks production-ready path |
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

## Situation Summary

**Neither provider can be fully validated in Sprint 10:**
- Sportmonks: key must be regenerated/verified
- SportsDataIO: trial scope too narrow for PSL/WC2026

**On adapter maturity and integration, Sportmonks remains the stronger candidate** once the key issue is resolved.

**SportsDataIO trial demonstrates auth model works**, but full validation requires a paid subscription.
