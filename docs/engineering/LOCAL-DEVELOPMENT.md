# PSL One — Local Development Setup

**Purpose:** Get from zero to running local environment  
**Audience:** All engineers  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Prerequisites

| Requirement | Version | Notes |
|------------|---------|-------|
| Node.js | ≥ 22.0.0 | Use nvm or volta |
| pnpm | ≥ 9.0.0 | `npm install -g pnpm` |
| PostgreSQL | 16 | Via Docker (recommended) or local install |
| Docker | Latest | For docker-compose services |

---

## Step 1: Clone and Install

```bash
git clone <repo-url> psl-one
cd psl-one
pnpm install
```

---

## Step 2: Start Infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL 16, Redis, Kafka, Kafka UI, and Mailpit.

Verify PostgreSQL is ready:

```bash
docker compose logs postgres | tail -5
```

---

## Step 3: Environment Files

Create `apps/api/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/psl_identity_dev
JWT_SECRET=local-dev-secret-replace-in-production
JWT_EXPIRES_IN=7d
```

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

---

## Step 4: Database Setup

Run all migrations:

```bash
pnpm --filter @psl-one/api db:migrate
```

This creates the database and all 38 tables.

Seed reference data (clubs, players, fixtures, rules, configs):

```bash
pnpm --filter @psl-one/api db:seed
```

---

## Step 5: Start Application

Start both API and web in development mode:

```bash
pnpm dev
```

Or start individually:

```bash
# API only (port 4000)
pnpm --filter @psl-one/api dev

# Web only (port 3001)
pnpm --filter @psl-one/web dev
```

---

## Verify

| URL | Expected |
|-----|---------|
| http://localhost:4000/health | `{"status":"ok"}` |
| http://localhost:3001 | Home page |
| http://localhost:3001/admin | Admin dashboard |
| http://localhost:8080 | Kafka UI |
| http://localhost:8025 | Mailpit email viewer |

---

## Database Management

| Command | Purpose |
|---------|---------|
| `pnpm --filter @psl-one/api db:migrate` | Run pending migrations |
| `pnpm --filter @psl-one/api db:seed` | Seed reference data |
| `pnpm --filter @psl-one/api db:studio` | Open Prisma Studio (GUI) |
| `pnpm --filter @psl-one/api db:reset` | **DESTRUCTIVE** — drop, recreate, migrate, seed |

---

## Running Tests

```bash
# All API tests
pnpm --filter @psl-one/api test

# Specific module
pnpm --filter @psl-one/api test beta-launch

# Watch mode
pnpm --filter @psl-one/api test:watch

# Coverage
pnpm --filter @psl-one/api test:cov
```

---

## Building

```bash
# Build API
pnpm --filter @psl-one/api build

# Build web
pnpm --filter @psl-one/web build

# Build all (Turbo)
pnpm build
```

---

## Common Issues

**PostgreSQL connection refused**  
Docker container not running. Run `docker compose up -d postgres`.

**Migration errors**  
Pending migrations. Run `pnpm --filter @psl-one/api db:migrate`.

**Type errors on build**  
Run `pnpm --filter @psl-one/api typecheck` to see all type errors before building.

**Port already in use (4000 or 3001)**  
Another process is using the port. `lsof -i :4000` to find and kill it.

**JWT errors**  
Missing `JWT_SECRET` in `apps/api/.env`. Add it.

See [Troubleshooting Guide](TROUBLESHOOTING.md) for more.
