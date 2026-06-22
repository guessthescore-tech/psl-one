# Sprint 19 — Story Matrix

## Sprint: Staging Environment Stabilisation & Admin Smoke

**Branch:** `feature/sprint-19-staging-admin-smoke`
**Status:** CONDITIONAL_GO
**Sprint Goal:** Staging readiness tooling for Sprint 18 admin workflow. No PSL activation. No EC2 deployment without owner authorization.

---

## Story Matrix

| Story ID | Story | Scope | Status |
|----------|-------|-------|--------|
| S19-01 | Staging Readiness Assessment | Docs | DONE |
| S19-02 | Staging Env Checklist | Docs | DONE |
| S19-03 | Staging Deployment Runbook | Docs | DONE |
| S19-04 | Staging Rollback Runbook | Docs | DONE |
| S19-05 | Migration Status Doc | Docs | DONE |
| S19-06 | Admin UI Smoke Checklist | Docs | DONE |
| S19-07 | Staging Env Check Tool | Tools | DONE |
| S19-08 | Admin Smoke Suite Tool | Tools | DONE |
| S19-09 | Admin RBAC Smoke Tool | Tools | DONE |
| S19-10 | Parse Ingestion Smoke Tool | Tools | DONE |
| S19-11 | Fixture Publication Smoke Tool | Tools | DONE |
| S19-12 | PSL Pre-Flight Smoke Tool | Tools | DONE |
| S19-13 | Migration Status Check Tool | Tools | DONE |
| S19-14 | Sprint 19 Experience Spec Block | Tests | DONE |
| S19-15 | Handover: Beta Go/No-Go | Docs | DONE |
| S19-16 | Handover: Handover | Docs | DONE |
| S19-17 | Handover: Known Gaps | Docs | DONE |
| S19-18 | Handover: Owner Review Guide | Docs | DONE |
| S19-19 | Handover: Rollback Plan | Docs | DONE |
| S19-20 | Handover: Sprint Matrix | Docs | DONE |

---

## API Route Inventory (Sprint 19 additions)

**None.** Sprint 19 adds no new API routes.

**Cumulative route count:** 548 (unchanged from Sprint 18)

---

## Frontend Page Inventory (Sprint 19 additions)

**None.** Sprint 19 adds no new frontend pages.

**Cumulative page count:** 353 (unchanged from Sprint 18)

---

## Test Coverage

| Suite | Tests Added | Total |
|-------|-------------|-------|
| experience.spec.ts (Sprint 19 block) | 25 | ~792 |
| API | 0 | 1,932 |

---

## Tool Safety Matrix

| Tool | DRY_RUN_ONLY | ALLOW_WRITE_SMOKE | Activates PSL | Applies Migrations |
|------|-------------|------------------|--------------|-------------------|
| staging-env-check.mjs | N/A | N/A | Never | Never |
| admin-smoke.mjs | true (default) | false (default) | Never | Never |
| admin-rbac-smoke.mjs | N/A | N/A | Never | Never |
| parse-ingestion-smoke.mjs | true (default) | false (default) | Never | Never |
| fixture-publication-smoke.mjs | N/A | false (default) | Never | Never |
| psl-preflight-smoke.mjs | N/A | N/A | Never | Never |
| migration-status-check.mjs | N/A | N/A | Never | Never (status only) |

---

## Hard Constraints Check

| Constraint | Status |
|-----------|--------|
| PSL NOT activated | PASS |
| Scheduled ingestion NOT enabled | PASS |
| Production ingestion NOT enabled | PASS |
| EC2 deployment not performed | PASS (pending owner auth) |
| Wallet SANDBOX only | PASS |
| No betting/odds/wager language | PASS |
| PARSE_API_KEY not in frontend | PASS |
| NEXT_PUBLIC_PARSE_API_KEY forbidden | PASS |
| No .env committed | PASS |
| No AWS/Terraform/EC2 mutations | PASS |
| No Prisma migrations added | PASS |
| No real-money functionality | PASS |

---

## Migration Count

**Sprint 19 migrations added: 0**

Cumulative migration count: 42 (unchanged from Sprint 7)

---

## Known Gaps / Owner Gates

See [SPRINT-19-KNOWN-GAPS.md](../handover/SPRINT-19-KNOWN-GAPS.md) and [SPRINT-19-BETA-GO-NOGO.md](../handover/SPRINT-19-BETA-GO-NOGO.md) for the 6 owner gates and 7 known gaps.
