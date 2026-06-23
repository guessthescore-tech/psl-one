# Sprint 24 — Rollback Plan

## Code Changes in This Sprint

Sprint 24 adds docs, tests, and staging evidence only. No code changes to controllers, services,
guards, or API routes. No migrations. No schema changes.

## Sprint 24 Docs/Tests Only

- 5 staging evidence docs
- 5 handover docs
- 1 sprint matrix
- Experience test additions

## Rollback: No Code Rollback Needed

Sprint 24 has no code changes. If the sprint 24 commit must be reverted:
```bash
git revert <sprint-24-commit-sha>
```
This only removes docs and test additions. No API behaviour changes.

## Rollback: EC2 Deployment

If beta EC2 needs to roll back from Sprint 24 deployment to pre-Sprint-23 state:

```bash
gh workflow run deploy-beta-ec2.yml \
  --repo guessthescore-tech/psl-one \
  --field git_sha=ac93297...  \
  --field run_migrations=false \
  --field confirm=DEPLOY
```

Note: This would re-introduce the `@Roles('ADMIN')` bug. Not recommended.

## Rollback: No DB Rollback Needed

Sprint 23 introduced 0 migrations. Sprint 24 introduces 0 migrations. Cumulative count: 42.

## Safety State After Rollback

- PSL: INACTIVE (unchanged — no PSL activation occurred)
- Wallet: SANDBOX (unchanged)
- Scheduled ingestion: DISABLED (unchanged)
- Production ingestion: DISABLED (unchanged)
- No real-money functionality (unchanged)
