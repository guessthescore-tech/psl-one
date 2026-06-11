# PSL One — Revised Sprint 0: Bootstrap Execution Plan

**Version:** 2.0 (Bootstrap)  
**Date:** 2026-06-08  
**Replaces:** `sprint-0-execution-plan.md` v1.0  
**Authority:** Programme Director + Architecture Review Board  
**Status:** APPROVED FOR IMMEDIATE EXECUTION

---

## Sprint 0 Objective (Revised)

**Original Sprint 0** targeted 15 microservices, MSK Serverless, Aurora, ECS Fargate, and a full Terraform module library. This was over-engineered for a pre-funding team.

**Revised Sprint 0** targets a single deployable, testable, demo-ready platform foundation:

> At the end of Sprint 0, any agent can receive a feature work package, build it against the monolith, and have it reviewed, tested, and deployed to a live URL within hours.

Sprint 0 is done when:
1. `docker-compose up` starts a full local dev stack in < 60 seconds
2. The NestJS monolith deploys to EC2 and returns a green health check
3. The Next.js app is deployed to Vercel and loads at a public URL
4. RDS PostgreSQL is live, all domain schemas exist, migrations run clean
5. A real fan can register, receive a verification email, and log in
6. GitHub Actions CI runs on every PR and blocks merge on failure

---

## Sprint 0 Duration

**1 week: 2026-06-09 → 2026-06-15**

This is half the original timeline because we are not building 15 microservices. One monolith, one database, one deployment target.

---

## Workstreams

### Workstream A — Infrastructure (DevOps Agent)

**Owner:** DevOps Agent  
**Duration:** Days 1–4

#### A1: AWS Account Setup

- [ ] Verify AWS free tier eligibility (run cost query in `bootstrap-cost-model.md`)
- [ ] Configure AWS Budget alert at $80/month threshold
- [ ] Create S3 bucket for Terraform state (used later) — `psl-one-terraform-state`
- [ ] Enable CloudTrail in the account (1 trail, free tier)

#### A2: Terraform Bootstrap

Create `infra/terraform/bootstrap/` with:

```
infra/terraform/bootstrap/
  main.tf         ← All resources
  variables.tf    ← region, environment, key_name, db_password
  outputs.tf      ← ec2_public_ip, rds_endpoint, s3_media_bucket
  user_data.sh    ← EC2 bootstrap script (Docker, docker-compose, nginx, certbot)
  .gitignore      ← *.tfstate, *.tfstate.backup, .terraform/
```

**Resources in `main.tf`:**
- Default VPC (use existing, no new VPC)
- Security Group: `psl-api-sg` — inbound 80, 443 from anywhere; outbound all
- Security Group: `psl-rds-sg` — inbound 5432 from `psl-api-sg` only
- EC2 t2.micro — Amazon Linux 2023, key pair, `psl-api-sg`, user_data
- RDS db.t3.micro — PostgreSQL 16, `psl-rds-sg`, `max_allocated_storage=20`, no multi-AZ
- S3 bucket — `psl-one-media-${var.environment}`, versioning disabled
- IAM instance profile — EC2 → S3 GetObject/PutObject on media bucket, SES SendEmail, Secrets Manager GetSecretValue

