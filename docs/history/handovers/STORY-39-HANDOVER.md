> **Documentation status:** Historical implementation record.
> This file is retained for traceability and is not the current source of architectural guidance.
> Current documentation starts at [Documentation Home](../../README.md).

# STORY-39 Handover — PSL Season Activation, Frontend Showcase & Beta Launch Readiness

**Created:** 2026-06-14  
**Status:** COMPLETE — all code written, all gates passing, NOT YET COMMITTED  
**Last commit before STORY-38/39:** `b083014 feat: add media sponsor campaigns and wallet activation foundation`

---

## A. What Was Built (STORY-39)

### Backend API
- `BetaLaunchModule` — `BetaLaunchService`, `BetaLaunchSmokeTestService`, `BetaLaunchController`
- 27 admin routes under `/admin/beta-launch/`
- 3 new schema models: `BetaCohort`, `BetaCohortMember`, `SeasonActivationApproval`
- 3 new enums: `BetaCohortStatus`, `BetaCohortMemberStatus`, `BetaLaunchApprovalStatus`
- Migration `20260614000001_beta_launch_readiness` — applied to `psl_identity_dev`
- 8 new `AdminOperations` module readiness entries
- `BetaFeedback` updated: completedStories=14, apiTestCount=1560, webPageCount=336

### Web Client
- `apps/web/src/lib/beta-launch-client.ts` — 22 typed client functions

### Web Pages (18 pages)
- 17 admin pages under `/admin/beta-launch/`
- 1 fan page: `/beta`

### Documentation (5 new, 9 updated)
New: `PSL-BETA-LAUNCH-RUNBOOK.md`, `PSL-BETA-ROLLBACK-RUNBOOK.md`, `PSL-BETA-HYPERCARE-PLAN.md`, `PSL-BETA-FRONTEND-WALKTHROUGH.md`, `PSL-BETA-SMOKE-TEST-PLAN.md`

Updated: `STORY-BY-STORY-CODE-WALKTHROUGH.md`, `API-ROUTE-INVENTORY.md`, `FRONTEND-ROUTE-INVENTORY.md`, `DATABASE-MIGRATION-INVENTORY.md`, `PLATFORM-OVERVIEW.md`, `ADMIN-CAPABILITY-GAP-REVIEW.md`, `BETA-READINESS-REVIEW.md`

---

## B. Safety Invariants

- PSL season activation has NOT been performed
- `SeasonActivationApproval.approvalStatus` is `APPROVED` (never `ACTIVATED` in this story)
- `activationPerformedAt` is never set
- `dryRunOnly: true` and `activationWillNotBePerformed: true` in all dry-run responses
- `rollbackWillNotBePerformed: true` and `worldCupHistoryPreserved: true` in rollback dry-run
- `activationRouteAbsent: true` confirmed programmatically in smoke test registry
- World Cup history untouched — `FIFA World Cup 2026` season `isActive: true`
- No real-money mechanics, no external provider calls

---

## C. Test Gate Results

| Gate | Result |
|------|--------|
| `pnpm --filter @psl-one/api typecheck` | PASS |
| `pnpm --filter @psl-one/api test` | 1560/1560 PASS |
| `pnpm --filter @psl-one/api build` | PASS |
| `pnpm --filter @psl-one/web typecheck` | PASS |
| `pnpm --filter @psl-one/web build` | PASS |
| `prisma validate` | PASS |
| `prisma migrate status` | 38/38 applied |
| `db:seed` (×2) | PASS (idempotent) |

---

## D. Sprint 3 Remaining Work

| Area | Status |
|------|--------|
| AWS ECS / CloudFront / RDS provisioning | PENDING |
| Live sports data provider contract | PENDING |
| Email/SMS/push notification provider | PENDING |
| Wallet provider production contract | PENDING |
| Media rights contract and CDN | PENDING |
| Season activation endpoint | PENDING (approval record ready; actual activation not built) |
| Real player squad import (official PSL data) | PENDING |
| Official PSL fixture schedule import | PENDING |
