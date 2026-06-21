# Sprint 7 — Staging Migration Rollback

**Migration:** 42 (`20260621000003_challenge_settlement`)

---

## Rollback Scope

Migration 42 is **additive only**:
- New nullable columns added to `prediction_challenges`
- New enum values added to `PredictionChallengeStatus` and `AuditEvent`

There is **no `prisma migrate down`** for this migration — Prisma does not auto-generate rollback SQL.

---

## Manual Rollback Steps (if needed)

### Remove settlement columns (if migration was applied and code rolled back)

```sql
-- Remove FK constraint first
ALTER TABLE "prediction_challenges" DROP CONSTRAINT IF EXISTS "prediction_challenges_winner_user_id_fkey";

-- Remove columns
ALTER TABLE "prediction_challenges" DROP COLUMN IF EXISTS "settled_at";
ALTER TABLE "prediction_challenges" DROP COLUMN IF EXISTS "creator_points";
ALTER TABLE "prediction_challenges" DROP COLUMN IF EXISTS "acceptor_points";
ALTER TABLE "prediction_challenges" DROP COLUMN IF EXISTS "winner_user_id";
ALTER TABLE "prediction_challenges" DROP COLUMN IF EXISTS "settlement_reason";
```

### Enum rollback note

PostgreSQL does NOT support removing enum values once added. This is a known PostgreSQL limitation.

**Impact:** `SETTLED` and `CHALLENGE_SETTLED` enum values cannot be removed without:
1. Creating a new enum without the value
2. Migrating all references
3. Dropping old enum and renaming new one

For beta/staging, this is acceptable — no production data has used these values. If rollback is required on production, contact the DBA for a planned migration window.

---

## Risk Assessment

| Risk | Severity | Notes |
|------|----------|-------|
| Data loss from rollback | NONE | All new columns are nullable |
| Enum value conflict | LOW | Values not used until settlement runs |
| FK constraint orphan | NONE | `ON DELETE SET NULL` ensures no orphans |

---

## Recovery Steps

1. Roll back code to previous commit (`git revert` the sprint 7 commits or `git checkout main~1`)
2. Run column removal SQL above if needed
3. Deploy old code
4. Verify health check passes
5. Monitor error logs for 15 minutes

---

## Contact

If rollback required in production: immediately contact the platform owner. Do not run destructive SQL without approval.
