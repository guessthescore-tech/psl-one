# Sprint 23 — RBAC Investigation

## Finding Summary

**Root cause of GAP-22-01:** Three controllers used `@Roles('ADMIN')` which does not correspond to any value in the `UserRole` enum. Since `RolesGuard` performs an exact string match against `req.user.role`, no user could ever satisfy these guards. All affected endpoints returned HTTP 403 for all authenticated users.

---

## Guard Architecture

### `JwtAuthGuard`

- Path: `apps/api/src/auth/guards/jwt-auth.guard.ts`
- Extracts `Authorization: Bearer <token>` header
- Calls `LocalJwtProvider.verifyToken(token)` — verifies JWT signature
- Sets `req.user = { sub, email, role }` from decoded payload
- No DB lookup — stateless JWT validation
- Missing or invalid token → HTTP 401

### `RolesGuard`

- Path: `apps/api/src/auth/guards/roles.guard.ts`
- Reads `ROLES_KEY` metadata from handler and class via `Reflector.getAllAndOverride`
- If no roles required → allows all
- Checks `required.includes(req.user.role)` — exact string match
- Mismatch or missing user → HTTP 403 (`ForbiddenException`)

### `TokenPayload`

```ts
export interface TokenPayload {
  sub: string;
  email: string;
  role: string;  // value from UserRole enum at login time
}
```

### `UserRole` enum

```prisma
enum UserRole {
  FAN
  CLUB_ADMIN
  SPONSOR
  PSL_ADMIN
}
```

There is **no `ADMIN` value** in the enum.

---

## Role Value in JWT

`auth.service.ts` `login()` signs the JWT with `role: user.role` where `user.role` is a Prisma `UserRole` enum value. In JavaScript, Prisma string enums are plain strings, so `user.role === 'PSL_ADMIN'` for a PSL admin user.

---

## Affected Controllers

| File | Controller | Required role (before fix) | Route examples |
|------|-----------|---------------------------|----------------|
| `fixture-publication.controller.ts` | `FixturePublicationController` | `'ADMIN'` | `GET /admin/fixtures/imported`, `POST /admin/fixtures/publish` |
| `fixture-publication.controller.ts` | `PslPreflightController` | `'ADMIN'` | `GET /admin/psl/preflight` |
| `data-provider.controller.ts` | `DataProviderController` | `'ADMIN'` | `GET /admin/data-provider/health`, `POST /admin/data-provider/parse-psl/fixtures/ingest` |
| `prediction-challenges.controller.ts` | `PredictionChallengesController` | `'ADMIN'` | `POST /predictions/challenges/settle-fixture/:id`, `POST /predictions/challenges/:token/settle` |

---

## Why Sprint 22 Smoke Showed 403 for Valid PSL_ADMIN JWT

The smoke tool (`sprint-19-admin-rbac-smoke.mjs`) treats any HTTP response < 500 as PASS for authenticated requests. It was designed to verify the server doesn't crash, not to assert that PSL_ADMIN can access admin routes. The 403 was silently treated as "authenticated non-5xx = PASS".

The ingestion smoke tool treats 401 and 403 identically as SKIP with message "ADMIN_TOKEN required", which also masked the true failure.

---

## Security Posture

- The incorrect `@Roles('ADMIN')` did NOT create a security hole — it made routes unreachable by any user (over-restrictive, not under-restrictive)
- No user had elevated access beyond their intended role
- RBAC was enforced correctly throughout (RolesGuard, JwtAuthGuard were never bypassed)
- The fix changes role name strings to match the enum — it does not weaken any guard
