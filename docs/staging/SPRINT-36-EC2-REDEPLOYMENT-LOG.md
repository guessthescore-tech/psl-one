# Sprint 36 — Beta EC2 Redeployment Execution Log

**Date:** 2026-06-24  
**Operator:** Owner-authorised automated deploy  
**Environment:** Beta (EC2 `i-0a5f16539c9626f90`, `af-south-1b`)

## Trigger

| Field | Value |
|-------|-------|
| Workflow | `Deploy — Beta EC2` (`deploy-beta-ec2.yml`) |
| Run ID | `28097344936` |
| Input: `git_sha` | `d4d8d8c444ae9d40341944f60a10e8dce6aaf49e` |
| Input: `run_migrations` | `true` |
| Input: `confirm` | `DEPLOY` |
| Triggered at | 2026-06-24T12:06:xx UTC (approx) |
| Completed at | 2026-06-24T12:15:xx UTC (approx) |

## Authorisation

Owner authorisation received verbally in current conversation session. Deploy scope: beta EC2 only. Production deploy NOT authorised.

## Pre-deploy State

| Check | Result |
|-------|--------|
| Main branch HEAD SHA | `d4d8d8c444ae9d40341944f60a10e8dce6aaf49e` |
| Previous deployed SHA | `2605b372df829ea77f76c9c334909d54abdec294` (Sprint 28) |
| API tests on main | 2053 (88 spec files) |
| Experience tests on main | 1302 |
| Migrations on main | 44 |
| CI status | 7/7 PASS |

## Workflow Jobs

| Job | Status | Duration |
|-----|--------|----------|
| Validate SHA | ✓ PASS | 4s |
| Build and push images | ✓ PASS | 3m 9s |
| Deploy to EC2 | ✓ PASS | 1m 58s |
| Smoke test | ✓ PASS | 1m 13s |
| Release manifest | ✓ PASS | 3s |

**Overall conclusion: SUCCESS**

## Image URIs Deployed

| Image | Tag |
|-------|-----|
| `psl-one-beta-api` | `d4d8d8c444ae9d40341944f60a10e8dce6aaf49e` |
| `psl-one-beta-api-migrator` | `d4d8d8c444ae9d40341944f60a10e8dce6aaf49e` |
| `psl-one-beta-web` | `d4d8d8c444ae9d40341944f60a10e8dce6aaf49e` |

## SSM Deploy Command

| Field | Value |
|-------|-------|
| Command ID | `3c1e2702-e2b6-425c-b7ee-ad8035154e8a` |
| Instance ID | `i-0a5f16539c9626f90` |
| Poll result | Success at poll 9/60 (~80 seconds) |
| Migration input | `run_migrations=true` |
| Migration result | `success` (set as job output) |

## Rollback Reference

Rollback SHA (previous deploy): `2605b372df829ea77f76c9c334909d54abdec294`

If a rollback is needed: trigger `deploy-beta-ec2.yml` with `git_sha=2605b372df829ea77f76c9c334909d54abdec294` and `confirm=DEPLOY`.

## Sprint Payload Included in This Deploy

| Sprint | Feature | Migration |
|--------|---------|-----------|
| Sprint 32 | AudienceSegment model, POPIA-safe CRUD, ADR-034 | 20260624120000_audience_segment |
| Sprint 33 | ObjectStorageModule, LocalDiskAdapter, S3CompatibleAdapter skeleton, ADR-035 | None |
| Sprint 34 | ApiCacheModule @Global, InMemoryCacheAdapter, @CacheResponse decorator, ADR-036 | None |
| Sprint 35 | ADR-033 CATALOGUE_ONLY commerce, /shop pages, 12 launch/BRD docs | None |

## Safety Boundaries Confirmed

- PSL NOT activated
- Scheduled fixture ingestion NOT enabled
- Fixture import write mode NOT enabled
- PSL fixtures NOT published
- Wallet production NOT enabled
- No real-money functionality
- No sponsor billing/payment
- Fantasy = points-only
- Social prediction = points-only
- Commerce = CATALOGUE_ONLY
