# PSL One — Security Architecture

**Purpose:** Authentication, authorisation, and security boundary documentation  
**Audience:** Backend engineers, architects, DevOps  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Authentication

### Mechanism

JWT (JSON Web Token) — stateless bearer token authentication.

- Tokens issued by `AuthModule` on login/register
- Signed with `JWT_SECRET` from environment
- Default expiry: 7 days (configurable via `JWT_EXPIRES_IN`)
- Token contains: `userId`, `email`, `role`

### `getBetaToken()` Centralisation

All `AuthModule` tests and beta-phase utilities use `getBetaToken()` from `apps/api/src/auth/test-helpers.ts`. This was centralised in STORY-35 to avoid drift between test helpers.

### Endpoints Without Auth

| Route | Reason |
|-------|--------|
| `POST /auth/register` | New user creation |
| `POST /auth/login` | Token issuance |
| `POST /auth/forgot-password` | Password reset flow |
| `POST /auth/reset-password` | Password reset flow |
| `GET /fixtures/public` | Public fixture feed |

All other routes require `JwtAuthGuard`.

---

## Authorisation (RBAC)

### Roles

| Role | Access |
|------|--------|
| `FAN` | All fan routes — Fantasy, predictions, challenges, profile, leaderboard |
| `PSL_ADMIN` | All `/admin/*` routes. Cannot be self-granted. |

### Guard Implementation

- `JwtAuthGuard` — validates JWT, attaches `req.user`
- `RolesGuard` — checks `req.user.role` against `@Roles()` decorator
- Applied globally via `APP_GUARD` registration in `AppModule` (JwtAuthGuard), then per-controller for RolesGuard

### RBAC Rules

- **Never bypass RBAC** — explicit project rule. No `skipAuth` flags, no `if (isDev)` holes.
- Admin routes always require both `JwtAuthGuard` AND `RolesGuard` with `@Roles('PSL_ADMIN')`
- Fan routes require `JwtAuthGuard` only
- Role elevation is not available to fans — no route escalates a `FAN` to `PSL_ADMIN`

---

## Audit Logging

- **`AdminAuditLog`** — every admin mutation must write an immutable audit record
- Actor's `userId` is always extracted from the JWT context (`req.user.id`), never from request body
- Audit records are never deleted or updated
- Audit fields: `userId`, `action`, `targetModel`, `targetId`, `payload` (sanitised), `performedAt`

This is a non-negotiable rule. Bypassing audit logging violates the project's explicit rules.

---

## API Security Boundaries

### Input Validation

- All request bodies validated via NestJS `ValidationPipe` with class-validator DTOs
- `whitelist: true` — extra properties stripped
- `forbidNonWhitelisted: true` — extra properties cause 400

### SQL Injection Prevention

- Prisma ORM used exclusively — no raw SQL queries in application code
- All user-supplied values are parameterised automatically

### Cross-Site Scripting (XSS)

- All JSON API responses — not HTML rendered on server
- Frontend sanitises data before rendering via React's JSX escaping
- No `dangerouslySetInnerHTML` usage

### Rate Limiting

- Not yet implemented (PLANNED for Sprint 3)
- All fan-facing mutation routes are unthrottled in current build

### CORS

- `CorsModule` configured in `AppModule`
- Development: permissive (`*` origin for `localhost:3001`)
- Production: tighten to specific CloudFront origin (PLANNED)

---

## Wallet and Financial Security Boundaries

- **No funds held**: PSL One holds no customer funds. Wallet integration stores only external reference IDs.
- **Sandbox only**: `SiliconEnterpriseSandboxWalletAdapter` — zero outbound HTTP calls. No real wallet API calls in any deployed build.
- **Gameplay points ≠ money**: `SocialPredictionPointsEntry` records have no monetary value. No payment processor is called.
- **KYC not implemented**: Customer identification requirements for financial services are not in scope until a regulated wallet provider is contracted.

---

## Session and Token Security

Current implementation (development-suitable):

- JWT in `Authorization: Bearer` header
- Token stored in browser `localStorage` on the web app
- No CSRF protection (token-based auth mitigates CSRF for API calls)

Sprint 3 production hardening (PLANNED):

- `httpOnly` cookies to prevent XSS token theft
- `Secure; SameSite=Strict` cookie flags
- Refresh token rotation
- Session revocation table

---

## Secrets Management

Current (development):

- `JWT_SECRET`, `DATABASE_URL` in `.env` files (not committed)
- `.env.example` committed for required variable names

Production (PLANNED):

- AWS Secrets Manager for all credentials
- ECS task definition references secret ARNs
- No secrets in environment variables or config files

---

## Data Protection

- **POPIA (South Africa's data protection law)** — compliance audit required before production at scale
- `UserPreferences.consent` records fan consent at registration
- No PII exported from the system in current implementation
- `AdminAuditLog` contains actor userId — not fan-identifiable PII

---

## Production Security Readiness (Not Yet Built)

| Item | Status |
|------|--------|
| Rate limiting | PLANNED |
| AWS WAF | PLANNED |
| httpOnly session cookies | PLANNED |
| Secrets Manager | PLANNED |
| TLS termination | PLANNED |
| POPIA audit | COMPLIANCE_REQUIRED |
| KYC / AML | CONTRACT_REQUIRED (wallet provider) |
| Penetration test | PLANNED |

See [Production Readiness](../operations/PRODUCTION-READINESS.md) for full checklist.
