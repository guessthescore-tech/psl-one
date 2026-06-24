# SOC2 Control Matrix

**Status: NOT_SOC2_CERTIFIED — evidence collection in progress**

| Control ID | Category | Description | Owner | Status | Evidence | Gap |
|------------|----------|-------------|-------|--------|----------|-----|
| CC6.1 | Logical Access | Role-based access control (RBAC) enforced on all API routes via RolesGuard | Platform Engineer | IMPLEMENTED | RBAC guard tests (1968 API tests passing) | None |
| CC6.2 | Authentication | JWT HS256 tokens with 1h expiration, bcrypt password hashing, alg:none rejected | Platform Engineer | IMPLEMENTED | auth-jwt-security.spec.ts, auth.service.spec.ts | Tokens without exp field accepted — add verifyOptions |
| CC6.3 | Authorization | PSL_ADMIN, CLUB_OFFICIAL, SPONSOR, FAN roles enforced; cross-tenant access denied | Platform Engineer | IMPLEMENTED | roles.guard.spec.ts, cross-tenant smoke tests | None |
| CC6.6 | Monitoring | AdminAuditLog records all admin mutations; auth events in authAuditLog | Platform Engineer | IMPLEMENTED | AdminAuditLog model, audit log tests | No real-time alerting configured yet |
| CC7.1 | Vulnerability Mgmt | Dependency audit in CI; Trivy container scan; undici CVE remediated | DevOps Lead | IMPLEMENTED | CI scan results (7/7 green), PR #3 undici fix | No formal vuln disclosure process |
| CC8.1 | Change Management | PR-based review; CI gates (typecheck, test, build, security scan) required | PR Reviewer | IMPLEMENTED | GitHub PR history, CI workflow | No formal change advisory board |
| A1.1 | Availability | EC2 beta at i-0a5f16539c9626f90; Caddy reverse proxy; health endpoint | DevOps Lead | IN_PROGRESS | Smoke tests (17/17 PASS), deploy runbook | No uptime SLA defined; no formal monitoring alerting |

---

## Control Detail Notes

### CC6.1 — Logical Access
- All admin endpoints require `@Roles('PSL_ADMIN')` decorator
- Club endpoints require `CLUB_OFFICIAL` membership verified via `PortalScopeService`
- Sponsor endpoints require `SPONSOR` membership verified via `PortalScopeService`
- Fan endpoints are authenticated but not role-restricted beyond FAN

### CC6.2 — Authentication
- JWT secret stored in AWS SSM Parameter Store, injected via `JWT_SECRET` env var
- Token TTL: 1 hour (`signOptions: { expiresIn: '1h' }`)
- Password hashing: bcrypt with salt rounds 12
- Known gap: no enforcement of `exp` presence in incoming tokens (mitigated by all issued tokens always having `exp`)

### CC6.6 — Monitoring
- `AdminAuditLog` records: action, entityType, route, metadata, createdAt
- Events: all import operations, RBAC events, season switching, fixture publication
- Gap: no real-time alerting on suspicious events (future: CloudWatch Alarms)

### CC7.1 — Vulnerability Management
- `pnpm audit` runs in CI on every PR
- Trivy scans Docker images on every push
- HIGH/CRITICAL CVEs must be resolved before merge (undici HIGH fixed in PR #3)
- MEDIUM CVEs reviewed case-by-case with deferred tracking in RISK-REGISTER.md
