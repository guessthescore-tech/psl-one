# PSL One — Error Handling

**Purpose:** How errors are handled at each layer of the stack  
**Audience:** Backend engineers  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## API Layer (NestJS)

### Standard HTTP Exceptions

Always use NestJS built-in exceptions — never throw bare `Error` objects for HTTP responses:

```typescript
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
```

| Status | Exception | When to use |
|--------|-----------|------------|
| 400 | `BadRequestException` | Invalid input, business rule violation |
| 401 | `UnauthorizedException` | Missing or invalid auth token |
| 403 | `ForbiddenException` | Authenticated but insufficient permissions |
| 404 | `NotFoundException` | Resource not found |
| 409 | `ConflictException` | Duplicate key, idempotency conflict |
| 422 | `UnprocessableEntityException` | Valid format but invalid state transition |

### Exception Propagation

Services throw exceptions. Controllers do not catch them. NestJS `HttpExceptionFilter` formats the response:

```json
{
  "statusCode": 404,
  "message": "Prediction not found",
  "error": "Not Found"
}
```

### Business Rule Violations

Use `BadRequestException` with a meaningful message:

```typescript
if (!fantasyWindow.isOpen) {
  throw new BadRequestException('Fantasy transfer window is currently closed');
}
```

---

## Input Validation Layer

NestJS `ValidationPipe` with class-validator DTOs handles malformed input before it reaches service code:

```typescript
// Applied globally in main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // strip extra properties
  forbidNonWhitelisted: true, // reject extra properties
  transform: true,            // auto-convert types
}));
```

Validation errors return `400 Bad Request` automatically with field-level detail.

---

## Season State Guards

Domain services use guard functions for state checks:

```typescript
// Fantasy open guard
export function assertFantasyOpen(config: FantasyRulesConfig, now: Date) {
  if (now > config.transferDeadline) {
    throw new BadRequestException('Fantasy transfer window is closed');
  }
}
```

These guards are called at the start of mutation methods. Tests should verify both the passing and the throwing case.

---

## Transaction Errors

When a `$transaction` fails, Prisma rolls back all operations. Let the error bubble to NestJS:

```typescript
await this.prisma.$transaction([
  this.prisma.season.update(...),
  this.prisma.season.update(...),
  this.prisma.seasonSwitchAudit.create(...),
]);
// If any operation throws, all are rolled back automatically
```

Do not catch `PrismaClientKnownRequestError` unless you have specific handling (e.g., unique constraint → `ConflictException`).

---

## Prisma Specific Errors

```typescript
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

try {
  await this.prisma.prediction.create({ data });
} catch (e) {
  if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
    throw new ConflictException('Prediction already exists for this fixture');
  }
  throw e; // re-throw unknown errors
}
```

Common Prisma error codes:
- `P2002` — Unique constraint violation
- `P2025` — Record not found (for delete/update)
- `P2003` — Foreign key constraint failed

---

## Dry Run Error Handling

Dry-run operations must not throw on "would fail" scenarios — they should report the failure in the response:

```typescript
async dryRun(seasonId: string) {
  const checks = await this.runReadinessChecks(seasonId);
  const blockers = checks.filter(c => c.status === 'FAIL');
  return {
    dryRunOnly: true,
    activationWillNotBePerformed: true,
    wouldProceed: blockers.length === 0,
    blockers,
    checks,
  };
}
```

---

## Frontend Error Handling

Client functions throw on non-OK responses:

```typescript
export async function someClientFn(token: string) {
  const res = await fetch(`${API_BASE}/some-route`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

Pages catch and display errors:

```typescript
useEffect(() => {
  someClientFn(token)
    .then(setData)
    .catch((e) => setError(e.message))
    .finally(() => setLoading(false));
}, []);

if (error) return <div className="p-4 text-red-500">{error}</div>;
```

---

## What NOT to Handle

- NestJS framework errors (routing, binding) — let the framework handle them
- Prisma internal errors unless you have specific recovery logic
- Errors from invariants that genuinely cannot happen (don't defend against your own correctly-implemented logic)
- Auth and role check failures at the service level — `JwtAuthGuard` and `RolesGuard` handle these before the service is reached
