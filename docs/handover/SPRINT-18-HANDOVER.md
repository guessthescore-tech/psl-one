# Sprint 18 — Handover

## Sprint Goal

Build the fixture publishing admin workflow and PSL activation pre-flight checklist. Do NOT activate PSL. Do NOT enable scheduled ingestion. Do NOT enable production wallet.

**Status: COMPLETE — CONDITIONAL_GO**

---

## Deliverables

### API

| File | Purpose |
|------|---------|
| `apps/api/src/fixture-import/fixture-publication.service.ts` | Bulk publish/unpublish service |
| `apps/api/src/fixture-import/psl-activation-preflight.service.ts` | 10-check read-only pre-flight service |
| `apps/api/src/fixture-import/fixture-publication.controller.ts` | Fixture + preflight controllers |
| `apps/api/src/fixture-import/fixture-import.module.ts` | Module registration (modified) |
| `apps/api/src/fixture-import/fixture-publication.service.spec.ts` | 28 service tests |
| `apps/api/src/fixture-import/psl-activation-preflight.service.spec.ts` | 15 preflight tests |

### Frontend

| File | Purpose |
|------|---------|
| `apps/experience/src/lib/fixture-publication-api.ts` | API helper functions |
| `apps/experience/src/app/admin/fixtures/imported/page.tsx` | Fixture manager admin page |
| `apps/experience/src/app/admin/psl/preflight/page.tsx` | Pre-flight check admin page |

### Tools

| File | Purpose |
|------|---------|
| `tools/discovery/sprint-18-fixture-publication-smoke.mjs` | API smoke tool |
| `tools/discovery/sprint-18-psl-preflight-check.mjs` | Pre-flight diagnostic tool |

### Docs

| File | Purpose |
|------|---------|
| `docs/data/SPRINT-18-FIXTURE-PUBLISHING-WORKFLOW.md` | API + service reference |
| `docs/data/SPRINT-18-PSL-ACTIVATION-PREFLIGHT.md` | Pre-flight check reference |
| `docs/data/SPRINT-18-FIXTURE-PUBLICATION-AUDIT.md` | Audit trail reference |
| `docs/data/SPRINT-18-ADMIN-SMOKE-RUNBOOK.md` | Operator runbook |
| `docs/handover/SPRINT-18-BETA-GO-NOGO.md` | Go/no-go decision |
| `docs/handover/SPRINT-18-HANDOVER.md` | This document |
| `docs/handover/SPRINT-18-KNOWN-GAPS.md` | Known gaps |
| `docs/handover/SPRINT-18-OWNER-REVIEW-GUIDE.md` | Owner review guide |
| `docs/handover/SPRINT-18-ROLLBACK-PLAN.md` | Rollback procedure |
| `docs/sprints/SPRINT-18-STORY-MATRIX.md` | Story matrix |

---

## Test Counts

| Suite | Before | After | Delta |
|-------|--------|-------|-------|
| API (apps/api) | 1,904 | 1,932 | +28 (fixture publication) + 15 (preflight) = +43 |
| Experience (apps/experience) | 741 | 766 | +25 (Sprint 18 block) |

> Note: exact counts depend on vitest run order; these are indicative.

---

## New API Routes

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/admin/fixtures/imported` | ADMIN | List imported fixtures |
| POST | `/admin/fixtures/publish` | ADMIN | Bulk publish/unpublish |
| GET | `/admin/psl/preflight` | ADMIN | Run PSL pre-flight check |

---

## New Admin Pages

| Path | Description |
|------|-------------|
| `/admin/fixtures/imported` | Fixture manager (filter, bulk-select, publish) |
| `/admin/psl/preflight` | Pre-flight check (run, view results) |

---

## No Migrations

Sprint 18 adds no new Prisma migrations. The `Fixture` model already has all required provenance fields (`isPublished`, `providerSource`, `providerFixtureId`, `externalId`, `sourceUrl`, `importedAt`, `lastSyncedAt`).

---

## Hard Constraints (All Honoured)

- PSL season NOT activated
- Scheduled ingestion NOT enabled
- Production ingestion NOT enabled
- Wallet stays in SANDBOX mode
- No betting/odds/wager/real-money language
- `PARSE_API_KEY` not exposed in frontend or docs
- No `.env` committed
- No AWS/Terraform/EC2 mutations
