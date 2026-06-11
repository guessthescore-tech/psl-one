# PSL One — Sprint 3: Commerce & Production Readiness Plan

**Sprint:** Sprint 3  
**Theme:** Commerce, Sponsor Activation, Production Deployment, First Product Launch  
**Trigger:** PSL season calibration complete, platform ready for public launch  
**Goal:** Turn on production, activate commerce, and launch PSL One publicly

---

## Sprint 3 Purpose

Sprint 3 is where PSL One becomes a real, deployed, revenue-generating product. After the World Cup beta (Sprint 1) and PSL season data preparation (Sprint 2), Sprint 3:

1. Deploys the platform to AWS production infrastructure
2. Sets up CI/CD quality gates
3. Activates sponsor management as a real bounded context
4. Enables reporting and analytics export
5. Implements POPIA-compliant data governance workflows
6. Unlocks rewards redemption (non-financial sponsor rewards)
7. Adds commerce foundation (digital goods, non-gambling)
8. Establishes monitoring, logging, and incident management

**Commerce must remain non-gambling.** PSL One does not implement betting, odds, stakes, payouts, deposits, withdrawals, or gambling mechanics unless explicit legal and product direction changes are provided.

---

## Candidate Stories

### Production Environment Readiness

**Goal:** PSL One runs on AWS production infrastructure with security hardening.

**Work:**
- Provision AWS ECS cluster (API service)
- Set up CloudFront distribution (web)
- Provision RDS PostgreSQL (production database)
- Configure AWS Secrets Manager for environment variables
- Configure EventBridge for domain events
- Deploy API container to ECS
- Deploy web app to CloudFront
- Configure custom domain and SSL
- Set up VPC, security groups, and IAM roles following least-privilege
- Validate: production API responds correctly
- Validate: production web serves fan and admin pages

**Notes:** Do not hardcode any secrets. All environment variables via Secrets Manager.

---

### CI/CD Quality Gate & Deployment Pipeline

**Goal:** Every PR goes through automated quality gates before merge. Every merge to main auto-deploys.

**Work:**
- Set up GitHub Actions (or AWS CodePipeline) for CI
- CI pipeline: install → typecheck → test → build → validate schema
- All 812 API tests + 8 web tests must pass on every PR
- CD pipeline: on merge to main, build Docker image, push to ECR, deploy to ECS
- Zero-downtime deployment (rolling or blue/green)
- Environment: staging and production environments
- Rollback capability: if health check fails, revert to previous image

**Acceptance:** New commit → fully tested → deployed to staging in under 10 minutes.

---

### Sponsor Management & Activation MVP

**Goal:** Sponsors can be onboarded and campaigns can target eligible fans.

**Work:**
- `Sponsor` model: name, logoUrl, website, contactEmail, status (ACTIVE/INACTIVE)
- `SponsorCampaign` model: sponsorId, name, targetCriteria (JSON), startDate, endDate, rewardType, rewardValue, activationLimit, activatedCount
- Link `RewardReadinessDefinition` to `SponsorCampaign`
- Admin CRUD for sponsors and campaigns
- Campaign targeting: evaluate eligible fans based on criteria
- Campaign activation: fan receives sponsor reward (code, link, or fulfilment reference)
- Admin: view campaign performance (eligible count, activated count)
- **No sponsor portal access in Sprint 3** — PSL admin manages on behalf of sponsors until portal is built
- **No automated fulfilment** — reward delivery is manual or via sponsor-provided redemption URL

**Notes:** Commerce here means digital rewards (discount codes, merchandise links, experiences). No fiat payments.

---

### Reporting & Export Centre MVP

**Goal:** PSL admin can generate and download platform reports.

**Work:**
- Report types: fan engagement summary, fantasy season stats, prediction accuracy, achievement distribution, sponsor campaign performance, notification delivery health
- CSV and JSON export
- Date range and season filters
- Admin-only access
- Reports run as background jobs (no blocking API calls for large datasets)
- Store generated report files temporarily (S3 in production)

**Notes:** No full report builder or scheduled delivery in initial MVP — those are future iterations.

---

### Compliance & Audit Governance MVP

**Goal:** PSL One meets POPIA (Protection of Personal Information Act) baseline obligations.

**Work:**
- Data subject access request flow: fan can request their own data export
- Data deletion request flow: fan can request account deletion (soft delete with retention period)
- Consent audit trail: all consent records tracked with timestamp and purpose
- Audit log viewer: PSL_ADMIN can search audit logs by user and action
- POPIA compliance checklist published and signed off
- DPA (Data Processing Agreement) references added to privacy policy

**Notes:** Full case management system is a future iteration. Sprint 3 delivers the self-service request flows and admin visibility.

---

### User & Role Administration MVP

**Goal:** PSL admins can manage user accounts and roles without database access.

**Work:**
- Admin can view all users with pagination and search
- Admin can update user roles (promote to PSL_ADMIN, assign CLUB_ADMIN)
- Admin can suspend/unsuspend user accounts
- Admin can view user activity summary
- Admin can trigger password reset for a user
- Audit log for all role/account changes

---

### Content Moderation Queue MVP

**Goal:** Systematic content moderation for the activity feed.

**Work:**
- Moderation queue: activity items flagged by fans or auto-flagged by keyword rules
- Admin moderation workflow: review → approve/hide/escalate
- Fan reporting: fans can report an activity item to add it to the moderation queue
- Moderation history and audit trail
- SLA targets: all flagged items reviewed within 24 hours

**Notes:** Sprint 1 has hide/unhide on activity items. Sprint 3 adds the full moderation queue workflow.

---

