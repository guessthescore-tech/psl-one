# Sprint 10 — EC2 Staging Migration Apply Log

## Status: STAGING_EC2_MIGRATION_PENDING_OWNER_AUTH

EC2 staging migration has NOT been applied.

The `DATABASE_URL` in `apps/api/.env` currently points to the local dev database (`localhost:5432/psl_identity_dev`).
No EC2 DATABASE_URL has been configured in this session.

---

## Local Dev Migration Status (for reference)

Applied in Sprint 9B (2026-06-21):

```
42 migrations found in prisma/migrations
Database schema is up to date!
```

All 42 migrations including:
- `20260621000001_account_security_trust` (migration 40)
- `20260621000002_prediction_challenge_token` (migration 41)
- `20260621000003_challenge_settlement` (migration 42)

## EC2 Staging Migration — Pending Requirements

Before applying to EC2 staging:

- [ ] Update `DATABASE_URL` in `apps/api/.env` to EC2 PostgreSQL host
- [ ] Confirm target DB is staging EC2 (NOT production, NOT localhost)
- [ ] Take pre-migration DB snapshot on EC2
- [ ] Run `prisma migrate status` to confirm pending migrations
- [ ] Owner explicitly authorizes EC2 migration apply in the session
- [ ] Run: `pnpm --filter @psl-one/api exec prisma migrate deploy`
- [ ] Capture exact output here
- [ ] Run post-apply smoke against EC2

## Migrations Expected on EC2 (if EC2 DB is on Sprint 7 state)

| Migration | Name | Type | Reversible |
|-----------|------|------|-----------|
| 40 | `20260621000001_account_security_trust` | Schema change | Partially |
| 41 | `20260621000002_prediction_challenge_token` | New table + enum | Enum: NO |
| 42 | `20260621000003_challenge_settlement` | Enum + columns | Enum: NO |

## EC2 Apply Result (fill in after authorized apply)

```
Date applied: ___
Target DB: ___
Applied by: ___
Migrations applied: ___
Output: ___
Post-smoke result: ___
```

## Safety Notes

- Enum additions (`SETTLED`, `CHALLENGE_SETTLED`, `CHALLENGE_TOKEN_CREATED`, `CHALLENGE_TOKEN_ACCEPTED`) are irreversible in PostgreSQL
- The `prediction_challenges` table is new — no existing data impact
- Column additions are reversible with DROP COLUMN if needed
- PSL activation is NOT triggered by any migration