**EC2 user_data.sh installs:**
- Docker Engine (latest)
- Docker Compose v2
- Nginx
- Certbot (Let's Encrypt)
- AWS CLI v2
- Sets up `/opt/psl-one/` deployment directory

#### A3: EC2 Application Setup (after Terraform apply)

- [ ] SSH in, verify Docker and Docker Compose are running
- [ ] Configure Nginx reverse proxy config for `api.pslone.co.za`
- [ ] Run `certbot --nginx -d api.pslone.co.za` (requires DNS A record pointing to EC2 IP)
- [ ] Create `/opt/psl-one/.env` from template (do not commit — Secrets Manager for prod values)
- [ ] Pull and run NestJS Docker image (manual for Day 1; automated from Day 2 via Actions)

#### A4: GitHub Actions

**`.github/workflows/ci.yml`** (already exists — verify and update):
- [ ] Change `--filter=...[origin/main]` Turborepo filter to `--filter=api...` (only the monolith)
- [ ] Add: `pnpm turbo run test --filter=api`
- [ ] Add: PostgreSQL service container for integration tests
- [ ] Verify: branch protection rule on `main` blocks merge without CI pass

**`.github/workflows/deploy.yml`** (update existing):
- [ ] On push to `main`: build Docker image → push to ECR → SSH to EC2 → `docker compose pull && docker compose up -d api`
- [ ] Secrets required: `EC2_SSH_KEY`, `EC2_HOST`, `AWS_ROLE_TO_ASSUME`, `ECR_REGISTRY`
- [ ] Health check after deploy: `curl https://api.pslone.co.za/health` → assert 200

#### A5: Vercel Deployment

- [ ] Connect `apps/web` to Vercel via GitHub integration
- [ ] Set environment variable: `NEXT_PUBLIC_API_URL=https://api.pslone.co.za`
- [ ] Verify preview deployment URL appears on every PR
- [ ] Connect domain `pslone.co.za` → Vercel production deployment (CNAME)

**Definition of Done — Workstream A:**
- [ ] `terraform plan` runs clean with no errors
- [ ] `terraform apply` completes in dev environment
- [ ] EC2 instance is running, health check returns 200
- [ ] RDS instance is running, reachable from EC2
- [ ] Vercel deployment is live at public URL
- [ ] GitHub Actions CI blocks a PR with a failing test
- [ ] GitHub Actions deploy updates the EC2 application on push to `main`

---

### Workstream B — Monolith Scaffold (Platform Agent)

**Owner:** Platform Agent  
**Duration:** Days 1–5  
**Depends on:** A2 (needs DATABASE_URL from Terraform outputs)

#### B1: Create `services/api/` Monolith

Create the NestJS monolith at `services/api/`. This is the single backend service for all of Phase 1.

**Package structure:**
```
services/api/
  package.json         ← name: @psl-one/api
  tsconfig.json        ← extends ../../tsconfig.base.json
  Dockerfile           ← multi-stage build
  nest-cli.json
  src/
    main.ts            ← FastifyAdapter, port 3000, ValidationPipe
    app.module.ts      ← imports all domain modules
    modules/
      identity/
      fan/
      football/
      fantasy/
      gts/
      loyalty/
      wallet/
      content/
      notifications/
      admin/
      outbox/
      health/
  test/
  prisma/
    schema.prisma      ← multi-schema
    migrations/
```

**Key scaffold rules:**
- Each module has: `<name>.module.ts`, `<name>.service.ts`, `<name>.controller.ts`, `<name>.resolver.ts`, `<name>.events.ts`
- No module imports another module's `Service` — only via `EventEmitter2` or interface
- `app.module.ts` configures: `ConfigModule.forRoot(isGlobal:true)`, `EventEmitterModule.forRoot()`, `GraphQLModule.forRoot()`

#### B2: Prisma Multi-Schema

`services/api/prisma/schema.prisma`:

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = [
    "identity", "fan", "football", "fantasy", 
    "gts", "loyalty", "wallet", "content",
    "notifications", "outbox", "audit"
  ]
}
```

Each domain agent writes their own models into this schema (marked with `@@schema("domain")`).

**Sprint 0 minimum models (scaffold only — agents fill in fields):**

Each domain needs at minimum:
- A primary entity (e.g., `User`, `Fixture`, `Squad`)
- The `OutboxEvent` model in `outbox` schema
- The `AuditLog` model in `audit` schema

The `outbox.OutboxEvent` and `audit.AuditLog` models are shared infrastructure and must be written in Sprint 0:

```prisma
model OutboxEvent {
  id            String    @id @default(uuid()) @db.Uuid
  topic         String
  payload       Json
  status        OutboxEventStatus @default(PENDING)
  attempts      Int       @default(0)
  errorMessage  String?
  createdAt     DateTime  @default(now())
  publishedAt   DateTime?

  @@index([status, attempts])
  @@index([createdAt])
  @@schema("outbox")
}

enum OutboxEventStatus {
  PENDING
  PUBLISHED
  FAILED
  DEAD
  @@schema("outbox")
}

