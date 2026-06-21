# Sprint 10 — Beta Go/No-Go

## Overall Decision: CONDITIONAL_GO

*Updated: 2026-06-21 | Amended: 2026-06-22 — Sportmonks REJECTED*

Progress since Sprint 9 CONDITIONAL_GO:
- ✅ Live staging smoke now passes: 6/6 PASS (was FAIL in Sprint 9 — no server)
- ✅ Settlement smoke: 8/8 PASS
- ✅ Read-only provider pipeline: 11/11 safety checks PASS
- ✅ Onboarding path bug fixed (`/onboarding/status` → `/account/onboarding`)
- ✅ SportsDataIO discovery: WC2026 found in competition list (CompetitionId=21)
- ✅ SportsDataIO: PSL NOT in competition list — important for provider decision
- ❌ Sportmonks: **REJECTED** — removed from active strategy (Sprint 10 amendment 2026-06-22)
- ⚠️ EC2 staging migration: still not applied (no EC2 DATABASE_URL)

**Conditions for full GO:**
1. Replacement provider selected with confirmed PSL coverage (see `SPRINT-10-NEW-PROVIDER-SHORTLIST.md`)
2. EC2 staging migration applied
3. EC2 live smoke passes with chosen provider
4. Commercial terms reviewed for chosen provider

---

## Gate Status

| Gate | Status | Notes |
|------|--------|-------|
| main CI (CI Quality) | ✅ PASS | Green on d4cbc08 |
| main CI (Container Build) | ✅ PASS | All 3 containers |
| API tests | ✅ PASS 1,770 | Sprint 10 baseline |
| Experience tests | ✅ PASS 519 | Sprint 10 adds S10 tests |
| API typecheck | ✅ PASS | |
| Experience typecheck | ✅ PASS | |
| API build | ✅ PASS | |
| Experience build | ✅ PASS | |
| codex:validate | ✅ PASS | |
| docs:validate | ✅ PASS | |
| audit (no HIGH/CRITICAL) | ✅ PASS | 3 moderate pre-existing |
| Pipeline safety check | ✅ PASS 11/11 | No scheduled ingestion, no odds, no PSL activation |
| Onboarding path fix | ✅ FIXED | `/account/onboarding` (was `/onboarding/status`) |
| Live smoke (local dev) | ✅ PASS 6/6 | 2 SKIP — no admin token |
| Settlement smoke | ✅ PASS 8/8 | Includes 3 live checks |
| EC2 staging migration | ❌ PENDING_EC2_DB_URL | No EC2 DATABASE_URL configured |
| EC2 live smoke | ❌ PENDING_EC2_MIGRATION | Cannot run until EC2 migration applied |
| Sportmonks validation | ❌ REJECTED | Removed from active strategy (Sprint 10 amendment 2026-06-22) |
| SportsDataIO full coverage | ⚠️ PARTIAL_TRIAL | Competitions + teams OK; PSL NOT in list |
| WC2026 in SportsDataIO | ⚠️ FOUND_NOT_VERIFIED | CompetitionId=21 in list; fixture data on trial unverified |
| PSL in SportsDataIO | ❌ NOT_FOUND | PSL not in SportsDataIO competition list — significant |
| Commercial terms review | ❌ PENDING | Owner must review before production ingestion |
| No real-money check | ✅ PASS | Points-only platform confirmed |
| PSL | ✅ INACTIVE | Not activated |
| WC2026 | ✅ ACTIVE | Beta context |
| Wallet | ✅ SANDBOX_ONLY | No production wallet |
| Security scan | ✅ PASS | No keys committed; no NEXT_PUBLIC_* provider keys |
| Vercel CI | ⚠️ BLOCKED (non-blocking) | Preview URL reachable (6/6 HTTP 200) |
| Rollback plan | ✅ DOCUMENTED | See SPRINT-10-ROLLBACK-PLAN.md |

---

## Critical SportsDataIO Finding

Running `staging-provider-discovery.mjs` revealed:
- **WC2026 IS in SportsDataIO competition list** (CompetitionId=21)
- **PSL is NOT in SportsDataIO competition list**

This changes the provider decision landscape:
- If Sportmonks key is fixed and has both PSL and WC2026 → Sportmonks is the clear primary
- If Sportmonks cannot cover PSL → a different provider or manual data import may be needed for PSL fixtures
- SportsDataIO may be useful for WC2026 (CompetitionId=21) but cannot cover PSL at all

---

## What Unblocks Each Failing Gate

| Gate | Action |
|------|--------|
| Primary provider | Select replacement from `SPRINT-10-NEW-PROVIDER-SHORTLIST.md`; confirm PSL coverage |
| EC2 staging migration | Configure EC2 DATABASE_URL + explicit owner authorization |
| EC2 live smoke | After EC2 migration + provider wired; run smoke with EC2 BASE_URL |
| SportsDataIO full coverage | Purchase paid plan + confirm PSL in competition list |
| Commercial terms | Owner reviews pricing for chosen replacement provider |

---

## No-Go Conditions (unchanged)

- PSL season activation before provider coverage confirmed
- Provider key committed to git or exposed in NEXT_PUBLIC_*
- Wallet production enabled without separate authorization
- Real-money functionality added
