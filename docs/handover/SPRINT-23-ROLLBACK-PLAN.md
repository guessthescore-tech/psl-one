# Sprint 23 — Rollback Plan

## Code Changes in This Sprint

3 controller files changed (5 decorators: `@Roles('ADMIN')` → `@Roles('PSL_ADMIN')`).
3 new spec files added (36 tests).
6 security docs.
5 handover docs.
1 sprint matrix.
Experience test additions.

## Rollback: RBAC Fix

If the `@Roles('PSL_ADMIN')` change must be reverted (e.g., if `ADMIN` was intentional for a different reason):

```bash
git revert <sprint-23-commit-sha>
```

Or manually change `@Roles('PSL_ADMIN')` back to `@Roles('ADMIN')` in the 3 files. This would restore the original behaviour where these endpoints return 403 for all users including PSL_ADMIN.

**Note:** Reverting would re-open GAP-22-01 and make all affected admin endpoints inaccessible again.

## Rollback: No Migrations

**Sprint 23 migrations added: 0** — migration count remains 42. No DB schema changes, no rollback needed for DB.

## Rollback: EC2

RBAC fix is not yet deployed to beta EC2 (pending Sprint 24 deployment). No EC2 rollback needed for Sprint 23.

## Safety State

- PSL: INACTIVE (unchanged)
- Wallet: SANDBOX (unchanged)
- Scheduled ingestion: DISABLED (unchanged)
- Data provider: NoOpAdapter default (unchanged)
