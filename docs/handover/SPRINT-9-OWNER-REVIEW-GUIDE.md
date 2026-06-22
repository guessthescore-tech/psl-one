# Sprint 9 — Owner Review Guide

## What to Review

### 1. Provider Validation Tooling (S9-01)
Run each discovery tool locally to verify they work safely with no keys:

```bash
# Should print BLOCKED for both providers (no keys set)
node tools/discovery/provider-health-check.mjs

# Should print BLOCKED coverage table
PROVIDER=sportmonks node tools/discovery/provider-coverage-check.mjs

# Should print BLOCKED field mapping
PROVIDER=sportmonks node tools/discovery/provider-field-mapping-check.mjs

# Should show side-by-side BLOCKED comparison
node tools/discovery/provider-compare.mjs
```

Expected: all output shows `BLOCKED_BY_REPLACEMENT_TOKEN`, no crash, exit code 0.

### 2. Provider Strategy — SUPERSEDED (Sprint 10 amendment 2026-06-22)

> **Sportmonks has been REJECTED** and removed from the active provider strategy.
> Do NOT regenerate or set `SPORTMONKS_API_KEY`. See `docs/data/SPRINT-10-ACTIVE-PROVIDER-STRATEGY.md`.

Historical note — previous Sportmonks instructions:
5. Run: `node tools/discovery/provider-health-check.mjs`
6. If healthy: `PROVIDER=sportmonks node tools/discovery/provider-coverage-check.mjs`
7. Record results in `docs/data/SPRINT-9-PROVIDER-VALIDATION-RESULTS.md`

**SportsDataIO:**
1. Go to https://sportsdata.io/cart/soccer and start a free trial
2. Copy the trial API key (UCL coverage only)
3. In `apps/api/.env` (never commit): `SPORTSDATAIO_SOCCER_API_KEY=<trial_value>`
4. Run: `PROVIDER=sportsdataio node tools/discovery/provider-coverage-check.mjs`
5. Record results in `docs/data/SPRINT-9-PROVIDER-VALIDATION-RESULTS.md`

### 3. Authorizing Staging Migration Apply (S9-02)

If you want to apply migrations 41 and 42 to staging:

1. Confirm staging DB backup exists
2. Run: `pnpm --filter @psl-one/api exec prisma migrate status` (check pending migrations)
3. Say explicitly: **"I authorize staging migration apply for Sprint 9"**
4. Then run: `pnpm --filter @psl-one/api exec prisma migrate deploy`
5. Record exact output in `docs/handover/SPRINT-9-STAGING-MIGRATION-APPLY-LOG.md`
6. Run post-apply smoke: `BASE_URL=http://<staging>:4000 node tools/smoke/sprint-9-staging-smoke.mjs`

### 4. Running the Smoke Suite (S9-03)

File-level checks (no server needed):
```bash
node tools/smoke/sprint-9-challenge-settlement-smoke.mjs
```

Live checks (need running API):
```bash
BASE_URL=http://localhost:4000 node tools/smoke/sprint-9-staging-smoke.mjs
BASE_URL=http://localhost:4000 node tools/smoke/sprint-9-challenge-settlement-smoke.mjs
```

With admin token:
```bash
SMOKE_ADMIN_TOKEN=<jwt> BASE_URL=http://localhost:4000 node tools/smoke/sprint-9-staging-smoke.mjs
```

### 5. Provider Decision (S9-04)

Read `docs/data/SPRINT-9-PROVIDER-DECISION-RECOMMENDATION.md`.

The preliminary recommendation is **Sportmonks as primary**. Confirm after running live validation and reviewing commercial terms.

### 6. Security Verification

```bash
# Confirm no provider key in frontend
grep -Rn 'NEXT_PUBLIC_.*(SPORT|KEY)' apps/experience/src apps/web/src || echo CLEAN

# Confirm no .env tracked
git ls-files | grep '.env' | grep -v '.example' || echo CLEAN
```

## What NOT to Do Without Explicit Authorization
- Apply staging migrations
- Activate PSL season
- Deploy to production
- Enable provider scheduled ingestion
- Activate wallet production
