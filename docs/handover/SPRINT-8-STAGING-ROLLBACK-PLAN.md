# Sprint 8 — Staging Rollback Plan

## Sprint 8 New Columns (from migration 43)
The following columns are nullable — they can be removed if needed:
- `prediction_challenges.settled_at` — nullable timestamp
- `prediction_challenges.creator_points` — nullable integer
- `prediction_challenges.acceptor_points` — nullable integer
- `prediction_challenges.winner_user_id` — nullable FK to users
- `prediction_challenges.settlement_reason` — nullable text

To remove columns (emergency only, requires DBA review):
```sql
ALTER TABLE prediction_challenges
  DROP COLUMN IF EXISTS settled_at,
  DROP COLUMN IF EXISTS creator_points,
  DROP COLUMN IF EXISTS acceptor_points,
  DROP COLUMN IF EXISTS settlement_reason;
```

## FK Constraint
The `winner_user_id` FK can be dropped independently:
```sql
ALTER TABLE prediction_challenges
  DROP CONSTRAINT IF EXISTS prediction_challenges_winner_user_id_fkey;
ALTER TABLE prediction_challenges
  DROP COLUMN IF EXISTS winner_user_id;
```

## Enum Values (CANNOT be removed from Postgres enum)
The following enum values were added additively and CANNOT be removed from PostgreSQL:
- `PredictionChallengeStatus.SETTLED`
- `AuditEvent.CHALLENGE_SETTLED`

**Accepted risk**: these values remain in the schema even if code is rolled back. This is standard practice for Postgres enum management. They cause no harm if unused.

## Code Rollback
If the staging deployment needs to be rolled back to Sprint 6 state:
1. Identify the Sprint 6 tag or commit: `git log --oneline --decorate | grep sprint-6`
2. Deploy the prior Docker image from ECR (do NOT run `prisma migrate reset`)
3. The new nullable columns will remain but be ignored by Sprint 6 code

## No Migration Rollback
`prisma migrate deploy` is one-directional. There is no `prisma migrate rollback` for production/staging.
The correct rollback is to redeploy an older code version that is compatible with the current schema.
Since all Sprint 8 columns are additive and nullable, older code versions will work with the new schema.

## Sequence
1. Stop staging API
2. Redeploy prior Docker image tag
3. Start staging API
4. Verify `GET /health` returns 200
5. Do NOT attempt to undo migrations
