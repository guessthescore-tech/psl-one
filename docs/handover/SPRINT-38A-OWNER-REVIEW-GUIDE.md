# Sprint 38A — Owner Review Guide

## What to Verify

### 1. Provider Health (3 min)

```bash
ADMIN_TOKEN=<your-beta-jwt> node tools/staging/sprint-38a-world-cup-provider-health.mjs
```

Expected: `STATUS: READY_FOR_DRY_RUN`, `football-data.org: CONFIGURED`

### 2. WC Live Readiness Endpoint (1 min)

```bash
curl -H "Authorization: Bearer <your-beta-jwt>" https://16.28.84.11/admin/data-provider/world-cup-live-readiness
```

Expected: `competition: WC2026`, `worldCupActive: true`, all safety flags true.

### 3. Fixture Dry-Run (2 min)

```bash
ADMIN_TOKEN=<your-beta-jwt> node tools/staging/sprint-38a-world-cup-fixture-import.mjs --dry-run
```

Expected: 104 WC fixtures previewed, 0 DB writes, SOURCE_AVAILABLE.

### 4. Frontend Live Page (2 min)

Navigate to `/world-cup/live` in the experience app.

Expected:
- Hero section with FIFA World Cup 2026 branding
- Fixtures section (empty or populated depending on DB state)
- ScoreBat widget placeholder if token not set
- Beta notice visible

### 5. Safety Verification (2 min)

Confirm on readiness response:
- `safety.noRealMoney: true`
- `safety.noPslActivation: true`
- `safety.worldCupBetaContext: true`
- `safety.noScheduledIngestion: true`

## Approval Gate

After reviewing the above, to authorize write import:

1. Set in terminal: `export ALLOW_WORLD_CUP_WRITE=true`
2. Set in terminal: `export CONFIRM_WORLD_CUP_WRITE=IMPORT_WORLD_CUP_BETA`
3. Run: `ADMIN_TOKEN=<jwt> node tools/staging/sprint-38a-world-cup-fixture-import.mjs --write`
4. Verify created count = 104 (or number of matches with known teams)

## Do Not

- Do not activate PSL season
- Do not publish PSL fixtures
- Do not set `ALLOW_WORLD_CUP_WRITE=true` in the production environment
- Do not enable scheduled ingestion
