# PSL One — Independent Review Checklist

## Section 1: Non-Negotiable Rules (Blocking)

Failure on any item in this section = FAIL verdict.

### 1.1 RBAC
- Every admin controller class has `@UseGuards(JwtAuthGuard, RolesGuard)`
- Every admin controller class has `@Roles('PSL_ADMIN')`
- Fan routes have `@UseGuards(JwtAuthGuard)` where they require authentication
- No admin route reachable without authentication
- `RolesGuard` is imported and registered in the module

### 1.2 Audit logging
- Every admin `POST`, `PUT`, `PATCH`, `DELETE` handler calls `this.prisma.adminAuditLog.create()`
- `action` field names the specific operation (not generic like "UPDATE")
- `performedBy` uses `user.sub` from `@CurrentUser() user: TokenPayload`
- `details` contains `JSON.stringify(dto)` or equivalent relevant context

### 1.3 Business logic placement
- `apps/web/src/lib/<domain>-client.ts` contains only typed HTTP client calls — no computation, no filtering, no transformation
- Web page components and server components contain no business logic
- All derived values come from the API response, not client-side computation

### 1.4 Domain boundaries
- No module file imports `PrismaService` from another bounded context's module
- No module queries tables that belong to a different bounded context
- Cross-domain reads use a service method from the owning module, not a direct Prisma call

### 1.5 Tests
- Every new `public` method on every service class has at least one test case
- Tests are co-located: `<domain>.service.spec.ts` alongside `<domain>.service.ts`
- No test file has a `describe.skip`, `it.skip`, or `xit` without an explanatory comment

### 1.6 Safety invariants
- No code path activates the PSL season
- No endpoint added for PSL activation
- No real-money prize, checkout, ticket issuance, or KYC claim flow
- Wallet calls go only to `SiliconEnterpriseSandboxWalletAdapter`
- No production external API credentials referenced in source

---

## Section 2: Security (Critical findings block)

### 2.1 Authentication
- JWT validated by `JwtAuthGuard` on every protected endpoint
- Auth endpoints rate-limited by `AuthThrottleGuard` (20 req/15 min)
- Password reset tokens: stored as `createHash('sha256').update(raw).digest('hex')`; raw token only passed to `PasswordResetNotifier`; never logged

### 2.2 Configuration
- `parseCorsOrigins()` called in main.ts; no `*` wildcard allowed
- `trustProxy` is `true` only when `nodeEnv` is not `development` or `test`
- `CORS_ORIGINS` env var required in staging/production; throws if absent

### 2.3 Security headers
- `onSend` hook sets: `x-content-type-options: nosniff`, `x-frame-options: DENY`, `referrer-policy: strict-origin-when-cross-origin`, `x-xss-protection: 0`, `permissions-policy: ...`
- `x-powered-by` header removed

### 2.4 Secrets
- No `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `BEGIN PRIVATE KEY`, `DATABASE_URL=` literal, `JWT_SECRET=` literal in any tracked file
- No `.env` files committed
- No Terraform variables with literal secret values

### 2.5 Injection
- All `$queryRaw` calls use tagged template literals (not string concatenation)
- All Prisma method calls use structured `where` objects (not raw string filters)
- DTO inputs validated with class-validator before reaching service

---

## Section 3: Performance (Non-blocking unless unbounded)

### 3.1 Query safety
- No `findMany()` call without `take` parameter or cursor-based pagination
- No N+1 pattern: looping over records and issuing a Prisma call per iteration
- Pagination parameters bounded via `parseBoundedLimit` (max configurable, never unlimited)

### 3.2 Aggregation
- Season-scoped leaderboards and aggregations use `$queryRaw` with `GROUP BY` and `ORDER BY` in the DB
- No in-memory `.sort()` or `.reduce()` on potentially large datasets (>1,000 records)

### 3.3 Fanout operations
- Broadcast/alert operations use cursor-based batching: `take = batchSize`, `cursor = { id: lastId }`
- Batch size bounded: `parseBoundedLimit(query.batchSize, 250, 500)`

### 3.4 Indexes
- New query patterns on high-volume tables (`match_events`, `fantasy_points_ledger`, `prediction_points_ledger`) have corresponding indexes in the migration

---

## Section 4: Code Quality (Non-blocking)

### 4.1 DTOs
- All request body DTOs use class-validator decorators
- Date/time inputs use `@IsISO8601()` not `@IsString()`
- Optional fields marked `@IsOptional()` before their type decorator

### 4.2 Error handling
- Services throw `HttpException` (or NestJS built-ins like `NotFoundException`, `BadRequestException`) on expected errors
- Unexpected errors are not swallowed without re-throwing
- Error messages do not leak internal details to the client

### 4.3 Tests
- Error paths tested (e.g., what happens when the record doesn't exist?)
- Mocks use `mockResolvedValue` not `mockReturnValue` for async calls
- Assertions check return values, not just mock call counts

### 4.4 Documentation
- New bounded context registered in `docs/architecture/BOUNDED-CONTEXT-MAP.md` or the relevant architecture doc
- New ADR created if the change qualifies (see ADR process in `AGENTS.md`)
- `docs/reference/API-ROUTES.md` updated if new routes added
