# Sprint 35 — Launch Readiness Checklist

## Platform Health

- [x] API typecheck PASS (0 TypeScript errors)
- [x] 2077 API tests passing (89 spec files)
- [x] 1272 experience tests passing
- [x] Codex validation PASS (0 errors)
- [x] Docs validation PASS (18/18 checks)
- [x] 7/7 CI checks green (GitHub Actions)
- [x] RBAC smoke 8/8 PASS (last verified Sprint 24)
- [x] Staging smoke 21/21 PASS (last verified Sprint 29)

## Feature Completeness

- [x] Fan registration, login, RBAC
- [x] Fantasy football (full lifecycle)
- [x] Guess The Score predictions
- [x] Social activity feed
- [x] Achievements and badges
- [x] Leaderboards
- [x] Club experience (16 clubs)
- [x] Club portal (CLUB_ADMIN)
- [x] Sponsor portal (non-financial)
- [x] Audience segmentation (POPIA-safe)
- [x] News centre + video centre
- [x] Live match intelligence (read-only)
- [x] Admin command centre
- [x] Media / sponsor campaigns
- [x] PSL season calibration
- [x] Competition switching (13+ checks)

## Infrastructure

- [x] EC2 staging deployed (af-south-1b)
- [x] Docker Compose + Caddy HTTPS
- [x] GitHub Actions CI/CD
- [x] ECR image repositories
- [x] SSM parameter store (12 paths)
- [x] OIDC GHCR deploy role
- [ ] Redis distributed cache
- [ ] S3 media bucket (production)
- [ ] CloudFront CDN
- [ ] APM/monitoring

## Data

- [x] 16 PSL clubs seeded
- [x] WC2026 season active (104 matches)
- [x] 96 provisional WC players seeded
- [ ] PSL 2026/27 fixtures published
- [ ] PSL player pool (500+ players) with prices

## Owner Gates

- [ ] OG-35-DATA: Live data key authorised
- [ ] OG-35-PSL-ACT: PSL activation authorised
- [ ] OG-35-EC2-PROD: Production EC2 authorised
- [ ] OG-35-DNS: DNS cutover authorised
- [ ] OG-35-COMMERCE: Commerce NOT authorised (deferred)

## Overall Status: CONDITIONAL_GO (Beta) / BLOCKED (Production)

Beta with WC2026 data: **READY**
Production with PSL data: **BLOCKED** on OG-35-DATA + OG-35-PSL-ACT + OG-35-DNS
