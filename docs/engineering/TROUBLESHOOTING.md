# PSL One — Troubleshooting Guide

**Purpose:** Common errors and their solutions  
**Audience:** All engineers  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Database Issues

### `Error: Can't reach database server`

**Cause:** PostgreSQL not running.  
**Fix:**
```bash
docker compose up -d postgres
```
Wait 5 seconds and retry.

### `Error: The table 'public.xxx' does not exist`

**Cause:** Migrations not run.  
**Fix:**
```bash
pnpm --filter @psl-one/api db:migrate
```

### `Error: Unique constraint failed on the fields: ('email')`

**Cause:** Seed running twice with duplicate emails.  
**Fix:**
```bash
pnpm --filter @psl-one/api db:reset
```
Warning: this drops and recreates the database.

### Prisma Client out of sync

**Cause:** Schema changed but Prisma Client not regenerated.  
**Fix:**
```bash
pnpm --filter @psl-one/api db:generate
```

---

## API Issues

### `401 Unauthorized`

**Cause:** Missing or expired JWT token.  
**Fix:** Check `JWT_SECRET` in `apps/api/.env`. Re-login to get a fresh token.

### `403 Forbidden`

**Cause:** Route requires `PSL_ADMIN` role but request made with `FAN` token.  
**Fix:** Use an admin token for `/admin/*` routes.

### `Port 4000 already in use`

**Cause:** Another NestJS process still running.  
**Fix:**
```bash
lsof -i :4000
kill <PID>
```

### `Cannot find module '@psl-one/...'`

**Cause:** Monorepo packages not installed.  
**Fix:**
```bash
pnpm install
```

---

## Frontend Issues

### `Port 3001 already in use`

**Cause:** Another Next.js dev server running.  
**Fix:**
```bash
lsof -i :3001
kill <PID>
```

### `NEXT_PUBLIC_API_BASE_URL is undefined`

**Cause:** Missing `apps/web/.env.local`.  
**Fix:** Create the file:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Note: the variable name is `NEXT_PUBLIC_API_BASE_URL` (not `NEXT_PUBLIC_API_URL`).

### Build fails with type errors

**Cause:** TypeScript strict mode (`exactOptionalPropertyTypes: true`).  
**Common fixes:**
- Use spread pattern instead of assigning `undefined` to optional fields
- Use `!!value` instead of `value &&` in JSX when value is `unknown` type
- Use non-null assertions `!` for mock call array access in tests

---

## Test Issues

### Tests fail with `--testPathPattern is not a valid option`

**Cause:** Vitest does not support `--testPathPattern`.  
**Fix:** Pass the pattern as a positional argument:
```bash
pnpm --filter @psl-one/api test beta-launch
```

### `expect(mock).toBeUndefined()` fails

**Cause:** Mock functions exist even if not called — they are never `undefined`.  
**Fix:** Use `.not.toHaveBeenCalled()`:
```typescript
expect(mockPrisma.season.update).not.toHaveBeenCalled();
```

### `Object is possibly 'undefined'` on mock call args

**Cause:** `mock.calls[0][0]` type includes undefined under strict TypeScript.  
**Fix:** Use non-null assertions:
```typescript
const arg = mockPrisma.thing.create.mock.calls[0]![0]!;
```

### Tests pass individually but fail together

**Cause:** Shared mock state between tests.  
**Fix:** Ensure `vi.clearAllMocks()` is called in `beforeEach`.

---

## Migration Issues

### `Migration failed to apply cleanly`

**Cause:** Schema drift — local database state doesn't match migrations.  
**Fix (development only — destructive):**
```bash
pnpm --filter @psl-one/api db:reset
```

### `Cannot read properties of undefined` in seed

**Cause:** Seed depends on records that failed to create.  
**Fix:** Run `db:reset` then `db:seed` fresh. Check seed output for individual errors.

---

## Docker Issues

### `docker compose` not found

**Fix:** Update Docker Desktop. Modern Docker includes Compose as a subcommand (`docker compose`, not `docker-compose`).

### Kafka container restart-looping

**Cause:** Broker advertised listeners misconfigured.  
**Fix:** `docker compose down && docker compose up -d`. If persisting, `docker compose down -v` (deletes volumes) then `up -d`.

---

## Build Issues

### `Cannot find module` in production build

**Cause:** Module not in `dependencies` (only in `devDependencies`).  
**Fix:** Move to `dependencies` in the relevant `package.json`.

### `next build` succeeds locally but fails in CI

**Cause:** `NEXT_PUBLIC_API_BASE_URL` not set in CI environment.  
**Fix:** Add the environment variable to CI secrets/config with the production or staging API URL.
