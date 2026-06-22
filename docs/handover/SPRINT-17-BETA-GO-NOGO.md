# Sprint 17 — Beta Go/No-Go

## Sprint Scope

Wire Parse PSL fixture ingestion into the beta admin workflow. Provide admin operators with a dry-run preview and gated write-run UI. No scheduler. No PSL activation.

## Go/No-Go Criteria

| # | Gate | Status |
|---|------|--------|
| 1 | `pnpm --filter api typecheck` — zero errors | **PASS** |
| 2 | `pnpm --filter experience typecheck` — zero errors | **PASS** |
| 3 | API test suite ≥ 1,894 tests PASS | **PASS** |
| 4 | Experience test suite ≥ 718 tests PASS | **PASS** |
| 5 | `pnpm --filter api build` succeeds | **PASS** |
| 6 | `pnpm --filter experience build` succeeds | **PASS** |
| 7 | `pnpm codex:validate` — all agents healthy | **PASS** |
| 8 | `pnpm docs:validate` — all 18/18 checks pass | **PASS** |
| 9 | No `PARSE_API_KEY` in any committed file | **PASS** |
| 10 | No scheduled ingestion code present | **PASS** |
| 11 | All fixtures created with `isPublished=false` | **PASS** |
| 12 | No PSL season activation triggered | **PASS** |
| 13 | `confirmWrite` guard present in controller | **PASS** |
| 14 | `seasonId` required-in-write-mode guard present | **PASS** |
| 15 | `AdminAuditLog` written for all ingestion events | **PASS** |

## Decision

**CONDITIONAL_GO** — Sprint 17 is mergeable.

## Conditions

1. `PARSE_API_KEY` must be rotated or validated before a live write run is attempted in beta.
2. Write run requires a live PSL Season ID — obtain from the Admin Command Centre.
3. Source will be empty until psl.co.za publishes 2026/27 fixtures (~July/August 2026).
4. After fixture import, fixtures must be manually published — they are `isPublished=false`.
5. PSL season activation remains a separate, owner-gated action.

## Not In Scope (No-Go for this sprint)

- Scheduled/automated ingestion
- PSL season activation
- Fixture publishing
- Production deployment
- Wallet production
