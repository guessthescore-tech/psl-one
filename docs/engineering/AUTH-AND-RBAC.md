# PSL One — Auth and RBAC Guide

**Purpose:** How authentication and role-based access control work in detail  
**Audience:** Backend engineers  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Authentication Flow

1. Fan/admin POSTs to `POST /auth/login` with `{ email, password }`
2. `AuthService.login()` verifies password hash with bcrypt
3. Signs and returns `{ access_token: string }` — JWT bearing `{ id, email, role }`
4. Client stores token and sends as `Authorization: Bearer <token>` on subsequent requests
5. `JwtAuthGuard` validates the token on every protected route
6. If valid, `req.user` is populated with `{ id, email, role }`

---

## JWT Configuration

```env
JWT_SECRET=<your-secret>
JWT_EXPIRES_IN=7d
```

Stored in `apps/api/.env`. Never commit `JWT_SECRET`. In production, load from AWS Secrets Manager.

---

## Guards

### `JwtAuthGuard`

Validates the Bearer token. Returns `401` if missing or invalid.

Usage:

```typescript
@Controller('predictions')
@UseGuards(JwtAuthGuard)
export class PredictionsController { ... }
```

### `RolesGuard`

Checks `req.user.role` against the `@Roles()` decorator. Returns `403` if role doesn't match.

Must be used together with `JwtAuthGuard`:

```typescript
@Controller('admin/predictions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class AdminPredictionsController { ... }
```

---

## Roles

| Role | Value | Description |
|------|-------|-------------|
| Fan | `FAN` | Default role for registered fans |
| Admin | `PSL_ADMIN` | PSL platform administrator |

Roles are stored on `User.role` in the database. A fan cannot self-elevate to `PSL_ADMIN`. No API route allows role change — it must be done via direct database update by a platform operator.

---

## `getBetaToken()` Utility

`apps/api/src/auth/test-helpers.ts` exports `getBetaToken()` for generating test tokens:

```typescript
import { getBetaToken } from '../auth/test-helpers';

const fanToken = getBetaToken({ id: 'user-1', email: 'fan@example.com', role: 'FAN' });
const adminToken = getBetaToken({ id: 'admin-1', email: 'admin@psl.co.za', role: 'PSL_ADMIN' });
```

This function was centralised in STORY-35. Do not create local `getToken()` helpers in individual test files.

---

## Getting User Context in Services

Always extract user context from the JWT-populated `req.user`, never from request body:

```typescript
// ✓ CORRECT — from JWT
@Post()
create(@Req() req: Request, @Body() dto: CreateDto) {
  return this.service.create(req.user.id, dto);
}

// ❌ WRONG — user could spoof their own userId
@Post()
create(@Body() dto: CreateWithUserIdDto) {
  return this.service.create(dto.userId, dto);  // NEVER do this
}
```

---

## Admin Audit Log

Every admin mutation must capture the actor:

```typescript
async adminSettle(predictionId: string, adminUserId: string, ...) {
  await this.prisma.adminAuditLog.create({
    data: {
      userId: adminUserId,  // from req.user.id, not from body
      action: 'SETTLE_PREDICTION',
      targetModel: 'Prediction',
      targetId: predictionId,
      payload: JSON.stringify({ result }),
      performedAt: new Date(),
    },
  });
  // ... then perform the mutation
}
```

**Never bypass audit logs** — explicit project rule.

---

## Public Routes (No Auth Required)

Only these routes are unauthenticated:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /fixtures/public` (if implemented)

All other routes require a valid JWT.

---

## Production Security Roadmap

Current implementation is development-suitable. Production requirements:

| Item | Status |
|------|--------|
| httpOnly session cookies | PLANNED (Sprint 3) |
| Token refresh rotation | PLANNED |
| Rate limiting on auth endpoints | PLANNED |
| Brute force protection | PLANNED |
| Session revocation | PLANNED |

See [Security Architecture](../architecture/SECURITY-ARCHITECTURE.md).
