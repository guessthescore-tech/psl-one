# Sprint 7 — Staging Migration Runbook

**Migration:** 42 (`20260621000003_challenge_settlement`)  
**Type:** Additive — safe to apply with zero downtime  
**PSL Season:** DO NOT ACTIVATE (remains INACTIVE)

---

## Pre-Migration Checklist

- [ ] Take a database snapshot/backup before running migrations
- [ ] Verify staging database is accessible
- [ ] Confirm current migration count is 41 (`20260621000002_prediction_challenge_token`)
- [ ] Ensure `DATABASE_URL` points to staging (not production)
- [ ] Confirm PSL season approval status: should be `DRAFT` or `APPROVED` only (not switched live)

---

## Current Migration State (Before Sprint 7)

Total migrations: 41

Most recent: `20260621000002_prediction_challenge_token`

---

## Migration 42: challenge_settlement

**File:** `apps/api/prisma/migrations/20260621000003_challenge_settlement/migration.sql`

**What it does:**
1. Adds `SETTLED` to `PredictionChallengeStatus` enum
2. Adds `CHALLENGE_SETTLED` to `AuditEvent` enum
3. Adds nullable columns to `prediction_challenges` table:
   - `settled_at TIMESTAMP(3)`
   - `creator_points INTEGER`
   - `acceptor_points INTEGER`
   - `winner_user_id TEXT`
   - `settlement_reason TEXT`
4. Adds FK constraint: `winner_user_id -> users(id) ON DELETE SET NULL`

All changes are additive. No data loss risk.

---

## Apply Commands

```bash
# 1. Connect to staging environment
ssh staging-server

# 2. Pull latest main
cd /app
git pull origin main

# 3. Apply migration
pnpm --filter @psl-one/api exec prisma migrate deploy

# 4. Verify migration applied
pnpm --filter @psl-one/api exec prisma migrate status
```

---

## Post-Migration Smoke Tests

```bash
# Health check
curl https://staging.pslone.co.za/api/health

# Verify DB connectivity
curl https://staging.pslone.co.za/api/status

# Check challenge result endpoint exists (should return 404 for bad token, not 500)
curl https://staging.pslone.co.za/api/predictions/challenges/nonexistent/result
# Expected: 404 {"message": "Challenge not found"}
```

---

## What NOT To Do

- DO NOT run any season switching functions (PSL must remain INACTIVE)
- DO NOT change PSL competition `approvalStatus` to anything beyond `APPROVED`
- DO NOT run any wallet seeding scripts
- DO NOT expose `SPORTMONKS_API_KEY` in frontend environment variables

---

## Rollback

See SPRINT-7-STAGING-MIGRATION-ROLLBACK.md