model AuditLog {
  id             String   @id @default(uuid()) @db.Uuid
  timestamp      DateTime @default(now())
  userId         String?  @db.Uuid
  tenantId       String?  @db.Uuid
  action         String
  resourceType   String
  resourceId     String?
  changes        Json?
  ipAddress      String?
  correlationId  String?  @db.Uuid

  @@index([userId])
  @@index([resourceType, resourceId])
  @@index([timestamp])
  @@schema("audit")
}
```

#### B3: Outbox Worker

`services/api/src/modules/outbox/outbox.worker.ts`:

- NestJS `@Injectable()` service with `@Cron('*/5 * * * * *')` (every 5 seconds)
- Queries `OutboxEvent WHERE status=PENDING AND attempts < 5 LIMIT 100`
- For each event: `EventEmitter2.emit(event.topic, event.payload)`
- Updates: `status=PUBLISHED, publishedAt=NOW()` on success
- Updates: `status=FAILED, attempts++, errorMessage` on failure
- After 5 attempts: `status=DEAD` + log at ERROR level (alert will fire)

#### B4: Auth Guard Integration

Wire `packages/auth-guards` into the monolith:
- `JwtAuthGuard` applied globally (except health endpoints and auth routes)
- `RolesGuard` applied on controllers requiring RBAC
- `@CurrentUser()` decorator available in all controllers/resolvers

#### B5: Health Module

`GET /health` → `{ status: 'ok', service: 'psl-api', version: '0.1.0', timestamp }`  
`GET /health/ready` → checks DB connection → `{ status: 'ok' | 'error', db: 'connected' | 'disconnected' }`

**Definition of Done — Workstream B:**
- [ ] `docker-compose up` starts full local stack in < 60 seconds
- [ ] `pnpm prisma migrate deploy` runs all migrations without error
- [ ] `GET /health` returns 200
- [ ] `GET /health/ready` returns 200 with DB connected
- [ ] All 11 domain schema namespaces exist in the database
- [ ] OutboxWorker starts, polls every 5 seconds, logs "outbox: 0 pending events"
- [ ] Auth guard rejects unauthenticated requests to protected routes
- [ ] Vitest runs with > 0 tests passing (even just the health check test)

---

### Workstream C — Cognito & Identity (Identity Agent)

**Owner:** Identity Agent  
**Duration:** Days 2–5  
**Depends on:** B1 (monolith exists), A2 (infrastructure exists)

#### C1: Cognito User Pool Setup

Create via AWS CLI (not Terraform for now — keeps bootstrap simple):

```bash
# User Pool
aws cognito-idp create-user-pool \
  --pool-name psl-one-users-dev \
  --region af-south-1 \
  --policies '{"PasswordPolicy":{"MinimumLength":8,"RequireUppercase":true,...}}' \
  --auto-verified-attributes email \
  --username-attributes email

# App Client (for server-side auth)
aws cognito-idp create-user-pool-client \
  --user-pool-id <POOL_ID> \
  --client-name psl-one-api \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --no-generate-secret
