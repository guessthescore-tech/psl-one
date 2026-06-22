# Sprint 12 — Provider Go / No-Go

## Overall Status: CONDITIONAL_GO

Sprint 12 establishes the multi-provider boundary and ships adapter code. Neither live provider has been validated against a real key. Full GO requires all six conditions below to be met and recorded.

## Path Summary

| Path | Status | Blocker |
|---|---|---|
| World Cup beta (football-data.org) | CONDITIONAL | Key validation pending |
| PSL live data (API-Football) | CONDITIONAL | Key validation pending + PSL league 288 unconfirmed |

## Full GO Conditions

| # | Condition | How to verify |
|---|---|---|
| 1 | football-data.org WC validation passing | Owner runs `sprint-12-football-data-worldcup.mjs` and confirms WC fixtures/teams/standings returned without error |
| 2 | API-Football PSL validation passing | Owner runs `sprint-11-provider-coverage.mjs` and confirms league 288 fixtures, player stats, and standings are accessible |
| 3 | Commercial terms reviewed for chosen providers | Owner reviews pricing pages for football-data.org and api-sports.io and confirms the intended usage tier |
| 4 | EC2 staging migration applied | Owner authorises and applies the pending EC2 Terraform plan |
| 5 | Staging live smoke passing | All 17 smoke checks pass after EC2 migration and any config changes |
| 6 | No odds add-on enabled | Owner confirms no odds-related add-on or endpoint is activated on either provider account |

## What Must NOT Happen Before Full GO

- PSL must not be activated (`approvalStatus` must remain `INACTIVE`)
- Production ingestion must not start
- Wallet production mode must not be enabled
- Sportmonks must not be re-engaged
- ESPN must not be wired or used for any production data path

## Recording GO

When all six conditions are met, create a new commit updating this file's status from `CONDITIONAL_GO` to `GO` and document the validation run dates and result summaries.
