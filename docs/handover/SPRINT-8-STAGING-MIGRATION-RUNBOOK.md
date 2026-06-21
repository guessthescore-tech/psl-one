# Sprint 8 — Staging Migration Runbook

## Scope
Migrations to apply to staging (if not already applied):
- Migration 40: 20260615000001_security_performance_hardening
- Migration 41: 20260621000001_account_security_trust
- Migration 42: 20260621000002_prediction_challenge_token
- Migration 43: 20260621000003_challenge_settlement
  (NOTE: this was indexed as migration 42 in Sprint 7 sequence; on staging it is migration 43 if staging was at 41)

## Pre-migration checklist
- [ ] Take DB snapshot/backup before applying
- [ ] Confirm current migration state: `prisma migrate status`
- [ ] Confirm no pending changes: `git status`
- [ ] Confirm DB is not in active use during migration window
- [ ] Confirm owner has explicitly authorized staging deployment

## Apply command
```bash
pnpm --filter @psl-one/api exec prisma migrate deploy
```

## Post-migration smoke checks
- [ ] API health endpoint returns 200
- [ ] `prediction_challenges` table has columns: `settled_at`, `creator_points`, `acceptor_points`, `winner_user_id`, `settlement_reason`
- [ ] PredictionChallengeStatus enum includes SETTLED
- [ ] AuditEvent enum includes CHALLENGE_SETTLED

## Additive verification
All Sprint 7/8 migrations are additive:
- No DROP TABLE
- No DROP COLUMN
- No NOT NULL without default
- New columns are nullable
- Enum values are additive (cannot be removed from PG enum without migration)

## DO NOT
- Do not activate PSL season
- Do not add production wallet config
- Do not enable provider production ingestion
- Do not run without DB backup
- Do not apply unless owner has authorized staging deployment
- Do not commit any token value to this file or any repository file
