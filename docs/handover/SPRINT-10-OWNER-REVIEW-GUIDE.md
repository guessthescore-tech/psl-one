# Sprint 10 — Owner Review Guide

## What to Review

### 1. Provider Pipeline Safety (no keys needed)

```bash
node tools/discovery/provider-readonly-pipeline-check.mjs
```

Expected: PASS 11/11. Confirms no scheduled ingestion, no betting endpoints, no PSL activation.

### 2. Sportmonks Key Fix

The replacement key (length 60) returns HTTP 401 on all endpoints.

**Action:**
1. Go to https://app.sportmonks.com/api-tokens
2. Verify key is active and plan includes v3 football API
3. Update `SPORTMONKS_API_KEY` in `apps/api/.env` (never commit)
4. Run: `node --env-file=apps/api/.env tools/discovery/provider-health-check.mjs`
5. If OK: `PROVIDER=sportmonks node --env-file=apps/api/.env tools/discovery/provider-coverage-check.mjs`

### 3. SportsDataIO Finding — PSL Not in Competition List

```bash
node --env-file=apps/api/.env tools/discovery/staging-provider-discovery.mjs
```

This confirmed:
- **WC2026 IS in SportsDataIO** (CompetitionId=21) ✅
- **PSL is NOT in SportsDataIO competition list** ❌

**Owner decision needed:** If Sportmonks also doesn't have PSL coverage, a different data approach for PSL fixtures may be required.

### 4. Commercial Terms

Review Sportmonks pricing before enabling any production ingestion:
- https://sportmonks.com/pricing

Confirm:
- [ ] PSL Premier League fixture data is licensed under chosen plan
- [ ] Rate limits are sufficient for 2M fans
- [ ] Data rights allow downstream display

### 5. Live Smoke Verification

```bash
pnpm --filter @psl-one/api run start:dev
# In another terminal:
BASE_URL=http://localhost:4000 node tools/smoke/sprint-9-staging-smoke.mjs
```

Expected: 6/6 PASS (2 SKIP without admin token).

### 6. EC2 Staging Migration

**Only run with explicit authorization:**
1. Update `DATABASE_URL` in `apps/api/.env` to EC2 PostgreSQL host
2. Run: `pnpm --filter @psl-one/api exec prisma migrate status`
3. Confirm 3 pending migrations
4. Say explicitly: **"I authorize EC2 staging migration apply for Sprint 10"**
5. Run: `pnpm --filter @psl-one/api exec prisma migrate deploy`

### 7. Security Verification

```bash
# No provider key in frontend
grep -Rn 'NEXT_PUBLIC_.*(SPORT|KEY)' apps/experience/src apps/web/src || echo CLEAN

# No .env tracked
git ls-files | grep '\.env' | grep -v '\.example' || echo CLEAN
```

## What NOT to Do Without Authorization

- Apply EC2 staging migrations
- Activate PSL season
- Deploy to production
- Enable scheduled provider ingestion
- Activate wallet production
