# Sprint 15 — Owner Review Guide

## Purpose

This guide walks through the steps for clearing the Sprint 15 CONDITIONAL_GO gates.

## Step 1 — Set Parse API Key (Required)

Obtain the Parse API key from the parse.bot marketplace listing for `psl-co-za-api`.

Place it in `apps/api/.env` (gitignored — never commit):

```
PARSE_API_KEY=<your-key-here>
```

Do NOT set `NEXT_PUBLIC_PARSE_API_KEY`. The key must never reach the browser.

Verify without printing:

```bash
node --env-file=apps/api/.env - <<'NODE'
const key = process.env.PARSE_API_KEY || '';
console.log(`Key: ${key.length > 8 ? `PRESENT length=${key.length}` : 'MISSING'}`);
NODE
```

## Step 2 — Run Health Check

```bash
node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-health.mjs
```

Expected: `PARSE_PSL_HEALTH_OK`

If `PARSE_PSL_AUTH_FAILED`: check key value and Parse.bot account status.

## Step 3 — Run Fixture Dry-Run

```bash
node --env-file=apps/api/.env tools/discovery/sprint-15-parse-fixture-dry-run.mjs
```

Expected results:

| Result | Action |
|--------|--------|
| `DRY_RUN_SOURCE_EMPTY` | Expected — psl.co.za hasn't published 2026/27 fixtures yet. Check back July/August. |
| `DRY_RUN_FIXTURES_NORMALIZED` | Fixtures are available — review sample output and proceed to Step 4. |
| `DRY_RUN_AUTH_FAILED` | Key rejected — check key and account. |
| `DRY_RUN_RATE_LIMITED` | Too many calls — wait 60 seconds and retry. |
| `DRY_RUN_SCHEMA_CHANGED` | Parse API changed shape — raise with engineering. |

## Step 4 — Run All Discovery Tools

```bash
node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-fixtures.mjs
node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-results.mjs
node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-standings.mjs
node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-match-details.mjs
```

Update `docs/data/SPRINT-15-PARSE-PSL-LIVE-VALIDATION.md` with the results.

## Step 5 — Review Ingestion Design

Read `docs/data/SPRINT-15-FIXTURE-INGESTION-DESIGN.md`.

Confirm you accept:
- Idempotent upserts by externalId
- Canonical data boundary (provider does not overwrite locked data)
- Rate-limit plan
- Manual-only trigger (no scheduler)

If accepted, record approval in `docs/data/SPRINT-15-FIXTURE-INGESTION-DESIGN.md`.

## Step 6 — Review Parse.bot Commercial Terms

Parse.bot is an unofficial scraper of psl.co.za. Before enabling any scheduled ingestion:

1. Review Parse.bot terms of service at parse.bot.
2. Confirm the psl-co-za-api listing permits automated/commercial use.
3. Consider reaching out to PSL for an official data partnership.

If commercial use is not permitted, do not proceed with scheduled ingestion.

## Step 7 — Optional: Reactivate API-Football Fallback

The API-Football account is suspended. The Parse PSL path is primary, so this is low priority. If you want the PSL fallback active:

1. Log in to dashboard.api-football.com.
2. Reactivate or upgrade the account.
3. Re-run `tools/discovery/sprint-13-psl-sample.mjs` to confirm PSL league 288 is accessible.

## Step 8 — What NOT To Do

| Do NOT | Reason |
|--------|--------|
| Set `NEXT_PUBLIC_PARSE_API_KEY` | Key must stay server-side |
| Activate PSL season | Separate explicit owner decision |
| Enable scheduled ingestion | Requires design approval + owner authorisation |
| Apply EC2 migration | Requires separate owner authorisation |
| Deploy to production | Staging must pass first |
| Commit `apps/api/.env` | Contains secrets |

## After All Steps Pass

Update `docs/data/SPRINT-15-PROVIDER-GO-NOGO.md` status for each cleared condition.

When all conditions met, update `docs/handover/SPRINT-15-BETA-GO-NOGO.md` from `CONDITIONAL_GO` to `GO`.
