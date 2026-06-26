# PSL One — Local Development Setup

**Purpose:** Get from zero to running local environment  
**Audience:** All engineers  
**Status:** Current as of Sprint 42B  
**Last verified:** 2026-06-26  

---

## Prerequisites

| Requirement | Version | Notes |
|------------|---------|-------|
| Node.js | ≥ 22.0.0 | Use nvm or volta |
| pnpm | ≥ 9.0.0 | `npm install -g pnpm` |
| PostgreSQL | 16 | Via Docker (recommended) or native install — see below |
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

## PostgreSQL Variants

Two local PostgreSQL configurations are supported. Choose the one that matches your setup and use the corresponding `DATABASE_URL` in Step 3.

**Option A — Docker PostgreSQL (recommended for new setups)**

The `docker compose up -d` command above starts PostgreSQL 16 with default credentials:

```
Host: localhost:5432
User: postgres
Password: postgres
Database: psl_identity_dev
```

**Option B — Native macOS PostgreSQL (peer/passwordless auth)**

If you have PostgreSQL installed natively (e.g. via Homebrew) and it uses your macOS system user, the `postgres` superuser role may not exist. Running `psql -U postgres` will fail with:

```
FATAL: role "postgres" does not exist
```

This does not mean PostgreSQL is down. Verify with:

```bash
pg_isready -h localhost -p 5432
```

The native setup uses your system username (output of `whoami`) with no password.

---

## Step 3: Environment Files

Create `apps/api/.env` using the `DATABASE_URL` for your PostgreSQL variant (see [PostgreSQL Variants](#postgresql-variants) above):

**Option A — Docker:**

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/psl_identity_dev
JWT_SECRET=local-dev-secret-replace-in-production
JWT_EXPIRES_IN=7d
```

**Option B — Native macOS:**

```env
DATABASE_URL=postgresql://<your-macos-username>@localhost:5432/psl_identity_dev
JWT_SECRET=local-dev-secret-replace-in-production
JWT_EXPIRES_IN=7d
```

Replace `<your-macos-username>` with the output of `whoami`.

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

This applies all 46 current migrations.

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

**PostgreSQL connection refused (Docker)**  
Docker container not running. Run `docker compose up -d postgres`.

**`psql -U postgres` fails with "role does not exist"**  
You are on a native macOS PostgreSQL install. The `postgres` superuser role is not created automatically. This does not mean PostgreSQL is down. Use `pg_isready` to check availability, then connect with your system username:

```bash
# Confirm PostgreSQL is reachable
pg_isready -h localhost -p 5432

# Connect using your macOS username (native auth)
psql -d psl_identity_dev -c 'SELECT 1;'

# Or using the full DATABASE_URL from .env (safe — does not print the URL)
psql "$DATABASE_URL" -c 'SELECT 1;'
```

**Migration errors**  
Pending migrations. Run:

```bash
pnpm --filter @psl-one/api exec prisma validate
pnpm --filter @psl-one/api db:migrate
```

**Type errors on build**  
Run `pnpm --filter @psl-one/api typecheck` to see all type errors before building.

**Port already in use (4000 or 3001)**  
Another process is using the port. `lsof -i :4000` to find and kill it.

**JWT errors**  
Missing `JWT_SECRET` in `apps/api/.env`. Add it.

**Diagnostics — is PostgreSQL really down?**  

```bash
# 1. Check if pg is listening
pg_isready -h localhost -p 5432

# 2. Check what is on port 5432
lsof -nP -iTCP:5432 -sTCP:LISTEN

# 3. Confirm which migration state the local DB is in
pnpm --filter @psl-one/api exec -- prisma migrate status
```

**Do not share DATABASE_URL in review comments or logs.** If credentials appear in a URL (Docker variant), treat the whole string as a secret. Use `psql "$DATABASE_URL" -c 'select 1;'` to verify connectivity without echoing it.

See [Troubleshooting Guide](TROUBLESHOOTING.md) for more.
