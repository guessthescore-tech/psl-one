# PSL One

**The Digital Operating System of South African Football**

PSL One is a fan engagement platform for the Premier Soccer League: Fantasy Football, Guess the Score, Social Prediction Challenges, Live Match Intelligence, Fan Value, Achievements, Campaigns, Rewards, and Match Centre — all in one place for 2 million South African football fans.

---

## Programme State (as of Sprint 2 / STORY-39)

| Item | Value |
|------|-------|
| Latest commit | `08e3852` feat: add psl beta launch readiness and frontend showcase |
| API tests | 1,560 passing (54 files) |
| Web pages | 337 routes |
| Migrations | 38 applied |
| Active season | FIFA World Cup 2026 (beta data) |
| Prepared season | PSL Premiership 2026/27 (not yet activated) |
| Sprint | Sprint 2 complete → Sprint 3 Foundation (Production Infrastructure) |

> **PSL season is not activated.** Activation requires explicit admin trigger after all 13 readiness checks pass. See [Beta Launch Readiness](docs/domain/BETA-LAUNCH.md).

---

## Architecture at a Glance

```
┌──────────────────────────────────────────────────────────┐
│  Next.js web app (port 3001)                             │
│  Fan + Admin pages · 337 routes · TypeScript + Tailwind  │
└────────────────────┬─────────────────────────────────────┘
                     │ NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
┌────────────────────▼─────────────────────────────────────┐
│  NestJS API (port 4000)                                  │
│  25 bounded contexts · 38 migrations · Prisma ORM        │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│  PostgreSQL 16 (port 5432, db: psl_identity_dev)         │
└──────────────────────────────────────────────────────────┘
```

**Technology stack:** NestJS · Next.js · PostgreSQL · Prisma · TypeScript · Tailwind · pnpm · Vitest · Turbo

**Production target:** AWS ECS · CloudFront · RDS · af-south-1 *(not yet deployed — Sprint 3)*

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 22.0.0 | `.nvmrc` or `nvm use` |
| pnpm | ≥ 9.0.0 | `npm install -g pnpm@9` |
| PostgreSQL | 16 | Local or via Docker |
| Docker (optional) | any | For `docker-compose up -d` |

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url> psl-one
cd psl-one
pnpm install
```

### 2. Start PostgreSQL

**Option A — Docker (recommended):**
```bash
docker-compose up -d postgres
```

**Option B — Local PostgreSQL:**
```bash
createdb psl_identity_dev
```

### 3. Configure API environment

```bash
cp apps/api/.env.example apps/api/.env   # if example exists, otherwise create manually
```

Minimum required in `apps/api/.env`:
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user@localhost:5432/psl_identity_dev
JWT_SECRET=local-dev-secret-at-least-32-characters-long
```

> Never commit real secrets. `JWT_SECRET` for local dev only.

### 4. Configure web environment

Create `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

> Use `NEXT_PUBLIC_API_BASE_URL` — **not** `NEXT_PUBLIC_API_URL`.

### 5. Run migrations and seed

```bash
# Generate Prisma client
pnpm --filter @psl-one/api db:generate

# Apply all 38 migrations
pnpm --filter @psl-one/api db:migrate

# Seed development data (idempotent — safe to run multiple times)
pnpm --filter @psl-one/api db:seed
```

### 6. Start the servers

```bash
# Terminal 1 — API
pnpm --filter @psl-one/api dev

# Terminal 2 — Web
pnpm --filter @psl-one/web dev
```

| Service | URL |
|---------|-----|
| API | http://localhost:4000 |
| Web | http://localhost:3001 |
| Health | http://localhost:4000/health |

---

## Key Commands

```bash
# Typechecking
pnpm --filter @psl-one/api typecheck
pnpm --filter @psl-one/web typecheck

# Tests
pnpm --filter @psl-one/api test                    # 1,560 unit tests
pnpm --filter @psl-one/api test beta-launch        # focused: one module

# Production builds
pnpm --filter @psl-one/api build
pnpm --filter @psl-one/web build

# Schema validation
cd apps/api && npx prisma validate
cd apps/api && npx prisma migrate status

