# PSL One — Migration Operations

**Purpose:** How database migrations are created, reviewed, and applied  
**Audience:** Backend engineers, DevOps  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Migration State

- **Total migrations:** 38 (as of STORY-39)
- **Location:** `apps/api/prisma/migrations/`
- **Schema:** `apps/api/prisma/schema.prisma`
- **ORM:** Prisma 5.22

---

## Creating a Migration

1. Edit `apps/api/prisma/schema.prisma`
2. Run:
   ```bash
   pnpm --filter @psl-one/api db:migrate
   ```
   When prompted, enter a descriptive migration name (snake_case): `add_beta_cohort_member`
3. A migration file is created: `migrations/<timestamp>_<name>/migration.sql`
4. Commit the migration SQL file alongside schema changes

---

## Migration Naming Convention

Format: `YYYYMMDDHHMMSS_description`

Examples from history:
```
20260609063038_drop_old_notification_prefs
20260613000001_social_prediction_match_centre
20260613000002_direct_challenges_campaign_triggers
20260614000001_beta_launch_readiness
```

---

## Migration Review Rules

Before committing a migration:

- [ ] No column drops that may have data without a data migration plan
- [ ] New required fields have migration-time defaults for existing rows
- [ ] New boolean fields have `DEFAULT false` or `DEFAULT true`
- [ ] Index added for foreign keys on large tables
- [ ] Performance indexes added where needed (filter columns on 2M-row tables)
- [ ] Reversibility considered — can this be rolled back safely?

---

## Applying Migrations

### Development

```bash
pnpm --filter @psl-one/api db:migrate
```

### Production (PLANNED)

```bash
npx prisma migrate deploy
```

Run as a pre-startup task — NOT during app initialization. Never use `prisma db push` in production.

### S3-INFRA-01 Staging (AUTHORED — NOT DEPLOYED)

S3-INFRA-01 defines a one-off ECS task that runs:

```bash
node_modules/.bin/prisma migrate deploy --schema apps/api/prisma/schema.prisma
```

This task runs before API service rollout. It does not seed, reset, push schema, call providers, or activate a season.

---

## Migration History

| Migration | Introduced in | Description |
|----------|--------------|-------------|
| ... early migrations ... | STORY-01 through STORY-25 | Auth, football core, Fantasy, Predictions, Social, Fan Value, Achievements, Rewards, Notifications, Feed, Admin |
| `20260609063038_drop_old_notification_prefs` | STORY-35 | Drop old notification preference columns |
| `20260613000001_social_prediction_match_centre` | STORY-38 | Match Centre, Social Prediction gaming tables |
| `20260613000002_direct_challenges_campaign_triggers` | STORY-38 | Direct challenges, idempotency, campaign triggers |
| `20260614000001_beta_launch_readiness` | STORY-39 | BetaCohort, BetaCohortMember, SeasonActivationApproval |

---

## Emergency: Migration Rollback

Prisma does not natively support automatic rollback. Options:

1. **Write a down migration SQL** manually and apply it
2. **Restore from backup** (production — requires backup infrastructure from Sprint 3)
3. **Create a corrective migration** — new migration that reverts the schema change

For development, `db:reset` is available but destructive.

---

## Performance Indexes

The following performance indexes were added in STORY-35 to support 2M-fan scale:

- `User.email` — already unique, inherently indexed
- `Fixture.gameweekId` — filter by gameweek
- `Prediction.userId` + `Prediction.fixtureId` — fan prediction lookup
- `FanValueLedger.userId` + `FanValueLedger.type` — Fan Value queries
- `ActivityFeedItem.userId` — feed query
- Additional indexes added as new high-traffic tables were introduced

When adding a new table that will be queried by `userId` or `seasonId` at scale, always add a corresponding index.
