# Incident Response Procedure

**Status: NOT_SOC2_CERTIFIED — procedure in draft**
Version: 1.0-draft | Date: 2026-06

---

## Severity Levels

| Severity | Definition | Response Time | Examples |
|----------|-----------|---------------|----------|
| SEV-1 (Critical) | Production down; data breach; PSL accidentally activated | Immediate | Auth bypass, database exposure, real-money feature enabled |
| SEV-2 (High) | Degraded service; security control failure; HIGH CVE exploited | 2 hours | RBAC bypass, provider key exposed, CI broken |
| SEV-3 (Medium) | Non-critical service degradation; MEDIUM CVE | 24 hours | API latency spike, fixture import failure, analytics gap |
| SEV-4 (Low) | Minor issue; cosmetic bug; LOW CVE | 72 hours | UI glitch, missing beta banner, documentation error |

---

## Detection

| Source | Method | Owner |
|--------|--------|-------|
| CI/CD | GitHub Actions alerts on failure | DevOps Lead |
| Application logs | CloudWatch log groups | DevOps Lead |
| Security scan | Trivy/pnpm audit in CI | Platform Engineer |
| Manual report | security@pslone.co.za | Security Lead |
| Beta tester | Feedback form / direct contact | Platform Engineer |

---

## Response Phases

### 1. Identification
- Alert raised via CI failure, log alert, or manual report
- On-call engineer acknowledges within response time
- Severity assessed and documented in incident channel

### 2. Containment
- SEV-1: Take affected service offline if needed; rotate all secrets
- SEV-2: Disable affected endpoint; block suspicious IPs in Caddy
- SEV-3/4: Monitor; prepare patch; no immediate takedown

### 3. Eradication
- Root cause identified
- Patch developed and tested locally
- PR created with fix; CI must pass before merge

### 4. Recovery
- Deploy patch to EC2 beta via standard deploy pipeline
- Smoke tests run (17+ checks)
- Service health confirmed

### 5. Post-Incident Review
- Write post-mortem within 48 hours of recovery
- Document: timeline, root cause, impact, prevention
- Update RISK-REGISTER.md with new or amended risk entry
- Update control matrix if a control failed

---

## Contact Chain (Beta Phase)

1. Platform Engineer (first responder)
2. DevOps Lead
3. Security Lead
4. Owner (for SEV-1 only)

**Security email:** security@pslone.co.za

---

## Beta-Specific Notes

- PSL is INACTIVE — accidental activation is SEV-1
- No real-money wallet is active — financial data breach risk is minimal
- Staging EC2 is the only deployed environment — no production blast radius
