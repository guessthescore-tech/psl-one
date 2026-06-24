# Risk Register

**Status: NOT_SOC2_CERTIFIED — risk register in draft**
Version: 1.0-draft | Date: 2026-06

Likelihood: 1 (Very Low) to 5 (Very High)
Impact: 1 (Minimal) to 5 (Critical)
Risk Score = Likelihood × Impact

| Risk ID | Category | Description | Likelihood | Impact | Score | Mitigation | Status |
|---------|----------|-------------|------------|--------|-------|------------|--------|
| RISK-001 | Auth | JWT token theft via XSS or network interception | 2 | 4 | 8 | HTTPS enforced (Caddy); 1h TTL; no localStorage (cookie future); httpOnly flag planned | OPEN |
| RISK-002 | Data | Fan PII exposure via misconfigured API endpoint | 2 | 5 | 10 | RBAC on all fan data routes; Prisma select filtering; no bulk export endpoint | OPEN |
| RISK-003 | Secret | Provider API key exposure in logs or responses | 1 | 4 | 4 | Server-side only; grep scan each sprint; AWS SSM; never NEXT_PUBLIC_ | MITIGATED |
| RISK-004 | Business | PSL accidental activation in production | 1 | 5 | 5 | Double-gated: 8+ preflight checks; isActive guard; readiness endpoint; documented CONDITIONAL_GO | MITIGATED |
| RISK-005 | Availability | DDoS attack on EC2 beta | 2 | 3 | 6 | Caddy rate limiting; Vercel edge on experience; CloudFront for future CDN | PARTIAL |
| RISK-006 | Vendor | Third-party football data provider outage | 3 | 2 | 6 | NoOpAdapter as fallback; multiple providers registered; GTS markets pre-seeded | MITIGATED |
| RISK-007 | Supply Chain | Malicious npm package introduced via dependency | 2 | 4 | 8 | pnpm audit in CI; Trivy container scan; undici CVE remediated (PR #3) | OPEN |
| RISK-008 | Auth | Algorithm confusion attack (RS256 vs HS256) | 1 | 4 | 4 | JWT security tests verify algorithm rejection; alg:none rejected | MITIGATED |
| RISK-009 | Financial | Real-money wallet accidentally enabled | 1 | 5 | 5 | SiliconEnterpriseSandboxWalletAdapter explicitly labelled SANDBOX; no production rails | MITIGATED |
| RISK-010 | Compliance | POPIA violation — unauthorised PII access | 2 | 4 | 8 | RBAC enforces access; data minimisation in Prisma selects; deletion endpoint (Sprint 5) | OPEN |

---

## Risk Treatment Summary

| Treatment | Count |
|-----------|-------|
| MITIGATED (controls in place) | 5 |
| PARTIAL (partial controls) | 1 |
| OPEN (accepted with monitoring) | 4 |

---

## Review Schedule

| Frequency | Trigger | Owner |
|-----------|---------|-------|
| Per sprint | New feature or integration added | Platform Engineer |
| On incident | After any SEV-1 or SEV-2 incident | Security Lead |
| Quarterly | Formal risk review | Security Lead + Owner |
