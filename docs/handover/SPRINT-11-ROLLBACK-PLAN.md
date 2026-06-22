# Sprint 11 — Rollback Plan

## Branch Rollback

If Sprint 11 branch needs to be reverted after merge:

```bash
git revert <merge-commit-sha> --no-edit
git push origin main
```

Sprint 11 adds no new migrations and no new database schema changes.
Rollback is low-risk — removes adapter code, docs, and tools only.

## Adapter Rollback

`ApiFootballAdapter` is a new file. To disable it:
1. Set `DATA_PROVIDER=` (empty) in `apps/api/.env`
2. API falls back to `NoOpAdapter` immediately — no code change needed

To remove entirely: delete `apps/api/src/data-provider/api-football.adapter.ts` and `api-football.adapter.spec.ts`.

## DataProviderService Rollback

Sprint 11 changed `DataProviderService` constructor to use `DATA_PROVIDER` flag.

Before Sprint 11: always `NoOpAdapter`.
After Sprint 11: `NoOpAdapter` by default; `ApiFootballAdapter` only when `DATA_PROVIDER=api-football` + key set.

To revert: set `DATA_PROVIDER=` (empty) — service defaults to `NoOpAdapter` without code change.

## Discovery Tool Rollback

Sprint 11 adds 4 discovery tools under `tools/discovery/sprint-11-*.mjs`. These are fire-and-forget tools — removing them has no impact on API or experience apps.

## What Cannot Be Rolled Back

No database or enum changes in Sprint 11. Full rollback is always possible.

## Provider Key Rollback

If a provider key causes issues:
- Set `DATA_PROVIDER=` (empty) in `apps/api/.env`
- API uses `NoOpAdapter` (safe empty returns)
- No code change needed
