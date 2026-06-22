# Sprint 11 — Owner Review Guide

## What to Review

### 1. Provider Strategy (read first)

```bash
cat docs/data/SPRINT-11-PROVIDER-DECISION.md
```

- API-Football selected as primary candidate (PSL league 288)
- Sportmonks confirmed REJECTED
- SportsDataIO remains secondary candidate only

### 2. Activate API-Football and Validate Coverage

**Step 1:** Obtain a trial key from https://api-sports.io or https://api-football.com

**Step 2:** Set in `apps/api/.env` (never commit):
```
API_FOOTBALL_KEY=<your_key>
DATA_PROVIDER=api-football
```

**Step 3:** Run health check:
```bash
node --env-file=apps/api/.env tools/discovery/sprint-11-provider-health.mjs
```
Expected: API-Football shows HTTP 200, PSL found.

**Step 4:** Run coverage check:
```bash
node --env-file=apps/api/.env tools/discovery/sprint-11-provider-coverage.mjs
```
Expected: PSL FOUND in output, league 288 results > 0.

**Step 5:** Run field mapping check:
```bash
node --env-file=apps/api/.env tools/discovery/sprint-11-provider-field-map.mjs
```
Expected: externalId, homeTeamName, awayTeamName, kickoffAt, status all PRESENT.

### 3. DataProviderService Wiring (verify safety)

```bash
cat apps/api/src/data-provider/data-provider.service.ts
```

Confirm:
- `DATA_PROVIDER=api-football` + `API_FOOTBALL_KEY` → `ApiFootballAdapter`
- No key → `NoOpAdapter` (safe fallback)
- No `DATA_PROVIDER` → `NoOpAdapter` (safe default)

### 4. Security Verification

```bash
# No provider key in frontend
grep -Rn 'NEXT_PUBLIC_.*(FOOTBALL|SPORT|KEY)' apps/experience/src apps/web/src || echo CLEAN

# No .env tracked
git ls-files | grep '\.env' | grep -v '\.example' || echo CLEAN

# No real key in docs
grep -rn 'API_FOOTBALL_KEY=.*[A-Za-z0-9]' docs/ || echo CLEAN
```

### 5. Live Smoke (local dev — optional if API-Football key is set)

```bash
pnpm --filter @psl-one/api run start:dev
# In another terminal:
BASE_URL=http://localhost:4000 node tools/smoke/sprint-9-staging-smoke.mjs
```

### 6. Commercial Terms

Before enabling any production ingestion:
- Review https://api-sports.io/pricing
- Confirm PSL Premier League is included in chosen plan
- Confirm rate limits sufficient for 2M fans
- Confirm data rights allow downstream display

## What NOT to Do Without Authorization

- Apply EC2 staging migrations
- Activate PSL season
- Deploy to production
- Enable scheduled provider ingestion
- Activate wallet production
- Use Sportmonks (REJECTED)
