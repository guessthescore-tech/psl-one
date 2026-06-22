# Sprint 12 — Handover

## Sprint Goal

Establish a multi-provider boundary in `DataProviderService` supporting football-data.org (World Cup beta) and API-Football (PSL) as explicit, selectable adapters alongside the existing `NoOpAdapter` default.

## Deliverables

### Code
- `FootballDataOrgAdapter` — implements the `IDataProvider` interface for football-data.org `/v4` endpoints
- `DataProviderService` updated — supports `DATA_PROVIDER=football-data-org`, `DATA_PROVIDER=api-football`, and default `NoOpAdapter`

### Discovery Tools
| Script | Purpose |
|---|---|
| `tools/discovery/sprint-12-football-data-health.mjs` | Health-check football-data.org API key |
| `tools/discovery/sprint-12-football-data-worldcup.mjs` | Validate WC fixtures, teams, standings |
| `tools/discovery/sprint-11-provider-coverage.mjs` | Validate API-Football PSL league 288 |
| _(existing)_ | API-Football adapter validation from Sprint 11 |

### Documentation (6 data docs)
- `SPRINT-12-PROVIDER-STRATEGY.md`
- `SPRINT-12-FOOTBALL-DATA-ORG-VALIDATION.md`
- `SPRINT-12-API-FOOTBALL-PSL-VALIDATION.md`
- `SPRINT-12-ESPN-RESEARCH-ONLY.md`
- `SPRINT-12-PROVIDER-CAPABILITY-MATRIX.md`
- `SPRINT-12-PROVIDER-GO-NOGO.md`

### Documentation (5 handover docs)
- `SPRINT-12-HANDOVER.md` _(this file)_
- `SPRINT-12-BETA-GO-NOGO.md`
- `SPRINT-12-KNOWN-GAPS.md`
- `SPRINT-12-OWNER-REVIEW-GUIDE.md`
- `SPRINT-12-ROLLBACK-PLAN.md`

## DataProviderService: Supported Providers

| `DATA_PROVIDER` | Key env var | Adapter |
|---|---|---|
| `football-data-org` | `FOOTBALL_DATA_API_KEY` | `FootballDataOrgAdapter` |
| `api-football` | `API_FOOTBALL_KEY` | `ApiFootballAdapter` |
| _(unset)_ | — | `NoOpAdapter` |

## Key Security

- No API keys are committed to the repository.
- No `NEXT_PUBLIC_*` provider keys exist — all keys are server-side only.
- Keys for `apps/api/.env` must be set locally or via SSM Parameter Store.

## Beta Status

**CONDITIONAL_GO** — see `SPRINT-12-BETA-GO-NOGO.md` for the six full GO conditions.

## What Is NOT Active

- No production data ingestion from any live provider
- No PSL activation (PSL remains `INACTIVE`)
- No wallet production mode
- No EC2 staging migration applied (pending owner authorisation)
- No ESPN adapter or ESPN data path
- No odds or betting integration

## Test Count

Sprint 12 introduces no new database migrations. Existing test counts from Sprint 11 are preserved. Discovery tools are fire-and-forget scripts with no test coverage required.
