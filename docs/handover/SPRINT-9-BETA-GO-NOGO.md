# Sprint 9 — Beta Go/No-Go

## Overall Decision: CONDITIONAL_GO

*Updated: 2026-06-21 — local dev migrations applied; live provider validation run.*

Progress since initial NO-GO:
- ✅ Provider replacement keys added to `apps/api/.env` by owner
- ✅ Local dev migrations (40, 41, 42) applied to `localhost:5432/psl_identity_dev`
- ⚠️ Sportmonks key returns HTTP 401 — key invalid, must be regenerated
- ⚠️ SportsDataIO trial — competitions/teams OK; full coverage requires paid plan
- ⚠️ Staging EC2 migration still requires EC2 DATABASE_URL + separate authorization
- ⚠️ Live smoke FAIL — API server not running during test

**Conditional GO — blocked on:**
1. Sportmonks key fix (regenerate at https://app.sportmonks.com/api-tokens)
2. Staging EC2 migration apply (requires EC2 DATABASE_URL in .env + authorization)
3. Commercial terms review (Sportmonks pricing)

---

## Gate Status

| Gate | Status | Notes |
|------|--------|-------|
| main CI (CI Quality) | ✅ PASS | Sprint 8 merge — CI green at c4101fb |
| main CI (Container Build) | ✅ PASS | All 3 containers build successfully |
| API tests | ✅ PASS 1,770 | Sprint 8 baseline |
| Experience tests | ✅ PASS 518 | Sprint 9 adds 18 new tests |
| API typecheck | ✅ PASS | |
| Experience typecheck | ✅ PASS | |
| API build | ✅ PASS | |
| Experience build | ✅ PASS | |
| codex:validate | ✅ PASS | |
| docs:validate | ✅ PASS | |
| audit (no HIGH/CRITICAL) | ✅ PASS | 3 moderate pre-existing |
| Local dev migration (40, 41, 42) | ✅ APPLIED | Applied to localhost:5432/psl_identity_dev 2026-06-21 |
| Staging EC2 migration (41, 42) | ❌ PENDING_EC2_DB_URL | Requires EC2 DATABASE_URL + separate auth |
| Sportmonks validation | ❌ HTTP_401 | Key present (length 60) but API rejects it |
| SportsDataIO validation | ⚠️ PARTIAL_TRIAL | Competitions (93) + teams (258) OK; rest requires paid plan |
| Challenge settlement | ✅ IMPLEMENTED | Auto-trigger on FINISHED + admin endpoint |
| Challenge result UX | ✅ IMPLEMENTED | /predict/challenge/result page |
| Smoke suite (file checks) | ✅ PASS | Live checks pending server |
| Smoke suite (live) | ⚠️ FAIL_NO_SERVER | API not running during test; re-run with active server |
| Security scan | ✅ PASS | No keys committed; no NEXT_PUBLIC_* provider keys |
| No real-money check | ✅ PASS | Points-only platform confirmed |
| PSL | ✅ INACTIVE | Not activated — required |
| WC2026 | ✅ ACTIVE | Beta context — correct |
| Wallet | ✅ SANDBOX_ONLY | No production wallet |
| Vercel CI | ⚠️ BLOCKED (non-blocking) | Deployment blocked; preview URL live and reachable |
| Rollback plan | ✅ DOCUMENTED | See SPRINT-9-ROLLBACK-PLAN.md |

---

## What Unblocks Each Failing Gate

| Gate | Unblocked By |
|------|-------------|
| Sportmonks HTTP 401 | Owner verifies/regenerates key at https://app.sportmonks.com/api-tokens; re-run health check |
| Staging EC2 migration | Update DATABASE_URL to EC2 host in `apps/api/.env`; run `prisma migrate deploy` with explicit auth |
| SportsDataIO full coverage | Purchase SportsDataIO paid plan for PSL/WC2026 validation (optional — Sportmonks preferred) |
| Live smoke | Start API server locally (`pnpm --filter @psl-one/api run start:dev`) then re-run smoke |
| Provider decision final | Sportmonks key fix → run coverage + field mapping checks → record results |

---

## No-Go Conditions That Must Never Be Bypassed

- PSL season activation before provider coverage confirmed
- Provider key committed to git or exposed in NEXT_PUBLIC_*
- Wallet production enabled without separate authorization
- Real-money functionality added
- Staging migrations applied without owner authorization
