# Sprint 11 — Provider Go / No-Go Criteria

Date: 2026-06-22

## Purpose

This document defines the gate criteria that must ALL pass before any football data provider is wired to production ingestion on PSL One. It supersedes the Sprint 9 and Sprint 10 go/no-go tables for the Sprint 11 primary candidate (API-Football).

Production ingestion means: the `DataProviderService` calls a live external provider API on behalf of real fan requests or automated ingestion jobs. The NoOp adapter remains default until every gate below is checked.

---

## Gate Table — API-Football (Primary Candidate)

| # | Gate | Required | Current Status | How to Unblock |
|---|------|----------|---------------|----------------|
| G1 | Trial key obtained and set server-side | YES — mandatory | BLOCKED — `API_FOOTBALL_KEY` length 0 | Sign up at api-football.com or RapidAPI; place key in `apps/api/.env` |
| G2 | `DATA_PROVIDER=api-football` set in `apps/api/.env` | YES — mandatory | NOT SET | Add `DATA_PROVIDER=api-football` to `apps/api/.env` |
| G3 | Health check passes (HTTP 200 on `/status` or equivalent) | YES — mandatory | NOT TESTED | Run `node --env-file=apps/api/.env tools/discovery/api-football-discovery.mjs` |
| G4 | PSL Premier Soccer League confirmed in competition list | YES — mandatory | NOT_CONFIRMED | Inspect `/leagues` endpoint response; verify PSL (South Africa) is present |
| G5 | World Cup 2026 confirmed in competition list | YES — mandatory | NOT_CONFIRMED | Inspect `/leagues` endpoint response; verify WC2026 is present |
| G6 | Full fixture response for a PSL match retrieved | YES — mandatory | NOT TESTED | Call `/fixtures?league=<psl-id>&season=<year>`; inspect response |
| G7 | Field mapping verified — all required fields present | YES — mandatory | NOT TESTED | Run `node --env-file=apps/api/.env tools/discovery/provider-field-mapping-check.mjs` |
| G8 | Starting lineup fields confirmed (`startingXI`, `bench`, `formation`) | YES — mandatory | NOT TESTED | Call `/fixtures/lineups?fixture=<id>`; map to `ProviderAdapter` |
| G9 | Match event fields confirmed (goals, cards, substitutions) | YES — mandatory | NOT TESTED | Call `/fixtures/events?fixture=<id>`; map to `ProviderAdapter` |
| G10 | Standings endpoint returns data for PSL | YES — mandatory | NOT TESTED | Call `/standings?league=<psl-id>&season=<year>`; confirm all required fields |
| G11 | Rate limits documented for paid plan | YES — before production | NOT REVIEWED | Review API-Football pricing page; document requests-per-minute and daily cap |
| G12 | Rate limits validated as sufficient for 2 million fans | YES — before production | NOT VALIDATED | Model peak request rate; confirm Redis caching strategy reduces API calls within limits |
| G13 | Commercial terms reviewed by owner | YES — before production | NOT REVIEWED | Owner reviews ToS at api-football.com; confirms redistribution rights for commercial use |
| G14 | Betting / odds endpoints confirmed not called | YES — mandatory | CONFIRMED (no calls made) | Maintained by adapter implementation; verify in code review |
| G15 | Key not committed to git | YES — mandatory | CONFIRMED (`.env` in `.gitignore`) | Git hook and `.gitignore` enforcement; verify pre-commit |
| G16 | No `NEXT_PUBLIC_*` key exposure | YES — mandatory | CONFIRMED (adapter is server-side only) | Verify in code review that key never reaches `apps/web` or `apps/experience` |
| G17 | Staging EC2 migration applied and smoke tests passing | YES — before production | PENDING_EC2_DB_URL | Owner provides EC2 DB URL; run `prisma migrate deploy` on staging; run smoke suite |
| G18 | Owner explicitly authorises production ingestion | YES — mandatory | NOT AUTHORISED | Owner reviews all gates above, then grants explicit written authorisation |

---

## Gate Table — SportsDataIO (Secondary Candidate)

| # | Gate | Required | Current Status | How to Unblock |
|---|------|----------|---------------|----------------|
| S1 | PSL competition confirmed in SportsDataIO | YES — mandatory | NOT_CONFIRMED (PSL absent on trial) | Contact SportsDataIO sales or upgrade plan; re-run competition list check |
| S2 | `DATA_PROVIDER=sportsdataio` set in `apps/api/.env` | YES — mandatory | NOT SET | Add env flag once PSL confirmed |
| S3 | Field mapping verified | YES — mandatory | NOT TESTED | Run discovery tools once PSL confirmed |
| S4 | Commercial terms reviewed | YES — before production | NOT REVIEWED | Owner reviews SportsDataIO ToS |
| S5 | Rate limits validated | YES — before production | NOT VALIDATED | Review paid plan limits |
| S6 | Owner explicitly authorises production ingestion | YES — mandatory | NOT AUTHORISED | All gates above must pass first |

---

## No-Go Conditions

Do NOT activate production ingestion if ANY of the following are true:

- `API_FOOTBALL_KEY` (or equivalent provider key) is not set in `apps/api/.env`
- `DATA_PROVIDER` env flag is not explicitly set to a validated provider name
- PSL Premier Soccer League fixtures have not been confirmed in the provider's competition list via a live API call
- Field mapping has not been run and documented
- Commercial terms have not been reviewed by the owner
- A provider key would be exposed in frontend code, environment variables, or via `NEXT_PUBLIC_*`
- The provider's betting or odds endpoints would be called as part of any ingestion job
- Staging smoke tests are not passing
- Owner has not granted explicit authorisation for production ingestion

---

## Current Overall Status

| Dimension | Status |
|-----------|--------|
| Primary candidate | API-Football — SELECTED, PENDING VALIDATION |
| Trial key | NOT PRESENT (length 0) |
| PSL coverage | NOT_CONFIRMED |
| WC2026 coverage | NOT_CONFIRMED |
| Commercial terms | NOT REVIEWED |
| Production ingestion | NOT AUTHORISED |
| PSL season | NOT ACTIVATED |
| NoOp fallback | ACTIVE (default when `DATA_PROVIDER` unset) |

---

## Gate History

| Sprint | Provider | Gate Result |
|--------|----------|------------|
| Sprint 9 | Sportmonks | HTTP 401 — all gates blocked |
| Sprint 9 | SportsDataIO | Partial — WC2026 only; PSL absent |
| Sprint 10 | Sportmonks | REJECTED — removed from strategy |
| Sprint 10 | SportsDataIO | Secondary candidate — PSL unresolved |
| Sprint 11 | API-Football | PRIMARY_CANDIDATE — no key; all gates open |
| Sprint 11 | SportsDataIO | SECONDARY_CANDIDATE — PSL still unresolved |
