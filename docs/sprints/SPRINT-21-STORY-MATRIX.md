# Sprint 21 — Story Matrix

## Sprint: Admin Token Provisioning & Manual Staging Smoke Completion

**Branch:** `feature/sprint-21-admin-token-staging-smoke`
**Status:** CONDITIONAL_GO
**Sprint Goal:** Complete manual staging smoke for Sprint 19 tools via SSM on beta EC2. Document admin token acquisition. No PSL activation. No real-money functionality.

---

## Story Matrix

| Story ID | Story | Scope | Status |
|----------|-------|-------|--------|
| S21-01 | Admin Token Runbook | Docs | DONE |
| S21-02 | RBAC Smoke Results | Docs + EC2 | DONE (5/5 PASS) |
| S21-03 | PSL Pre-Flight Smoke Results | Docs + EC2 | DONE (auth-gated PASS) |
| S21-04 | Parse Ingestion Smoke Results | Docs + EC2 | DONE (write guard PASS) |
| S21-05 | Fixture Publication Smoke Results | Docs + EC2 | DONE (3/3 PASS) |
| S21-06 | Manual Smoke Results Summary | Docs | DONE |
| S21-07 | Handover: Beta Go/No-Go | Docs | DONE |
| S21-08 | Handover: Handover | Docs | DONE |
| S21-09 | Handover: Known Gaps | Docs | DONE |
| S21-10 | Handover: Owner Review Guide | Docs | DONE |
| S21-11 | Handover: Rollback Plan | Docs | DONE |
| S21-12 | Sprint Matrix | Docs | DONE |
| S21-13 | Sprint 21 Experience Spec Block | Tests | DONE |

---

## API Route Inventory (Sprint 21 additions)

**None.** Sprint 21 adds no new API routes.

**Cumulative route count:** 548 (unchanged from Sprint 18)

---

## Frontend Page Inventory (Sprint 21 additions)

**None.** Sprint 21 adds no new frontend pages.

**Cumulative page count:** 353 (unchanged from Sprint 18)

---

## Test Coverage

| Suite | Tests Added | Total |
|-------|-------------|-------|
| experience.spec.ts (Sprint 21 block) | ~26 | ~840 |
| API | 0 | 1,932 |

---

## Smoke Execution Summary

| Tool | Method | PASS | FAIL | SKIP |
|------|--------|------|------|------|
| `sprint-19-admin-rbac-smoke.mjs` | SSM + Docker | 5 | 0 | 0 |
| `sprint-19-psl-preflight-smoke.mjs` | SSM + Docker | 1 | 0 | 1 |
| `sprint-19-parse-ingestion-smoke.mjs` | SSM + Docker | 1 | 0 | 2 |
| `sprint-19-fixture-publication-smoke.mjs` | SSM + Docker | 3 | 0 | 2 |
| `sprint-19-admin-smoke.mjs` | SSM + Docker | 3 | 0 | 4 |

All authenticated paths: `MANUAL_SMOKE_PENDING_ADMIN_TOKEN`

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
| No gambling language | PASS |
| PARSE_API_KEY not in frontend | PASS |
| NEXT_PUBLIC_PARSE_API_KEY forbidden | PASS |
| No .env committed | PASS |
| No real-money functionality | PASS |
| Admin JWT not printed or committed | PASS |
| Fixture publishing separate from PSL activation | PASS |

---

## Migration Count

**Sprint 21 migrations added: 0**

Cumulative migration count: 42 (unchanged from Sprint 7)

---

## Known Gaps / Owner Gates

See [SPRINT-21-KNOWN-GAPS.md](../handover/SPRINT-21-KNOWN-GAPS.md) for 5 known gaps.