```

Output: `COGNITO_USER_POOL_ID` and `COGNITO_CLIENT_ID` → add to `.env` and GitHub Secrets.

#### C2: Registration Endpoint

`POST /api/v1/auth/register`:
1. Validate input (Zod)
2. `adminCreateUser` in Cognito
3. Prisma transaction: `identity.User` + `identity.ConsentRecord` + `outbox.OutboxEvent`
4. Return `{ userId, message: 'Check your email for verification' }`

#### C3: Login Endpoint

`POST /api/v1/auth/login`:
1. `initiateAuth` with `USER_PASSWORD_AUTH` flow
2. Return access token + refresh token (httpOnly cookie, SameSite=Lax — per ARB-001 finding 010-B)

#### C4: Token Refresh + Logout

`POST /api/v1/auth/refresh` — use refresh token cookie to get new access token  
`POST /api/v1/auth/logout` — clear refresh token cookie

**Definition of Done — Workstream C:**
- [ ] Fan can register via API, record appears in DB and Cognito
- [ ] Fan receives Cognito verification email
- [ ] Fan can log in with verified email + password → receives JWT
- [ ] JWT is valid and accepted by `JwtAuthGuard`
- [ ] Refresh token is in an httpOnly cookie
- [ ] `ConsentRecord` is written on registration
- [ ] `OutboxEvent` with topic `identity.user.registered` is written on registration
- [ ] POPIA endpoints scaffolded: `GET /api/v1/me/data`, `POST /api/v1/me/consent`, `DELETE /api/v1/me/account`

---

## Sprint 0 Deliverables Checklist

### Superseded from Sprint 0 v1.0

The following items from the original Sprint 0 are **deferred to post-funding Phase 2**:

| Original Item | Status | Reason |
|---|---|---|
| MSK Serverless Terraform module | DEFERRED | No MSK in bootstrap |
| Aurora Serverless v2 Terraform module | DEFERRED | RDS free tier used |
| ECS Fargate cluster Terraform module | DEFERRED | EC2 + Docker used |
| ElastiCache Terraform module | DEFERRED | No Redis in bootstrap |
| CloudFront + API Gateway module | DEFERRED | Vercel used for frontend |
| WAF module | DEFERRED | Added before first public load test |
| 15 service scaffold | DEFERRED | Monolith with modules instead |
| Apollo Router setup | DEFERRED | Monolith IS the gateway |
| Pact Broker | DEFERRED | No Kafka to contract-test |
| Per-service Dockerfiles (14 services) | DEFERRED | One Dockerfile for monolith |

### Active Sprint 0 Deliverables

| # | Deliverable | Owner | Done When |
|---|---|---|---|
| D1 | ADR-011 Bootstrap Architecture | ARB | ✅ Written |
| D2 | Bootstrap Cost Model | ARB | ✅ Written |
| D3 | Migration Path document | ARB | ✅ Written |
| D4 | Revised Sprint 0 Plan | ARB | ✅ This document |
| D5 | Infrastructure Bootstrap (Terraform) | DevOps | EC2 + RDS live |
| D6 | GitHub Actions CI/CD | DevOps | PR blocks on fail; deploy on merge |
| D7 | Vercel deployment | DevOps | `apps/web` live at URL |
| D8 | NestJS monolith scaffold | Platform | Health check live |
| D9 | Prisma multi-schema + migrations | Platform | All schemas exist |
| D10 | Outbox Worker | Platform | Polls every 5s |
| D11 | Cognito User Pool | Identity | Dev pool live |
| D12 | Register + Login endpoints | Identity | Fan can auth |
| D13 | GitHub Issues created | Programme | Issues in backlog |
| D14 | Delivery Roadmap (Bootstrap) | ARB | ✅ Written |

---

## Environment Variables Required Before Any Build

Create `services/api/.env` (never commit; use Secrets Manager for deployed values):

```bash
# Database
DATABASE_URL=postgresql://pslone:<password>@<rds-endpoint>:5432/psl_one_dev

# Auth
COGNITO_USER_POOL_ID=af-south-1_XXXXXXXXX
COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
COGNITO_REGION=af-south-1

# AWS
AWS_REGION=af-south-1
S3_MEDIA_BUCKET=psl-one-media-dev

# Email
SES_FROM_ADDRESS=noreply@pslone.co.za
SES_REGION=af-south-1

# App
NODE_ENV=development
PORT=3000
JWT_ISSUER=https://cognito-idp.af-south-1.amazonaws.com/<POOL_ID>
CORS_ORIGINS=http://localhost:3001,https://pslone.co.za
```

---

## Sprint 0 Success Criteria

Sprint 0 is complete and Sprint 1 may begin when ALL of the following pass:

```bash
# Local dev
docker-compose up -d
curl http://localhost:3000/health          # 200 { status: 'ok' }
curl http://localhost:3000/health/ready    # 200 { status: 'ok', db: 'connected' }

# Register + login
curl -X POST http://localhost:3000/api/v1/auth/register \
  -d '{"email":"test@pslone.co.za","password":"Test1234!","consentTerms":true}'
# Expected: 201 { userId, message }

# Auth guard
curl http://localhost:3000/api/v1/me      # 401 Unauthorized (no token)

# CI
# GitHub Actions CI passes on a PR with a test change

# Deployed
curl https://api.pslone.co.za/health      # 200 from live EC2
# Vercel URL loads Next.js app
```

When these pass, Sprint 1 begins.
