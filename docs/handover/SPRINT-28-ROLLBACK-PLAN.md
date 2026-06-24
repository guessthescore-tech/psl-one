# Sprint 28: Rollback Plan

**Date:** 2026-06-23
**Sprint:** 28

PSL remains INACTIVE. Wallet SANDBOX. NON-FINANCIAL. No real-money.

---

## Scope of Rollback

Sprint 28 changes:
1. Two new DB tables: `club_memberships`, `sponsor_memberships`
2. Updated portal services (reject scope instead of `API_SCOPE_PENDING`)
3. PortalScopeModule (new)
4. AppModule updated

No migrations to existing tables. No column additions to User/Team/Sponsor.

---

## Application Rollback (Git Revert)

```bash
# Option 1: Revert the PR merge commit
git revert <merge-commit-sha> --no-commit
git commit -m "revert: sprint-28 user-org scoping rollback"
git push origin main

# Option 2: Redeploy previous image tag
# On staging EC2 — change IMAGE_TAG in .env and restart
sudo systemctl restart docker
docker compose -f compose.beta.yaml pull
docker compose -f compose.beta.yaml up -d
```

---

## Database Rollback

```sql
-- Drop new tables (additive only — no existing table changes)
DROP TABLE IF EXISTS "sponsor_memberships";
DROP TABLE IF EXISTS "club_memberships";
```

**OR via Prisma:**
```bash
DATABASE_URL=<url> npx prisma migrate resolve --rolled-back 20260623000001_club_sponsor_memberships
```

---

## Portal Behaviour After Rollback

After rolling back Sprint 28, portal services return to the Sprint 27 behaviour:
- `{ scopeStatus: 'API_SCOPE_PENDING' }` when no clubId/sponsorId provided
- Data returned when `?clubId=<uuid>` param provided (unscoped — GAP-27-01/02 re-opens)

This is acceptable for emergency rollback. Sprint 28 should be re-attempted with fixes.

---

## Non-Impacted Systems

- Authentication (JWT, RBAC) — unchanged
- Fantasy, predictions, challenges — unchanged
- PSL season status — unchanged (PSL remains inactive)
- Wallet — unchanged (still sandbox, non-financial)
- Fixture publication — unchanged
- Kafka events — unchanged

---

## Rollback Authorization Required

Owner must authorize rollback. Do not roll back without explicit instruction. The staging smoke tools should be used to diagnose issues before rollback.
