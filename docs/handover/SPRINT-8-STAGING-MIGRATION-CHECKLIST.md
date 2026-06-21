# Sprint 8 — Staging Migration Checklist

## Pre-Migration
- [ ] Owner has explicitly authorized staging migration apply
- [ ] DB snapshot taken and confirmed restorable
- [ ] `git pull origin main` run on staging deploy box (confirm SHA matches PR merge commit)
- [ ] `pnpm --filter @psl-one/api exec prisma migrate status` run and output reviewed
- [ ] No active fan sessions during migration window (schedule off-peak)
- [ ] Staging API is stopped or health check shows no active requests

## Migration Apply
- [ ] Run: `pnpm --filter @psl-one/api exec prisma migrate deploy`
- [ ] Confirm output shows: "All migrations have been successfully applied" (or lists newly applied ones)
- [ ] No error output from migrate deploy
- [ ] Check Postgres logs for errors

## Post-Migration Verification
- [ ] Restart staging API service
- [ ] `GET /health` returns 200
- [ ] `GET /football/fixtures` returns fixtures (confirms DB connectivity)
- [ ] Confirm `prediction_challenges` columns: `settled_at`, `creator_points`, `acceptor_points`, `winner_user_id`, `settlement_reason`
  ```sql
  SELECT column_name FROM information_schema.columns WHERE table_name = 'prediction_challenges';
  ```
- [ ] Confirm PredictionChallengeStatus includes SETTLED:
  ```sql
  SELECT unnest(enum_range(NULL::"PredictionChallengeStatus"));
  ```
- [ ] Confirm AuditEvent includes CHALLENGE_SETTLED:
  ```sql
  SELECT unnest(enum_range(NULL::"AuditEvent")) WHERE unnest LIKE '%CHALLENGE%';
  ```
- [ ] Run sprint-8 smoke suite: `node tools/smoke/sprint-8-beta-smoke.mjs --api-url https://api.staging.psl-one.co.za`

## Rollback Trigger
If any post-migration check fails, follow `docs/handover/SPRINT-8-STAGING-ROLLBACK-PLAN.md`.

## Sign-off
- Migration applied by: ___________________________
- Date/time: ___________________________
- All checks passed: [ ] YES / [ ] NO
- Notes: ___________________________
