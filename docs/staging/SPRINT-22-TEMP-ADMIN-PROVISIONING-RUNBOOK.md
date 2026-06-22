# Sprint 22 — Temporary Admin Provisioning Runbook

## Purpose

Create a short-lived `PSL_ADMIN` user in the beta DB, obtain a valid JWT, run authenticated staging smoke tools, then disable the user and delete all secrets. No token is printed or committed.

## Instance

- **EC2:** `i-0a5f16539c9626f90` (af-south-1b)
- **Execution path:** SSM Run Command → `AWS-RunShellScript`
- **Docker network:** `psl-one-beta`
- **API container:** `psl-one-beta-api-1`

## Module Resolution Fix

pnpm monorepo: packages live in the virtual store. `require('@prisma/client')` and `require('bcrypt')` only resolve correctly from `/app/apps/api` (not from `/tmp`). Scripts are copied to `/app/apps/api/` and run with `NODE_PATH=/app/apps/api/node_modules`.

## Provision Script (`provision.cjs`)

1. Generate 64-char random hex password via `crypto.randomBytes(32)` — never printed
2. Hash with `bcrypt.hash(password, 12)` — matches `BCRYPT_ROUNDS = 12` in `auth.service.ts`
3. `p.user.upsert({ where: { email }, create: { ... role: 'PSL_ADMIN', isVerified: true, isActive: true }, update: { ... } })`
4. `POST http://localhost:4000/auth/login` → `{ accessToken }` — 277-char JWT
5. `fs.writeFileSync('/tmp/s22-admin-token', token, { mode: 0o600 })` — never printed
6. stdout: `TEMP_ADMIN_UPSERTED`, `LOGIN_SUCCESS_TOKEN_WRITTEN length=277`

## Token Extraction

```bash
docker cp psl-one-beta-api-1:/tmp/s22-admin-token /tmp/sprint22/secrets/admin-token
chmod 600 /tmp/sprint22/secrets/admin-token
```

## Env File

```bash
{ printf 'ADMIN_TOKEN='; cat /tmp/sprint22/secrets/admin-token; echo; \
  echo 'BASE_URL=http://api:4000'; echo 'DRY_RUN_ONLY=true'; \
  echo 'ALLOW_WRITE_SMOKE=false'; echo 'SPORTMONKS_API_KEY='; \
} > /tmp/sprint22/secrets/.smoke-env
chmod 600 /tmp/sprint22/secrets/.smoke-env
```

Token is written to file via shell redirect. The SSM command log shows shell syntax, not the expanded token value.

## Smoke Execution Pattern

```bash
docker run --rm --network psl-one-beta \
  --env-file /tmp/sprint22/secrets/.smoke-env \
  -v /tmp/sprint22/scripts:/scripts:ro \
  node:22-alpine node /scripts/<tool>.mjs
```

## Cleanup Script (`cleanup.cjs`)

1. `p.user.update({ where: { email }, data: { isActive: false } })`
2. Re-read to verify `isActive === false`
3. stdout: `TEMP_ADMIN_DISABLED_VERIFIED`

## Secrets Deletion

```bash
rm -f /tmp/sprint22/secrets/admin-token /tmp/sprint22/secrets/.smoke-env
```

## Email

`sprint22-admin-smoke@psl-one.internal` — disabled after smoke, password unknown post-run

## SSM Command ID

`979db8e3-0cb6-46b7-8f89-a7c904cbcf6b`

---

## Safety Guarantees

- Token value: PRESENT_REDACTED (never printed to stdout or logs)
- Password: random, never stored, unknown after run
- Temp user: disabled immediately after smoke
- Secrets: deleted from EC2 host after smoke
- PSL NOT activated
- No scheduled ingestion
- No production ingestion
- No real-money functionality
