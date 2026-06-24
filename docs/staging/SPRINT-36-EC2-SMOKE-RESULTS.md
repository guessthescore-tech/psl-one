# Sprint 36 — Beta EC2 Smoke Test Results

**Date:** 2026-06-24  
**Workflow run:** `28097344936`  
**Job:** `Smoke test` (ID `83191043351`)  
**Duration:** 1m 13s  
**Deployed SHA:** `d4d8d8c444ae9d40341944f60a10e8dce6aaf49e`

## Summary

| Metric | Value |
|--------|-------|
| Checks run | 17 |
| Passed | 17 |
| Failed | 0 |
| Status | **PASS** |
| Expected SHA | `d4d8d8c444ae9d40341944f60a10e8dce6aaf49e` |
| Deployed SHA | `d4d8d8c444ae9d40341944f60a10e8dce6aaf49e` |
| SHA match | YES |

## Individual Results

| # | Check | Status |
|---|-------|--------|
| 1 | api liveness | PASS |
| 2 | api readiness | PASS |
| 3 | api version sha | PASS |
| 4 | web health | PASS |
| 5 | web landing | PASS |
| 6 | beta environment label | PASS |
| 7 | world cup season preserved | PASS |
| 8 | psl season exists and inactive | PASS |
| 9 | psl activation not ACTIVATED | PASS |
| 10 | fixtures | PASS |
| 11 | standings | PASS |
| 12 | match centre | PASS |
| 13 | fantasy landing | PASS |
| 14 | guess the score landing | PASS |
| 15 | social prediction landing | PASS |
| 16 | leaderboards | PASS |
| 17 | unauthenticated admin rejection | PASS |

## Safety Checks (subset of above)

| Safety Boundary | Smoke Check | Result |
|-----------------|-------------|--------|
| PSL INACTIVE | `psl season exists and inactive` | PASS |
| PSL NOT ACTIVATED | `psl activation not ACTIVATED` | PASS |
| WC2026 preserved | `world cup season preserved` | PASS |
| RBAC enforced | `unauthenticated admin rejection` | PASS |

## Regression Status

All 17 checks that passed in previous deployments continue to pass. No regressions detected.

## New Capabilities Exercised

Sprint 32–35 payload deployed successfully:

| Sprint | New Capability | Smoke Coverage |
|--------|---------------|----------------|
| Sprint 32 | AudienceSegment CRUD | `api readiness` (implicit) |
| Sprint 33 | ObjectStorageModule | `api liveness` (module loads) |
| Sprint 34 | ApiCacheModule @Global | `api liveness` (module loads) |
| Sprint 35 | /shop CATALOGUE_ONLY | `web landing` (implicit) |

Dedicated Sprint 32–35 integration tests: 2053 API / 1302 experience (all green on main prior to deploy).

## Conclusion

**CONDITIONAL_GO** — Beta EC2 is running Sprint 36 payload. PSL remains inactive. No real-money functionality. Safe for continued controlled beta access.
