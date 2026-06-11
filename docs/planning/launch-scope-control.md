# PSL One — Launch Scope Control

**Version:** 1.0  
**Date:** 2026-06-08  
**Authority:** PSL One Chief Architecture Agent + Programme Director  
**Purpose:** Define exactly what is in and out of the 12-week Phase 1 MVP launch

---

## Scope Philosophy

**Ship a platform that works perfectly for the features it has, rather than a platform that half-works for all the features it wants.**

The PSL One vision is large. The 12-week window is not. The discipline to say NO to good ideas is what creates space for great execution on the right ideas.

Every item in this document has been evaluated against the question: *Does a fan need this to register, engage, and come back tomorrow?*

---

## Must-Have for v1.0 (12-Week Launch)

These features must be complete, tested, and production-grade for the Phase 1 launch. No exceptions.

### Identity & Access

| Feature | Why Must-Have | Definition of Done |
|---|---|---|
| Fan registration (email + mobile) | Without this, there are no fans | Registration completes, OTP verified |
| Mobile OTP verification | SA mobile-first — SMS is primary | OTP delivered < 30 seconds |
| Email + password login | Standard access | JWT issued, session tracked |
| JWT + refresh token | Secure, stateless auth | Tokens rotate correctly |
| RBAC (Fan, Club Admin, PSL Admin) | Required for security model | All roles enforced at API |
| Password reset (email) | Basic UX requirement | Reset email delivered, new password set |
| POPIA consent capture | Legal requirement | Granular consent at registration |
| POPIA data access (`GET /my/data`) | Legal requirement | Export available within 24h |
| POPIA account deletion | Legal requirement | Anonymisation within 30 days |

---

### Fan Profile

| Feature | Why Must-Have |
|---|---|
| Fan profile (name, province, avatar) | Personalisation foundation |
| Club affiliation (primary club) | Core fan identity |
| Player favourites (up to 5) | Engagement hook |
| Notification preferences | Spam prevention + trust |

---

### Football Core

| Feature | Why Must-Have |
|---|---|
| Competition list (PSL, MTN8) | Content foundation |
| Season management | Scopes all features |
| Fixture list (upcoming + recent) | Daily retention hook |
| Live fixture status (scheduled/live/finished) | Engagement driver |
| Match results | Fundamental content |
| League standings table | Daily check behaviour |
| Club profiles | Fan discovery |
| Player profiles (basic) | Fantasy + engagement |
| Admin: manual fixture/result entry | Data entry fallback |

---

### Fantasy Football

