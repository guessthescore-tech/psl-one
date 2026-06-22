# Sprint 12 — Multi-Provider Boundary Strategy

## Sprint 12 Objective

Establish a clean multi-provider boundary in `DataProviderService` that supports football-data.org (World Cup beta candidate) and API-Football (PSL candidate) side-by-side, while keeping the default runtime as `NoOpAdapter`. No production ingestion is enabled. No PSL activation occurs. Keys are server-side only.

## Provider Roles

| Provider | Role | Status | Competition |
|---|---|---|---|
| football-data.org | World Cup beta candidate | ACTIVE_CANDIDATE | WC (FIFA World Cup) |
| API-Football | PSL candidate | ACTIVE_CANDIDATE | PSL (league 288) |
| ESPN public API | Research only | RESEARCH_ONLY | Various |
| Sportmonks | Rejected | REJECTED | — |
| SportsDataIO | Secondary only | SECONDARY_CANDIDATE | No PSL |
| NoOpAdapter | Default runtime | DEFAULT | All |

## Adapter Wiring

| `DATA_PROVIDER` value | Additional env var required | Adapter activated |
|---|---|---|
| `football-data-org` | `FOOTBALL_DATA_API_KEY` | `FootballDataOrgAdapter` |
| `api-football` | `API_FOOTBALL_KEY` | `ApiFootballAdapter` |
| _(empty / unset)_ | — | `NoOpAdapter` (safe default) |

The `DATA_PROVIDER` flag must be set explicitly. Supplying a key alone never activates a live adapter.

## Key Security Rules

- All provider API keys are **server-side only** — they must only appear in `apps/api/.env` (never committed) or SSM Parameter Store.
- `NEXT_PUBLIC_*` prefixed provider keys are **forbidden** — any such prefix would expose the key to browser clients.
- No `.env` files containing real keys may be committed to the repository at any time.
- Keys must not appear in CI logs, debug output, or error messages.

## What Is NOT Enabled in Sprint 12

- No production data ingestion from any live provider
- No PSL activation (PSL remains `INACTIVE`)
- No wallet production mode
- No betting or odds integration (platform is points-only — odds add-ons must not be enabled)
- No EC2 staging migration (pending owner authorisation)
- ESPN is not wired and has no adapter

## Validation Status

Both `ACTIVE_CANDIDATE` providers are in `PENDING_LIVE_KEY_VALIDATION` state. Neither is confirmed for production use until the owner runs the validation scripts listed in `SPRINT-12-OWNER-REVIEW-GUIDE.md` and all GO conditions in `SPRINT-12-PROVIDER-GO-NOGO.md` are met.
