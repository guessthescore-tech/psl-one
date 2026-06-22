# Sprint 22 — Temp Admin Cleanup Evidence

## SSM Command

- **Command ID:** `979db8e3-0cb6-46b7-8f89-a7c904cbcf6b`
- **Status:** Success

## Cleanup Output

```
=== CLEANUP ===
TEMP_ADMIN_DISABLED_VERIFIED
SECRETS_DELETED
=== ALL DONE ===
```

## Verification Steps

| Step | Evidence |
|------|----------|
| `p.user.update({ isActive: false })` | Executed |
| Re-read `isActive` from DB | `TEMP_ADMIN_DISABLED_VERIFIED` — `isActive=false` confirmed |
| Delete `/tmp/sprint22/secrets/admin-token` | `SECRETS_DELETED` |
| Delete `/tmp/sprint22/secrets/.smoke-env` | `SECRETS_DELETED` |

## Post-Run State

- `sprint22-admin-smoke@psl-one.internal` exists in DB but `isActive=false`
- User cannot log in (login guard checks `isActive`)
- Password hash remains in DB but is a random bcrypt hash with unknown cleartext
- No token file on EC2 host
- No env file on EC2 host

## Optional Hard Delete

If a hard delete is preferred:

```bash
# From EC2 via SSM, inside API container
docker exec -e NODE_PATH=/app/apps/api/node_modules -w /app/apps/api \
  psl-one-beta-api-1 node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.delete({ where: { email: 'sprint22-admin-smoke@psl-one.internal' } })
  .then(() => { console.log('DELETED'); return p.\$disconnect(); });
"
```

The soft-disable approach is preferred — it preserves audit trail while preventing login.

---

## Safety Confirmation

- Admin token: never printed, deleted from host
- Temp user: disabled, cannot authenticate
- PSL NOT activated during or after cleanup
