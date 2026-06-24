# Sprint 28: Migration Rollback Plan

**Date:** 2026-06-23
**Sprint:** 28

PSL remains INACTIVE. Wallet SANDBOX. NON-FINANCIAL. No real-money.

---

## Migration Details

Migration `20260623000001_club_sponsor_memberships` creates two new tables with no changes to existing tables. Rollback is straightforward.

---

## Rollback Steps

### 1. Revert Application First

Deploy the previous Docker image before rolling back the DB:

```bash
# On EC2 via SSM session manager:
cd /home/ec2-user/psl-one
git log --oneline -3
# Note the previous commit SHA
docker compose -f compose.beta.yaml down
# Update IMAGE_TAG in .env to previous tag
docker compose -f compose.beta.yaml up -d
```

### 2. Drop New Tables

```sql
-- Order matters: drop tables with FKs before referenced tables
DROP TABLE IF EXISTS "sponsor_memberships";
DROP TABLE IF EXISTS "club_memberships";
```

### 3. Mark Migration as Rolled Back (optional)

```bash
DATABASE_URL=<staging-db-url> \
npx prisma migrate resolve --rolled-back 20260623000001_club_sponsor_memberships
```

---

## What Is Safe to Drop

The `club_memberships` and `sponsor_memberships` tables are new in Sprint 28. Dropping them:
- Does NOT affect users, teams, or sponsors
- Does NOT affect authentication or JWT
- Does NOT affect fantasy, predictions, or challenges
- Does NOT affect PSL season status (PSL remains inactive regardless)
- Does NOT affect wallet (stays sandbox, non-financial)
- Reverts portal scoping to `API_SCOPE_PENDING` placeholder mode

---

## After Rollback

Portal services will return to Sprint 27 behaviour:
- `GET /club-portal/overview?clubId=<uuid>` — returns data (unscoped, GAP-27-01 re-opens)
- `GET /club-portal/overview` (no clubId) — returns `{ scopeStatus: 'API_SCOPE_PENDING' }`

This is the known pre-Sprint-28 state. It is NOT a security regression for internal testing (CLUB_ADMIN users are trust-provisioned in beta).

---

## Authorization Required

Migration rollback requires owner authorization. Do not run without explicit instruction.
