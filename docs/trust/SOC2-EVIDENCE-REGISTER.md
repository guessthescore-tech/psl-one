# SOC2 Evidence Register

**Status: NOT_SOC2_CERTIFIED — evidence collection in progress**

| Evidence ID | Control | Type | Source | Status | Location |
|-------------|---------|------|--------|--------|----------|
| EV-001 | CC6.2 | Test results | auth-jwt-security.spec.ts | COLLECTED | apps/api/src/auth/auth-jwt-security.spec.ts |
| EV-002 | CC6.2 | Test results | auth.service.spec.ts | COLLECTED | apps/api/src/auth/auth.service.spec.ts |
| EV-003 | CC6.1 CC6.3 | Test results | roles.guard.spec.ts | COLLECTED | apps/api/src/auth/guards/roles.guard.spec.ts |
| EV-004 | CC6.6 | Code review | AdminAuditLog model in schema.prisma | COLLECTED | prisma/schema.prisma (AdminAuditLog model) |
| EV-005 | CC7.1 | CI scan results | pnpm audit output in GitHub Actions | COLLECTED | .github/workflows/ci.yml |
| EV-006 | CC7.1 | Container scan | Trivy scan results in CI | COLLECTED | .github/workflows/ci.yml (Trivy step) |
| EV-007 | CC8.1 | PR history | GitHub PR list — all merges via PR | COLLECTED | github.com repo PR history |
| EV-008 | CC6.3 | Smoke test | RBAC live smoke (8/0 PASS, Sprint 24) | COLLECTED | docs/sprints/sprint-24-complete.md |
| EV-009 | CC6.1 | Code review | PortalScopeService cross-tenant denial | COLLECTED | apps/api/src/portals/portal-scope.service.ts |
| EV-010 | CC6.2 | Config review | JWT_SECRET in AWS SSM (not in git) | COLLECTED | tools/staging/sprint-19-staging-env-check.mjs |
| EV-011 | A1.1 | Smoke test | 17/17 smoke checks PASS on EC2 | COLLECTED | Smoke run SHA 91dc999 |
| EV-012 | CC6.1 | Dependency review | No provider keys in frontend (grep clean) | COLLECTED | Sprint 39 security scan results |

---

## Evidence Collection Notes

### JWT Security (EV-001, EV-002)
Sprint 39 introduced `auth-jwt-security.spec.ts` with 12 tests covering:
- alg:none rejection
- Wrong key rejection
- Expired token rejection
- Tampered payload rejection
- Empty/malformed token rejection
- Valid token acceptance

### RBAC (EV-003, EV-008, EV-009)
- 36 guard tests added in Sprint 23 confirming PSL_ADMIN role alignment
- Cross-tenant smoke test run live on EC2 (Sprint 29): CROSS_CLUB/SPONSOR_ACCESS_DENIED verified

### Secret Management (EV-010, EV-012)
- grep scan on every sprint confirms no provider keys in source
- AWS SSM Parameter Store holds: JWT_SECRET, FOOTBALL_DATA_API_KEY, SCOREBAT_WIDGET_TOKEN etc.
- .gitignore includes .env* rules

### Audit Logging (EV-004)
- AdminAuditLog model: action, entityType, route, metadata, createdAt
- All import operations write audit entries (verified in WorldCupImportService)
- All admin RBAC failures throw logged ForbiddenException

---

## Gaps to Fill Before Audit

| Gap | Evidence Needed | Owner | Target |
|-----|----------------|-------|--------|
| Penetration test | External report | Security Lead | TBD |
| Log retention policy | CloudWatch config | DevOps Lead | TBD |
| Incident response test | Tabletop exercise record | Security Lead | TBD |
| Formal vulnerability disclosure process | Policy document + contact page | Security Lead | TBD |
