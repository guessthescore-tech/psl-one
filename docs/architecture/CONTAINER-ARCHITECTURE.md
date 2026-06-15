# PSL One — Container Architecture

**Purpose:** Local and planned production container configuration  
**Audience:** Engineers, DevOps  
**Status:** Current as of S3-INFRA-01 authoring
**Last verified:** 2026-06-15

---

## Local Development Containers

`docker-compose.yml` at repo root defines:

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `postgres` | `postgres:16` | 5432 | Primary database |
| `redis` | `redis:7` | 6379 | Cache / session (planned) |
| `kafka` | `confluentinc/cp-kafka` | 9092 | Event bus (wired in compose, not yet used by app) |
| `kafka-ui` | `provectuslabs/kafka-ui` | 8080 | Kafka management UI |
| `mailpit` | `axllent/mailpit` | 1025/8025 | Local SMTP trap for email testing |

Start all services:

```bash
docker compose up -d
```

The NestJS API and Next.js web are run as local processes (not in Docker for development).

---

## Application Processes

| Process | Command | Port |
|---------|---------|------|
| NestJS API | `pnpm --filter @psl-one/api dev` | 4000 |
| Next.js Web | `pnpm --filter @psl-one/web dev` | 3001 |

Both can be started together:

```bash
pnpm dev  # runs Turbo dev pipeline
```

---

## Environment Variables

Required in `apps/api/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/psl_identity_dev
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
```

Required in `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Neither `.env` file is committed. `.env.example` files document required variables.

---

## Staging Container Architecture (AUTHORED — NOT DEPLOYED)

No AWS infrastructure has been created by S3-INFRA-01. The authored staging target is:

| Component | AWS Service | Notes |
|-----------|-------------|-------|
| API container | ECS Fargate | NestJS image built from `apps/api/Dockerfile` |
| Web container | ECS Fargate | Next.js standalone image built from `apps/web/Dockerfile` |
| Database | RDS PostgreSQL 16 | Private, encrypted, not publicly accessible; creation approval required |
| Load balancer | ALB | Initial staging entry point and health checks |
| Private egress | NAT gateway | `nat_gateway_count = 1` by default; configurable for higher availability or later VPC endpoint design |
| CDN | CloudFront | Optional; `PLANNED_AFTER_INITIAL_STAGING` |
| DNS | Route 53 or external DNS | Not changed by S3-INFRA-01 |
| TLS | ACM | Certificate ARN supplied later; not provisioned by this story |
| Secrets | AWS Secrets Manager | Secret references only; no values committed |
| Logging | CloudWatch Logs | Log groups authored in Terraform |
| Metrics | CloudWatch Metrics | Log groups authored in Terraform; CloudWatch alarms not yet authored (planned Sprint 3) |
| Region | Configurable | `af-south-1` is the documented proposed/default, not confirmed |

---

## CI/CD (Planned)

Current S3-INFRA-01 CI/CD authoring:

Pipeline:

```
Pull request
  → GitHub Actions quality gate
  → Docker image build and scan
  → No AWS credentials, no push

Manual staging deployment
  → GitHub Actions OIDC role assumption
  → Build Docker image for apps/api
  → Build Docker image for apps/web
  → Push immutable Git SHA tags to ECR
  → Record image digests in release manifest
  → Run one-off migration task
  → Roll API with ECS circuit breaker
  → Check API readiness at /health/ready
  → Roll web with ECS circuit breaker
  → Run smoke tests
```

The web image receives `NEXT_PUBLIC_API_BASE_URL` as a Docker build argument before `next build`; runtime environment variables cannot repair a missing Next.js public build-time value. The manual staging workflow verifies that a staging web bundle does not contain the local `http://localhost:4000` fallback.

---

## Database Migration in Production (PLANNED)

For production deployments:

1. Run `prisma migrate deploy` as a pre-startup task (not in the app startup)
2. Use ECS Task for migration, separate from the main service
3. Wait for migration task to succeed before starting new app containers
4. Never run `prisma db push` in production — migrations only

---

## Redis (DEFERRED)

Redis is running in the legacy local `docker-compose.yml` but is not required by the authored staging stack. Distributed rate limiting must be revisited before scaling authentication traffic horizontally.

- Session cache (httpOnly cookie + Redis session store)
- Rate limiting counters
- Notification queue buffer

---

## Kafka (DEFERRED)

Kafka broker and kafka-ui are in the legacy local `docker-compose.yml` but no producers or consumers are wired into the active app. ADR-027 defers Kafka/MSK until measured triggers are met.
