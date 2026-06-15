# PSL One — Environment Strategy

**Purpose:** Environment definitions, promotion paths, and configuration management  
**Audience:** Engineers, DevOps  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Current State

As of STORY-39, only one environment exists: **local development**. No staging, no production.

| Environment | Status | Location |
|------------|--------|---------|
| Local development | ACTIVE | Developer machine |
| Staging | IMPLEMENTATION_AUTHORED / NOT_DEPLOYED | AWS region configurable; `af-south-1` proposed default |
| Production | PLANNED | AWS af-south-1 (Sprint 3) |

---

## Local Development

- **API:** `http://localhost:4000`
- **Web:** `http://localhost:3001`
- **Database:** `psl_identity_dev` on `localhost:5432` (Docker)
- **Redis:** `localhost:6379` (Docker, not yet used by app)
- **Kafka:** `localhost:9092` (Docker, not yet used by app)
- **Mailpit:** `http://localhost:8025` (SMTP trap)
- **Kafka UI:** `http://localhost:8080`

### Environment Files

```
apps/api/.env          (not committed — copy from .env.example)
apps/web/.env.local    (not committed — copy from .env.local.example)
```

---

## Planned Environment Strategy

### Staging (IMPLEMENTATION_AUTHORED — NOT DEPLOYED)

- Mirrors production infrastructure at reduced scale
- Used for integration testing before production deployment
- Separate database — not shared with production
- `NEXT_PUBLIC_API_BASE_URL=https://api.staging.pslone.co.za` supplied as a web Docker build argument before `next build`
- ECS Fargate for `apps/api` and `apps/web`
- Private RDS PostgreSQL through Secrets Manager
- ALB-based initial staging entry point
- Public ALB hostnames are configurable; proposed defaults are `api.staging.pslone.co.za` and `staging.pslone.co.za`
- Private app subnet egress uses configurable NAT gateway count, defaulting to 1 for cost-conscious staging
- GitHub OIDC trust is restricted to the `staging` GitHub Environment
- CloudFront optional after initial staging
- Requires AWS identity, region, cost and Terraform-plan review before resource creation

### Production (PLANNED)

- AWS af-south-1 (Cape Town)
- ECS Fargate for API and Web
- RDS PostgreSQL 16 Multi-AZ
- CloudFront CDN
- `NEXT_PUBLIC_API_BASE_URL=https://api.pslone.co.za`

---

## Environment Variables

### API Required Variables

| Variable | Description | Example |
|---------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | JWT signing secret | Random 256-bit key |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |

### API Optional Variables (Planned)

| Variable | Description |
|---------|-------------|
| `WALLET_PROVIDER` | `sandbox` or `production` |
| `WALLET_PROVIDER_API_KEY` | Production wallet API key |
| `LIVE_DATA_PROVIDER` | Football data provider selection |

### Web Required Variables

| Variable | Description | Example |
|---------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Public API base URL; build-time for Next.js public browser config | `http://localhost:4000` |

---

## Configuration Promotion Rules

1. All configuration changes go through code review
2. Production secrets come from AWS Secrets Manager — never from code or env files
3. Environment-specific values are in environment variables only — never hardcoded
4. No development configuration in production code paths

---

## Database Per Environment

Each environment has its own isolated database. **Never share databases between environments.**

| Environment | Database |
|------------|---------|
| Local | `psl_identity_dev` |
| Staging (planned) | `psl_identity_staging` |
| Production (planned) | `psl_identity_prod` |

Migrations run independently per environment via `prisma migrate deploy`.
