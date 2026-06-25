# Email Verification — Trust Control Evidence

Generated: 2026-06-25 | Sprint: 41

---

## Control: Verified Email at Registration

### Control statement
PSL One verifies user email addresses before enabling trust-sensitive features, reducing fraud risk and ensuring reliable contact with users in compliance with POPIA's accuracy principle.

### Implementation evidence

| Evidence item | Location | Status |
|---------------|----------|--------|
| `EmailVerificationToken` model with hashed token, expiry, single-use | `apps/api/prisma/schema.prisma` | IMPLEMENTED |
| Token stored as SHA-256 hash only | `apps/api/src/auth/auth.service.ts` — `requestEmailVerification()` | IMPLEMENTED |
| Token expires after 24 hours | `apps/api/src/auth/auth.service.ts` — `expiresAt` check | IMPLEMENTED |
| Single-use enforcement | `usedAt` timestamp set on confirm | IMPLEMENTED |
| `EMAIL_VERIFICATION_REQUEST` audit log | `apps/api/prisma/schema.prisma` AuditEvent enum | IMPLEMENTED |
| `EMAIL_VERIFICATION_CONFIRM` audit log | `apps/api/prisma/schema.prisma` AuditEvent enum | IMPLEMENTED |
| User.isVerified field | `apps/api/prisma/schema.prisma` — `isVerified Boolean @default(false)` | IMPLEMENTED |
| Rate limiting on resend | `AuthThrottleGuard` on POST /auth/email/verify/request | IMPLEMENTED |
| No raw token in DB | Token column named `tokenHash` — SHA-256 only | IMPLEMENTED |
| No raw token in logs | `NullEmailProvider` discards; `ConsoleEmailProvider` logs URL only in dev | IMPLEMENTED |
| No token in API response | Token delivered only via email | IMPLEMENTED |
| Error-safe delivery | `requestEmailVerification` wrapped in try/catch; email failure does not block registration | IMPLEMENTED |

---

## Test coverage

| Test | File | Status |
|------|------|--------|
| register creates unverified user | `apps/api/src/auth/auth.service.spec.ts` | IMPLEMENTED |
| verification token is hashed | `apps/api/src/auth/auth.service.spec.ts` | IMPLEMENTED |
| expired token rejected | `apps/api/src/auth/auth.service.spec.ts` | IMPLEMENTED |
| invalid token rejected | `apps/api/src/auth/auth.service.spec.ts` | IMPLEMENTED |
| valid token sets isVerified=true | `apps/api/src/auth/auth.service.spec.ts` | IMPLEMENTED |
| used token rejected (replay) | `apps/api/src/auth/auth.service.spec.ts` | IMPLEMENTED |
| login includes emailVerified | `apps/api/src/auth/auth.service.spec.ts` | IMPLEMENTED |
| raw token not logged | `apps/api/src/auth/providers/email-provider.ts` — NullEmailProvider | IMPLEMENTED |

---

## POPIA alignment

| POPIA principle | Alignment |
|----------------|-----------|
| Accuracy | Verified email reduces inaccurate contact data |
| Accountability | Audit log records every verification request and confirmation |
| Security | Token hashed; single-use; expiry |
| Transparency | User informed in sign-up UI that verification email is sent |
| Minimality | Only email and token stored for verification; no extra data |

---

## Outstanding items

| Item | Priority | Owner |
|------|----------|-------|
| Wire production email provider (SES or Resend) | HIGH | Infra story |
| `REQUIRE_EMAIL_VERIFIED` flag to block predictions until verified | MEDIUM | Product decision |
| Email template with PSL One branding | MEDIUM | Design story |
| DMARC/SPF/DKIM records for pslone.co.za | HIGH | DNS story |