| Feature | Why Must-Have |
|---|---|
| Squad creation (15 players, validation rules) | Core engagement feature |
| Captain + Vice Captain selection | Core fantasy mechanic |
| Free transfer (1 per gameweek) | Basic squad management |
| Paid transfer (points deduction) | Engagement mechanic |
| Gameweek scoring (goals, assists, clean sheets, cards) | The whole point of fantasy |
| Captain/Triple Captain multipliers | Core scoring mechanic |
| Bench logic (auto-fill if starter doesn't play) | Fairness mechanic |
| Wildcard chip | Most used chip |
| Overall leaderboard | Competition + retention |

---

### Guess The Score (GTS)

| Feature | Why Must-Have |
|---|---|
| Predict score for upcoming fixtures | Core prediction mechanic |
| One prediction per fixture | Game integrity |
| Prediction lock at kickoff | Game integrity |
| Automatic settlement after match.finished | Core mechanic |
| Exact score reward (500 points) | Incentive |
| Correct result reward (100 points) | Incentive |
| GTS leaderboard (gameweek + overall) | Competition |

---

### Loyalty & Wallet

| Feature | Why Must-Have |
|---|---|
| Loyalty account (created on registration) | Foundation of rewards |
| Points for: registration, login, GTS, Fantasy, content view | Earning mechanics |
| Fan tier (Bronze → Superfan) | Status gamification |
| Loyalty wallet (balance display) | Points have value |
| Transaction history | Trust + transparency |
| Basic reward catalogue (3-5 rewards) | Redemption motivation |
| Point redemption | Complete the loop |

---

### Content

| Feature | Why Must-Have |
|---|---|
| Article feed (club + league news) | Daily retention hook |
| Article view page | Content consumption |
| Basic video embed (YouTube / S3) | Richer engagement |
| Club-specific content filtering | Personalisation |
| PSL Admin content publishing | Content creation capability |

---

### Notifications

| Feature | Why Must-Have |
|---|---|
| Welcome email on registration | Onboarding + trust |
| Email: Fantasy gameweek result | Retention |
| Email: GTS prediction result | Retention |
| Push notification: match started | Real-time engagement |
| Push notification: Fantasy result | Retention |
| Fan can opt out per channel | Legal + trust |

---

### Web Application

| Feature | Why Must-Have |
|---|---|
| Responsive web app (mobile-first) | Primary access channel for SA fans |
| Home screen (fixtures + content feed) | Entry point |
| Fixture list with competition filter | Core content |
| Match centre (live/finished match detail) | Engagement |
| Fantasy team management | Core feature |
| GTS prediction entry | Core feature |
| Profile page (details + tier + points) | Fan ownership |
| Wallet page (balance + history) | Transparency |
| Registration + login flow | Entry requirement |

---

### Admin Portal

| Feature | Why Must-Have |
|---|---|
| User search + view | Support operations |
| User suspend/reinstate | Platform safety |
| Reward catalogue management | Operational control |
| Earning rule configuration | Commercial flexibility |
| Content publishing (articles) | Club + PSL editorial |
| GTS leaderboard management | Operations |
| Audit log viewer | Compliance |

---

### Infrastructure & Platform

| Feature | Why Must-Have |
|---|---|
| AWS ECS Fargate deployment | Cloud-native deployment |
| CloudFront CDN | Performance (SA + Africa) |
| AWS WAF | Basic security |
| PostgreSQL (Aurora Serverless v2) | Data store |
| Kafka (MSK Serverless) | Event bus |
| Redis (ElastiCache) | Cache + sessions |
| S3 (media storage) | Asset storage |
| GitHub Actions CI/CD | Continuous delivery |
| CloudWatch + X-Ray monitoring | Operations |
| Grafana dashboards | Executive visibility |
| 99.9% uptime target | Fan trust |

---

## Should-Have (Target for v1.1, Weeks 13-16)

These features add significant value but do not block the initial launch. Build immediately after Phase 1 stability is confirmed.

| Feature | Rationale for Deferral |
|---|---|
| Club portal (dedicated) | Admin portal serves Phase 1 club admin needs |
| Sponsor portal (self-service) | Manual sponsor management acceptable in Phase 1 |
| Mini fantasy leagues (private) | Overall league sufficient for Phase 1 |
| Bench Boost + Free Hit chips | Wildcard covers Phase 1; add other chips in v1.1 |
| Triple Captain chip | Add with other chips |
| Fantasy team history (previous seasons) | No previous season data yet |
| Full player statistics (xG, pass accuracy) | Requires premium data provider |
| Social sharing (share fantasy team, prediction) | Nice-to-have engagement boost |
| WhatsApp notifications | Email + push sufficient for Phase 1 |
| SMS notifications (non-OTP) | Budget optimisation |
| Referral program (earn points for referrals) | Launch first, add virality after |
| Push notification preferences (granular) | Opt-out per category sufficient for v1.0 |
| Search (players, articles, clubs) | Navigation sufficient for Phase 1 volume |
| Content scheduler (future publish date) | Immediate publish sufficient |
| Match timeline animations | Nice-to-have UX enhancement |

---

## Could-Have (Phase 2 Roadmap, Weeks 17+)

Validated ideas that require Phase 1 fan volume data before building.

| Feature | Prerequisite |
|---|---|
| Ticketing (Computicket/TicketPro integration) | Fan base to drive ticket sales |
| Basic marketplace (club merchandise) | Fan base + vendor onboarding |
| Club membership subscriptions | Revenue validation |
| Sponsor campaigns (self-service, basic) | Sponsor pipeline confirmed |
| Snowflake analytics (sponsor reporting) | Data volume to justify cost |
| Mobile web app optimisation (PWA) | Performance data from Phase 1 |
| React Native mobile app | Web app usage data + budget |
| Enhanced fantasy (chips, differential picks) | Fantasy player base established |
| Prediction streak bonuses | Loyalty data established |
| Fan badge system | Engagement data established |

---

## Explicitly Deferred (Phase 3+, No Timeline)

These are genuine product vision items that are NOT on the 12-week or Phase 2 path. Any attempt to scope these into Phase 1 or 2 is a scope risk.

| Feature | Why Deferred |
|---|---|
| **Financial Wallet (ZAR payments)** | Requires FSP licence (6-12 months) or banking partner |
| **Native ticketing engine** (seat maps, QR tickets) | Phase 1 aggregator model sufficient |
| **AI recommendation engine** | Requires Phase 1 data to train on |
| **Marketplace (full)** | Requires vendor onboarding + payment infrastructure |
| **Fan tokens / digital collectibles** | Requires regulatory clarity (FSCA crypto position) |
| **Betting partner integration (Betway API)** | Sponsorship is brand-only in Phase 1 |
| **Africa expansion (Nigeria, Ghana)** | Requires Phase 1 South Africa success |
| **Multi-language support** (Zulu, Xhosa, Afrikaans) | Phase 1 English only |
| **Live audio commentary** | Media rights complexity |
| **Video streaming** | Infrastructure + rights cost |
| **Esports / FIFA integration** | Phase 4 vision |
| **Women's football (NWSL/Hollywoodbets)** | Phase 3 multi-league expansion |
| **CAF/AFCON integration** | Phase 3 multi-league expansion |
| **SOC 2 / ISO 27001 certification** | Phase 3 (enterprise customer requirement) |
| **PCI DSS Level 1** | Phase 3 (required for financial wallet) |

---

## Scope Risks

### Risk 1: Fantasy Platform Complexity
Fantasy scoring engines are deceptively complex. Edge cases (player not playing, blank gameweek, postponed fixtures) can derail a sprint.

**Mitigation:** Fantasy Agent must build unit tests for every scoring edge case before integration. Define a "minimum viable scoring" feature set — goals, assists, clean sheets only for Phase 1; add bonus points, xG in v1.1.

---

### Risk 2: Football Data Provider Gaps
If the contracted data provider has incomplete PSL data (missing player IDs, wrong statistics), fantasy scoring breaks.

**Mitigation:** Build manual override admin endpoints for all football data. Football Agent cannot depend solely on provider data.

---

### Risk 3: POPIA Compliance Delays
If the POPIA legal review identifies issues with the consent model, Identity Service may need to be rebuilt.

**Mitigation:** POPIA legal review in Sprint 0 (Week 2), not Week 10. Fix the model before code is written, not after.

---

### Risk 4: Scope Creep from Stakeholder Demos
Early demos create feature requests. Every week of scope creep = 1 week of delay.

**Mitigation:** Implement scope control protocol below. Every new feature request goes through written process.

---

### Risk 5: Performance Under Matchday Load
PSL championship decider = potential 50K+ concurrent users. If the platform isn't load-tested, a viral moment becomes a crisis.

**Mitigation:** K6 load tests at 10K concurrent by Week 9. Infrastructure auto-scaling configured and tested.

---

## Scope Control Rules

These rules are **non-negotiable** and apply for the entire 12-week programme:

### Rule 1: The Iron Triangle
Every feature request must choose two:
- Fast (in 12 weeks)
- Cheap (within budget)
- Complete (full feature set)

If a stakeholder wants something fast AND complete, something currently in scope must be deferred.

### Rule 2: Written Scope Change Request
Any new feature added to Phase 1 scope requires:
1. Written request: What is it and why is it needed now?
2. Estimation: How many hours/days does it add?
3. Trade-off: What existing feature is deferred to make space?
4. Approval: Programme Director + CTO

No verbal scope changes. No "quick additions." No exceptions.

### Rule 3: No Feature Creep During Sprint
Features in the current sprint cannot be expanded mid-sprint. Improvements go on the backlog.

### Rule 4: Definition of Done is Binary
A feature is either Done (meets all acceptance criteria, all tests pass, security reviewed) or Not Done. There is no "mostly done" or "90% complete." 90% complete = 0% value.

### Rule 5: Agent Work Package Immutability
Once an agent receives a work package for a sprint, that package is not changed mid-sprint. New requirements go to the next sprint.

### Rule 6: Weekly Scope Review
Every Monday: Programme Director reviews scope health:
- What is at risk this sprint?
- Is any feature blocking another feature?
- Does anything need to be cut to protect the launch date?

The answer to "cut" is always preferable to "delay launch."

---

## v1.0 Definition of Done (Platform Level)

PSL One v1.0 is ready to launch when ALL of the following are true:

### Product
- [ ] All Must-Have features implemented and tested
- [ ] 0 P0 bugs
- [ ] ≤ 5 P1 bugs (documented, workarounds available)
- [ ] E2E test suite covers all user journeys (passing)
- [ ] Performance: p95 API latency < 300ms under 1,000 concurrent users
- [ ] Lighthouse score ≥ 90 (performance, accessibility)

### Security & Compliance
- [ ] POPIA legal review signed off
- [ ] OWASP Top 10 checklist complete
- [ ] Security Review Agent passed
- [ ] No critical or high CVEs in production dependencies
- [ ] AWS GuardDuty active
- [ ] CloudTrail logging active
- [ ] RBAC enforced across all endpoints

### Infrastructure
- [ ] Production environment deployed and healthy
- [ ] `terraform apply` production is clean
- [ ] Disaster recovery runbook tested (RTO < 4 hours)
- [ ] Automated backups running (RPO ≤ 15 minutes)
- [ ] Auto-scaling tested under 10K concurrent users
- [ ] Monitoring + alerting active (Grafana)
- [ ] On-call rotation established

### Operations
- [ ] Runbooks for: incident response, database restore, Kafka consumer lag, service restart
- [ ] Release Readiness Agent: GO verdict
- [ ] Rollback procedure documented and tested

### Commercial
- [ ] At least 1 club partner onboarded (content, branding)
- [ ] Admin portal team trained
- [ ] Support process documented
- [ ] Privacy policy and terms of service published (legal review)
