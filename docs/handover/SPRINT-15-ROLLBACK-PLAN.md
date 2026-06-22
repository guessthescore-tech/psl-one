# Sprint 15 — Rollback Plan

## Risk Assessment

Sprint 15 changes are additive and non-breaking:
- Documentation files only (no schema changes)
- One new discovery/dry-run tool (read-only, no DB writes)
- No new DB migrations
- No service code changes
- No new API routes
- No frontend changes

**Rollback risk: MINIMAL**

## If Rollback Is Needed

Since there are no DB migrations and no service changes, rollback is simply reverting or removing the Sprint 15 commit from main.

```bash
# Revert the Sprint 15 merge commit
git revert <sprint-15-merge-commit-sha>
git push origin main
```

This removes all Sprint 15 docs and the dry-run tool from main. No data is affected.

## What Cannot Be Rolled Back

- Nothing in Sprint 15 is irreversible.
- The discovery tool has no side effects.
- No production data was written.

## Related Plans

- Sprint 14 rollback: `docs/handover/SPRINT-14-ROLLBACK-PLAN.md` — adapter is additive
- Sprint 16 (future): fixture ingestion job will have its own rollback plan (DB migration involved)
