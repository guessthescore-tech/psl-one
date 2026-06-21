# Sprint 8 — Risk Register

| # | Risk | Likelihood | Impact | Mitigation | Status |
|---|------|-----------|--------|------------|--------|
| R1 | Sportmonks token exposure | HIGH (already occurred) | HIGH | BLOCKED_BY_REPLACEMENT_TOKEN; revoke old token immediately at https://app.sportmonks.com/api-tokens; never commit token value | OPEN — owner action required |
| R2 | Staging migration applied out of order | LOW | MEDIUM | Deploy order enforced in SPRINT-8-STAGING-MIGRATION-RUNBOOK.md; always run `prisma migrate status` before `migrate deploy` | MITIGATED |
| R3 | Settlement trigger firing on non-FINISHED fixture | LOW | MEDIUM | Explicit `FixtureStatus.FINISHED` check inside `settle(token)` — fixture status is read from DB, not trusted from caller; non-FINISHED status throws BadRequestException caught by settleAllAcceptedForFixture error handler | MITIGATED |
| R4 | One challenge failure blocking all settlements | LOW | MEDIUM | `settleAllAcceptedForFixture` wraps each `settle(token)` in try/catch; individual failure increments `errors` counter and continues loop | MITIGATED |
| R5 | Settlement fire-and-forget blocks request path | LOW | HIGH | `.catch()` applied immediately; never awaited in `adminUpdateFixtureStatus` response path; test verifies `.catch(` present in file | MITIGATED |
| R6 | Wallet records created by settlement | LOW | HIGH | ChallengeSettlementService has no wallet/fanValueLedger dependency; settlement service spec verifies no wallet mock needed | MITIGATED |
| R7 | PSL season accidentally activated | LOW | CRITICAL | PSL is INACTIVE in seed; no activation logic added in S8; release gate checks PSL status | MITIGATED |
| R8 | Production data ingestion enabled | LOW | HIGH | DataProviderModule disabled by default when no key configured; Sportmonks adapter returns safe empty arrays; no cron/scheduler added | MITIGATED |
| R9 | Staging DB not backed up before migration | MEDIUM | HIGH | SPRINT-8-STAGING-MIGRATION-CHECKLIST.md requires backup as first step | MITIGATED (procedural) |
| R10 | settle-fixture route conflicts with :token routes | LOW | MEDIUM | `settle-fixture/:fixtureId` placed BEFORE all `:token` routes in PredictionChallengesController to avoid NestJS prefix matching | MITIGATED |

## Risk Owner
All risks are owned by the project maintainer (owner) until replacement token is issued and staging apply is authorized.
