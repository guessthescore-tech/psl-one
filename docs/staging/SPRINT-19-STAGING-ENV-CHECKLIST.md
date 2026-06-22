# Sprint 19 — Staging Environment Checklist

## Purpose

Step-by-step checklist for verifying the staging/beta environment before and after Sprint 18/19 deployment. All items must pass before admin smoke testing begins.

**Do not activate PSL. Do not enable scheduled ingestion. Wallet stays SANDBOX.**

---

## Pre-Deployment Checklist

### Infrastructure

- [ ] EC2 instance `i-0a5f16539c9626f90` (16.28.84.11) is running
- [ ] SSM Session Manager is accessible
- [ ] Port 3000 is reachable from operator IP
- [ ] Port 80 (Caddy proxy) is reachable
- [ ] PostgreSQL is running on EC2

### Environment Variables (verify via SSM, never print values)

- [ ] `/psl-one/beta/app/DATABASE_URL` — set, points to local PostgreSQL
- [ ] `/psl-one/beta/app/JWT_SECRET` — set
- [ ] `/psl-one/beta/app/PARSE_API_KEY` — set (server-side only; never NEXT_PUBLIC)
- [ ] `/psl-one/beta/app/FOOTBALL_DATA_API_KEY` — set or acceptable if missing
- [ ] `/psl-one/beta/app/API_FOOTBALL_KEY` — set or acceptable if missing
- [ ] `/psl-one/beta/app/NODE_ENV` — `production`
- [ ] No `NEXT_PUBLIC_PARSE_API_KEY` in any env (forbidden)
- [ ] No `NEXT_PUBLIC_*` provider keys anywhere (forbidden)

### Sprint 18/19 Images

- [ ] `psl-one-api:sprint-18` or later present in ECR
- [ ] `psl-one-web:sprint-18` or later present in ECR
- [ ] Owner has authorized deployment

---

## Post-Deployment Checklist

### API Health

```bash
curl -s http://16.28.84.11:3000/health | jq .
```

Expected: `{ "status": "ok" }`

### Sprint 18 Routes Reachable

```bash
ADMIN_JWT=<token>
curl -s -H "Authorization: Bearer $ADMIN_JWT" http://16.28.84.11:3000/admin/fixtures/imported | jq .
curl -s -H "Authorization: Bearer $ADMIN_JWT" http://16.28.84.11:3000/admin/psl/preflight | jq .
```

Expected: HTTP 200 with valid JSON shape

### RBAC Check

```bash
# Without token — should 401
curl -s -o /dev/null -w "%{http_code}" http://16.28.84.11:3000/admin/fixtures/imported
# Expected: 401
```

### Migration Status

```bash
DATABASE_URL=$(aws ssm get-parameter --name /psl-one/beta/app/DATABASE_URL --with-decryption --query 'Parameter.Value' --output text)
DATABASE_URL=$DATABASE_URL node tools/staging/sprint-19-migration-status-check.mjs
```

Expected: `STAGING_MIGRATION_UP_TO_DATE` (no migrations needed for Sprint 18/19)

### Smoke Suite

```bash
BASE_URL=http://16.28.84.11:3000 \
ADMIN_TOKEN=<jwt> \
DRY_RUN_ONLY=true \
node tools/staging/sprint-19-admin-smoke.mjs
```

Expected: All PASS or only WARN for empty source

---

## State Verification

After smoke, confirm unchanged state:

- [ ] PSL season is still INACTIVE: `GET /admin/season-switching/readiness`
- [ ] Wallet providers are SANDBOX-only: `GET /admin/psl/preflight` → `wallet_sandbox_only: PASS`
- [ ] No fixtures published unless explicitly done: `GET /admin/fixtures/imported?isPublished=true` → total=0

---

## Known Expected States

| Check | Expected |
|-------|----------|
| PSL season active | false |
| WC2026 season active | true |
| Fixtures imported from Parse PSL | 0 (source empty until ~July/August 2026) |
| Pre-flight overall status | NO_GO (no fixtures) |
| Wallet status | SANDBOX |
