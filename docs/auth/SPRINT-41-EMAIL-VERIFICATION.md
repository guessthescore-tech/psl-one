# Sprint 41 — Email Verification

## Overview

PSL One implements email verification at registration to:
- Confirm user-owned email addresses before enabling certain features
- Reduce bot/fake account creation
- Support POPIA compliance (verified contact details)
- Enable reliable transactional email delivery (bounce reduction)

---

## Implementation

### Backend

**Schema:** `EmailVerificationToken` model — same pattern as `PasswordResetToken`.
- Token stored as SHA-256 hash only (raw token never persisted)
- 24-hour expiry
- Single-use (usedAt timestamp set on confirmation)

**AuditEvent additions:**
- `EMAIL_VERIFICATION_REQUEST` — logged when verification email is requested
- `EMAIL_VERIFICATION_CONFIRM` — logged when token is successfully confirmed

**Routes:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | Public | Creates user as unverified; triggers verification email |
| `POST` | `/auth/email/verify/request` | FAN JWT | Resend verification email |
| `POST` | `/auth/email/verify` | Public | Confirm token, set isVerified=true |
| `GET` | `/auth/me` | FAN JWT | Returns `isVerified` field |
| `POST` | `/auth/login` | Public | Returns `emailVerified` in user object |

**Email provider:**

Abstract interface `EmailProvider` with adapters:
- `ConsoleEmailProvider` — development only; logs verification URL to stdout without exposing raw token structure in logs
- `NullEmailProvider` — staging/production placeholder; token is discarded until SES adapter is wired

**Environment variables:**

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `APP_BASE_URL` | Yes for real links | `http://localhost:3001` | Base URL for verify link |
| `EMAIL_PROVIDER` | No | `null` | Future: `smtp`, `resend`, `postmark`, `sendgrid` |
| `SMTP_HOST` | Future | — | SMTP hostname |
| `SMTP_PORT` | Future | `587` | SMTP port |
| `SMTP_USER` | Future | — | SMTP username |
| `SMTP_PASSWORD` | Future | — | SMTP password (never commit) |
| `SMTP_FROM` | Future | — | From address |
| `RESEND_API_KEY` | Future | — | Resend.com API key |
| `EMAIL_VERIFICATION_TOKEN_TTL_MINUTES` | No | `1440` (24h) | Token expiry |

---

### Frontend

**Routes:**

| Route | Description |
|-------|-------------|
| `/sign-up` | Registration form → "check your email" success state |
| `/verify-email?token=...` | Token confirmation page (server component) |
| `/account/security` | Shows verification status, resend button |

**User journey:**
1. User fills `/sign-up` form → POST /auth/register
2. On 201 response: "Check your email" state shown
3. User receives email → clicks link → `/verify-email?token=<raw>`
4. Page server-fetches POST /auth/email/verify → shows success/error
5. User redirected to `/sign-in` on success

---

## Security Properties

| Property | Implementation |
|----------|---------------|
| Token stored as hash | SHA-256, never plaintext in DB |
| Token single-use | `usedAt` timestamp blocks replay |
| Token expiry | 24-hour TTL (`expiresAt`) |
| Rate limiting | `AuthThrottleGuard` on `/auth/email/verify/request` |
| No enumeration | Success message always shown regardless of email existence |
| Audit log | Both request and confirm events logged |
| Raw token not logged | EmailProvider contract; NullProvider discards |
| No token in API response | Token only in email link |

---

## Email Provider Roadmap

For production, choose one:

| Provider | SA latency | Free tier | Monthly cost (10k emails) | DKIM support |
|----------|-----------|-----------|--------------------------|--------------|
| **Resend** | Good (EU/US) | 3k/month | $20 | Yes |
| **Postmark** | Good (EU/US) | 100/month | $15 | Yes |
| **SendGrid** | Good (US) | 100/day | $19.95 | Yes |
| **AWS SES** | af-south-1 | 62k/month (EC2) | ~$1/10k | Yes |
| **Brevo** | EU | 300/day | Free | Yes |

Recommended: **AWS SES** (lowest cost, ZA region available, already using AWS) or **Resend** (best DX).

When a provider is chosen, create `SmtpEmailProvider` or `ResendEmailProvider` implementing `EmailProvider` and wire it in `AuthModule` based on `EMAIL_PROVIDER` env var.

---

## ADR Reference

This feature informs ADR-037 (Email Provider Selection). ADR-037 should be created when an email provider is selected for production.
