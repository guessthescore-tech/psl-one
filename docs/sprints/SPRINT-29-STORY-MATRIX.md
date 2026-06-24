# Sprint 29 Story Matrix

**Date:** 2026-06-24
**Sprint:** 29 — Beta EC2 Deployment + Cross-Tenant Membership Smoke
**Status:** CONDITIONAL_GO

---

## Sprint Goal

Validate that the ClubMembership + SponsorMembership DB-backed scoping controls
introduced in Sprint 28 correctly enforce cross-tenant isolation on the live
beta EC2 environment.

---

## Story Matrix

| Story | Title | Type | Status | Notes |
|---|---|---|---|---|
| S29-01 | EC2 Deployment of Sprint 28 SHA | Ops | PENDING_OWNER | Requires deploy-beta-ec2.yml dispatch |
| S29-02 | Migration 43 Apply on EC2 | Ops | PENDING_DEPLOY | Runs with deploy (run_migrations=true) |
| S29-03 | Cross-Tenant Smoke Script | Test | COMMITTED | `tools/staging/sprint-29-ec2-cross-tenant-smoke.sh` |
| S29-04 | Temp Smoke User Provisioning | Ops | PENDING_DEPLOY | CLUB_ADMIN + SPONSOR smoke users |
| S29-05 | Cross-Tenant Smoke Execution | Test | PENDING_DEPLOY | 21-check smoke run |
| S29-06 | Temp User Cleanup | Ops | PENDING_SMOKE | Delete smoke users + /tmp/sprint29/ |
| S29-07 | Staging Docs + Evidence | Docs | COMPLETE | 9 staging/security/handover docs |
| S29-08 | Experience Test Coverage | Test | COMPLETE | +26 tests in experience.spec.ts |

---

## Deliverables by Category

### Code / Tools
- `tools/staging/sprint-29-ec2-cross-tenant-smoke.sh` — 21-check bash smoke script

### Documentation (15 files)
- `docs/staging/SPRINT-29-STAGING-MEMBERSHIP-PREFLIGHT.md`
- `docs/staging/SPRINT-29-SMOKE-SCOPE-SELECTION.md`
- `docs/staging/SPRINT-29-TEMP-USER-PROVISIONING.md`
- `docs/staging/SPRINT-29-CROSS-TENANT-SMOKE-EXECUTION-LOG.md`
- `docs/staging/SPRINT-29-CROSS-TENANT-SMOKE-RESULTS.md`
- `docs/staging/SPRINT-29-ROLE-SMOKE-EVIDENCE.md`
- `docs/staging/SPRINT-29-TEMP-USER-CLEANUP-EVIDENCE.md`
- `docs/security/SPRINT-29-CROSS-TENANT-ACCESS-VERIFICATION.md`
- `docs/security/SPRINT-29-MEMBERSHIP-SMOKE-SECURITY-REVIEW.md`
- `docs/handover/SPRINT-29-BETA-GO-NOGO.md`
- `docs/handover/SPRINT-29-HANDOVER.md`
- `docs/handover/SPRINT-29-KNOWN-GAPS.md`
- `docs/handover/SPRINT-29-OWNER-REVIEW-GUIDE.md`
- `docs/handover/SPRINT-29-ROLLBACK-PLAN.md`
- `docs/sprints/SPRINT-29-STORY-MATRIX.md`

### Tests
- `apps/experience/src/lib/experience.spec.ts` — Sprint 29 describe blocks

---

## API Route Count

No new API routes in Sprint 29. Total remains **2,034** (as of Sprint 28 merge).

---

## Page Count

No new frontend pages in Sprint 29. Total remains **1,175 experience pages** (as of Sprint 28).

---

## Test Counts

| Suite | Count | Delta |
|---|---|---|
| API unit/integration tests | 2,053 | 0 |
| Experience tests | 1,257 | +26 |

---

## Safety Matrix

| Safety Gate | Confirmed |
|---|---|
| PSL INACTIVE | YES — PSL remains inactive throughout Sprint 29 |
| Wallet SANDBOX | YES — no wallet production calls |
| NON_FINANCIAL | YES — no real-money, no betting, no cash rewards |
| No fixture write | YES |
| No fixture publication | YES |
| No scheduled ingestion | YES |
| No production ingestion | YES |
| No Terraform changes | YES |
| No IAM mutations | YES |
| No .env committed | YES |
| No JWT in source | YES (JWT_SCAN_CLEAN) |

---

## Known Gaps

See `docs/handover/SPRINT-29-KNOWN-GAPS.md`.

Key gap: EC2 deployment pending (GAP-29-01).

---

## Sprint 30 Candidates

1. Audience Segmentation + Sponsor Asset Management
2. World Cup Squads + Fantasy Player Pool Completion

Owner to select.
