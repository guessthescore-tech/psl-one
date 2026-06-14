# PSL One — Database Guide

**Purpose:** Prisma schema conventions, migration workflow, and query patterns  
**Audience:** Backend engineers  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Setup

- **ORM:** Prisma 5.22
- **Database:** PostgreSQL 16
- **Dev database:** `psl_identity_dev` on `localhost:5432`
- **Schema:** `apps/api/prisma/schema.prisma`
- **Migrations:** `apps/api/prisma/migrations/` (38 migrations as of STORY-39)

---

## Common Commands

| Command | Purpose |
|---------|---------|
| `pnpm --filter @psl-one/api db:migrate` | Apply pending migrations |
| `pnpm --filter @psl-one/api db:seed` | Run seed file |
| `pnpm --filter @psl-one/api db:studio` | Open Prisma Studio (GUI browser) |
| `pnpm --filter @psl-one/api db:reset` | **DESTRUCTIVE** — drop, recreate, migrate, seed |
| `pnpm --filter @psl-one/api db:generate` | Regenerate Prisma Client after schema change |

---

## Migration Workflow

### Creating a New Migration

1. Edit `apps/api/prisma/schema.prisma`
2. Run:
   ```bash
   pnpm --filter @psl-one/api db:migrate
   ```
   Prisma will prompt for a migration name. Use descriptive snake_case: `add_beta_cohort_member`.
3. The migration file is created in `apps/api/prisma/migrations/<timestamp>_<name>/migration.sql`
4. Regenerate the Prisma client if not done automatically:
   ```bash
   pnpm --filter @psl-one/api db:generate
   ```

### Migration Rules

- **Never edit existing migration files.** They are immutable history.
- **Additive changes only** — never drop a column that may have existing data without a data migration plan.
- **Default values required** — new required fields must have a default in the migration SQL for existing rows.
- **Boolean fields** — always provide `DEFAULT false` or `DEFAULT true`.
- **Migration naming:** `YYYYMMDDHHMMSS_descriptive_name`

### Production Migrations

Use `prisma migrate deploy` (not `db push`) for production:

```bash
npx prisma migrate deploy
```

Run as a pre-startup step, not during app initialization.

---

## Schema Conventions

```prisma
model DomainEntity {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  userId    String
  user      User     @relation(fields: [userId], references: [id])

  // Fields with defaults
  isActive  Boolean  @default(false)
  status    String   @default("PENDING")

  @@map("domain_entities")  // snake_case table names
}
```

- `id` is always a UUID string
- All models have `createdAt` and `updatedAt`
- Table names use `@@map()` with snake_case
- Foreign keys are `String` UUID references
- Enums are defined in Prisma schema and use UPPER_CASE values

---

## Key Query Patterns

### Active Season Resolution

```typescript
const season = await this.prisma.season.findFirst({
  where: { isActive: true },
});
if (!season) throw new NotFoundException('No active season');
```

### Player by External ID (Non-Unique)

`Player.externalId` is non-unique across seasons. Always scope by season:

```typescript
const player = await this.prisma.player.findFirst({
  where: { externalId, seasonTeamPlayers: { some: { seasonId } } },
});
```

### Upsert Pattern

```typescript
await this.prisma.fantasyRulesConfig.upsert({
  where: { seasonId },
  create: { seasonId, ...defaults },
  update: { ...overrides },
});
```

### Transactions

Use `$transaction` for multi-table atomic writes:

```typescript
await this.prisma.$transaction([
  this.prisma.season.update({ where: { id: fromId }, data: { isActive: false } }),
  this.prisma.season.update({ where: { id: toId }, data: { isActive: true } }),
  this.prisma.seasonSwitchAudit.create({ data: { fromSeasonId: fromId, toSeasonId: toId, userId } }),
]);
```

---

## Immutable Ledger Pattern

`PredictionPointsLedger` and `SocialPredictionPointsEntry` are append-only:

```typescript
// ✓ Always create new entries
await this.prisma.predictionPointsLedger.create({ data: { ... } });

// ❌ Never update ledger entries
// await this.prisma.predictionPointsLedger.update(...)  // PROHIBITED
```

---

## Seed File

`apps/api/prisma/seed.ts` seeds:

- 2 competitions (FIFA World Cup 2026, PSL Premiership 2026/27)
- 2 seasons (WC active, PSL upcoming)
- 16 PSL clubs + squads
- World Cup teams
- Fixtures and gameweeks
- Fantasy rules configs
- Prediction rules configs
- Integration provider configs (9 entries)
- Achievement definitions (17)
- Reward readiness definitions (6)

Re-run seed at any time — it uses `upsert` where safe or `deleteMany + create` where necessary.

---

## Prisma Studio

Browser-based database GUI:

```bash
pnpm --filter @psl-one/api db:studio
```

Opens at `http://localhost:5555`. Useful for inspecting data during development.
