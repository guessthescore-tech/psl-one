# WC Beta Replay Harness — Handover

**Purpose:** Operational handover for the World Cup 2026 beta replay harness  
**Audience:** Backend engineers, platform operators  
**Status:** Complete — gates PASS, not yet deployed  
**Last verified:** 2026-06-26  

---

## What Was Implemented

### Live Provider Wiring
- Sportmonks adapter wired as `WC_LIVE_PROVIDER=sportmonks`
- ScoreBat widget adapter for embedded video (widget token is contractually public/non-secret for iframe attribution — this exception does not apply to provider API keys)
- `WorldCupImportService` double-gated: dry-run default, explicit season guard

### WC Beta Capability Matrix
- 104 live World Cup 2026 fixtures seeded (50 FINISHED, 54 SCHEDULED as of Sprint 42B)
- 1,200 player pool priced for Fantasy
- Provider health check and fixture readiness endpoints

### Live Match Backing
- `/world-cup/live` is the live match hub page; it uses `LiveMatchService`, which defaults to `ManualLiveMatchProviderAdapter` and switches to `SportmonksLiveMatchAdapter` when `WC_LIVE_PROVIDER=sportmonks` is set
- ScoreBat is used for **embedded video/highlights only** via `ScoreBatWidgetAdapter` — it does not provide live match scores or events
- `/admin/live-match/*` admin pages are backed by `LiveMatchService` (Sportmonks or ManualLiveMatch)

### Historical Replay Harness

| Service | Location | Purpose |
|---------|----------|---------|
| `WcFixtureReplayService` | `src/replay/wc-fixture-replay.service.ts` | Orchestrator — routes to prediction and fantasy sub-services; also defines `buildGtsCases()` |
| `ReplayPredictionSettlementService` | `src/predictions/replay-prediction-settlement.service.ts` | Replay GTS predictions, award points, write FanValueLedger |
| `ReplayFantasySettlementService` | `src/fantasy/replay-fantasy-settlement.service.ts` | Replay fantasy scoring, write FantasyPointsLedger |
| `buildGtsCases()` utility | `src/replay/wc-fixture-replay.service.ts` (exported) | Canonical GTS prediction case builder; GTS base scoring lives in `src/predictions/scoring.ts` |
| `computePlayerBasePoints()` utility | `src/fantasy/fantasy-scoring.utils.ts` | Canonical fantasy base-point calc used by replay |

---

## Running Replay

### Local development (uses tsx + source)

```bash
# Dry-run (safe, no writes)
pnpm --filter @psl-one/api replay:world-cup-fixture -- --fixtureId=<fixture-uuid> --dry-run

# Confirmed write
pnpm --filter @psl-one/api replay:world-cup-fixture -- \
  --fixtureId=<fixture-uuid> \
  --confirm=REPLAY_WORLD_CUP_BETA
```

### Beta / production container (compiled JS)

The replay script is compiled into the API image at build time (`nest build` compiles all files under `src/`). It is available inside the running API container without exposing PostgreSQL or adding a public endpoint.

Access via SSM then `docker exec`:

```bash
# 1. Open SSM session on beta EC2
aws ssm start-session --target i-0a5f16539c9626f90

# 2. Exec into the running API container
docker exec -it $(docker ps -qf name=psl-one-beta-api-1) sh

# 3. Inside the container — dry-run (safe, no writes)
node apps/api/dist/scripts/replay-world-cup-fixture.js \
  --fixtureId=<fixture-uuid> --dry-run

# 4. Inside the container — confirmed write (only after reviewing dry-run)
node apps/api/dist/scripts/replay-world-cup-fixture.js \
  --fixtureId=<fixture-uuid> \
  --confirm=REPLAY_WORLD_CUP_BETA
```

**Known beta fixture (FINISHED, score 0-1):** `d1d125ab-a186-4412-9228-e3c9ed4071f4`

Or use the package script alias (requires pnpm — not available in the production runner image):

