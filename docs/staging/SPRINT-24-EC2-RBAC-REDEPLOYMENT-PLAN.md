# Sprint 24 — Beta EC2 RBAC Re-deployment Plan

## Objective

Re-deploy the Sprint 23 RBAC fix (`c731c494`) to beta EC2 so that PSL_ADMIN users can access
intended admin endpoints. Sprint 22 confirmed PSL_ADMIN JWT was accepted by `JwtAuthGuard` but
rejected by `RolesGuard` due to `@Roles('ADMIN')` mismatches. Sprint 23 fixed all 5 decorators.
Sprint 24 deploys that fix to the live beta environment and confirms it via authenticated smoke.

## Target Environment

| Field | Value |
|-------|-------|
| Environment | Beta EC2 only |
| Instance | `i-0a5f16539c9626f90` |
| Region | `af-south-1b` |
| Docker network | `psl-one-beta` |
| Internal API base | `http://api:4000` |
| Workflow | `Deploy — Beta EC2` |
| File | `.github/workflows/deploy-beta-ec2.yml` |

## Target SHA

| Field | Value |
|-------|-------|
| SHA | `c731c494d37bda3679e149f869afb63448091b4f` |
| PR | #23 merged 2026-06-23 |
| Branch | main |
| RBAC fix included | YES — `@Roles('ADMIN')` → `@Roles('PSL_ADMIN')` in 3 files |

## Pre-deployment Verification

| Check | Expected |
|-------|---------|
| Target is beta EC2 only | VERIFIED |
| Not production | VERIFIED |
| Not Terraform | VERIFIED |
| Not IAM | VERIFIED |
| Not PSL activation | VERIFIED |
| Not wallet production | VERIFIED |
| Migration count | 42 (unchanged from Sprint 23) |
| SHA is on origin/main | VERIFIED |

## Deployment Parameters

| Parameter | Value |
|-----------|-------|
| `git_sha` | `c731c494d37bda3679e149f869afb63448091b4f` |
| `run_migrations` | `true` |
| `confirm` | `DEPLOY` |

## Post-deployment Verification

After deployment, before authenticated smoke:

- [ ] API readiness endpoint returns healthy
- [ ] Migration count is 42
- [ ] PSL season is INACTIVE
- [ ] WC2026 season is ACTIVE
- [ ] No `@Cron` ingestion enabled
- [ ] Wallet adapter is sandbox

## RBAC Behaviour Change Expected

| Scenario | Before Sprint 23 | After Sprint 24 |
|----------|-----------------|-----------------|
| PSL_ADMIN → admin route | 403 (incorrect) | Non-403 (correct) |
| FAN → admin route | 403 | 403 (unchanged) |
| No token → admin route | 401 | 401 (unchanged) |

## Safety State

- PSL: INACTIVE (unchanged)
- WC2026: ACTIVE (unchanged)
- Wallet: SANDBOX (unchanged)
- Scheduled ingestion: DISABLED (unchanged)
- Production ingestion: DISABLED (unchanged)
- Real-money functionality: NONE (unchanged)
- Fixture publishing: separate from PSL activation (unchanged)