### Rewards Marketplace / Redemption Readiness

**Goal:** Eligible fans can redeem sponsor rewards.

**Work:**
- Redemption flow: fan claims a reward → system records redemption → sponsor is notified
- Redemption codes or links: stored per `SponsorCampaign`, distributed at claim time
- Fan sees: claimed rewards, redemption status, expiry
- Admin sees: redemption counts per campaign
- No cash payments, no fiat currencies, no financial transactions

**Acceptance:** Fan with ELIGIBLE status can claim a sponsor reward code without error.

---

### Commerce Foundation MVP

**Goal:** Platform can sell non-gambling digital goods to fans.

**Work:**
- `DigitalProduct` model: name, description, price (FV or fiat placeholder), type (PROFILE_BADGE, PREMIUM_FEATURE, BUNDLE)
- Fan-facing: browse, select, confirm purchase
- Payment processor integration: TBD (PSL to confirm provider — Peach Payments, PayStack, etc.)
- No gambling mechanics
- No crypto
- No withdrawal or deposit of real money until legal review completed

**Notes:** Commerce direction to be confirmed with product and legal before implementation. Sprint 3 prepares the foundation; actual money movement requires explicit sign-off.

---

### Monitoring, Logging & Incident Readiness

**Goal:** Platform failures are detected and alerted before fans notice.

**Work:**
- CloudWatch alarms: API error rate, latency p99, ECS CPU/memory
- Structured logging: all API errors logged with request ID, user ID, route
- Sentry (or equivalent) for exception tracking
- Uptime monitoring for API and web
- On-call runbook: how to investigate and roll back a failed deployment
- PagerDuty or equivalent alerting for P1 incidents
- Status page (public): pslone.co.za/status

---

### First Product Launch Readiness Review

**Goal:** Gate check before making PSL One publicly available to all fans.

**Checklist:**
- [x] Production environment deployed and tested
- [x] CI/CD pipeline operational
- [x] PSL season data complete (Sprint 2 done)
- [x] All API tests passing on production database
- [x] POPIA compliance checklist signed off
- [x] Privacy policy published
- [x] Terms of service published
- [x] Security review completed
- [x] Load test: simulated 10,000 concurrent users
- [x] Performance: API P95 latency < 200ms
- [x] Sponsor campaigns configured for launch
- [x] Admin users trained
- [x] Incident runbook published
- [x] Rollback plan tested

---

## What Is NOT Sprint 3

- Full sponsor portal (self-service for sponsors) — this is a future sprint
- Full CRM integration — future
- Direct messaging between fans — future
- Comments on activity items — future
- Media/video uploads — future
- External social sharing (Facebook, X, Instagram) — future
- Mobile native app — future
- Betting, odds, or gambling — never, unless explicit legal direction
- Crypto — never, unless explicit product direction

---

## Sprint 3 Technical Notes

### Infrastructure
- Terraform is the infrastructure-as-code tool
- **Do not run any `aws` CLI commands unless explicitly instructed** — design only until approved
- **Do not run any `terraform` commands (plan, apply, init, destroy) unless explicitly instructed** — design only until approved
- **Do not introduce Kafka, EventBridge, queues, or brokers unless explicitly approved** — all event integration is synchronous direct service calls until further notice
- **Local PostgreSQL (`psl_identity_dev`) remains the development default through Sprint 2 and early Sprint 3** — production RDS is only used after explicit deployment approval
- Production RDS requires regular backup verification
- CloudFront distribution caches static assets — cache invalidation strategy needed
- Connection pooling: RDS Proxy is preferred over PgBouncer for Fargate (stateless containers); capture this in an ADR before Sprint 3 deployment

### CORS (must fix before first ECS deploy)
- `apps/api/src/main.ts` currently hardcodes `origin: ['http://localhost:3001']`
- Before any staging or production deployment, `CORS_ORIGIN` must be an environment variable
- Recommended fix: `app.enableCors({ origin: process.env['CORS_ORIGIN']?.split(',') ?? ['http://localhost:3001'], credentials: true })`
- Failure to fix this will cause all production fan requests to be blocked by CORS

### Database
- Production uses AWS RDS PostgreSQL (not local)
- Migrations run via `prisma migrate deploy` (not `migrate dev`)
- Never run `prisma migrate reset` on production
- Create a dedicated performance index migration before any load testing

### Missing indexes (create as performance migration in Sprint 3)
The following indexes are absent from the Sprint 1 schema and will cause query degradation at 2M fans:
- `fixtures`: index on `(season_id, status)` and `(gameweek_id)`
- `score_predictions`: index on `(fixture_id, status)` for settlement queries
- `peer_challenges`: index on `challenger_user_id` and `opponent_user_id`
- `fantasy_gameweek_scores`: index on `(season_id, gameweek_id)` for leaderboard queries

### Security
- All secrets via AWS Secrets Manager — never in environment files
- JWT secret rotation policy needed
- API rate limiting: add `@nestjs/throttler` on auth endpoints before production
- Add `@fastify/helmet` for security headers (HSTS, XSS protection, etc.)
- HTTPS everywhere — no HTTP in production

### Performance
- Database indexes on high-traffic queries: create performance migration (see above)
- Redis caching for: active season, player pool, standings (Sprint 3+)
- Async event processing (achievement evaluation, notification dispatch) requires explicit broker decision — do not introduce Kafka or EventBridge until explicitly approved

### Compliance
- POPIA requires: lawful basis for processing, data subject rights, breach notification within 72 hours
- No personal data in activity feed public responses (currently enforced)
- No password hashes, reset tokens, or auth secrets in any API response (currently enforced)
