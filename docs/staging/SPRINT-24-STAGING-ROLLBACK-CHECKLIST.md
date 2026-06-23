# Sprint 24 — Staging Rollback Checklist

## When to Roll Back

Roll back beta EC2 if:
- API containers fail to start after Sprint 24 deploy
- Health endpoint returns non-200 after deploy
- Migration fails
- Smoke results show regressions for previously-passing checks

## Rollback SHA

The previous stable SHA is:
```
5a0385f5f8b74f179e4ef53420e220cbf709a483
```
(Sprint 23 feature branch final commit — same code as c731c494, Sprint 24 is docs/tests only)

For a full rollback to pre-Sprint-23 state (Sprint 22):
```
ac93297...  (Sprint 22 merge commit)
```

## Rollback Procedure

1. Trigger `Deploy — Beta EC2` workflow with rollback SHA:
   ```bash
   gh workflow run deploy-beta-ec2.yml \
     --repo guessthescore-tech/psl-one \
     --field git_sha=<rollback-sha> \
     --field run_migrations=false \
     --field confirm=DEPLOY
   ```
   Use `run_migrations=false` for rollback — Sprint 23 has 0 migrations, no schema changes.

2. Verify API readiness after rollback.

3. Document rollback reason in `SPRINT-24-EC2-RBAC-SMOKE-EXECUTION-LOG.md`.

## No DB Rollback Needed

Sprint 23 introduced 0 migrations. Cumulative migration count: 42.
No schema changes = no DB rollback required regardless of code rollback.

## Safety State After Rollback

- PSL: INACTIVE (unchanged — no PSL activation occurred)
- Wallet: SANDBOX (unchanged)
- Scheduled ingestion: DISABLED (unchanged)
- Production ingestion: DISABLED (unchanged)
- No real-money functionality (unchanged)