```bash
pnpm --filter @psl-one/api replay:world-cup-fixture:prod -- --fixtureId=<id> --dry-run
```

The literal string `REPLAY_WORLD_CUP_BETA` is required for confirmed mode. Any other value or omission keeps the service in dry-run mode.

**Always run dry-run first on any FINISHED WC fixture before running confirmed mode.**

---

## Safety Rules

| Rule | Detail |
|------|--------|
| Dry-run default | `--confirm` token must be provided explicitly to write |
| PSL season INACTIVE | Replay targets WC 2026 only; PSL is not activated |
| Points-only | Fan Value Ledger writes use non-financial points, not real money |
| No real money | Wallet is sandbox-only; no financial transactions |
| No production ingestion | `FixtureIngestionService` is guarded; manual only, never automatic |
| WC fixture data protected | Never modify or delete seeded World Cup historical fixture data |
| Idempotency | Every replay path is safe to rerun — no duplicate ledger rows |

---

## Database / Migration

### Migration: `20260626000001_replay_ledger_idempotency`

Applied 2026-06-26. **Additive only** — no existing data modified.

**What it adds:**

| Object | Type | Purpose |
|--------|------|---------|
| Duplicate audit DO block | Procedure | Raises EXCEPTION before index creation if existing data has duplicate `prediction_id` values |
| Duplicate audit DO block | Procedure | Raises EXCEPTION before index creation if existing data has duplicate `(fantasy_team_id, player_id, fixture_id)` tuples |
| `prediction_points_ledger_prediction_id_unique` | Partial unique index | `WHERE prediction_id IS NOT NULL` — prevents concurrent duplicate prediction ledger rows |
| `fantasy_points_ledger_team_player_fixture_unique` | Unique index | `(fantasy_team_id, player_id, fixture_id)` — prevents concurrent duplicate fantasy ledger rows |

Prisma cannot express partial (`WHERE`) unique indexes in `@@unique`. The migration SQL is the authoritative definition. Both services catch Prisma error `P2002` (unique constraint violation) for safe concurrent re-runs.

### FanValueLedger idempotency key

`PREDICTION_SETTLEMENT:<predictionId>` — safe to call unconditionally on skip, repair, and happy paths. If a prior run committed the prediction ledger but failed before writing FanValueLedger, the next run repairs it.

---

## Provider Configuration

| Variable | Purpose | Required for |
|----------|---------|-------------|
| `WC_LIVE_PROVIDER` | Set to `sportmonks` to activate live match data; any other value falls back to `ManualLiveMatchProviderAdapter` | Live match scores and events |
| `SPORTMONKS_API_KEY` | Sportmonks v3 API key | Required when `WC_LIVE_PROVIDER=sportmonks` |
| `SCOREBAT_WIDGET_TOKEN` | ScoreBat iframe attribution token | Embedded video/highlights widget only — unrelated to live match scoring |
| `DATA_PROVIDER` | Global data provider flag | Fixture import |

Beta EC2 reads these values from SSM into `.env.beta` during bootstrap/deploy:

| SSM parameter | Runtime variable |
|---------------|------------------|
| `/psl-one/beta/wc-live-provider` | `WC_LIVE_PROVIDER` |
| `/psl-one/beta/sportmonks-api-key` | `SPORTMONKS_API_KEY` |
| `/psl-one/beta/scorebat-widget-token` | `SCOREBAT_WIDGET_TOKEN` |

**ScoreBat note:** ScoreBat is an embedded video widget provider only. It does not supply live match scores or events. Its widget token is contractually public for iframe attribution purposes. Do not generalise this exception to any other provider credential.

**`ManualLiveMatchProviderAdapter` is the default.** When `WC_LIVE_PROVIDER` is unset or set to anything other than `sportmonks`, the service returns stub/manual responses — no network calls are made to external providers.

---

## Verification Gates

Run in order. All must pass before any deployment.

