# Sprint 9 — Staging Migration Go/No-Go

## Current Decision: LOCAL_DEV_GO — STAGING_EC2_PENDING_DB_URL

Local dev migration apply was authorized and completed 2026-06-21. All 3 pending migrations applied successfully to `localhost:5432/psl_identity_dev`.

Staging EC2 migration apply is still NO-GO until the EC2 `DATABASE_URL` is configured and separately authorized.

---

## Go Criteria — Local Dev (COMPLETE 2026-06-21)

| Criterion | Status | Notes |
|-----------|--------|-------|
| Explicit owner authorization received in session | ✅ RECEIVED | Owner chose "Apply all 3 to local dev DB" |
| `prisma migrate status` shows expected pending migrations | ✅ CONFIRMED | 3 pending: account_security_trust, prediction_challenge_token, challenge_settlement |
| No other migration in progress | ✅ CONFIRMED | Clean status |
| DB backup | N/A | Local dev — no backup required |
| API health pre-migration | N/A | Local dev only |

## Go Criteria — Staging EC2 (PENDING)

| Criterion | Status | Notes |
|-----------|--------|-------|
| Explicit owner authorization for EC2 staging | ❌ NOT RECEIVED | Required |
| DATABASE_URL updated to EC2 instance | ❌ NOT CONFIGURED | apps/api/.env still points to localhost |
| Staging DB backup confirmed | ❌ UNKNOWN | Owner must confirm before EC2 apply |
| Staging API pre-migration health check passes | ❌ NOT RUN | Requires EC2 server + correct DB URL |
| No other migration in progress | ❌ UNKNOWN | Confirm before apply |

## No-Go Conditions (unchanged)

- Do NOT apply to production database without separate written authorization
- PSL season activation is NOT part of this migration gate

## What Changes After Authorization

Once the owner explicitly authorizes in the current session:
1. Run `prisma migrate status` to confirm pending
2. Take DB backup
3. Run `pnpm --filter @psl-one/api exec prisma migrate deploy`
4. Record exact output in SPRINT-9-STAGING-MIGRATION-APPLY-LOG.md
5. Run post-apply smoke checks
6. Update this document with result

## Migration Safety Notes

- Migration 41 creates the `prediction_challenges` table — new table, no data impact on existing tables
- Migration 42 adds settlement columns and enum values — additive, no existing data modified
- Both migrations use `IF NOT EXISTS` guards — safe to run against a DB that already has them partially applied
- Enum additions (`SETTLED`, `CHALLENGE_SETTLED`) are irreversible in PostgreSQL — acceptable for staging, cannot be done on production without a maintenance window if ever rolled back
