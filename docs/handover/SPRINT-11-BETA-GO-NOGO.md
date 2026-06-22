# Sprint 11 — Beta Go/No-Go

## Overall Decision: CONDITIONAL_GO

*Updated: 2026-06-22*

Progress since Sprint 10 CONDITIONAL_GO:
- ✅ API-Football selected as primary provider candidate
- ✅ `ApiFootballAdapter` implemented (safe no-key skeleton, 22 tests)
- ✅ `DataProviderService` wired with explicit `DATA_PROVIDER` flag
- ✅ NoOp fallback retained — no accidental activation
- ✅ Provider discovery tools (4 tools) created
- ✅ Provider validation matrix, decision record, risk register documented
- ❌ PSL coverage not confirmed — no live API-Football trial key in Sprint 11
- ❌ WC2026 coverage not confirmed — no live trial key
- ❌ EC2 staging migration still not applied (no EC2 DATABASE_URL)
- ❌ Commercial terms not reviewed for API-Football

**Conditions for full GO:**
1. API-Football trial key obtained; PSL (league 288) confirmed in coverage
2. WC2026 confirmed in API-Football coverage
3. Field mapping verified (externalId, homeTeamName, awayTeamName, kickoffAt, status)
4. EC2 staging migration applied
5. EC2 live smoke passes
6. Commercial terms reviewed for API-Football

---

## Gate Status

| Gate | Status | Notes |
|------|--------|-------|
| main CI (CI Quality) | ✅ PASS | Sprint 10 merge — green at 19ba33d |
| main CI (Container Build) | ✅ PASS | All 3 containers |
| API tests | ✅ PASS 1,798 | Sprint 11 adds 27 new tests |
| Experience tests | ✅ PASS | Sprint 11 assertions added |
| API typecheck | ✅ PASS | |
| Experience typecheck | ✅ PASS | |
| API build | ✅ PASS | |
| Experience build | ✅ PASS | |
| codex:validate | ✅ PASS | |
| docs:validate | ✅ PASS | |
| audit (no HIGH/CRITICAL) | ✅ PASS | 3 moderate pre-existing |
| ApiFootballAdapter implemented | ✅ PASS | Safe no-key mode |
| DataProviderService DATA_PROVIDER flag | ✅ PASS | Explicit selection wired |
| NoOp default retained | ✅ PASS | No auto-activation |
| Provider discovery tools | ✅ PASS | 4 tools, READ-ONLY |
| No provider key committed | ✅ PASS | |
| No NEXT_PUBLIC_ provider keys | ✅ PASS | |
| API-Football PSL (league 288) confirmed | ❌ PENDING | No live trial key in Sprint 11 |
| API-Football WC2026 confirmed | ❌ PENDING | No live trial key |
| API-Football field mapping verified | ❌ PENDING | Requires live trial key |
| Commercial terms reviewed | ❌ PENDING | Owner must review api-sports.io pricing |
| EC2 staging migration | ❌ PENDING_EC2_DB_URL | No EC2 DATABASE_URL configured |
| EC2 live smoke | ❌ PENDING_EC2_MIGRATION | Cannot run until EC2 migration applied |
| PSL | ✅ INACTIVE | Not activated |
| WC2026 | ✅ ACTIVE | Beta context |
| Wallet | ✅ SANDBOX_ONLY | No production wallet |
| Real-money check | ✅ PASS | Points-only confirmed |
| Rollback plan | ✅ DOCUMENTED | See SPRINT-11-ROLLBACK-PLAN.md |

---

## What Unblocks Each Failing Gate

| Gate | Action |
|------|--------|
| API-Football PSL confirmed | Obtain trial key → run `sprint-11-provider-coverage.mjs` |
| API-Football WC2026 confirmed | Same trial key → verify league ID 1 in coverage output |
| Field mapping verified | Run `sprint-11-provider-field-map.mjs` with live key |
| Commercial terms | Review https://api-sports.io/pricing; owner authorises |
| EC2 staging migration | Configure EC2 DATABASE_URL + explicit owner authorization |
| EC2 live smoke | After EC2 migration applied; run smoke with EC2 BASE_URL |

---

## No-Go Conditions (unchanged)

- PSL season activation before provider coverage confirmed
- Provider key committed to git or exposed in `NEXT_PUBLIC_*`
- Wallet production enabled without separate authorization
- Real-money functionality added
- Betting, odds, or wagering endpoints called
