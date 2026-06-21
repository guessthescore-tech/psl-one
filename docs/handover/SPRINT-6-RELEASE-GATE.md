# Sprint 6 Release Gate

All gates must be green before merging to main.

## Gate Results

| Gate | Command | Result |
|------|---------|--------|
| Schema valid | `prisma validate` | PASS |
| API typecheck | `pnpm --filter @psl-one/api typecheck` | PASS |
| API unit tests | `pnpm --filter @psl-one/api test` | 1680 passed, 9 pre-existing DB failures |
| API build | `pnpm --filter @psl-one/api build` | PASS |
| Experience typecheck | `pnpm --filter @psl-one/experience typecheck` | PASS |
| Experience tests | `pnpm --filter @psl-one/experience test` | 476 passed, 0 failed |
| Experience build | `pnpm --filter @psl-one/experience build` | PASS |
| Codex validate | `pnpm codex:validate` | PASS |
| Docs validate | `pnpm docs:validate` | PASS |
| Whitespace check | `git --no-pager diff --check` | PASS |

## Pre-Existing Failures (Not Blocking)

The 9 API test failures are pre-existing DB integration tests that require a live PostgreSQL connection:
- `world-cup-api.e2e-spec.ts` — requires seeded WC2026 data
- `direct-challenge-concurrency.spec.ts` — requires live DB for transaction isolation tests

These are tracked in S3-INFRA-00 and do not block merge.

## Security Non-Regret Checklist

- [ ] `SPORTMONKS_API_KEY` not present in any `NEXT_PUBLIC_*` env or frontend file
- [ ] No `prisma.user.delete()` calls added
- [ ] No betting/odds/stakes/wager/payout language added
- [ ] No Terraform/IAM/AWS files modified
- [ ] PSL `approvalStatus` remains `PENDING`/`APPROVED` (not `ACTIVATED`)
- [ ] No real-money wallet functionality added
- [ ] Migration is additive only (no DROP TABLE, no DROP COLUMN)
- [ ] NoOpAdapter returns safe empty responses (no throws)
