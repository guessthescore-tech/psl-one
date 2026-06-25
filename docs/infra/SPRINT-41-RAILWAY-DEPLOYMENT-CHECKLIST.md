# Sprint 41 — Railway Deployment Checklist

Status: DRAFT — do not deploy until owner explicitly authorises Railway deployment.

---

## Pre-Deployment Requirements

- [ ] Owner authorises Railway deployment in writing
- [ ] POPIA cross-border transfer documentation complete (if serving ZA users)
- [ ] Railway Pro plan confirmed (required for no cold starts)
- [ ] ZA region available, or latency benchmark confirms acceptable UX

---

## Service Configuration

Railway project: `psl-one-beta`

### Services required

| Service | Source | Start command |
|---------|--------|---------------|
| `postgres` | Railway managed Postgres | (managed) |
| `api` | `apps/api/` | `node dist/main.js` |
| `migrator` | `apps/api/` | `prisma migrate deploy` (pre-deploy only) |
| `web` | `apps/experience/` | `node apps/experience/server.js` |

---

## railway.toml (when authorised)

```toml
[build]
builder = "dockerfile"

[[services]]
name = "api"
dockerfile = "apps/api/Dockerfile"
healthcheckPath = "/health"
healthcheckTimeout = 30

[[services.envs]]
name = "DATABASE_URL"
value = "${{Postgres.DATABASE_URL}}"

[[services.envs]]
name = "JWT_SECRET"
value = "${{JWT_SECRET}}"

[[services.envs]]
name = "NODE_ENV"
value = "production"

[[services]]
name = "web"
dockerfile = "apps/experience/Dockerfile"
healthcheckPath = "/api/health"

[[services.envs]]
name = "NEXT_PUBLIC_API_BASE_URL"
value = "https://${{api.RAILWAY_PUBLIC_DOMAIN}}"

[[services.envs]]
name = "NEXT_PUBLIC_DATA_MODE"
value = "WC_BETA"

[[services.envs]]
name = "NEXT_PUBLIC_ENVIRONMENT_LABEL"
value = "railway-preview"
```

---

## Environment Variables Required

| Variable | Notes |
|----------|-------|
| `DATABASE_URL` | Injected from Railway Postgres service |
| `JWT_SECRET` | 64+ char random string, store in Railway secrets |
| `REDIS_URL` | If using Railway Redis addon |
| `APP_BASE_URL` | Public URL of web service |
| `EMAIL_PROVIDER` | `null` for beta (NullEmailProvider) |
| `NODE_ENV` | `production` |
| `DATA_PROVIDER` | `noop` (no live ingestion on Railway) |
| `ALLOW_WORLD_CUP_WRITE` | `false` |
| `NEXT_PUBLIC_DATA_MODE` | `WC_BETA` |
| `NEXT_PUBLIC_API_BASE_URL` | Railway API public domain |

---

## Migration Execution

Prisma migrations must run before the API starts. On Railway, use a pre-deploy command or a separate `migrator` service:

```bash
# In Railway service deploy command (before api start):
cd apps/api && pnpm prisma migrate deploy && node dist/main.js
```

Or use Railway's `pre-deploy` hook in the dashboard.

---

## Smoke Test (Post-Deploy)

After deployment, run:

```bash
SMOKE_ENVIRONMENT=beta \
  BETA_API_BASE_URL=https://<railway-api-domain>/api \
  BETA_WEB_BASE_URL=https://<railway-web-domain> \
  node scripts/smoke/staging-smoke.mjs
```

All 17 checks must PASS before Railway is considered stable.

---

## Rollback

Railway maintains deployment history. To rollback:
1. Railway dashboard → Deployments tab
2. Select previous successful deployment
3. Click "Redeploy"

---

## When NOT to use Railway

- Primary beta serving South African users until ZA region available
- Production (no ZA region, POPIA)
- Any deployment without passing the full 17/17 smoke suite
