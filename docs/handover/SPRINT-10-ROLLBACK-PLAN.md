# Sprint 10 — Rollback Plan

## Branch Rollback

If Sprint 10 branch needs to be reverted after merge:

```bash
git revert <merge-commit-sha> --no-edit
git push origin main
```

Sprint 10 adds no new API routes, no new migrations, no database schema changes.
Rollback is low-risk: removes tools and docs only.

## Tool Rollback

Sprint 10 adds two new discovery tools:
- `tools/discovery/staging-provider-discovery.mjs`
- `tools/discovery/provider-readonly-pipeline-check.mjs`

These are fire-and-forget tools — removing them has no impact on API or experience apps.

## Smoke Script Fix Rollback

Sprint 10 fixes the onboarding path in `tools/smoke/sprint-9-staging-smoke.mjs`:
- Before: `/onboarding/status` (404 — wrong path)
- After: `/account/onboarding` (401 — correct path)

To revert: change back to `/onboarding/status` — but note this was a bug fix.

## EC2 Migration Rollback

If EC2 staging migration is applied in a future sprint and needs rollback:

1. `prediction_challenges` table: drop with `DROP TABLE "prediction_challenges" CASCADE;`
2. Enum values (`SETTLED`, `CHALLENGE_SETTLED`, etc.): cannot be removed without dropping and recreating the type — destructive operation
3. Only appropriate on staging with no real fan data

## What Cannot Be Rolled Back (if EC2 migration is applied)

- PostgreSQL enum values added by migrations 41 and 42

## Provider Key Rollback

If a provider key causes issues:
- Set `SPORTMONKS_API_KEY=` (empty) in `apps/api/.env`
- API automatically falls back to `NoOpAdapter` (safe empty returns)
- No code change needed
