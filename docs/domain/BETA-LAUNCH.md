# PSL One — Beta Launch Domain

**Purpose:** Beta cohort management, activation approval, and launch readiness  
**Audience:** Backend engineers, platform operators  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Domain Overview

`BetaLaunchModule` — 27 API routes managing the beta launch process. It does NOT activate the PSL season. It manages cohorts, readiness review, dry-runs, and an approval record.

---

## What Beta Launch Does

1. **Readiness review** — delegates to `SeasonSwitchingService` for 13-check gate (no duplication)
2. **Dry run** — read-only analysis of what activation would do
3. **Rollback dry run** — read-only analysis of what rollback would do
4. **Cohort management** — create cohorts, add/remove members, start/pause/complete
5. **Approval record** — admin sign-off that readiness is verified
6. **Smoke tests** — verify API routes and safety boundaries
7. **Runbook** — reference documentation embedded in API response

---

## What Beta Launch Does NOT Do

- Does NOT set `Season.isActive = true`
- Does NOT write `season.activationPerformedAt`
- Does NOT call any external provider
- Does NOT activate the PSL season in any way

The `ACTIVATION_DISABLED_NOTICE` constant is exported from the module and included in relevant responses.

---

## Models

### BetaCohort

| Field | Description |
|-------|-------------|
| `seasonId` | Season this cohort belongs to |
| `name` | Cohort name (e.g., "Beta Wave 1") |
| `status` | `PENDING`, `ACTIVE`, `PAUSED`, `COMPLETED` |

### BetaCohortMember

| Field | Description |
|-------|-------------|
| `cohortId` | Cohort reference |
| `userId` | Fan reference |

### SeasonActivationApproval

| Field | Description |
|-------|-------------|
| `seasonId` | Season reference |
| `approvedBy` | Admin user ID |
| `approvalStatus` | `APPROVED` — not `ACTIVATED` |
| `notes` | Admin notes |
| `approvedAt` | Timestamp |

`activationPerformedAt` is NEVER set in STORY-39. Activation approval does not activate the season.

---

## Smoke Test Registry

`BetaLaunchSmokeTestService.runRegistry()` verifies:

- `activationRouteAbsent: true` — no route exists that activates the season
- `destructiveRoutesAbsent: true` — no routes that could destroy data
- `allNonDestructive: true` — all registered routes are safe
- Returns `SmokeTestSummary` interface with registry and metadata

---

## API Routes (27 total)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/admin/beta-launch/:seasonId/overview` | Launch overview |
| GET | `/admin/beta-launch/:seasonId/readiness` | 13-check readiness |
| GET | `/admin/beta-launch/:seasonId/blockers` | Blocking issues |
| GET | `/admin/beta-launch/:seasonId/warnings` | Warnings |
| GET | `/admin/beta-launch/:seasonId/frontend-readiness` | Frontend readiness |
| GET | `/admin/beta-launch/:seasonId/data-readiness` | Data readiness |
| GET | `/admin/beta-launch/:seasonId/security-readiness` | Security readiness |
| GET | `/admin/beta-launch/:seasonId/operations-readiness` | Operations readiness |
| GET | `/admin/beta-launch/:seasonId/cohort-readiness` | Cohort readiness |
| GET | `/admin/beta-launch/:seasonId/activation-preview` | Activation preview (read-only) |
| POST | `/admin/beta-launch/:seasonId/dry-run` | Activation dry run (no writes) |
| POST | `/admin/beta-launch/:seasonId/rollback-dry-run` | Rollback dry run (no writes) |
| POST | `/admin/beta-launch/:seasonId/approve` | Create approval record |
| POST | `/admin/beta-launch/:seasonId/reject` | Reject approval |
| GET | `/admin/beta-launch/:seasonId/approval` | Get approval record |
| GET | `/admin/beta-launch/cohorts` | List cohorts |
| POST | `/admin/beta-launch/cohorts` | Create cohort |
| POST | `/admin/beta-launch/cohorts/:id/members` | Add member |
| DELETE | `/admin/beta-launch/cohorts/:id/members/:userId` | Remove member |
| POST | `/admin/beta-launch/cohorts/:id/start` | Start cohort |
| POST | `/admin/beta-launch/cohorts/:id/pause` | Pause cohort |
| POST | `/admin/beta-launch/cohorts/:id/complete` | Complete cohort |
| GET | `/admin/beta-launch/smoke-tests` | Get smoke test registry |
| POST | `/admin/beta-launch/smoke-tests/run` | Run smoke tests |
| GET | `/admin/beta-launch/runbook` | Get runbook |
| GET | `/admin/beta-launch/walkthrough` | Get walkthrough |
| GET | `/admin/beta-launch/seasons` | Beta-ready seasons |

---

## Safety Boundaries

These safety boundaries are verified in smoke tests and encoded in the service:

| Boundary | Status |
|---------|--------|
| PSL season activation | DISABLED |
| Real money movement | DISABLED |
| External wallet API calls | DISABLED (sandbox only) |
| World Cup data modification | PROTECTED |
| Production database migration | NOT_APPLICABLE (local dev) |

See `docs/platform/PSL-BETA-LAUNCH-RUNBOOK.md` for operational procedures.
