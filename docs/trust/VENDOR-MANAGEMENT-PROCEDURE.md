# Vendor Management Procedure

**Status: NOT_SOC2_CERTIFIED — procedure in draft**
Version: 1.0-draft | Date: 2026-06

---

## Vendor List

| Vendor | Service | Data Shared | Risk Level | Status |
|--------|---------|-------------|------------|--------|
| AWS | Hosting (EC2, SSM, CloudFront, S3) | All app data | HIGH | Active — af-south-1 region |
| GitHub | Source control, CI/CD | Source code, CI secrets | HIGH | Active |
| Vercel | Frontend hosting, preview deployments | Experience app bundle | MEDIUM | Active |
| football-data.org | WC fixture data | Query parameters only (no fan data) | LOW | Active (beta key) |
| API-Football | PSL fixture data | Query parameters only | LOW | PENDING_KEY |
| SportRadar | WC live data | Query parameters only | LOW | BETA_TRIAL |
| ScoreBat | Video highlights widget | No fan data | LOW | Active (widget token) |
| Parse.bot | PSL fixture scraping | Query parameters only | LOW | PENDING_KEY |
| Silicon Enterprise | Wallet sandbox | No real money; test data only | MEDIUM | Sandbox only |

---

## Risk Assessment

### AWS (HIGH risk)
- Hosts all production-bound infrastructure
- SSM Parameter Store holds all secrets
- S3 for file storage (ObjectStorageModule)
- Mitigation: DenyPublicS3 policy, IAM least-privilege, af-south-1 for data residency

### GitHub (HIGH risk)
- Source code and CI pipeline
- GitHub Actions has deploy permissions via OIDC
- Mitigation: OIDC (no long-lived credentials), branch protection on main, CODEOWNERS

### Vercel (MEDIUM risk)
- Hosts experience frontend
- Env vars stored in Vercel (INTERNAL_API_URL only; no secret provider keys)
- Mitigation: NEXT_PUBLIC_ env vars contain no secrets; all keys are server-side only

### football-data.org / API-Football / SportRadar (LOW risk)
- Read-only fixture/player data
- API keys stored in AWS SSM (not in code or Vercel)
- No fan PII sent to providers
- Mitigation: keys never in frontend, server-side requests only, NoOpAdapter as safe default

### Silicon Enterprise Wallet (MEDIUM risk)
- Sandbox only — no real money
- Not connected to production payment rails
- Mitigation: SiliconEnterpriseSandboxWalletAdapter explicitly labelled SANDBOX

---

## Data Classification Sent to Vendors

| Data Class | Vendors Receiving | Notes |
|------------|------------------|-------|
| Fan PII (email, DOB) | AWS only | Never sent to football data providers |
| Fixture/match data | football-data.org, API-Football, SportRadar (read from) | No fan data in requests |
| Source code | GitHub, AWS (ECR) | Standard SaaS supply chain |
| App bundle | Vercel | No secrets in bundle |

---

## Vendor Security Assessment Status

| Vendor | Assessment Type | Status |
|--------|----------------|--------|
| AWS | Reliance on AWS SOC2 report | ACCEPTED |
| GitHub | Reliance on GitHub SOC2 report | ACCEPTED |
| Vercel | Reliance on Vercel SOC2 report | ACCEPTED |
| football-data.org | Informal (no SOC2 available) | ACCEPTED (low risk — no fan data) |
| Silicon Enterprise | Sandbox only — not assessed | DEFERRED |
