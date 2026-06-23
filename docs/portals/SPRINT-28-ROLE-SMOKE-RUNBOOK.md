# Sprint 28: Role Smoke Runbook

**Date:** 2026-06-23
**Sprint:** 28

PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | NON-FINANCIAL

---

## Prerequisites

- Staging EC2 running (see Sprint 20 deploy runbook)
- Admin token provisioned (see Sprint 22/23 runbook)
- Club membership assigned in DB for CLUB_ADMIN test user
- Sponsor membership assigned in DB for SPONSOR test user

---

## Club Scope Smoke

```bash
BASE_URL=http://16.28.84.11:3000 \
PSL_ADMIN_TOKEN=<psl-admin-jwt> \
CLUB_ADMIN_TOKEN=<club-admin-jwt> \
CLUB_ID_ALLOWED=<team-uuid-from-db> \
CLUB_ID_FORBIDDEN=<different-team-uuid> \
node tools/staging/sprint-28-club-scope-smoke.mjs
```

Expected:
- Anonymous → PASS (401)
- PSL_ADMIN no teamId → PASS (400/403)
- PSL_ADMIN with teamId → PASS (200)
- CLUB_ADMIN allowed club → PASS (200)
- CLUB_ADMIN forbidden club → PASS_FORBIDDEN_AS_EXPECTED (403)

---

## Sponsor Scope Smoke

```bash
BASE_URL=http://16.28.84.11:3000 \
PSL_ADMIN_TOKEN=<psl-admin-jwt> \
SPONSOR_TOKEN=<sponsor-jwt> \
SPONSOR_ID_ALLOWED=<sponsor-uuid-from-db> \
SPONSOR_ID_FORBIDDEN=<different-sponsor-uuid> \
node tools/staging/sprint-28-sponsor-scope-smoke.mjs
```

Expected:
- Billing endpoint → PASS_INVOICE_ONLY
- Rewards → PASS_NON_FINANCIAL

---

## Cross-Tenant Role Smoke

```bash
BASE_URL=http://16.28.84.11:3000 \
FAN_TOKEN=<fan-jwt> \
CLUB_ADMIN_TOKEN=<club-admin-jwt> \
SPONSOR_TOKEN=<sponsor-jwt> \
node tools/staging/sprint-28-role-cross-tenant-smoke.mjs
```

Expected:
- FAN on any portal → PASS_FAN_FORBIDDEN (403)
- CLUB_ADMIN on sponsor portal → PASS_CLUB_ADMIN_NOT_SPONSOR (403)
- SPONSOR on club portal → PASS_SPONSOR_NOT_CLUB_ADMIN (403)
- Cross-club escalation attempt → PASS_CROSS_CLUB_DENIED (403)

---

## Assigning Test Memberships

```sql
-- Club membership for CLUB_ADMIN test user
INSERT INTO club_memberships (id, user_id, team_id, role, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), '<club-admin-user-id>', '<team-id>', 'CLUB_ADMIN', true, now(), now());

-- Sponsor membership for SPONSOR test user
INSERT INTO sponsor_memberships (id, user_id, sponsor_id, role, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), '<sponsor-user-id>', '<sponsor-id>', 'SPONSOR', true, now(), now());
```

**Do NOT activate PSL season. Do NOT trigger wallet production. Non-financial only.**

---

## Migration (Run Once on Staging)

```bash
# On staging EC2 via SSM or docker exec:
DATABASE_URL=<staging-db-url> npx prisma migrate deploy
```

**Status: PENDING_OWNER_AUTHORIZATION**
