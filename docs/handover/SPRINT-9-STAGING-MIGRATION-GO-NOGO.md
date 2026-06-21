# Sprint 9 — Staging Migration Go/No-Go

## Current Decision: NO-GO

Staging migration apply is not authorized. The apply log (`SPRINT-9-STAGING-MIGRATION-APPLY-LOG.md`) will be updated once authorized.

---

## Go Criteria

All of the following must be true before apply:

| Criterion | Status | Notes |
|-----------|--------|-------|
| Explicit owner authorization received in session | ❌ NOT RECEIVED | Required |
| Staging DB backup confirmed | ❌ UNKNOWN | Owner must confirm |
| Staging API pre-migration health check passes | ❌ NOT RUN | Requires staging server |
| `prisma migrate status` shows expected pending migrations | ❌ NOT RUN | Run before apply |
| No other migration in progress | ❌ UNKNOWN | Confirm before apply |

## No-Go Criteria

Do NOT apply if any of these are true:

| Condition | Status |
|-----------|--------|
| No explicit owner authorization | ACTIVE — blocking |
| No DB backup | UNKNOWN — must be resolved |
| Staging server is unhealthy | UNKNOWN |
| Migration would be applied to production (not staging) | NEVER permitted without separate authorization |
| PSL would be activated as part of migration | PSL activation is a separate gate, not part of this migration |

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
