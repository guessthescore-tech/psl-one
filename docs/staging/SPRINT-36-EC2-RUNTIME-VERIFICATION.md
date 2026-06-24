# Sprint 36 — Beta EC2 Runtime Verification

**Date:** 2026-06-24  
**Deployment run:** `28097344936`  
**Deployed SHA:** `d4d8d8c444ae9d40341944f60a10e8dce6aaf49e`

## Infrastructure

| Component | Value |
|-----------|-------|
| Instance ID | `i-0a5f16539c9626f90` |
| Region | `af-south-1` |
| AZ | `af-south-1b` |
| Public IP | `16.28.84.11` |
| SSM status | Online |

## Image Tags Verified

All three images deployed with full-SHA immutable tag `d4d8d8c444ae9d40341944f60a10e8dce6aaf49e` via IMMUTABLE ECR repositories:

- `844513166932.dkr.ecr.af-south-1.amazonaws.com/psl-one-beta-api:d4d8d8c...`
- `844513166932.dkr.ecr.af-south-1.amazonaws.com/psl-one-beta-api-migrator:d4d8d8c...`
- `844513166932.dkr.ecr.af-south-1.amazonaws.com/psl-one-beta-web:d4d8d8c...`

## SSM Parameters Updated

| Parameter | Version After Deploy |
|-----------|---------------------|
| `/psl-one/beta/git-sha` | v22 |
| `/psl-one/beta/api-image-uri` | v21 |
| `/psl-one/beta/migration-image-uri` | v21 |
| `/psl-one/beta/web-image-uri` | v21 |

## Migration Runtime

| Check | Result |
|-------|--------|
| `run_migrations` input | `true` |
| Migration container ran | Yes (docker compose run --rm migrate) |
| Migration result | `success` (SSM command output) |
| Migration aborts deploy on failure | Yes (no `|| true`) |
| Total migrations on schema | 44 |
| New migration in this deploy | `20260624120000_audience_segment` (Sprint 32) |

## DB Schema State (post-deploy)

Tables confirmed present per schema/migration history:

| Table | Sprint | Status |
|-------|--------|--------|
| `audience_segments` | Sprint 32 | NEW — applied in this deploy |
| `club_memberships` | Sprint 28 | Existing |
| `sponsor_memberships` | Sprint 28 | Existing |
| `media_assets` | Sprint 37 | Existing |
| `integration_provider_configs` | Sprint 32 (ops) | Existing |

## New Module Runtime State

| Module | Adapter Active | Notes |
|--------|---------------|-------|
| ObjectStorageModule | `LocalDiskAdapter` | OBJECT_STORAGE_ADAPTER not set → local |
| ApiCacheModule | `InMemoryCacheAdapter` | @Global, TTL-based |

## PSL Safety State (Confirmed by Smoke)

| Check | Result |
|-------|--------|
| PSL season exists | Yes |
| PSL season is INACTIVE | PASS |
| PSL activation status | NOT ACTIVATED |
| WC2026 season preserved | PASS |
| Commerce status | CATALOGUE_ONLY |
