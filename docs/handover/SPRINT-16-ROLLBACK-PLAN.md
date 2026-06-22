# Sprint 16 — Rollback Plan

## Risk Assessment

Sprint 16 carries LOW rollback risk:

- No migration — schema unchanged
- No scheduled jobs — manual trigger only
- dryRun defaults true — no accidental writes
- Fixtures created with isPublished=false — no fan-visible impact

## Rollback Scenarios

### Scenario A: Dry-run only (common case)

If only dry-runs have been executed, there is nothing to roll back.
No DB changes, no schema changes.

### Scenario B: Write run created fixtures

If a write run was executed and fixtures were created:

1. Query ingested fixtures:
   ```sql
   SELECT id FROM fixtures WHERE provider_source = 'parse-psl';
   ```
2. Delete them:
   ```sql
   DELETE FROM fixtures WHERE provider_source = 'parse-psl';
   ```
3. No cascade effects — fixtures are not published, not linked to predictions/gameweeks yet.

### Scenario C: Code rollback

If the Sprint 16 branch needs to be reverted from main:

```bash
git revert <merge-commit-sha>
```

Files to be reverted:
- `apps/api/src/data-provider/parse-psl-fixture-ingestion.service.ts` (deleted)
- `apps/api/src/data-provider/parse-psl-fixture-ingestion.service.spec.ts` (deleted)
- `apps/api/src/data-provider/data-provider.module.ts` (reverted to pre-Sprint-16 version)
- `apps/api/src/data-provider/data-provider.controller.ts` (reverted)
- `tools/discovery/sprint-16-parse-fixture-ingestion-dry-run.mjs` (deleted)

No migration to roll back — no Prisma schema changes in Sprint 16.

### Scenario D: Module import error

If `ParsePslFixtureIngestionService` causes a startup failure:

Remove from `DataProviderModule.providers` and `DataProviderModule.exports` temporarily,
and remove the injected dependency from `DataProviderController`.

## Recovery Time Estimate

| Scenario | Estimated Recovery Time |
|----------|------------------------|
| Dry-run only | 0 minutes (nothing to undo) |
| Write run — delete fixtures | < 5 minutes |
| Code rollback | < 15 minutes |
| Module error fix | < 5 minutes |
