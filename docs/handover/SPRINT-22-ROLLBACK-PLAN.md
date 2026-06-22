# Sprint 22 — Rollback Plan

## What Can Be Rolled Back

Sprint 22 made no schema changes, no infrastructure changes, and no code changes beyond test additions and documentation. All changes are documentation-only plus 22 experience tests.

## If Temp Admin User Must Be Hard-Deleted

The temp admin user (`sprint22-admin-smoke@psl-one.internal`) is disabled (`isActive=false`) but still exists in the DB. To hard-delete:

```bash
# Via SSM → EC2 → Docker exec
docker exec -e NODE_PATH=/app/apps/api/node_modules -w /app/apps/api \
  psl-one-beta-api-1 node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.delete({ where: { email: 'sprint22-admin-smoke@psl-one.internal' } })
  .then(() => { console.log('DELETED'); return p.\$disconnect(); });
"
```

## If EC2 Must Be Rolled Back

EC2 deployment is unchanged from Sprint 20 (SHA `81d3c39`). No deploy occurred in Sprint 22.

## Code Changes

No API or experience code changes in Sprint 22. Test additions and docs only. Rollback = revert commit.

## Migrations

**Sprint 22 migrations added: 0** — migration count remains 42.

## Safety State

- PSL: INACTIVE (unchanged)
- Wallet: SANDBOX (unchanged)
- Scheduled ingestion: DISABLED (unchanged)
- Data provider: NoOpAdapter default (unchanged)
