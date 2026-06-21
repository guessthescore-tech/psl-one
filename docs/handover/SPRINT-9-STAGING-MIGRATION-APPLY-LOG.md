# Sprint 9 — Staging Migration Apply Log

## Status: STAGING_APPLY_PENDING_OWNER_AUTHORIZATION

Staging migration apply has NOT been performed. This document will record the result once authorized.

---

## Migrations to Apply

| # | Migration Name | Type | Reversible |
|---|---------------|------|------------|
| 41 | `20260621000002_prediction_challenge_token` | Table create + enum values + FK | Enum values: NO; Table: YES (with data loss) |
| 42 | `20260621000003_challenge_settlement` | Enum value + additive columns + FK | Enum value: NO; Columns: YES |

### Migration 41 Summary (`prediction_challenge_token`)
```sql
-- Creates new table
CREATE TABLE "prediction_challenges" (...);
-- Adds enum values (IRREVERSIBLE in PostgreSQL)
ALTER TYPE "AuditEvent" ADD VALUE IF NOT EXISTS 'CHALLENGE_TOKEN_CREATED';
ALTER TYPE "AuditEvent" ADD VALUE IF NOT EXISTS 'CHALLENGE_TOKEN_ACCEPTED';
-- Creates indexes and foreign keys
```

### Migration 42 Summary (`challenge_settlement`)
```sql
-- Adds enum value (IRREVERSIBLE in PostgreSQL)
ALTER TYPE "PredictionChallengeStatus" ADD VALUE IF NOT EXISTS 'SETTLED';
ALTER TYPE "AuditEvent" ADD VALUE IF NOT EXISTS 'CHALLENGE_SETTLED';
-- Adds columns (reversible: DROP COLUMN)
ALTER TABLE "prediction_challenges" ADD COLUMN IF NOT EXISTS "settled_at" TIMESTAMP(3);
ALTER TABLE "prediction_challenges" ADD COLUMN IF NOT EXISTS "creator_points" INTEGER;
ALTER TABLE "prediction_challenges" ADD COLUMN IF NOT EXISTS "acceptor_points" INTEGER;
ALTER TABLE "prediction_challenges" ADD COLUMN IF NOT EXISTS "winner_user_id" TEXT;
ALTER TABLE "prediction_challenges" ADD COLUMN IF NOT EXISTS "settlement_reason" TEXT;
-- Adds foreign key
ALTER TABLE "prediction_challenges" ADD CONSTRAINT ... FOREIGN KEY ("winner_user_id") REFERENCES "users"("id") ...;
```

## Pre-Migration Checklist

Before running apply, confirm each item:

- [ ] Owner has explicitly authorized staging apply in this session
- [ ] DB backup has been taken (staging DB snapshot or pg_dump)
- [ ] Staging API is healthy (`GET /health` returns 200)
- [ ] Current migration status confirmed: `pnpm --filter @psl-one/api exec prisma migrate status`
- [ ] No other migration is in progress

## Apply Command

```bash
# Run from repo root
pnpm --filter @psl-one/api exec prisma migrate deploy
```

Expected output (template — fill in after apply):
```
Prisma Migrate: running migrations...
  - 20260621000002_prediction_challenge_token ... done
  - 20260621000003_challenge_settlement ... done
All migrations have been successfully applied.
```

## Post-Apply Smoke Checks

After migration apply, run:

```bash
# API health
curl http://localhost:4000/health

# Challenge result endpoint exists
curl http://localhost:4000/predictions/challenges/nonexistent/result
# Expected: 404

# Settlement admin endpoint gated
curl -X POST http://localhost:4000/predictions/challenges/settle-fixture/test
# Expected: 401

# Full staging smoke
BASE_URL=http://<staging-host>:4000 node tools/smoke/sprint-9-staging-smoke.mjs
```

## Apply Result (fill in after apply)

```
Date applied: ___
Applied by: ___
Output: ___
Post-smoke result: ___
```

## Rollback Notes

Enum values (`SETTLED`, `CHALLENGE_SETTLED`, `CHALLENGE_TOKEN_CREATED`, `CHALLENGE_TOKEN_ACCEPTED`) cannot be removed from PostgreSQL enums without dropping and recreating the type. If rollback is needed:
1. Drop `prediction_challenges` table (will delete all challenge data)
2. Create a new enum without the added values
3. This is a destructive operation — only appropriate in staging, never production with real data
