# PSL One — Production Readiness

**Purpose:** What must be completed before production deployment  
**Audience:** Engineers, DevOps, delivery team  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Current State

PSL One is **not production-ready**. It is in beta-development state. No production infrastructure exists.

---

## Production Readiness Checklist

### Infrastructure (Sprint 3)

| Item | Status |
|------|--------|
| AWS account configured | PLANNED |
| VPC and networking | PLANNED |
| ECS Fargate for API | PLANNED |
| ECS Fargate for Web | PLANNED |
| RDS PostgreSQL 16 Multi-AZ | PLANNED |
| CloudFront CDN | PLANNED |
| Route 53 DNS | PLANNED |
| ACM TLS certificates | PLANNED |
| AWS Secrets Manager (JWT, DB) | PLANNED |
| CloudWatch Logs | PLANNED |
| CloudWatch Metrics | PLANNED |
| ALB health checks | PLANNED |
| ECS blue/green deployment | PLANNED |

S3-INFRA-01 authored staging ECS Fargate, ECR, ALB, RDS, Secrets Manager, CloudWatch and GitHub OIDC configuration. It remains `NOT_DEPLOYED`; production infrastructure remains `PLANNED`.

### Security (Sprint 3)

| Item | Status |
|------|--------|
| httpOnly session cookies | PLANNED |
| Token refresh rotation | PLANNED |
| AWS WAF | PLANNED |
| Rate limiting | PLANNED |
| API Gateway throttling | PLANNED |
| CORS locked to production origin | PLANNED |
| Penetration test | PLANNED |
| POPIA compliance audit | COMPLIANCE_REQUIRED |

### CI/CD (Sprint 3)

| Item | Status |
|------|--------|
| GitHub Actions → ECR pipeline | PLANNED |
| Automated test gate in CI | PLANNED |
| Docker images for API and Web | PLANNED |
| Pre-startup migration job | PLANNED |
| Deployment rollback procedure | PLANNED |

S3-INFRA-01 authored these for staging only. Production workflows are intentionally not created.

### Provider Integrations

| Provider | Status |
|---------|--------|
| Football data (live match) | CONTRACT_REQUIRED |
| Notification delivery (email/SMS/push) | PROVIDER_REQUIRED |
| Production wallet | CONTRACT_REQUIRED + COMPLIANCE_REQUIRED |
| Media CDN | PROVIDER_REQUIRED |
| Social OAuth | PROVIDER_REQUIRED |

### Data Readiness

| Item | Status |
|------|--------|
| Official PSL 2026/27 squad data | PENDING (STORY-40) |
| Official PSL 2026/27 fixture schedule | PENDING (STORY-40) |
| Fantasy prices from provisional to official | PENDING (STORY-40) |
| Prediction rules promoted from PROVISIONAL | PENDING (STORY-40) |

### Season Activation

| Item | Status |
|------|--------|
| All 13 readiness checks passing | 12/13 ready (squad_import pending official data) |
| STORY-40 completed | NOT STARTED |
| Activation approval record | APPROVED (dry-run level only) |
| Season activation endpoint | NOT IMPLEMENTED |
| PSL season activated | NO |

---

## What Blocks Production

**Minimum viable production requires all of the following:**

1. Sprint 3 infrastructure (ECS, RDS, CloudFront, Secrets Manager)
2. CI/CD pipeline for apps/api and apps/web
3. STORY-40 (official PSL data)
4. All 13 readiness checks passing
5. Formal season activation
6. At minimum: notification provider (email) and TLS certificates

**What does NOT block production:**
- Kafka (can launch without it — direct calls work)
- Production wallet (can launch with sandbox)
- Football data provider (can launch with admin manual entry)
- Social OAuth (can launch with email/password only)

---

## Observability Requirements (Not Yet Met)

See [Observability Requirements](OBSERVABILITY-REQUIREMENTS.md).

| Requirement | Status |
|------------|--------|
| Structured JSON logging | PLANNED |
| API response time metrics | PLANNED |
| Error rate alerting | PLANNED |
| Database connection pool monitoring | PLANNED |
| Fan count dashboards | PLANNED |
