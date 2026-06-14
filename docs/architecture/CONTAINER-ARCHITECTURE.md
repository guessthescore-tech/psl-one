# PSL One — Container Architecture

**Purpose:** Local and planned production container configuration  
**Audience:** Engineers, DevOps  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

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

## Production Architecture (PLANNED — Sprint 3)

No production infrastructure exists yet. Planned:

| Component | AWS Service | Notes |
|-----------|-------------|-------|
| API container | ECS Fargate | NestJS image built from `apps/api/Dockerfile` (to be created) |
| Web container | ECS Fargate or Lambda@Edge | Next.js image or static export |
| Database | RDS PostgreSQL 16 Multi-AZ | Managed, automated backups |
| Load balancer | ALB | HTTPS termination, health checks |
| CDN | CloudFront | Static assets, Next.js origin |
| DNS | Route 53 | pslone.co.za domain |
| TLS | ACM | Certificate for CloudFront and ALB |
| Secrets | AWS Secrets Manager | JWT_SECRET, DATABASE_URL |
| Logging | CloudWatch Logs | Structured JSON logs from NestJS |
| Metrics | CloudWatch Metrics | Custom app metrics |
| Region | af-south-1 (Cape Town) | Low latency for South African fans |

---

## CI/CD (Planned)

Current CI: `.github/workflows/deploy.yml` — references old microservices directory (`services/`), stale. Needs Sprint 3 update.

Planned pipeline:

```
Push to main
  → GitHub Actions build & test
  → Build Docker image for apps/api
  → Build Docker image for apps/web
  → Push to ECR
  → ECS service update (blue/green or rolling)
  → Health check confirmation
  → Notify
```

---

## Database Migration in Production (PLANNED)

For production deployments:

1. Run `prisma migrate deploy` as a pre-startup task (not in the app startup)
2. Use ECS Task for migration, separate from the main service
3. Wait for migration task to succeed before starting new app containers
4. Never run `prisma db push` in production — migrations only

---

## Redis (PLANNED)

Redis is running locally via Docker Compose but not yet used by the application. Planned uses:

- Session cache (httpOnly cookie + Redis session store)
- Rate limiting counters
- Notification queue buffer

---

## Kafka (DECISION_REQUIRED)

Kafka broker and kafka-ui are in docker-compose.yml but no producers or consumers are implemented in the application. Requires load justification before wiring. See [Event and Side Effects](EVENT-AND-SIDE-EFFECTS.md).
