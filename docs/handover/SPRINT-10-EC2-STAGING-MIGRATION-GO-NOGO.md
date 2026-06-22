# Sprint 10 — EC2 Staging Migration Go/No-Go

## Current Decision: NO-GO (EC2 DATABASE_URL not configured)

---

## Go Criteria

| Criterion | Status | Notes |
|-----------|--------|-------|
| DATABASE_URL points to EC2 (not localhost, not production) | ❌ NOT CONFIGURED | Currently localhost |
| Explicit owner authorization in session | ❌ NOT RECEIVED | Required |
| EC2 DB backup confirmed | ❌ UNKNOWN | Must be confirmed before apply |
| `prisma migrate status` run against EC2 | ❌ NOT RUN | Requires EC2 DB URL |
| No other migration in progress | ❌ UNKNOWN | Confirm before apply |

## No-Go Conditions

| Condition | Active? |
|-----------|---------|
| DATABASE_URL points to localhost | YES — blocking |
| No explicit owner authorization | YES — blocking |
| Would apply to production DB | NEVER permitted |
| PSL would be activated by migration | NO — migration does not activate PSL |

## How to Unblock

1. Get EC2 DB connection string from SSM or deployment config
2. Temporarily update `apps/api/.env`: `DATABASE_URL=postgresql://...ec2...`
3. Run: `pnpm --filter @psl-one/api exec prisma migrate status`
4. Confirm the right 3 migrations are pending
5. Say explicitly in the session: **"I authorize EC2 staging migration apply for Sprint 10"**
6. Then: `pnpm --filter @psl-one/api exec prisma migrate deploy`
7. Record output in `SPRINT-10-EC2-STAGING-MIGRATION-LOG.md`
8. Restore `DATABASE_URL` to localhost after apply

## What Changes After EC2 Migration

- `prediction_challenges` table created on EC2 staging DB
- Settlement enum values added (irreversible)
- Live challenge create/accept/settle flow is testable on EC2 staging
- Full live smoke can be run against `http://<ec2-ip>:4000`
