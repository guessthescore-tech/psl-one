# PSL One — Security Review Checklist

## Section 1: Access Control (OWASP A01)

### Admin RBAC
- [ ] Every admin controller class decorated with `@UseGuards(JwtAuthGuard, RolesGuard)`
- [ ] Every admin controller class decorated with `@Roles('PSL_ADMIN')`
- [ ] `AuthModule` imported in every module that has RBAC-protected routes
- [ ] No admin routes reachable at `/admin/*` without authentication
- [ ] Fan routes requiring authentication have `@UseGuards(JwtAuthGuard)`

**Verification:**
```bash
grep -r "@Controller('admin" apps/api/src --include="*.controller.ts" -l | while read f; do
  echo "=== $f ===" && grep -A2 "@Controller" "$f" | head -10
done
```

### Cross-user isolation
- [ ] All fan data queries filter by `userId` from `@CurrentUser()`, not from query params
- [ ] Admin queries may scope by any userId, but only when `PSL_ADMIN` role verified

---

## Section 2: Cryptographic Failures (OWASP A02)

### Password reset tokens
- [ ] `requestPasswordReset`: creates raw token → stores `createHash('sha256').update(rawToken).digest('hex')` in DB
- [ ] `requestPasswordReset`: passes only `rawToken` to `passwordResetNotifier.sendPasswordResetEmail()`
- [ ] `requestPasswordReset`: never logs or returns `rawToken`
- [ ] `confirmPasswordReset`: looks up by `tokenHash`, never by raw token
- [ ] `NullPasswordResetNotifier` used in all non-development environments
- [ ] `ConsolePasswordResetNotifier` used only when `NODE_ENV === 'development'`

**Verification:**
```bash
grep -n "rawToken\|tokenHash\|PASSWORD_RESET" apps/api/src/auth/auth.service.ts
```

### JWT
- [ ] `JWT_SECRET` not hardcoded in source (must come from `process.env`)
- [ ] `JWT_EXPIRES_IN` configured (no non-expiring tokens)

---

## Section 3: Injection (OWASP A03)

### Prisma parameterised queries
- [ ] All `$queryRaw` calls use tagged template literals: `prisma.$queryRaw\`SELECT ... WHERE id = ${id}\``
- [ ] No `$queryRaw` calls using string concatenation or `.join()`
- [ ] No `$executeRaw` with user-supplied values via concatenation

**Verification:**
```bash
grep -rn "\$queryRaw\|\$executeRaw" apps/api/src --include="*.ts"
# Inspect each result — verify template literal, not concatenation
```

### DTO validation
- [ ] All controller methods accepting `@Body()` or `@Query()` params use validated DTOs
- [ ] `ValidationPipe` is globally registered (check `apps/api/src/main.ts`)
- [ ] Date inputs use `@IsISO8601()`, not `@IsString()`

---

## Section 4: Security Misconfiguration (OWASP A05)

### CORS
- [ ] `parseCorsOrigins(process.env['CORS_ORIGINS'], nodeEnv)` called in `main.ts`
- [ ] `parseCorsOrigins` throws if `CORS_ORIGINS` contains `*`
- [ ] `parseCorsOrigins` throws if `CORS_ORIGINS` unset in staging/production
- [ ] Fallback `['http://localhost:3001']` used only in development/test

### Trust proxy
- [ ] `trustProxy` is `nodeEnv !== 'development' && nodeEnv !== 'test'`
- [ ] `AuthThrottleGuard` keys on `req.ip` — not `req.headers['x-forwarded-for']` directly

### Security headers
- [ ] `onSend` hook present in `main.ts`
- [ ] `x-content-type-options: nosniff` set
- [ ] `x-frame-options: DENY` set
- [ ] `referrer-policy: strict-origin-when-cross-origin` set
- [ ] `x-xss-protection: 0` set (disables broken browser XSS filter)
- [ ] `permissions-policy` set
- [ ] `x-powered-by` removed

**Verification:**
```bash
grep -A20 "onSend" apps/api/src/main.ts
```

---

## Section 5: Auth and Session Failures (OWASP A07)

### JWT validation
- [ ] `JwtAuthGuard` applied on all protected routes
- [ ] JWT uses `HS256` or `RS256` — not `none` or `HS1`

### Rate limiting
- [ ] `AuthThrottleGuard` registered in `AuthModule`
- [ ] `WINDOW_MS = 15 * 60 * 1000` (15 minutes)
- [ ] `MAX_REQUESTS = 20`
- [ ] Throttle keyed on `req.ip` only

---

## Section 6: Logging and Monitoring Failures (OWASP A09)

### Audit logging
- [ ] Every admin `POST`, `PUT`, `PATCH`, `DELETE` endpoint writes `AdminAuditLog`
- [ ] `action` field is descriptive (not generic)
- [ ] `performedBy` is `user.sub` from `@CurrentUser()`
- [ ] No PII in `details` beyond what is strictly necessary

### Sensitive data in logs
- [ ] No raw password reset tokens in any `console.log` or `Logger.log` call
- [ ] No JWT secrets or provider credentials logged
- [ ] `NullPasswordResetNotifier` discards the raw token without logging

---

## Section 7: Financial Safety

- [ ] No monetary value path in Fantasy module
- [ ] No monetary value path in Predictions module
- [ ] No monetary value path in Social Prediction module
- [ ] Fan Value is a loyalty metric — no conversion to cash
- [ ] Wallet module uses only `SiliconEnterpriseSandboxWalletAdapter`
- [ ] No `ProductionWalletAdapter` or real payment provider instantiated
- [ ] No checkout, no ticket issuance, no real KYC claims

---

## Section 8: Secrets Scan

```bash
# Scan for committed secrets
git grep -n "AWS_ACCESS_KEY_ID\|AWS_SECRET_ACCESS_KEY\|BEGIN PRIVATE KEY\|DATABASE_URL=.*@\|JWT_SECRET=[a-zA-Z0-9]" \
  $(git ls-files) | grep -v ".env.example\|README\|LOCAL-DEVELOPMENT\|CONTAINER-ARCHITECTURE\|SPRINT-1-HANDOVER"
```

Expected: no results (or only template/example values in documentation).

---

## Severity classification

| Finding | Severity |
|---------|---------|
| Admin route missing RBAC guard | CRITICAL |
| Raw password reset token in logs | CRITICAL |
| `$queryRaw` using string concatenation | CRITICAL |
| Real-money path added | CRITICAL |
| Admin mutation missing audit log | HIGH |
| CORS wildcard allowed | HIGH |
| Trust proxy misconfigured | HIGH |
| Security header missing | MEDIUM |
| JWT expiry not configured | MEDIUM |
| Rate limit missing from auth endpoint | MEDIUM |
| PII unnecessarily logged | LOW |
