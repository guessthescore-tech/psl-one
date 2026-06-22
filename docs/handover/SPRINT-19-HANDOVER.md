# Sprint 19 — Handover

## Sprint Goal

Prepare and validate the staging environment for the Sprint 18 admin ingestion/publication/pre-flight workflow without deploying production, without activating PSL, and without scheduled ingestion.

**Status: COMPLETE — CONDITIONAL_GO**

---

## Deliverables

### Staging Tools

| File | Purpose |
|------|---------|
| `tools/staging/sprint-19-staging-env-check.mjs` | Env var validation — never prints secrets |
| `tools/staging/sprint-19-admin-smoke.mjs` | Comprehensive admin endpoint smoke |
| `tools/staging/sprint-19-admin-rbac-smoke.mjs` | RBAC rejection verification |
| `tools/staging/sprint-19-parse-ingestion-smoke.mjs` | Ingestion dry-run smoke, write-disabled by default |
| `tools/staging/sprint-19-fixture-publication-smoke.mjs` | Publication smoke, write-disabled by default |
| `tools/staging/sprint-19-psl-preflight-smoke.mjs` | Pre-flight read-only smoke |
| `tools/staging/sprint-19-migration-status-check.mjs` | Migration status — never applies |

### Staging Docs

| File | Purpose |
|------|---------|
| `docs/staging/SPRINT-19-STAGING-READINESS-ASSESSMENT.md` | Current state assessment |
| `docs/staging/SPRINT-19-STAGING-ENV-CHECKLIST.md` | Pre/post deployment checklist |
| `docs/staging/SPRINT-19-STAGING-DEPLOYMENT-RUNBOOK.md` | Owner-gated deployment steps |
| `docs/staging/SPRINT-19-STAGING-ROLLBACK-RUNBOOK.md` | Rollback procedure |
| `docs/staging/SPRINT-19-MIGRATION-STATUS.md` | Migration state (0 new migrations) |
| `docs/staging/SPRINT-19-ADMIN-UI-SMOKE-CHECKLIST.md` | Manual UI smoke checklist |

### Handover Docs

| File | Purpose |
|------|---------|
| `docs/handover/SPRINT-19-BETA-GO-NOGO.md` | Go/no-go decision |
| `docs/handover/SPRINT-19-HANDOVER.md` | This document |
| `docs/handover/SPRINT-19-KNOWN-GAPS.md` | Known gaps |
| `docs/handover/SPRINT-19-OWNER-REVIEW-GUIDE.md` | Owner review guide |
| `docs/handover/SPRINT-19-ROLLBACK-PLAN.md` | Code rollback plan |
| `docs/sprints/SPRINT-19-STORY-MATRIX.md` | Sprint story matrix |

---

## Test Counts

| Suite | Before | After | Delta |
|-------|--------|-------|-------|
| API | 1,932 | 1,932 | 0 (no new API code) |
| Experience | 767 | 792 | +25 (Sprint 19 block) |

---

## New Routes / Pages

Sprint 19 adds no new API routes and no new frontend pages. All new code is tooling and documentation.

---

## Hard Constraints (All Honoured)

- PSL NOT activated
- Scheduled ingestion NOT enabled
- Production ingestion NOT enabled
- EC2 deployment NOT performed (pending owner authorization)
- Wallet stays SANDBOX
- No betting/odds/wager/real-money language
- `PARSE_API_KEY` not exposed in frontend or docs
- No `.env` committed
- No AWS/Terraform/EC2 mutations
- No Prisma migrations added

---

## Tool Safety Invariants

| Tool | Default | Write mode | PSL activation |
|------|---------|-----------|----------------|
| `staging-env-check.mjs` | Read-only | N/A | Never |
| `admin-smoke.mjs` | Read-only | Off (`ALLOW_WRITE_SMOKE=false`) | Never |
| `admin-rbac-smoke.mjs` | Read-only | N/A | Never |
| `parse-ingestion-smoke.mjs` | Dry-run only | Off (`ALLOW_WRITE_SMOKE=false`) | Never |
| `fixture-publication-smoke.mjs` | Read-only | Off (`ALLOW_WRITE_SMOKE=false`) | Never |
| `psl-preflight-smoke.mjs` | Read-only | N/A | Never |
| `migration-status-check.mjs` | Status only | N/A | Never |
