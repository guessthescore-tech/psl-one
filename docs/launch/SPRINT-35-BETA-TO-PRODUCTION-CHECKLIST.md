# Sprint 35 — Beta to Production Checklist

## Infrastructure

- [ ] EC2 instance type reviewed for production traffic (t3.medium → m5.large?)
- [ ] RDS instance type reviewed (dev RDS → production-grade Multi-AZ)
- [ ] ElastiCache Redis provisioned (replaces in-memory cache for multi-task)
- [ ] CloudFront CDN distribution configured for psl.co.za
- [ ] S3 bucket for media assets (af-south-1, versioning enabled)
- [ ] AWS WAF rules configured (rate limiting, geo-restriction if needed)
- [ ] Backup schedule: daily DB snapshot, 7-day retention
- [ ] Monitoring: CloudWatch alarms for CPU/memory/DB connections
- [ ] APM: Datadog or AWS X-Ray configured

## Security

- [ ] All SSM parameters migrated from beta names to production names
- [ ] JWT secret rotated (never use the same secret across beta and production)
- [ ] Admin user provisioned with PSL_ADMIN role (never use beta admin JWT)
- [ ] CORS policy restricted to psl.co.za and api.psl.co.za
- [ ] HTTPS enforced everywhere (HTTP → HTTPS redirect)
- [ ] Security scan re-run on production build (Trivy, npm audit)
- [ ] Rate limiting configured (100 req/min per IP on public endpoints)

## Data

- [ ] Production DB seeded (clubs, PSL season, fixtures, players)
- [ ] Seed data verified: 16 clubs, correct PSL fixtures, accurate squad prices
- [ ] `prisma migrate deploy` run on production DB (not `migrate dev`)
- [ ] Migration status: all 44 migrations applied
- [ ] PSL season activation pre-flight: 13 checks PASS (OG-35-PSL-ACT)

## CI/CD

- [ ] GitHub Actions deploy workflow points to production ECS task/EC2
- [ ] Separate staging and production environment variables
- [ ] Branch protection on `main` (require PR review before merge)
- [ ] Deployment rollback procedure documented and tested

## Frontend

- [ ] Vercel production deployment verified (psl-one-experience.vercel.app or custom domain)
- [ ] Environment variables set in Vercel production (NEXT_PUBLIC_API_URL)
- [ ] Vercel Analytics enabled
- [ ] Web Vitals: LCP < 2.5s, CLS < 0.1, FID < 100ms

## Legal & Compliance

- [ ] POPIA privacy policy published at /privacy
- [ ] Terms of service published at /terms
- [ ] PAIA manual available (if required for scale)
- [ ] Cookie consent banner (if analytics cookies used)

## Owner Gate Status

- [ ] OG-35-PSL-ACT: AUTHORISED by owner
- [ ] OG-35-EC2-PROD: AUTHORISED by owner
- [ ] OG-35-DNS: AUTHORISED by owner
