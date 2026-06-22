# Sprint 12 — Rollback Plan

## Database Migrations

**Sprint 12 introduces no database migrations.**

Full rollback to pre-Sprint-12 state is always possible without any schema changes or data migration. There is no `prisma migrate reset` required for provider adapter changes.

## Adapter Rollback

To immediately switch back to the safe `NoOpAdapter`:

```bash
# Remove or clear the DATA_PROVIDER flag in apps/api/.env
DATA_PROVIDER=
```

Or remove the line entirely. When `DATA_PROVIDER` is empty or absent, `DataProviderService` falls back to `NoOpAdapter`. No code change is required.

## Removing FootballDataOrgAdapter

If the `FootballDataOrgAdapter` must be removed from the codebase entirely:

1. Delete `apps/api/src/data-provider/adapters/football-data-org.adapter.ts`
2. Remove its import and registration from `DataProviderService`
3. Set `DATA_PROVIDER=` (empty) in environment — `NoOpAdapter` becomes active immediately

No migrations, no schema changes, no seed changes needed.

## Reverting DataProviderService Changes

The entire `DataProviderService` provider selection change is guarded behind the `DATA_PROVIDER` env var. Setting `DATA_PROVIDER=` (empty) disables all live adapters without reverting code. If a full code revert is needed:

```bash
git revert <sprint-12-commit-sha>
```

This is safe because there are no migrations to undo.

## Discovery Tools Rollback

The discovery tools in `tools/discovery/` are fire-and-forget Node scripts. They have no runtime impact:

- They do not modify the database.
- They do not register as services or modules.
- They are not imported by any application code.
- Removing them has zero effect on the running application.

To remove them:
```bash
rm tools/discovery/sprint-12-football-data-health.mjs
rm tools/discovery/sprint-12-football-data-worldcup.mjs
```

## Summary

| Component | Rollback method | Schema change needed |
|---|---|---|
| FootballDataOrgAdapter activation | Set `DATA_PROVIDER=` (empty) | No |
| FootballDataOrgAdapter code | Delete adapter file | No |
| DataProviderService changes | Set `DATA_PROVIDER=` (empty) or `git revert` | No |
| Discovery tools | Delete script files | No |
| Database | No action needed | No migrations in Sprint 12 |
