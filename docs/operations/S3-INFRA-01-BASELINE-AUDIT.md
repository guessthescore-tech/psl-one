# S3-INFRA-01 Baseline Infrastructure Audit

**Date:** 2026-06-15  
**Status:** ACCEPTED_BASELINE  
**Scope:** Containerisation, ECR, ECS Fargate and staging deployment preparation  

---

## Git Baseline

| Item | Value |
|------|-------|
| Branch | `main` |
| HEAD | `ea5559164746bc06dd28c2e8cd6f1adedfaa0d25` |
| Upstream | `origin/main` |
| Working tree at audit | Clean |

## Authoritative Deployable Applications

| Workload | Package | Status | Notes |
|----------|---------|--------|-------|
| API | `apps/api` / `@psl-one/api` | ACTIVE | NestJS modular monolith, port `4000` |
| Web | `apps/web` / `@psl-one/web` | ACTIVE | Next.js App Router, port `3001` |

These are the only workloads in scope for S3-INFRA-01.

## Existing Infrastructure Classification

| Path | Classification | Notes |
|------|----------------|-------|
| `docker-compose.yml` | LEGACY_DEVELOPMENT | Local Postgres, Redis, Kafka, Kafka UI, Mailpit. Useful for development, not production-equivalent staging. |
| `compose.yaml` | IMPLEMENTED | Authoritative local container stack for API, web, migration job and PostgreSQL once authored. |
| `.github/workflows/ci.yml` | IMPLEMENTED | Quality gate workflow. |
| `.github/workflows/deploy.yml` | STALE_BEFORE_S3_INFRA_01 | Previously targeted `services/*`; replaced for manual staging deployment authoring. |
| `infra/iam/*.json` | PROPOSED_LEGACY_GUARDRAILS | Sprint 0 policy documents. Not applied by this story. |
| `infra/terraform/` | PROPOSED | Empty scaffolding before S3-INFRA-01; populated with authoring only. |
| `services/identity/Dockerfile` | LEGACY_PROPOSED | Future identity service stub; not active staging workload. |
| `services/*` | FUTURE_STUBS | Not deployed by S3-INFRA-01. |
| `apps/admin`, `apps/club-portal`, `apps/sponsor-portal` | FUTURE_STUBS | Not deployed by S3-INFRA-01. |

## IAM Deny Conflict

`infra/iam/pslone-sprint0-policy.json` contains `DenyECSFargate`, which conflicts with ADR-028 and the approved S3-INFRA-01 ECS Fargate staging target.

Resolution is `APPROVAL_REQUIRED`. S3-INFRA-01 authors a scoped replacement/amendment proposal but does not apply IAM changes.

## Safety Invariants

- STORY-40 remains reserved.
- PSL season remains inactive.
- World Cup 2026 historical data must remain preserved.
- Fantasy, Guess the Score and social prediction remain points-only.
- Fan Value remains non-financial.
- Wallet remains sandbox-only.
- No production providers are enabled.
- No AWS resources are created by this authoring phase.

## AWS Information Still Required

- AWS account ID and confirmation of dedicated staging account or approved shared account.
- Approved region for deployment. `af-south-1` is documented as the proposed/default only.
- VPC, subnet and CIDR approval if Terraform will create networking.
- RDS cost approval and final database sizing.
- GitHub OIDC role ARN and trust policy approval.
- ECR repository naming approval.
- Secrets Manager secret names and values.
- ALB hostname, certificate and DNS decisions.

## Deployment Stop Points

The following remain blocked until a later authorised deployment phase:

- AWS authentication
- `terraform plan`
- `terraform apply`
- ECR login and image push
- ECS migration task execution
- ECS service deployment
- RDS creation
- DNS or certificate changes
