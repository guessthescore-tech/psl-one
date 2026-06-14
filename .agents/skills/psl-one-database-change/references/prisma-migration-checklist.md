# PSL One — Prisma Migration Checklist

## Before Writing a Migration

### 1. Identify the change type

| Change type | Safe? | Notes |
|-------------|-------|-------|
| Add table | Safe | Always additive |
| Add column (nullable) | Safe | Always additive |
| Add column (NOT NULL with DEFAULT) | Safe | DEFAULT provides backfill |
| Add column (NOT NULL, no DEFAULT) | Unsafe | Will fail on existing rows |
| Add index | Safe | Use `IF NOT EXISTS` |
| Add unique constraint | Conditional | Safe only if all existing values are unique |
| Drop column | Unsafe | Data loss; requires deprecation period |
| Drop table | Unsafe | Data loss |
| Rename column | Unsafe | Breaks existing queries; use add-then-migrate pattern |
| Change column type | Conditional | Only if all existing values are compatible |

### 2. Check for existing data

Before adding a NOT NULL constraint or changing a column type:
```sql
-- Check for nulls that would violate the constraint
SELECT COUNT(*) FROM "my_table" WHERE "my_column" IS NULL;
```

### 3. Name the migration

Format: `YYYYMMDD000001_descriptive_name`

Examples:
- `20260615000001_security_performance_hardening`
- `20260616000001_add_player_contract_model`
- `20260617000001_add_notification_delivery_status`

The `000001` suffix disambiguates same-day migrations.

---

## Writing the Migration SQL

### New table

```sql
CREATE TABLE IF NOT EXISTS "my_model" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "season_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "my_model_pkey" PRIMARY KEY ("id")
);
```

### Add nullable column

```sql
ALTER TABLE "my_model" ADD COLUMN IF NOT EXISTS "description" TEXT;
```

### Add NOT NULL column with default

```sql
ALTER TABLE "my_model" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'PENDING';
```

### Add index

```sql
CREATE INDEX IF NOT EXISTS "my_model_season_id_idx" ON "my_model"("season_id");

-- Composite index for query patterns
CREATE INDEX IF NOT EXISTS "my_model_season_id_user_id_idx" ON "my_model"("season_id", "user_id");
```

### Add unique constraint

```sql
-- Only after verifying existing data has no duplicates
ALTER TABLE "my_model" ADD CONSTRAINT "my_model_external_id_key" UNIQUE ("external_id");
```

### Add foreign key

```sql
ALTER TABLE "my_model" ADD CONSTRAINT "my_model_season_id_fkey" 
  FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

---

## Schema.prisma Conventions

### Model naming
- PascalCase model names: `FantasyTeam`, `PredictionPointsLedger`
- snake_case column names via `@@map`: `@@map("fantasy_team")`
- Or via `@map`: `@map("created_at")`

### Common field patterns

```prisma
model MyModel {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  seasonId  Int      @map("season_id")
  season    Season   @relation(fields: [seasonId], references: [id])
  
  @@map("my_models")
}
```

### Enum naming

```prisma
enum MyStatus {
  PENDING
  ACTIVE
  COMPLETED
  VOID
}
```

---

## After Writing the Migration

### Local verification

```bash
# Apply the migration locally
pnpm --filter @psl-one/api prisma migrate dev

# Verify schema is valid
pnpm --filter @psl-one/api prisma validate

# Verify migration status
pnpm --filter @psl-one/api prisma migrate status

# Run tests to confirm nothing broken
pnpm --filter @psl-one/api test
```

### Migration count

Current baseline: 39 migrations as of S3-INFRA-00 (2026-06-14).  
Every story that changes the schema adds exactly one migration.

---

## Migration Deployment (Non-Dev)

Non-dev environments always use:
```bash
pnpm --filter @psl-one/api prisma migrate deploy
```

Never use `migrate dev` or `migrate reset` in staging or production.

---

## What Not to Do

- Do not edit committed migration files — create a new one
- Do not use `migrate reset` if data exists
- Do not use `prisma db push` to bypass migrations in a shared environment
- Do not add `DROP COLUMN` without a product decision and data retention review
- Do not commit migration files without testing them locally first
