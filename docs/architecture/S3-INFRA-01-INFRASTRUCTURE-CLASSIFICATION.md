# S3-INFRA-01 Infrastructure Classification

**Status:** IMPLEMENTED_AS_DOCUMENTATION  
**Last updated:** 2026-06-15  

---

## Active

| Component | Path | Notes |
|-----------|------|-------|
| API workload | `apps/api` | Authoritative NestJS modular monolith. |
| Web workload | `apps/web` | Authoritative Next.js application. |
| CI quality gate | `.github/workflows/ci.yml` | Local/test/build validation. |

## Implemented But Not Deployed

| Component | Path | Notes |
|-----------|------|-------|
| API image definition | `apps/api/Dockerfile` | TOOL_REQUIRED: Docker not available in this remediation pass; no ECR push approved. |
| Web image definition | `apps/web/Dockerfile` | TOOL_REQUIRED: Docker not available in this remediation pass; no ECR push approved. |
| Production-equivalent local Compose | `compose.yaml` | Configuration review required before starting stack. |
| Terraform staging authoring | `infra/terraform/environments/staging` | `terraform plan/apply` blocked pending approval. |
| GitHub staging deploy workflow | `.github/workflows/deploy.yml` | Manual workflow only; AWS OIDC requires approved role. |

## Legacy Or Development Scaffolding

| Component | Path | Notes |
|-----------|------|-------|
| Local dev Compose | `docker-compose.yml` | Retained for developer Postgres/Redis/Kafka/Mailpit. Not a staging stack. |
| Microservice stubs | `services/*` | Future extraction scaffolding, not active staging workloads. |
| Identity Dockerfile | `services/identity/Dockerfile` | Legacy proposed service image, not used by S3-INFRA-01. |
| Kafka client | `packages/kafka-client` | Scaffold only; ADR-027 defers Kafka. |

## Proposed Or Approval Required

| Component | Path | Status |
|-----------|------|--------|
| IAM replacement/amendment | `infra/iam/pslone-s3-infra-01-staging-ecs-policy.json` | APPROVAL_REQUIRED |
| RDS module | `infra/terraform/modules/rds-postgres` | NOT_DEPLOYED |
| Optional CloudFront module | `infra/terraform/modules/cloudfront` | PLANNED_AFTER_INITIAL_STAGING |
| GitHub OIDC module | `infra/terraform/modules/github-oidc` | NOT_DEPLOYED |

## Out Of Scope

- Production environment Terraform
- DNS changes
- Certificate provisioning
- MSK/Kafka
- ElastiCache/Redis as a mandatory dependency
- CodeDeploy blue/green
- STORY-40 data finalisation
- PSL activation
