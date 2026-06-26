# PSL One — Testing Guide

**Purpose:** Testing patterns, conventions, and standards  
**Audience:** All engineers  
**Status:** Current as of Sprint 42B  
**Last verified:** 2026-06-26  

---

## Test Stack

- **Framework:** Vitest 4.x (NestJS API)
- **Test runner:** `pnpm --filter @psl-one/api test`
- **Current count:** 2,355 tests across 100 spec files (as of Sprint 42B)
- **Experience tests:** 1 spec file, 1,638 tests
- **Web tests:** 9 spec files, 543 tests

---

## PostgreSQL and Integration Tests

Most service spec files use a **mocked** `PrismaService` (via `vi.fn()`) and do not require a live database. However, one file hits a real database:

- `src/football/world-cup-2026.integration.spec.ts` — connects directly via `PrismaClient` to verify WC 2026 seed data shape.

This file is included in the default `pnpm --filter @psl-one/api test` run. If PostgreSQL is not reachable or the database is not seeded, these tests will fail.

**Before running the full suite, confirm PostgreSQL is available:**

```bash
# Quick reachability check
pg_isready -h localhost -p 5432

# Confirm migration state
pnpm --filter @psl-one/api exec -- prisma migrate status

# Apply any pending migrations (safe, additive only)
pnpm --filter @psl-one/api db:migrate
```

If `pg_isready` returns "accepting connections" but `psql -U postgres` fails with `FATAL: role "postgres" does not exist`, you are on a native macOS PostgreSQL install. That error does not mean the database is down. See [Local Development](LOCAL-DEVELOPMENT.md#postgresql-variants) for both supported DATABASE_URL variants.

---

## Running Tests

```bash
# All tests
pnpm --filter @psl-one/api test

# Single module (positional pattern argument)
pnpm --filter @psl-one/api test beta-launch
pnpm --filter @psl-one/api test fantasy

# Watch mode
pnpm --filter @psl-one/api test:watch

# Coverage
pnpm --filter @psl-one/api test:cov
```

Note: Do NOT use `--testPathPattern` flag — it is not valid for Vitest. Pass pattern as positional argument.

---

## Unit Test Structure

All service tests follow this pattern:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { DomainService } from './domain.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  domain: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  adminAuditLog: {
    create: vi.fn(),
  },
};

describe('DomainService', () => {
  let service: DomainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DomainService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DomainService>(DomainService);
    vi.clearAllMocks();
  });

  it('should return all domain items for user', async () => {
    mockPrisma.domain.findMany.mockResolvedValue([{ id: '1' }]);
    const result = await service.findAll('user-1');
    expect(result).toHaveLength(1);
    expect(mockPrisma.domain.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    });
  });
});
```

---

## Mock Setup Rules

1. Mock `PrismaService` with `vi.fn()` for every method your service calls
2. Call `vi.clearAllMocks()` in `beforeEach` — never share mock state between tests
3. For methods that should NOT be called, assert with `.not.toHaveBeenCalled()`, not `.toBeUndefined()` — mock functions exist even when not called
4. Non-null assertions required for mock call argument access:

```typescript
// ❌ WRONG — may be undefined under strict TypeScript
const arg = mockPrisma.domain.create.mock.calls[0][0];

// ✓ CORRECT
const arg = mockPrisma.domain.create.mock.calls[0]![0]!;
```

---

## `getBetaToken()` in Tests

All tests that need a JWT token use the centralised helper:

```typescript
import { getBetaToken } from '../auth/test-helpers';

const token = getBetaToken({ id: 'user-1', email: 'test@example.com', role: 'FAN' });
```

Do not manually craft JWT strings in tests. Do not copy-paste token helpers between files.

---

## Testing Admin Routes

Admin routes require `PSL_ADMIN` role:

```typescript
const adminToken = getBetaToken({ id: 'admin-1', email: 'admin@psl.co.za', role: 'PSL_ADMIN' });
```

Test that non-admin requests are rejected:

```typescript
it('should reject non-admin access', async () => {
  const fanToken = getBetaToken({ id: 'fan-1', role: 'FAN' });
  const response = await request(app.getHttpServer())
    .get('/admin/predictions')
    .set('Authorization', `Bearer ${fanToken}`)
    .expect(403);
});
```

---

## Testing Side Effects

When a mutation has side effects (Fan Value, Notifications, Activity Feed), assert they were called:

```typescript
it('should award Fan Value on prediction', async () => {
  // ... setup
  await service.createPrediction(userId, dto);
  expect(mockPrisma.fanValueLedger.create).toHaveBeenCalledWith(
    expect.objectContaining({ data: expect.objectContaining({ userId }) })
  );
});
```

---

## Testing Dry Runs

```typescript
it('should return dry-run flags without writing', async () => {
  const result = await service.activationDryRun(seasonId, adminUserId);
  expect(result.dryRunOnly).toBe(true);
  expect(result.activationWillNotBePerformed).toBe(true);
  expect(mockPrisma.season.update).not.toHaveBeenCalled();
});
```

---

## What to Test

- Every public service method
- Happy path (success case)
- Error cases (not found, bad input, window closed)
- RBAC enforcement (admin-only operations)
- Idempotency (duplicate requests)
- Side effects (Fan Value, Notifications called)
- Dry run correctness (no writes)
- Audit log written (admin mutations)

---

## What NOT to Test

- Prisma internals (trust the ORM)
- NestJS routing (trust the framework)
- TypeScript type correctness (tsc handles this)
- Third-party library behaviour

---

## Minimum Test Requirements

**Always write tests** is an explicit project rule. No PR is complete without tests for new service methods. If a story adds N new service methods, it must add at least N new test cases.
