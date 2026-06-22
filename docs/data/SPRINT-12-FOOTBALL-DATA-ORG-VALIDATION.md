# Sprint 12 — football-data.org Validation

## Provider Overview

- **Provider:** football-data.org
- **Adapter:** `FootballDataOrgAdapter`
- **Env var:** `FOOTBALL_DATA_API_KEY`
- **Activation:** `DATA_PROVIDER=football-data-org` + `FOOTBALL_DATA_API_KEY` set

## Free Tier Competitions

The football-data.org free tier covers the following competitions (official competition codes):

| Code | Competition |
|---|---|
| WC | FIFA World Cup |
| CL | UEFA Champions League |
| PL | English Premier League |
| BL1 | German Bundesliga |
| SA | Italian Série A |
| DED | Eredivisie (Netherlands) |
| FL1 | Ligue 1 (France) |
| PPL | Primeira Liga (Portugal) |
| EC | UEFA European Championship |
| BSA | Campeonato Brasileiro Série A |

## PSL Support

**PSL is NOT available on the football-data.org free tier.** The PSL is not listed among the covered competitions. A paid tier upgrade does not guarantee PSL coverage. The PSL candidate provider is API-Football (see `SPRINT-12-API-FOOTBALL-PSL-VALIDATION.md`).

## World Cup Support

**YES — World Cup (WC) is fully supported on the free tier.**

Relevant endpoints:

| Endpoint | Description |
|---|---|
| `GET /v4/competitions/WC/matches` | All WC match fixtures and results |
| `GET /v4/competitions/WC/teams` | All WC participating teams |
| `GET /v4/competitions/WC/standings` | WC group standings |

## Authentication

- **Header:** `X-Auth-Token: <key>` (server-side only)
- The key must never be sent from the frontend or exposed via `NEXT_PUBLIC_*` env vars.

## Paid Tier Add-ons

An Odds Add-On exists on paid tiers. This **must NOT be used**. PSL One is a points-only platform — no odds, no betting, no wagering data may be ingested or displayed.

## Validation Status

**PENDING_LIVE_KEY_VALIDATION**

The adapter is implemented but has not been validated against a live key. Validation requires the owner to run the discovery scripts below.

## Owner Actions Required

1. Obtain a football-data.org API key from https://www.football-data.org/client/register
2. Set `FOOTBALL_DATA_API_KEY=<key>` in `apps/api/.env` (never commit this file)
3. Run health check:
   ```bash
   node --env-file=apps/api/.env tools/discovery/sprint-12-football-data-health.mjs
   ```
4. Run WC validation:
   ```bash
   node --env-file=apps/api/.env tools/discovery/sprint-12-football-data-worldcup.mjs
   ```
5. Confirm WC fixtures, teams, and standings are returned without error before marking GO.