```bash
# 1. Schema validity
pnpm --filter @psl-one/api exec prisma validate

# 2. Type correctness
pnpm --filter @psl-one/api typecheck

# 3. Replay-specific specs (92 tests)
pnpm --filter @psl-one/api test -- \
  src/predictions/replay-prediction-settlement.service.spec.ts \
  src/fantasy/replay-fantasy-settlement.service.spec.ts \
  src/replay/wc-fixture-replay.service.spec.ts

# 4. Full API suite — requires local PostgreSQL (see below)
pnpm --filter @psl-one/api test

# 5. API build
pnpm --filter @psl-one/api build

# 6. Experience tests
pnpm --filter @psl-one/experience test

# 7. Web tests
pnpm --filter @psl-one/web test

# 8. Docs validation
pnpm -w run docs:validate
```

**Gate results as of 2026-06-26:**

| Gate | Result |
|------|--------|
| prisma validate | PASS |
| typecheck | PASS |
| 3 replay specs | 92 / 92 |
| Full API (with live PostgreSQL) | 2355 / 2355 (100 spec files) |
| API build | PASS |
| Experience | 1638 / 1638 |
| Web | 543 / 543 |
| docs:validate | 18 / 18 PASS |

---

## Local PostgreSQL Setup Caveat

The full API suite includes `src/football/world-cup-2026.integration.spec.ts`, which connects to a real database. If PostgreSQL is not reachable, that spec file fails.

Two supported configurations:

**Docker PostgreSQL:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/psl_identity_dev
```
Start with `docker compose up -d postgres`.

**Native macOS PostgreSQL (peer auth):**
```env
DATABASE_URL=postgresql://<whoami>@localhost:5432/psl_identity_dev
```
`psql -U postgres` will fail with `role "postgres" does not exist` — this is expected and does not mean PostgreSQL is down. Use `pg_isready` to confirm availability.

See [Local Development](../engineering/LOCAL-DEVELOPMENT.md) for full guidance including diagnostics.

**Before running the full gate, always check migration state:**

```bash
pnpm --filter @psl-one/api exec -- prisma migrate status
pnpm --filter @psl-one/api db:migrate   # applies any pending migrations
```

Do not use `prisma migrate reset` — it is destructive. Do not use `prisma migrate dev` against a shared or staging database.

---

## Remaining Operational Steps

These steps are pending explicit owner authorisation:

1. **Set provider env vars on target environment** — `/psl-one/beta/wc-live-provider`, `/psl-one/beta/sportmonks-api-key`, and/or `/psl-one/beta/scorebat-widget-token` must be configured in the EC2 SSM parameter store before live data flows.

2. **Deploy** — run the deployment workflow only when explicitly approved. The API build passes locally; EC2 staging deploy is a separate owner-authorised step.

3. **Dry-run on real FINISHED fixture** — after deployment, run:
   ```bash
   pnpm --filter @psl-one/api replay:world-cup-fixture -- \
     --fixtureId=<real-finished-wc-fixture-uuid> --dry-run
   ```
   Review the dry-run report before running confirmed mode.

4. **Confirmed replay** — only after dry-run is reviewed and approved:
   ```bash
   pnpm --filter @psl-one/api replay:world-cup-fixture -- \
     --fixtureId=<fixture-uuid> \
     --confirm=REPLAY_WORLD_CUP_BETA
   ```

---

## Related Documents

- [Migration Reference](../reference/MIGRATIONS.md) — all 46 migrations
- [Migration Operations](../operations/MIGRATION-OPERATIONS.md) — migration workflow
- [Local Development](../engineering/LOCAL-DEVELOPMENT.md) — local DB setup (both variants)
- [Testing Guide](../engineering/TESTING-GUIDE.md) — integration test DB requirements
- [Predictions Domain](../domain/PREDICTIONS.md) — GTS lock/settle/void lifecycle
- [Fantasy Domain](../domain/FANTASY.md) — fantasy scoring model
- [Fan Value and Leaderboards](../domain/FAN-VALUE-AND-LEADERBOARDS.md) — FanValueLedger
