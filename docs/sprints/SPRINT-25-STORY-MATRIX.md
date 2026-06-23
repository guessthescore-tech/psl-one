# Sprint 25 — Story Matrix

**Sprint Goal:** Prepare platform for PSL fixture availability monitoring without importing fixtures, publishing fixtures, or activating PSL.

**Decision: CONDITIONAL_GO**

---

## Stories

| ID | Title | Type | Status | Notes |
|----|-------|------|--------|-------|
| S25-01 | Parse PSL fixture availability check tool | Tool | DONE | `tools/staging/sprint-25-psl-fixture-availability-check.mjs` — dryRun=true always |
| S25-02 | Team resolution readiness tool | Tool | DONE | `tools/staging/sprint-25-team-resolution-readiness.mjs` — read-only |
| S25-03 | Parse fixture availability status doc | Doc | DONE | `docs/staging/SPRINT-25-PARSE-FIXTURE-AVAILABILITY.md` |
| S25-04 | Dry-run results record | Doc | DONE | `docs/staging/SPRINT-25-PARSE-DRY-RUN-RESULTS.md` — SOURCE_EMPTY |
| S25-05 | Source-empty status explanation | Doc | DONE | `docs/staging/SPRINT-25-SOURCE-EMPTY-STATUS.md` |
| S25-06 | Team resolution matrix | Doc | DONE | `docs/staging/SPRINT-25-TEAM-RESOLUTION-READINESS.md` — 16 clubs |
| S25-07 | Fixture import write runbook | Doc | DONE | `docs/staging/SPRINT-25-FIXTURE-IMPORT-WRITE-RUNBOOK.md` — NOT AUTHORISED |
| S25-08 | Fixture publication runbook | Doc | DONE | `docs/staging/SPRINT-25-FIXTURE-PUBLICATION-RUNBOOK.md` — NOT AUTHORISED |
| S25-09 | Owner approval gates | Doc | DONE | `docs/staging/SPRINT-25-OWNER-APPROVAL-GATES.md` |
| S25-10 | PSL activation boundary | Doc | DONE | `docs/staging/SPRINT-25-PSL-ACTIVATION-BOUNDARY.md` |
| S25-11 | Experience tests | Tests | DONE | ~20 new tests in experience.spec.ts |
| S25-12 | Handover docs | Docs | DONE | 5 handover docs + this matrix |

---

## Counters

| Metric | Sprint 24 | Sprint 25 | Delta |
|--------|-----------|-----------|-------|
| API routes | 1,968 | 1,968 | +0 |
| Experience tests | 905 | ~925 | +~20 |
| API tests | 1,968 | 1,968 | +0 |
| Migrations | 42 | 42 | +0 |
| Web pages | unchanged | unchanged | +0 |
| Staging docs | — | +8 | +8 |
| Tool scripts | — | +2 | +2 |

---

## Known Gaps

| Gap | Description | Sprint |
|-----|-------------|--------|
| GAP-25-01 | PSL fixtures SOURCE_EMPTY (~July/August 2026) | 25 |
| GAP-25-02 | API-Football PSL account suspended | 13+ |
| GAP-25-03 | No PSL 2026/27 Season record | 25 |
| GAP-25-04 | No PSL 2026/27 Gameweeks | 25 |

---

## Safety State

```
PSL:                    INACTIVE (unchanged)
WC2026:                 ACTIVE (unchanged)
Wallet:                 SANDBOX (unchanged)
Scheduled ingestion:    DISABLED (unchanged)
Production ingestion:   DISABLED (unchanged)
Real-money:             NONE (unchanged)
EC2 deployed SHA:       c731c494 (Sprint 24, unchanged)
Migrations:             42 (unchanged)
```
