# Sprint 10 — Provider Staging Runbook

## Overview

This runbook guides an operator through validating provider coverage and running staging smoke tests safely.

## Prerequisites

- `apps/api/.env` must contain `SPORTMONKS_API_KEY` and `SPORTSDATAIO_SOCCER_API_KEY` (never commit)
- Node.js 20.6+ for `--env-file` flag support
- Local PostgreSQL running for live smoke tests

## Step 1: Pipeline Safety Check

Always run this first:

```bash
node tools/discovery/provider-readonly-pipeline-check.mjs
```

Expected: PASS 11/11. If any fail, do not proceed.

## Step 2: Provider Health Check

```bash
node --env-file=apps/api/.env tools/discovery/provider-health-check.mjs
```

Expected: at least one provider OK.

If Sportmonks returns HTTP 401:
1. Go to https://app.sportmonks.com/api-tokens
2. Verify key is active on correct plan (v3 football API required)
3. Update `SPORTMONKS_API_KEY` in `apps/api/.env`
4. Re-run health check

## Step 3: Read-Only Discovery

```bash
node --env-file=apps/api/.env tools/discovery/staging-provider-discovery.mjs
```

This fetches a small sample from each provider (read-only). No writes to DB.

## Step 4: Coverage Check

```bash
PROVIDER=sportmonks node --env-file=apps/api/.env tools/discovery/provider-coverage-check.mjs
PROVIDER=sportsdataio node --env-file=apps/api/.env tools/discovery/provider-coverage-check.mjs
```

## Step 5: Field Mapping Check

```bash
PROVIDER=sportmonks node --env-file=apps/api/.env tools/discovery/provider-field-mapping-check.mjs
PROVIDER=sportsdataio node --env-file=apps/api/.env tools/discovery/provider-field-mapping-check.mjs
```

## Step 6: Live Smoke (requires running API)

```bash
# Terminal 1 — start API
pnpm --filter @psl-one/api run start:dev

# Terminal 2 — run smoke
BASE_URL=http://localhost:4000 node tools/smoke/sprint-9-staging-smoke.mjs
BASE_URL=http://localhost:4000 node tools/smoke/sprint-9-challenge-settlement-smoke.mjs
```

Expected: staging smoke 6/6 PASS (2 SKIP without admin token), settlement 8/8 PASS.

## Step 7: EC2 Staging Migration (owner authorization required)

Do NOT run this without explicit owner authorization.

```bash
# First verify target DB is EC2 (not localhost, not production)
pnpm --filter @psl-one/api exec prisma migrate status

# Only after explicit owner authorization:
pnpm --filter @psl-one/api exec prisma migrate deploy
```

## Hard Rules

- NEVER print key values
- NEVER run `prisma migrate deploy` without explicit authorization
- NEVER activate PSL season
- NEVER enable scheduled provider ingestion
- NEVER use `NEXT_PUBLIC_*` provider keys
- NEVER write provider data as authoritative without owner decision

## Known Issue: Onboarding Path

The Sprint 9 smoke tool originally checked `/onboarding/status` (404). Fixed in Sprint 10 to `/account/onboarding` (401 — correct). Always use the Sprint 10 branch version.
