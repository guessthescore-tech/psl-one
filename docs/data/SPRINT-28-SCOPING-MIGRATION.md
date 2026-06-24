# Sprint 28: Scoping Migration Details

**Date:** 2026-06-23
**Sprint:** 28
**Migration:** `20260623000001_club_sponsor_memberships`

PSL remains INACTIVE. Wallet SANDBOX. NON-FINANCIAL. No real-money.

---

## Migration File

**Path:** `apps/api/prisma/migrations/20260623000001_club_sponsor_memberships/migration.sql`

---

## What It Creates

### Table: `club_memberships`

```sql
CREATE TABLE "club_memberships" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLUB_ADMIN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "club_memberships_pkey" PRIMARY KEY ("id")
);
```

Foreign keys:
- `user_id` → `users.id` (CASCADE DELETE)
- `team_id` → `teams.id` (CASCADE DELETE)

Indexes:
- `club_memberships_team_id_idx`
- `club_memberships_user_id_idx`
- `UNIQUE(user_id, team_id)`

### Table: `sponsor_memberships`

```sql
CREATE TABLE "sponsor_memberships" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "sponsor_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'SPONSOR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sponsor_memberships_pkey" PRIMARY KEY ("id")
);
```

Foreign keys:
- `user_id` → `users.id` (CASCADE DELETE)
- `sponsor_id` → `sponsors.id` (CASCADE DELETE)

---

## Impact

- Additive only — no changes to existing tables
- No data migration needed
- Rollback: `DROP TABLE sponsor_memberships; DROP TABLE club_memberships;`

---

## Deploy Status

**PENDING_OWNER_AUTHORIZATION** — migration not yet deployed to staging EC2.

```bash
# On staging (after owner authorization):
DATABASE_URL=<staging-db-url> \
npx prisma migrate deploy
```

The migration is idempotent — safe to run multiple times.
