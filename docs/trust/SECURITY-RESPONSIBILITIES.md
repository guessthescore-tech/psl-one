# Security Responsibilities

**Status: NOT_SOC2_CERTIFIED — roles in draft**
Version: 1.0-draft | Date: 2026-06

---

## Role Definitions

### Security Lead
- Owns SOC2 readiness programme
- Conducts quarterly access reviews
- Manages incident response for SEV-1/SEV-2
- Approves changes to auth system, RBAC, or secret management
- Reviews and updates RISK-REGISTER.md quarterly
- Point of contact for security@pslone.co.za

### DevOps Lead
- Manages AWS infrastructure security (SSM, IAM, S3 policies)
- Maintains CI/CD pipeline security gates
- Owns log retention and CloudWatch configuration
- Manages Terraform change reviews
- Reviews all infrastructure PRs before merge

### Platform Engineer
- Implements security controls in code (guards, middleware, validators)
- Maintains RBAC guard coverage on all routes
- Runs security scans (pnpm audit, Trivy) and remediates findings
- Writes and maintains security test suites (roles.guard.spec, jwt security spec)
- Performs sprint-level security grep scans (no keys in frontend)

### PR Reviewer
- Reviews all code changes for RBAC coverage
- Flags new endpoints without auth guards
- Verifies CI gates pass before approving merge
- Ensures no secrets in code diff
- Checks that ADRs are created for architectural decisions

---

## Responsibility Matrix (RACI)

| Activity | Security Lead | DevOps Lead | Platform Engineer | PR Reviewer |
|----------|--------------|-------------|------------------|-------------|
| RBAC implementation | A | I | R | C |
| JWT security | A | I | R | C |
| Secret management | A | R | C | I |
| CI security gates | C | A | R | C |
| Dependency audit | A | C | R | I |
| Incident response (SEV-1) | R | R | C | I |
| Incident response (SEV-2/3) | A | C | R | I |
| SOC2 evidence collection | R | C | C | I |
| Access review | R | C | I | I |
| Risk register | R | C | C | I |

R = Responsible, A = Accountable, C = Consulted, I = Informed

---

## Beta Phase Notes

- All roles may be held by the same person during beta
- Formal role separation is a pre-production gate
- At minimum, a separate reviewer (not the author) must approve each PR
