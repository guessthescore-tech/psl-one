# Sprint 7 — Release Gate

## Gate Checklist

| Check | Status | Notes |
|-------|--------|-------|
| `prisma validate` passes | PASS | Schema validated |
| `prisma generate` completes | PASS | Client generated |
| `pnpm --filter @psl-one/api typecheck` | PASS | No TS errors |
| `pnpm --filter @psl-one/experience typecheck` | PASS | No TS errors |
| `pnpm --filter @psl-one/api test` | PASS | All tests green |
| `pnpm --filter @psl-one/experience test` | PASS | All tests green |
| `pnpm --filter @psl-one/api build` | PASS | API build clean |
| `pnpm --filter @psl-one/experience build` | PASS | Experience build clean |
| `pnpm codex:validate` | PASS | Agent prompts valid |
| `pnpm docs:validate` | PASS | Doc structure valid |
| Security scan: no SPORTMONKS_API_KEY in frontend | PASS | CLEAN |
| Real-money language scan | PASS | CLEAN |
| PSL season state | INACTIVE | Not activated |
| STORY-40 | RESERVED | Not implemented |

## Security Attestation

- `SPORTMONKS_API_KEY` appears only in server-side API code
- No `NEXT_PUBLIC_*` Sportmonks vars
- Auth header used (Bearer), not query param
- All test references to SPORTMONKS in spec files are allowed (test assertions only)

## Non-Financial Attestation

- Settlement creates zero wallet/ledger records
- Settlement response contains: `creatorPoints`, `acceptorPoints`, `winnerUserId`, `settlementReason`
- No `stake`, `payout`, `odds`, `wager`, `deposit`, `withdraw` in settlement code
