# Sprint 19 — Migration Status

## Summary

**Sprint 18 adds zero Prisma migrations.**
**Sprint 19 adds zero Prisma migrations.**

The staging database at migration 42 (applied during Sprint 7 deployment) is fully current for all Sprint 18 and Sprint 19 features.

**No migration apply is required before deploying Sprint 18/19 images.**

---

## Migration History

| Sprint | Migration(s) Added | Count After |
|--------|-------------------|-------------|
| Sprint 5 | 40_account_module | 40 |
| Sprint 6 | 41_data_provider_module | 41 |
| Sprint 7 | 42_challenge_settlement | 42 |
| Sprint 8 | 0 | 42 |
| Sprint 9–18 | 0 | 42 |
| Sprint 19 | 0 | 42 |

---

## Why No Migrations Were Needed

### Sprint 18

- `FixturePublicationService` uses the existing `Fixture` model with `isPublished`, `providerSource`, `providerFixtureId`, `externalId`, `sourceUrl`, `importedAt`, `lastSyncedAt` — all present since Sprint 27 (initial import feature)
- `PslActivationPreflightService` uses existing `Season`, `Fixture`, `WalletProviderDetail`, `SeasonActivationApproval`, `AdminAuditLog` models — no new fields

### Sprint 19

- All Sprint 19 additions are tooling (scripts, docs) — no schema changes
- No new API models were introduced

---

## Migration Verification

To verify migration status on any target database:

```bash
DATABASE_URL=<target-url> node tools/staging/sprint-19-migration-status-check.mjs
```

Expected output: `STAGING_MIGRATION_UP_TO_DATE`

To check via Prisma directly (non-destructive):

```bash
DATABASE_URL=<target-url> pnpm --filter @psl-one/api exec prisma migrate status
```

Expected: `Database schema is up to date!`

---

## If Pending Migrations Are Found

If the staging database shows pending migrations (should not happen for Sprint 18/19), they must be applied with owner authorization:

```bash
DATABASE_URL=<staging-url> pnpm --filter @psl-one/api exec prisma migrate deploy
```

**Rules:**
- Target must be staging, never production
- Owner must authorize before applying
- Do not apply during active traffic (low-traffic window preferred)

---

## Production Database

This document covers staging/beta only. Production database migration management is separate and requires a full production deployment plan.
