# PSL Beta Rollback Runbook

> Status: DRAFT — rollback not yet required  
> Last updated: 2026-06-14 (STORY-39)  
> Safety: Rollback dry-run is read-only. This doc describes the procedure; it does not trigger rollback.

## When to Rollback

Rollback is required if:
- A critical data integrity issue is discovered post-beta-invite
- PSL season activation causes unexpected side-effects (future story)
- A security or compliance issue is identified in the beta cohort

## What is Preserved in ANY Rollback

These are NEVER touched during rollback:
- `FIFA World Cup 2026` season and all associated data
- World Cup fantasy teams, predictions, scores, leaderboards
- World Cup player stats, standings, history

## Rollback Dry Run

Before any rollback, run the read-only analysis:
```
POST /admin/beta-launch/:seasonId/rollback-dry-run
```

Response will carry:
- `rollbackWillNotBePerformed: true`
- `worldCupHistoryPreserved: true`
- Impact analysis per domain

## Rollback Scope for Beta (STORY-39)

Since PSL season has NOT been activated in STORY-39, rollback in this context means:

1. **Cohort rollback** — Pause or cancel beta cohorts at `/admin/beta-launch/cohorts/:cohortId`
2. **Approval invalidation** — Reject/invalidate approval at `POST /admin/beta-launch/:seasonId/reject`
3. **Data rollback** — Re-run seed to reset provisional data: `pnpm --filter @psl-one/api db:seed`

## Full Season Rollback (future story — when activation has occurred)

Steps (once activation endpoint exists):
1. Notify beta cohort users
2. Pause all active cohorts
3. Run rollback dry-run to confirm scope
4. Revert `Season.isActive` and `Season.status` to pre-activation state
5. Void any PSL-season-scoped predictions, fantasy entries, social challenges
6. Publish rollback notice via admin dashboard
7. Confirm World Cup data intact: `GET /seasons/active` must still return World Cup season

## After Rollback
- Write post-mortem documenting the cause
- Update `SeasonActivationApproval` with `invalidationReason`
- Review and fix the root cause before re-attempting activation
