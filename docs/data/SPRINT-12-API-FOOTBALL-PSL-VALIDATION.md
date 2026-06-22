# Sprint 12 — API-Football PSL Validation

## Provider Overview

- **Provider:** API-Football (v3.football.api-sports.io)
- **Adapter:** `ApiFootballAdapter` (implemented in Sprint 11)
- **Env var:** `API_FOOTBALL_KEY`
- **Activation:** `DATA_PROVIDER=api-football` + `API_FOOTBALL_KEY` set

## PSL League ID

- **PSL (Premier Soccer League):** league ID **288**
- The adapter was built targeting league 288 in Sprint 11, but this has not been validated against a live key.

## WC2026 League ID

- **FIFA World Cup 2026:** league ID **1**
- WC2026 coverage via API-Football is a secondary path; football-data.org is the primary WC candidate.

## Authentication

- **Header:** `x-apisports-key: <key>` (server-side only)
- The key must never be sent from the frontend or exposed via `NEXT_PUBLIC_*` env vars.

## Sprint 11 Context

The `ApiFootballAdapter` was implemented in Sprint 11 based on published API-Football documentation. A trial key was not available during Sprint 11, so the adapter has not been exercised against a live endpoint. The adapter code is present but its output is unconfirmed.

## Validation Status

**PENDING_LIVE_KEY_VALIDATION**

PSL league 288 fixtures, player stats, and standings have not been confirmed to exist in API-Football's data set. This must be validated before PSL ingestion can proceed.

## Owner Actions Required

1. Obtain a trial key from https://api-sports.io (register for API-Football)
2. Set `API_FOOTBALL_KEY=<key>` in `apps/api/.env` (never commit this file)
3. Run the provider coverage script:
   ```bash
   node --env-file=apps/api/.env tools/discovery/sprint-11-provider-coverage.mjs
   ```
4. Confirm league 288 fixtures are returned, player stats are present, and standings are accessible before marking GO.
5. Review commercial terms at https://api-sports.io/pricing — confirm the tier covers PSL fixture volume and player stat depth required.
