# Sprint 12 — Beta Go / No-Go

## Status: CONDITIONAL_GO

Sprint 12 ships the multi-provider adapter boundary but neither live provider has been validated. Full GO requires all six conditions below.

## Full GO Conditions

| # | Condition | Status |
|---|---|---|
| 1 | football-data.org WC validation passing (`sprint-12-football-data-worldcup.mjs`) | PENDING |
| 2 | API-Football PSL validation passing (`sprint-11-provider-coverage.mjs`) | PENDING |
| 3 | Commercial terms reviewed for chosen providers (football-data.org + api-sports.io) | PENDING |
| 4 | EC2 staging migration applied and confirmed | PENDING |
| 5 | Staging live smoke passing (all 17 checks) | PENDING |
| 6 | No odds add-on enabled on either provider account | PENDING |

## Critical Gate

**Do NOT activate PSL** until condition 2 is confirmed. PSL must remain `INACTIVE` until API-Football league 288 coverage is validated and the owner explicitly authorises PSL activation.

## What Changes at Full GO

- `CONDITIONAL_GO` → `GO` in this file and in `SPRINT-12-PROVIDER-GO-NOGO.md`
- `DATA_PROVIDER=football-data-org` may be set in staging configuration
- Controlled WC ingestion testing may begin on staging
- PSL path assessed separately once condition 2 is met

## What Does Not Change at Full GO

- PSL remains `INACTIVE` until a separate PSL activation gate is passed
- Wallet production remains disabled
- No production deployments without owner sign-off
- Sportmonks remains `REJECTED`