# Seed (idempotent)
pnpm --filter @psl-one/api db:seed
```

---

## Safety Boundaries

| Boundary | Status |
|----------|--------|
| Fantasy and Guess the Score | **Points-only** — no real money, no paid entry |
| Social prediction gaming | **System-issued gameplay points** — no wallet funding, no cash payout |
| Fan Value | **Non-financial loyalty score** — no cash value |
| Wallet | **Sandbox-only** — SiliconEnterpriseSandboxWalletAdapter, zero outbound calls |
| PSL season activation | **Not yet performed** — requires 13-check gate + explicit admin trigger |
| World Cup history | **Preserved** — FIFA World Cup 2026 data is read-only beta reference |
| Production AWS | **Not deployed** — Sprint 3 work |
| External providers | **Not wired** — no Opta, Stats Perform, Sportradar, Cognito, SES, or live wallets |

---

## Monorepo Structure

```
psl-one/
├── apps/
│   ├── api/              # NestJS API — all product logic lives here
│   │   ├── prisma/       # Schema, migrations (38), seed
│   │   └── src/          # 25+ bounded-context modules
│   └── web/              # Next.js fan + admin frontend
│       ├── src/app/      # 337 route pages
│       └── src/lib/      # ~50 typed API client modules
├── packages/             # Shared packages (types, auth-guards, etc.)
├── services/             # Placeholder microservice stubs (future)
├── docs/                 # All documentation
│   ├── README.md         # Documentation navigation hub ← start here
│   ├── project/          # Story index, roadmap, current state
│   ├── architecture/     # System design documents
│   ├── engineering/      # Developer guides
│   ├── domain/           # Domain-specific documentation
│   ├── operations/       # Deployment and operations
│   ├── reference/        # API routes, models, migrations
│   ├── adr/              # Architecture Decision Records
│   └── platform/         # Historical implementation records (Sprint 1-2)
├── docker-compose.yml    # Local infrastructure (postgres, redis, kafka, mailpit)
├── CLAUDE.md             # AI agent operating rules
└── README.md             # This file
```

---

## Documentation

Start with **[docs/README.md](docs/README.md)** for the full documentation navigation hub.

Key starting points by role:

| Role | Start Here |
|------|------------|
| New developer | [docs/engineering/LOCAL-DEVELOPMENT.md](docs/engineering/LOCAL-DEVELOPMENT.md) |
| Backend engineer | [docs/engineering/BACKEND-GUIDE.md](docs/engineering/BACKEND-GUIDE.md) |
| Frontend engineer | [docs/engineering/FRONTEND-GUIDE.md](docs/engineering/FRONTEND-GUIDE.md) |
| Architect | [docs/architecture/SYSTEM-OVERVIEW.md](docs/architecture/SYSTEM-OVERVIEW.md) |
| Product / programme | [docs/project/CURRENT-STATE.md](docs/project/CURRENT-STATE.md) |
| DevOps | [docs/operations/PRODUCTION-READINESS.md](docs/operations/PRODUCTION-READINESS.md) |
| QA | [docs/engineering/TESTING-GUIDE.md](docs/engineering/TESTING-GUIDE.md) |

---

## Current Limitations

- No production deployment (Sprint 3)
- No live sports-data provider wired (contract required)
- No email/SMS notifications (provider required)
- No production wallet (sandbox only, contract + compliance required)
- No real-money mechanics of any kind
- PSL season not yet activated (all 13 readiness checks must pass first)
- Auth uses localStorage JWT (production session management Sprint 3)
- No CDN, no object storage, no monitoring (Sprint 3)

---

## Contribution

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch strategy, testing requirements, migration rules, safety scan checklist and Definition of Done.

---

## Next Programme Phase

**Sprint 3 — Production Infrastructure & Deployment**

AWS ECS provisioning · RDS · CloudFront · CI/CD hardening · Observability · Production auth · Rate limiting · WAF · Official PSL data (STORY-40 reserved)

See [docs/project/ROADMAP.md](docs/project/ROADMAP.md) for the full programme roadmap.
