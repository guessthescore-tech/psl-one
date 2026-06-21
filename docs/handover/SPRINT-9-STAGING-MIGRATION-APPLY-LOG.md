# Sprint 9 — Staging Migration Apply Log

## Status: LOCAL_DEV_APPLIED — STAGING_EC2_PENDING_DB_URL

Local dev migration apply was performed 2026-06-21 with explicit owner authorization.
Target: `localhost:5432/psl_identity_dev` (local dev DB, NOT staging EC2).

Staging EC2 migration apply still requires:
1. Update `DATABASE_URL` in `apps/api/.env` to point to the EC2 instance
2. Explicit owner authorization in a new session
3. Pre-migration backup of staging DB

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

## Local Dev Apply Result

```
Date applied: 2026-06-21
Target DB:    localhost:5432/psl_identity_dev (local dev — NOT staging EC2)
Authorized by: owner (explicit approval in session)
Migrations applied:
  - 20260621000001_account_security_trust    ← Sprint 5 (was pending on local dev)
  - 20260621000002_prediction_challenge_token ← migration 41
  - 20260621000003_challenge_settlement       ← migration 42
Output: "All migrations have been successfully applied."
Post-smoke result: Challenge settlement smoke — 5/5 file-level PASS; live checks SKIP (no server)
```

## Pre-Migration Checklist (actual)

- [x] Owner explicitly authorized in session (all 3 migrations, local dev DB)
- [ ] DB backup — local dev, not required for dev environment
- [ ] Staging API pre-migration health — local dev only, not applicable
- [x] prisma migrate status confirmed: 3 pending migrations
- [x] No other migration in progress

## Rollback Notes

Enum values (`SETTLED`, `CHALLENGE_SETTLED`, `CHALLENGE_TOKEN_CREATED`, `CHALLENGE_TOKEN_ACCEPTED`) cannot be removed from PostgreSQL enums without dropping and recreating the type. If rollback is needed:
1. Drop `prediction_challenges` table (will delete all challenge data)
2. Create a new enum without the added values
3. This is a destructive operation — only appropriate in staging, never production with real data
