# Access Control Policy

**Status: NOT_SOC2_CERTIFIED — policy in draft**
Version: 1.0-draft | Date: 2026-06

---

## Roles

| Role | Access Level | Scope | Auth Method |
|------|-------------|-------|-------------|
| FAN | Read own data, submit predictions/fantasy teams | All public + own account | JWT |
| CLUB_OFFICIAL | Read/write club-scoped data | Own club only (PortalScopeService) | JWT |
| SPONSOR | Read/write sponsor-scoped data | Own sponsor org only (PortalScopeService) | JWT |
| PSL_ADMIN | Full admin access | All routes under /admin/* | JWT + @Roles('PSL_ADMIN') |
| SERVICE_ACCOUNT | Internal service-to-service | Backend only, not via public API | JWT (dedicated secret) |

---

## JWT Token Policy

| Property | Value | Notes |
|----------|-------|-------|
| Algorithm | HS256 | Symmetric; secret in AWS SSM |
| Access token TTL | 1 hour (3600s) | signOptions.expiresIn='1h' |
| Refresh token | Not implemented (Sprint 1-39) | Future: refresh token rotation |
| Logout | Client-side token discard | LocalJwtProvider.logout() is no-op |
| alg:none | REJECTED | LocalJwtProvider.verifyToken rejects |
| Missing exp | Accepted (gap — see SOC2 roadmap) | All issued tokens have exp via signOptions |

---

## Access Review Process

| Frequency | Review Type | Owner |
|-----------|-------------|-------|
| On offboarding | Remove user account | PSL_ADMIN |
| Quarterly | Review PSL_ADMIN accounts | Security Lead |
| Per PR | Review new route guards | PR Reviewer |
| Per sprint | Verify RBAC smoke tests pass | Platform Engineer |

---

## Cross-Tenant Access Prevention

- `PortalScopeService` enforces club/sponsor membership before any portal mutation
- `CROSS_CLUB_ACCESS_DENIED` and `SPONSOR_ACCESS_DENIED` errors thrown on violation
- Verified live on EC2 beta (Sprint 29, smoke run SHA 2605b37)

---

## Least Privilege Principle

- FAN role cannot access any `/admin/*` route (401/403)
- CLUB_OFFICIAL cannot access another club's data
- SPONSOR cannot access another sponsor's data
- No route grants PSL_ADMIN access without explicit `@Roles('PSL_ADMIN')` decorator

---

## Password Policy

- Minimum length: 8 characters
- Must contain: uppercase, lowercase, number, special character
- Storage: bcrypt hash (rounds=12), never plaintext
- Reset: time-limited token via `passwordResetToken` table
