# S3-INFRA-01 Staging Implementation Guide

**Status:** IMPLEMENTED / NOT_DEPLOYED  
**Last updated:** 2026-06-15  

---

## Runtime Architecture

S3-INFRA-01 authors a staging runtime for:

- `apps/api` on ECS Fargate
- `apps/web` on ECS Fargate
- one-off API migration task running `prisma migrate deploy`
- private ECR repositories
- Application Load Balancer
- private PostgreSQL through RDS
- Secrets Manager references
- CloudWatch log groups
- GitHub Actions OIDC

No AWS resource has been created by this story.

## Deployment Order

1. Build API, API migrator and web images.
2. Push immutable full-Git-SHA tags to ECR.
3. Record ECR image digests in `release-manifest.json`.
4. Register a new migration task definition revision.
5. Run the one-off migration task.
6. Stop if migration exits non-zero.
7. Register and roll the API task definition.
8. Wait for ECS API service stability.
9. Check API readiness at `/health/ready`.
10. Register and roll the web task definition.
11. Wait for ECS web service stability.
12. Check web readiness at `/api/health`.
13. Run the read-only staging smoke script.
14. Upload the release manifest artifact.

The workflow does not deploy production and does not use `latest`.

Container vulnerability scanning uses `aquasecurity/trivy-action@0.33.1`; mutable branch references are not used.

ALB routing is host-based:

- `api.staging.pslone.co.za` routes to the API target group by default.
- `staging.pslone.co.za` routes to the web target group by default.
- Both hostname lists are Terraform variables and require DNS approval before use.

## Migration Task

The migration task command is:

```bash
node_modules/.bin/prisma migrate deploy --schema apps/api/prisma/schema.prisma
```

It must never:

- run `prisma migrate reset`
- run `prisma db push`
- run seed
- call providers
- activate a season
- log credentials

## Rollback

ECS services use rolling deployments with:

- deployment circuit breaker enabled
- automatic rollback enabled
- previous task definition revisions retained
- image digest recorded in the release manifest

Manual rollback, when authorised, is to update the affected ECS service to the previous task definition revision and verify health checks. CodeDeploy blue/green is deferred as a future option.

## Secrets Strategy

Secrets are referenced from AWS Secrets Manager. The repository contains only secret names and ARN references.

Expected staging secret bundles:

| Secret | Required keys |
|--------|---------------|
| `psl-one/staging/api/runtime` | `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGINS` |

`NEXT_PUBLIC_API_BASE_URL` is public browser configuration and is supplied as a Docker build argument for the web image. It is not stored in Secrets Manager, and a staging build verification rejects bundles containing the local `http://localhost:4000` fallback.

No `.env`, `.tfvars`, Terraform state, database password or provider credential should be committed.

## RDS Strategy

The RDS module is authored but gated:

- `create_rds = false` by default
- private database subnets
- `publicly_accessible = false`
- encrypted storage
- RDS-managed master password in Secrets Manager
- access only from API and migration task security groups
- configurable engine version, class, storage, backup retention and Multi-AZ
- no password output
- no automatic seed
- no destructive migration

RDS creation remains `APPROVAL_REQUIRED`.

## CloudFront Status

CloudFront is optional and marked `PLANNED_AFTER_INITIAL_STAGING`. Initial staging is ALB-based. CloudFront should not block first staging validation unless custom-domain and certificate prerequisites are separately approved.

## Redis And Kafka

Redis and Kafka remain development scaffolding only. They are not mandatory staging dependencies. Distributed rate limiting must be revisited before horizontally scaling authentication-heavy traffic.

## Cost Baseline

Cost-producing resources authored for staging include:

- ECS Fargate tasks for API and web
- ALB
- one NAT gateway by default for private-subnet egress
- ECR storage
- CloudWatch logs
- optional RDS PostgreSQL
- optional CloudFront

Cost controls:

- one desired task per service by default
- `nat_gateway_count = 1` by default for cost-conscious staging; increase to the AZ count for higher egress availability or replace with VPC endpoints after review
- 30-day log retention
- ECR lifecycle policy retaining 30 images
- CloudFront disabled by default
- RDS disabled by default

Cost review is required before `terraform plan`.

## Required Configuration Before Terraform Plan

- AWS account ID and account model approval
- region approval; `af-south-1` is only the proposed/default
- staging CIDR approval
- secret names and required secret values created through an authorised process
- immutable image URIs for API, web and migrator
- GitHub owner/repository values
- approved GitHub OIDC provider choice: create a provider or reuse an existing provider ARN
- approved staging hostnames for ALB host-based routing
- approved staging API public base URL for the web build
- RDS approval or explicit `create_rds = false`
- ALB ingress CIDR approval
- CloudFront decision
- state backend bucket and lock table decision

## Required Configuration Before Terraform Apply

- reviewed Terraform plan
- cost approval
- approved AWS identity from `aws sts get-caller-identity`
- approved region
- approved IAM amendment replacing the Sprint 0 `DenyECSFargate` conflict
- Secrets Manager values present
- rollback owner identified
- staging smoke-test owner identified

## Validation State Terms

| Term | Meaning |
|------|---------|
| IMPLEMENTED | File or code exists in the repository. |
| VALIDATED | Local validation command passed. |
| NOT_RUN | Validation was not run. |
| CONFIGURATION_REQUIRED | Values or external configuration are missing. |
| APPROVAL_REQUIRED | Human approval is required before execution. |
| NOT_DEPLOYED | No AWS resource creation or deployment occurred. |
| TOOL_REQUIRED | Tooling is unavailable locally, so validation must run in an environment with that tool. |
| STATIC_REVIEW_ONLY | Files were reviewed manually without Terraform execution. |

## Current Validation Status

| Check | Status | Notes |
|-------|--------|-------|
| Docker build | NOT_RUN | Docker validation must run where Docker is available. |
| Compose render | NOT_RUN | `docker compose config` has not been run in this remediation pass. |
| Terraform fmt/validate | NOT_RUN | Terraform tooling must run before plan. |
| Terraform static review | STATIC_REVIEW_ONLY | Optional RDS, optional CloudFront, ECR repository count, host-based ALB routing, private subnet NAT egress, and OIDC trust were reviewed from source. OIDC variables have defaults (guessthescore-tech/psl-one, staging) with non-empty validation guards. |
| Staging smoke tests | AUTHORED / NOT_RUN | `scripts/smoke/staging-smoke.mjs` exists and is wired into manual staging deployment; no staging endpoint was called. |
| AWS resources | NOT_DEPLOYED | No AWS commands were run and no resource creation occurred. |
