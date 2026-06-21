# Sprint 8 — Release Gate

## Gate Checks

| # | Check | Status | Notes |
|---|-------|--------|-------|
| G01 | `prisma validate` passes | PASS | No schema changes in S8 |
| G02 | `prisma generate` passes | PASS | No schema changes in S8 |
| G03 | API typecheck passes | PASS | |
| G04 | Experience typecheck passes | PASS | |
| G05 | API tests pass (>= 1,739 baseline) | PASS | |
| G06 | Experience tests pass (>= 487 baseline) | PASS | |
| G07 | API build passes | PASS | |
| G08 | Experience build passes | PASS | |
| G09 | `pnpm codex:validate` passes | PASS | |
| G10 | `pnpm docs:validate` passes | PASS | |
| G11 | `pnpm audit` clean (no HIGH/CRITICAL unmitigated) | PASS | undici remediated in Sprint 3 |
| G12 | `git diff --check` clean | PASS | |
| G13 | No SPORTMONKS_API_KEY in experience/src | PASS | Security scan clean |
| G14 | No NEXT_PUBLIC_SPORTMONKS_* in any file | PASS | |
| G15 | No real-money language in settlement service | PASS | |
| G16 | PSL INACTIVE confirmed | PASS | seed unchanged |
| G17 | Settlement is fire-and-forget (.catch present) | PASS | verified in code |
| G18 | settle-fixture route before :token routes | PASS | verified in controller |
| G19 | ChallengeSettlementService exported from module | PASS | |
| G20 | PredictionChallengesModule imported in FootballModule | PASS | |
| G21 | Challenge result page exists at /predict/challenge/result | PASS | |
| G22 | Result page has no financial/betting language | PASS | |
| G23 | Staging runbook authored | PASS | pending owner apply authorization |
| G24 | Rollback plan documented | PASS | |
| G25 | STORY-40 still RESERVED | PASS | not referenced in any new code |

## Blocked Gates
| # | Gate | Status | Blocker |
|---|------|--------|---------|
| GB01 | Sportmonks trial validation complete | BLOCKED | BLOCKED_BY_REPLACEMENT_TOKEN — owner must revoke old token and issue new |
| GB02 | Staging migration applied | BLOCKED | Pending explicit owner authorization |
| GB03 | End-to-end settlement tested in staging | BLOCKED | Depends on GB02 |

## Sign-off
- Sprint 8 code gate: READY FOR REVIEW
- Owner authorization required for: GB01, GB02, GB03
