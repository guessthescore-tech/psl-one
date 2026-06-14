---
name: psl-one-security-review
description: OWASP Top 10 and PSL One-specific security checklist for reviewing authentication, RBAC, CORS, audit logging, and financial safety constraints.
---

# Skill: PSL One Security Review

**Skill ID:** psl-one-security-review  
**Purpose:** Equips a security reviewer agent with the PSL One security checklist covering OWASP Top 10, platform-specific security controls, and POPIA compliance.  
**Audience:** Security reviewer agents

---

## What this skill provides

1. PSL One security review checklist (OWASP-aligned)
2. Platform-specific security control inventory
3. Financial safety verification items

---

## Platform security controls inventory

These controls were implemented in S3-INFRA-00 (commit `ee1b4ed`). Every review should verify they are still present and not bypassed.

| Control | File | Implementation |
|---------|------|---------------|
| Auth throttle | `apps/api/src/auth/guards/auth-throttle.guard.ts` | 20 req / 15 min / IP |
| CORS validation | `apps/api/src/env.ts` `parseCorsOrigins()` | Rejects `*`; fails in prod if unset |
| Trust proxy | `apps/api/src/main.ts` | True only in staging/prod |
| Security headers | `apps/api/src/main.ts` | Fastify `onSend` hook |
| Password reset hash | `apps/api/src/auth/auth.service.ts` | SHA-256 hash stored; raw never logged |
| Password reset notifier | `apps/api/src/auth/providers/password-reset-notifier.ts` | Null in non-dev; Console in dev |
| RBAC guards | Every admin controller | `JwtAuthGuard + RolesGuard + @Roles('PSL_ADMIN')` |
| Audit log | Every admin mutation | `AdminAuditLog.create()` |
| Bounded pagination | `apps/api/src/common/pagination.ts` | `parseBoundedLimit`, `parseBoundedOffset` |

---

## Quick checklist

See [security-review-checklist.md](references/security-review-checklist.md) for the full checklist.

Key verification points:
- RBAC on every admin route
- SHA-256 hash storage for password reset tokens
- CORS wildcard rejection
- Audit log on every admin mutation
- No secrets in source
- Financial safety (points-only, sandbox wallet)

---

## References

- [Security review checklist](references/security-review-checklist.md) — full checklist with verification commands
