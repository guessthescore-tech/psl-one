# Sprint 9 — Beta Go/No-Go

## Overall Decision: NO-GO

Beta live activation is blocked on two hard gates:
1. Replacement provider keys not present (both BLOCKED_BY_REPLACEMENT_TOKEN)
2. Staging migration apply not yet authorized by owner

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
| Staging migration (migration 41) | ❌ PENDING_AUTH | NOT applied — awaiting owner authorization |
| Staging migration (migration 42) | ❌ PENDING_AUTH | NOT applied — awaiting owner authorization |
| Sportmonks validation | ❌ BLOCKED_BY_REPLACEMENT_TOKEN | Adapter ready; key needed |
| SportsDataIO validation | ❌ BLOCKED_BY_REPLACEMENT_TOKEN | Candidate skeleton; key needed |
| Challenge settlement | ✅ IMPLEMENTED | Auto-trigger on FINISHED + admin endpoint |
| Challenge result UX | ✅ IMPLEMENTED | /predict/challenge/result page |
| Smoke suite (file checks) | ✅ PASS | Live checks pending server |
| Smoke suite (live) | ❌ PENDING_SERVER | Requires running API + staging migration |
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
| Staging migration | Owner explicit authorization → `pnpm --filter @psl-one/api exec prisma migrate deploy` |
| Sportmonks validation | Owner generates replacement key → `SPORTMONKS_API_KEY` in `apps/api/.env` |
| SportsDataIO validation | Owner registers at sportsdata.io → `SPORTSDATAIO_SOCCER_API_KEY` in `apps/api/.env` |
| Live smoke | Running API server + staging migration applied |
| Provider decision final | Live trial validation results recorded |

---

## No-Go Conditions That Must Never Be Bypassed

- PSL season activation before provider coverage confirmed
- Provider key committed to git or exposed in NEXT_PUBLIC_*
- Wallet production enabled without separate authorization
- Real-money functionality added
- Staging migrations applied without owner authorization
