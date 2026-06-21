# Sprint 8 — Known Gaps

| # | Gap | Impact | Owner Action Required |
|---|-----|--------|----------------------|
| G1 | Sportmonks trial validation: BLOCKED_BY_REPLACEMENT_TOKEN | Provider field mapping and live data ingestion blocked | Revoke old token, generate replacement, place in `.env` or staging SSM |
| G2 | Settlement auto-trigger not yet tested against staging DB | Cannot confirm end-to-end settlement in staging environment | Authorize and apply staging migration runbook |
| G3 | Staging migration apply: pending owner authorization | Migrations 41–43 ready but not yet applied to staging | Owner must explicitly authorize; see SPRINT-8-STAGING-MIGRATION-RUNBOOK.md |
| G4 | Provider field mapping results | Template created; actual results pending trial key | Run `pnpm --filter @psl-one/api exec ts-node tools/data-provider-spike/sportmonks-discovery.ts` after token placed |
| G5 | Settlement service not tested against live PostgreSQL | Unit tests pass; no integration test with real DB | Addressed when staging is unblocked |
| G6 | challenge/result page redirects to accept (JS redirect) | No server-side redirect; requires JS enabled | Acceptable for beta; production can use Next.js redirect config |
| G7 | PSL season: INACTIVE | PSL features not testable by fans | Not a gap — deliberate; PSL activation requires owner instruction |
| G8 | AuditEvent.CHALLENGE_SETTLED and PredictionChallengeStatus.SETTLED cannot be removed from PG enum | Schema constraint | Accepted risk — additive enum values are benign |

## Gaps Intentionally Out of Scope (Sprint 8)
- Production Sportmonks ingestion scheduler
- Push notifications on challenge settlement
- Fantasy auto-settlement on gameweek end
- PSL fixture import from Sportmonks
- Wallet settlement (deliberately excluded — points-only)
