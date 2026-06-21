# Sprint 9 — Rollback Plan

## Branch Rollback

If the Sprint 9 branch (`feature/sprint-9-provider-validation-staging`) needs to be reverted after merge:

```bash
# Create a revert commit on main (do NOT force-push main)
git revert <merge-commit-sha> --no-edit
git push origin main
```

Sprint 9 adds no new API routes and no new migrations — only tooling scripts and documentation. A revert is low-risk.

## Migration Rollback (Staging Only)

**Migration 41** (`prediction_challenge_token`) created the `prediction_challenges` table.
- To undo: `DROP TABLE "prediction_challenges" CASCADE;`
- This is **destructive** — all challenge data will be lost
- Only appropriate on staging with no real fan data

**Migration 42** (`challenge_settlement`) added enum values and columns.
- Enum values (`SETTLED`, `CHALLENGE_SETTLED`) **cannot be removed** from PostgreSQL enums without dropping and recreating the type
- Columns (`settled_at`, `creator_points`, `acceptor_points`, `winner_user_id`, `settlement_reason`) can be dropped: `ALTER TABLE "prediction_challenges" DROP COLUMN IF EXISTS "settled_at";` (repeat for each)
- FK constraint can be dropped: `ALTER TABLE "prediction_challenges" DROP CONSTRAINT IF EXISTS "prediction_challenges_winner_user_id_fkey";`

**Practical staging rollback if needed:**
```sql
-- Drop the table entirely (irreversible, loses all challenge data)
DROP TABLE IF EXISTS "prediction_challenges" CASCADE;
-- Note: enum values remain in the DB type system — this is a known PostgreSQL limitation
```

Only attempt this on staging with no real fan data.

## Provider Rollback

If a provider trial breaks the API:
- Set `SPORTMONKS_API_KEY=` (empty or remove) in `apps/api/.env`
- Restart API — `NoOpAdapter` becomes active automatically (safe empty returns)
- No code changes needed

## Smoke Suite Rollback

If smoke scripts cause issues:
- Delete from `tools/smoke/sprint-9-*.mjs`
- Smoke scripts are fire-and-forget tools, not part of the build — removing them has no impact on API or experience

## What Cannot Be Rolled Back

- PostgreSQL enum values added by migrations 41 and 42 (they persist in the DB type system)
- Challenge records created in staging (if any were created before rollback)
- Any provider API usage that may have consumed trial quota
