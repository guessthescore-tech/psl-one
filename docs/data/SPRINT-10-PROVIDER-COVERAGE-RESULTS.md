# Sprint 10 — Provider Coverage Results

Date: 2026-06-21  
Amended: 2026-06-22 — Sportmonks REJECTED; see SPRINT-10-ACTIVE-PROVIDER-STRATEGY.md

## Summary

| Provider | Key Present | Health | Coverage | PSL | WC2026 |
|----------|------------|--------|----------|-----|--------|
| Sportmonks | ✅ PRESENT (length 60) | ❌ HTTP 401 | ❌ ALL_FAIL | ❓ UNKNOWN | ❓ UNKNOWN |
| SportsDataIO | ✅ PRESENT (length 32) | ✅ HTTP 200 | ⚠️ PARTIAL (UCL trial) | ❓ UNKNOWN (paid plan) | ❓ UNKNOWN (paid plan) |

## Sportmonks Coverage Detail

All endpoints return HTTP 401 — key invalid or plan blocked.

| Endpoint | HTTP | Count | Notes |
|----------|------|-------|-------|
| seasons | 401 | 0 | Auth rejected |
| fixtures | 401 | 0 | Auth rejected |
| teams | 401 | 0 | Auth rejected |
| players | 401 | 0 | Auth rejected |
| standings | 401 | 0 | Auth rejected |

## SportsDataIO Coverage Detail

Trial scope: UEFA Champions League (Competition ID 3) only.

| Endpoint | HTTP | Count | Notes |
|----------|------|-------|-------|
| competitions | 200 | 93 | All competitions accessible |
| schedules (UCL) | 401 | 0 | Trial tier limitation |
| teams (UCL) | 200 | 258 | Teams accessible on trial |
| players (UCL team) | 404 | 0 | Trial tier limitation |
| standings (UCL) | 401 | 0 | Trial tier limitation |

## Key Unknowns

| Question | Answer |
|----------|--------|
| Does Sportmonks have PSL fixtures? | UNKNOWN — 401 blocks all queries |
| Does Sportmonks have WC2026 fixtures? | UNKNOWN — 401 blocks all queries |
| Does SportsDataIO have PSL fixtures? | UNKNOWN — requires paid plan |
| Does SportsDataIO have WC2026 fixtures? | UNKNOWN — requires paid plan |
| Rate limits for 2M fans? | UNKNOWN — neither provider validated |
| Commercial licensing for PSL data? | UNKNOWN — owner must review |

## Commands Run

```bash
node --env-file=apps/api/.env tools/discovery/provider-health-check.mjs
PROVIDER=sportmonks node --env-file=apps/api/.env tools/discovery/provider-coverage-check.mjs
PROVIDER=sportsdataio node --env-file=apps/api/.env tools/discovery/provider-coverage-check.mjs
```

No key values were printed. No production ingestion occurred.
