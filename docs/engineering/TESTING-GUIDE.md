# PSL One — Testing Guide

**Purpose:** Testing patterns, conventions, and standards  
**Audience:** All engineers  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Test Stack

- **Framework:** Vitest 4.x (NestJS API)
- **Test runner:** `pnpm --filter @psl-one/api test`
- **Current count:** 1,560 tests across 54 spec files (as of STORY-39)
- **Web tests:** 3 spec files (minimal — web is tested via build + manual review)

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
