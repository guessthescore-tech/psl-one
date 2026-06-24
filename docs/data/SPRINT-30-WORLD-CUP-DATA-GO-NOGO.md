# Sprint 30 — World Cup 2026 Data Go/No-Go Assessment

**Status:** CONDITIONAL_GO | PSL INACTIVE | WALLET SANDBOX | BETA ONLY
**Date:** 2026-06-24

---

## Decision Matrix

| Data Domain | Status | Confidence | Blocker |
|-------------|--------|-----------|---------|
| WC Fixtures | **GO** | HIGH | None |
| WC Teams | **GO** | HIGH | None |
| Group Standings | **GO** | HIGH | Can be calculated |
| Squad/Player Pool | **CONDITIONAL** | MEDIUM | Manual CSV needed or paid key |
| Live Match Data | **NO_GO** | N/A | No live key, not needed for beta |
| Player Statistics | **DEFERRED** | N/A | Paid plan needed |
| Fantasy Player Pool | **CONDITIONAL** | MEDIUM | Depends on squad data |
| GTS Prediction Cards | **GO** | HIGH | Fixtures sufficient |
| Leaderboards | **GO** | HIGH | Points-only, no financial |

---

## Detail by Domain

### ✅ GO — WC Fixtures
- **Evidence:** Sprint 13 validation confirmed 104 WC2026 matches via football-data.org
- **Data:** All rounds (group stage + knockout), kickoff times, venue, teams
- **Provider:** football-data.org (free tier sufficient)
- **Action:** None — already ingested to beta DB

### ✅ GO — WC Teams
- **Evidence:** 65 teams seeded in beta DB (confirmed Sprint 29 smoke: 65 Team records)
- **Data:** Team names, slugs, national associations, crest URLs (placeholders)
- **Action:** None — existing seed data sufficient for beta

### ✅ GO — Group Standings
- **Evidence:** Group, GroupStanding models exist in schema
- **Data:** 8 groups × 6 teams = 48 entries; can be computed from fixture results
- **Action:** GroupStanding records update via FixtureResultService on FINISHED status

### ⚠️ CONDITIONAL — Squad/Player Pool
- **Evidence:** SquadImportModule exists; 96 provisional WC players seeded (Sprint 29)
- **Gap:** 48 teams need 23+ players each = ~1,104–1,248 players needed
- **Current coverage:** ~96 provisional (Sprint 29 seed) — PARTIAL
- **Action:** Owner must either (a) provide football-data.org/API-Football key for bulk import or (b) authorise manual CSV upload workflow. **OWNER GATE.**

### ❌ NO_GO — Live Match Data
- **Evidence:** No live API key in beta environment
- **Reason:** Live match data not required for beta UX testing (fixtures are sufficient)
- **Action:** Deferred to production launch readiness (owner must procure live key)

### ⚠️ CONDITIONAL — Fantasy Player Pool
- **Depends on:** Squad/Player Pool above
- **Current state:** FantasyPriceCalibrationModule + FantasyCalibrationModule exist
- **With 96 players:** 4-position pool viable but thin (not enough per position)
- **With full squads:** Fully viable with flat pricing by position
- **Action:** Blocked by squad data completeness. Owner gate.

### ✅ GO — GTS Prediction Cards
- **Evidence:** 104 WC fixtures already in DB; ScorePrediction model + PredictionsModule exist
- **Data:** All 104 matches can appear as prediction cards
- **Lock timing:** Calculated from fixture.kickoffAt - FantasyRulesConfig.lockMinutes
- **Settlement:** Automated via PredictionsModule on FINISHED fixture status
- **Points:** POINTS_ONLY — no financial settlement
- **Status:** READY for beta user testing

### ✅ GO — Leaderboards
- **Evidence:** EngagementModule exists; PredictionPointsLedger, FantasyPointsLedger exist
- **Data:** Points-only leaderboards fully operational
- **Status:** READY — no real-money involvement

---

## Owner Decisions Required

| # | Decision | Impact | Priority |
|---|----------|--------|----------|
| OG-30-01 | Procure paid API key (football-data.org or API-Football) for full squad data | Fantasy player pool completeness | HIGH |
| OG-30-02 | Authorise manual CSV squad upload workflow for WC48 teams | Beta fantasy feature | MEDIUM |
| OG-30-03 | Confirm football-data.org attribution display requirement for production | Legal/commercial | MEDIUM |
| OG-30-04 | Procure live match data key for production phase | Match centre live features | LOW (not beta) |

---

## Beta Readiness Summary

**Can beta continue?** YES — CONDITIONAL_GO  
**GTS beta:** READY (104 fixtures, points-only)  
**Fantasy beta:** PARTIAL (thin player pool, functional but limited)  
**Leaderboards:** READY (points-only)  
**Live match:** DEFERRED (production gate)

**PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | BETA ONLY**

---

*Next step: Owner resolves OG-30-01 or OG-30-02 to unblock full fantasy player pool.*
