# Sprint 20 — Story Matrix

## Sprint: Owner-Authorised Beta EC2 Deployment & Staging Smoke

**Branch:** `feature/sprint-20-ec2-staging-smoke`
**Status:** CONDITIONAL_GO
**Sprint Goal:** Execute owner-authorised beta EC2 deployment and staging smoke validation. No PSL activation. No real-money functionality.

---

## Story Matrix

| Story ID | Story | Scope | Status |
|----------|-------|-------|--------|
| S20-01 | EC2 Deployment Plan | Docs | DONE |
| S20-02 | EC2 Execution Log | Docs | DONE |
| S20-03 | Staging Smoke Results | Docs | DONE |
| S20-04 | Staging Env Validation | Docs | DONE |
| S20-05 | Rollback Checklist | Docs | DONE |
| S20-06 | Handover: Beta Go/No-Go | Docs | DONE |
| S20-07 | Handover: Handover | Docs | DONE |
| S20-08 | Handover: Known Gaps | Docs | DONE |
| S20-09 | Handover: Owner Review Guide | Docs | DONE |
| S20-10 | Handover: Rollback Plan | Docs | DONE |
| S20-11 | Sprint Matrix | Docs | DONE |
| S20-12 | Sprint 20 Experience Spec Block | Tests | DONE |
| S20-13 | EC2 Deployment Trigger | EC2 | DONE (workflow triggered) |

---

## API Route Inventory (Sprint 20 additions)

**None.** Sprint 20 adds no new API routes.

**Cumulative route count:** 548 (unchanged from Sprint 18)

---

## Frontend Page Inventory (Sprint 20 additions)

**None.** Sprint 20 adds no new frontend pages.

**Cumulative page count:** 353 (unchanged from Sprint 18)

---

## Test Coverage

| Suite | Tests Added | Total |
|-------|-------------|-------|
| experience.spec.ts (Sprint 20 block) | ~20 | ~808 |
| API | 0 | 1,932 |

---

## Deployment Summary

| Property | Value |
|----------|-------|
| Deployed SHA | `81d3c391ffb69b9217caf0847aa9b4402493c83d` |
| Target | Beta EC2 `i-0a5f16539c9626f90` |
| Workflow | `Deploy — Beta EC2` |
| Migration count | 42 (unchanged) |
| PSL status | INACTIVE |
| Wallet status | SANDBOX |

---

## Hard Constraints Check

| Constraint | Status |
|-----------|--------|
| PSL NOT activated | PASS |
| Scheduled ingestion NOT enabled | PASS |
| Production ingestion NOT enabled | PASS |
| EC2 = beta only (not production) | PASS |
| No Terraform apply | PASS |
| No IAM mutation | PASS |
| Wallet SANDBOX only | PASS |
| No betting/odds/wager language | PASS |
| PARSE_API_KEY not in frontend | PASS |
| NEXT_PUBLIC_PARSE_API_KEY forbidden | PASS |
| No .env committed | PASS |
| No real-money functionality | PASS |
| Fixture publishing separate from PSL activation | PASS |

---

## Migration Count

**Sprint 20 migrations added: 0**

Cumulative migration count: 42 (unchanged from Sprint 7)

---

## Known Gaps / Owner Gates

See [SPRINT-20-KNOWN-GAPS.md](../handover/SPRINT-20-KNOWN-GAPS.md) for the 5 known gaps.
