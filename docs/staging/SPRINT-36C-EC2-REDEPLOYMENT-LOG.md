# Sprint 36C — Beta EC2 Redeployment Log

## Purpose

Owner-authorised beta EC2 redeployment of Sprint 36B PSL fixture readiness monitoring to SHA `91dc999733c70195748d5acfd92e499f067638a1`.

## Deployment Summary

| Field | Value |
|-------|-------|
| Workflow | `deploy-beta-ec2.yml` |
| Workflow run ID | `28107618815` |
| Triggered | 2026-06-24T14:54:34Z |
| Completed | 2026-06-24T14:59:33Z |
| Duration | ~5 minutes |
| Conclusion | **success** |
| git_sha input | `91dc999733c70195748d5acfd92e499f067638a1` |
| run_migrations input | `true` |
| confirm input | `DEPLOY` |
| EC2 instance | `i-0a5f16539c9626f90` (af-south-1b) |
| IP | `16.28.84.11` |

## Job Results

| Job | Status | Duration | Job ID |
|-----|--------|----------|--------|
| Validate SHA | success | 5s | 83226049718 |
| Build and push images | success | 1m42s | 83226080972 |
| Deploy to EC2 | success | 1m33s | 83226502640 |
| Smoke test | success | 1m12s | 83226882675 |
| Release manifest | success | 6s | 83227183894 |

## SSM Deploy Command

| Field | Value |
|-------|-------|
| SSM Command ID | `acc13865-2138-41be-bb48-20c85f5c4e85` |
| Instance | `i-0a5f16539c9626f90` |
| Poll result | Poll 7/60 — **Success** at 2026-06-24T14:57:53Z |
| run_migrations | true |
| migration_result | success |

## Migrations Applied

No new migrations in Sprint 36B. Last migration was `20260624120000_audience_segment` (migration 44, Sprint 32), already applied in Sprint 36 deploy. No schema changes expected.

## Rollback SHA

| Sprint | SHA |
|--------|-----|
| Sprint 32-35 (prior main state before 36) | `d4d8d8c444ae9d40341944f60a10e8dce6aaf49e` |
| Sprint 36 / Sprint 36 EC2 evidence | `d4d8d8c` (same) |
| Sprint 36B merge (current deployed SHA) | `91dc999733c70195748d5acfd92e499f067638a1` |

To rollback to Sprint 36 state: redeploy SHA `d4d8d8c` with `run_migrations=false`.

## Release Artifact

`beta-release-manifest-91dc999733c70195748d5acfd92e499f067638a1`

## Safety State at Deploy

| Boundary | Status |
|----------|--------|
| PSL | INACTIVE |
| WC 2026 | ACTIVE (beta context) |
| Wallet | SANDBOX ONLY |
| Fantasy | POINTS-ONLY |
| Social prediction | POINTS-ONLY |
| Fan Value | NON-FINANCIAL |
| Commerce | CATALOGUE_ONLY |
| Ticketing | CTA_PLACEHOLDER |
| Sponsor billing | INVOICE_PLACEHOLDER |
| Real-money functionality | NONE |
| Scheduled ingestion | DISABLED |
| Production ingestion | DISABLED |
| Fixture import write | NO OWNER AUTH |
| Fixture publication | NO OWNER AUTH |
| PSL activation | NO OWNER AUTH |
