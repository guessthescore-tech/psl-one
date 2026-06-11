# PSL One — Architecture Readiness Report

**Generated:** 2026-06-08  
**Author:** PSL One Chief Architecture Agent  
**Classification:** Internal — Executive

---

## Current State

PSL One is in **documentation-complete, implementation-zero** state.

The strategic vision is clear. The business requirements are documented. The architecture is designed. The agent operating model is defined.

**Zero production code exists.**  
**Zero infrastructure exists.**  
**Zero tests exist.**  
**Zero CI/CD exists.**

The project is at the start of a 12-week sprint with the ambition of delivering South African football's Digital Operating System.

---

## Target State

By Week 12, PSL One should deliver a **Phase 1 MVP** capable of:

1. Fan registration and verified identity
2. Live PSL football data (fixtures, results, standings)
3. Fantasy football (squad creation, transfers, gameweek scoring)
4. Guess The Score predictions with point settlement
5. Basic loyalty wallet (points earn, tier display)
6. Web application (responsive, mobile-first)
7. Admin portal (user management, content management)
8. Core notifications (push, email)
9. All deployed to AWS via CI/CD
10. Monitored with Grafana / CloudWatch

---

## Gap Analysis

### Documentation Gaps

| Gap | Severity | Action Required |
|---|---|---|
| PRD is empty | CRITICAL | Complete PRD covering all Phase 1 user stories this week |
| TDAP truncated at 127 lines | HIGH | Complete TDAP with remaining engineering standards |
| Implementation Programme is BRD duplicate | HIGH | Write real delivery plan: sprints, teams, milestones |
| No ADRs | HIGH | Write 6 foundational ADRs before Sprint 1 |
| No Kafka event catalogue | HIGH | Document all 40+ events before first service is built |
| No API contracts | HIGH | OpenAPI specs required per service |

---

### Infrastructure Gaps

| Gap | Severity | Action Required |
|---|---|---|
| No Terraform code | CRITICAL | Sprint 0: network, compute, database, Kafka, Redis, S3 |
| No AWS accounts configured | HIGH | Provision dev, staging, production accounts |
| No ECS clusters | HIGH | Terraform ECS with auto-scaling |
| No Kafka cluster | HIGH | AWS MSK Serverless |
| No databases | HIGH | Aurora Serverless v2 per service |
| No CI/CD | CRITICAL | GitHub Actions for build, test, deploy |
| No secrets management | HIGH | AWS Secrets Manager |
| No domain/DNS | MEDIUM | Route53, ACM certificates |

---

### Application Gaps

| Gap | Severity | Action Required |
|---|---|---|
| No monorepo structure | CRITICAL | Bootstrap Turborepo monorepo |
| No Identity Service | CRITICAL | Sprint 1 priority |
| No Football Service | CRITICAL | Sprint 1 priority |
| No Fan Service | CRITICAL | Sprint 1 priority |
| No Fantasy Service | HIGH | Sprint 2 priority |
| No Loyalty/GTS Service | HIGH | Sprint 2 priority |
| No Wallet Service | HIGH | Sprint 2 priority |
| No Web Application | CRITICAL | Sprint 1 foundation, Sprint 2 features |
| No Notifications | HIGH | Sprint 2 priority |
| No GraphQL Federation Gateway | CRITICAL | Sprint 1 |
| No Admin Portal | HIGH | Sprint 2 |

---

### Integration Gaps

| Gap | Severity | Action Required |
|---|---|---|
| Auth provider not selected | CRITICAL | ADR-001 this week |
| Football data provider not contracted | HIGH | Commercial decision needed now |
| Payment provider not contracted | HIGH | Required for Phase 2 commerce |
| SMS provider not contracted | MEDIUM | Required for OTP (identity launch) |
| WhatsApp not configured | LOW | Phase 2 |

---

### Compliance Gaps

| Gap | Severity | Action Required |
|---|---|---|
| POPIA consent flow not designed | CRITICAL | Legal review + design before Sprint 1 |
| Data retention policy not defined | HIGH | Define before first data is stored |
| POPIA breach notification process | HIGH | Document before launch |
| Phase 3 Wallet FSP licensing | HIGH | Start legal process now (6-12 months) |
| PCI DSS readiness | MEDIUM | Required before payment processing (Phase 2) |

---

## Critical Risks

### Risk 1: PRD is Empty
**Severity:** CRITICAL  
**Description:** The product requirements document contains one line. There are no user stories, acceptance criteria, wireframes or UX designs. Engineering agents and developers are being asked to build without knowing exactly what to build.  
**Impact:** High probability of building the wrong product. Wasted sprints. Rework.  
**Mitigation:** Complete PRD for Phase 1 scope before any feature development begins. Minimum viable PRD: 30 user stories with acceptance criteria.

---

### Risk 2: 12-Week Timeline vs Zero Starting Point
**Severity:** CRITICAL  
**Description:** The delivery programme claims 12 weeks to production. With zero code, zero infrastructure, zero CI/CD and zero integrations, this requires delivering a complex multi-service, event-driven platform from scratch in 12 weeks.  
**Impact:** Timeline overrun is near-certain without significant scope reduction and parallel team execution.  
**Mitigation:**
1. Reduce Phase 1 scope to an absolute MVP (Identity + Football + Fan profile only for Week 4)
2. Ensure parallel workstreams (Infrastructure, Backend, Frontend run simultaneously)
3. Leverage AI agents aggressively for code generation with human review
4. Weekly milestone reviews with hard decisions on scope vs timeline

---

### Risk 3: Football Data Provider Not Contracted
**Severity:** HIGH  
**Description:** Fantasy scoring, GTS settlement and live match centre all depend on reliable, real-time football data. No provider has been contracted.  
**Impact:** Fantasy and GTS features cannot launch without this. Football Core can be built with seed data but live features are blocked.  
**Mitigation:** Commercial decision required this week. Options: Sportradar (premium), API-Football (cost-effective), manual data entry (fallback for Phase 1 only).

---

### Risk 4: Authentication Provider Decision Pending
**Severity:** HIGH  
**Description:** Every service depends on Identity. Identity depends on the auth provider (Cognito vs Auth0). This decision, once made and integrated, is expensive to reverse.  
**Impact:** Architecture divergence if decision is delayed. Risk of migration mid-build.  
**Mitigation:** Write and sign off ADR-001 this week. Recommendation: AWS Cognito.

---

### Risk 5: Domain Boundary Violations
**Severity:** HIGH  
**Description:** The agent-based build model means multiple AI agents build different services in parallel. Without automated enforcement, agents may create shared database tables, duplicate logic or publish incompatible events.  
**Impact:** Technical debt that compounds. Coupling that prevents independent scaling.  
**Mitigation:** Architecture tests from day one. ArchUnit / custom Gradle plugins. CODEOWNERS per service directory. PR review agent (already configured) must enforce boundaries.

---

### Risk 6: Kafka Schema Drift
**Severity:** HIGH  
**Description:** With 40+ Kafka events across 14+ services, schema drift is a high-probability failure mode. A producer changing an event schema breaks all downstream consumers.  
**Impact:** Silent data corruption. Production incidents.  
**Mitigation:** Schema Registry with forward/backward compatibility enforcement. Contract tests (Pact). No producer may change an event schema without consumer tests passing.

---

### Risk 7: Phase 3 Financial Wallet Regulatory Risk
**Severity:** HIGH  
**Description:** The Phase 3 Wallet enables financial transactions in ZAR. This requires either an FSP licence (minimum 6-12 months to obtain from FSCA) or a partnership with a licensed entity.  
**Impact:** Phase 3 Wallet may be blocked by regulatory constraints at the time it is scheduled.  
**Mitigation:** Begin FSP licensing process or banking partner negotiations now, before Phase 3 design begins.

---

### Risk 8: Agent Coordination Without Shared State
**Severity:** MEDIUM  
**Description:** The agent operating model (Programme Director + specialist agents) has no formal coordination mechanism. Agents may build conflicting implementations of shared concerns (error handling, auth guards, event publishing).  
**Impact:** Inconsistent platform quality. Integration failures between services.  
**Mitigation:** Shared `packages/` directory for cross-cutting concerns. Shared event schema package. Build standards in TDAP. Programme Director agent reviews all agent outputs before merge.

---

### Risk 9: Year 1 Budget vs Scale Target Mismatch
**Severity:** HIGH  
**Description:** BRD projects Year 1 revenue of R2M but targets 50K MAU. AWS infrastructure for the specified architecture (ECS Fargate, Aurora, MSK, ElastiCache, CloudFront) will cost approximately R30K-80K/month depending on traffic. Year 1 infrastructure costs alone could exceed Year 1 revenue.  
**Impact:** Operating loss in Year 1 is expected but must be planned for. Cost overrun could halt operations.  
**Mitigation:** Use AWS Serverless options (MSK Serverless, Aurora Serverless, ElastiCache Serverless) which scale to zero in low-traffic periods. Defer Snowflake to Phase 2. Set AWS Cost Budgets with alerts.

---

### Risk 10: Single Club / Single Competition Launch Viability
**Severity:** MEDIUM  
**Description:** The PSL has 16 clubs. If clubs do not actively promote PSL One to their fans, the 10,000 Year 1 registration target may not be reached. Without fan volume, the platform has no commercial value to sponsors.  
**Impact:** Revenue targets missed. Sponsor commitments at risk.  
**Mitigation:** Secure 3-5 PSL club launch partnerships before going live. Club engagement is a commercial priority, not just a product feature.

---

## Critical Decisions Required

| # | Decision | Owner | Deadline | Impact of Delay |
|---|---|---|---|---|
| 1 | Authentication Provider (Cognito vs Auth0) | CTO | Week 1 | Blocks Identity Service |
| 2 | ORM Selection (Prisma vs TypeORM) | Engineering Lead | Week 1 | Blocks all services |
| 3 | Monorepo Tool (Turborepo vs NX) | Engineering Lead | Week 1 | Blocks all apps |
| 4 | Football Data Provider | Commercial / CTO | Week 1 | Blocks Fantasy, GTS |
| 5 | SMS Provider for OTP | Engineering Lead | Week 1 | Blocks registration |
| 6 | Phase 3 FSP Licensing strategy | CEO / Legal | Week 2 | Blocks Phase 3 planning |
| 7 | Payment Provider (Phase 2) | Commercial | Week 3 | Blocks commerce planning |
| 8 | AWS account strategy (single vs multi-account) | DevOps | Week 1 | Blocks Terraform |
| 9 | Phase 1 MVP scope (what is in/out of 12 weeks) | CPO / CTO | Week 1 | Drives sprint plan |
| 10 | Club onboarding strategy | Commercial | Week 2 | Drives fan acquisition |

---

## Recommended Next Steps

### Week 1 (This Week)

1. **Complete the PRD** for Phase 1 scope. Minimum: 30 user stories with acceptance criteria.
2. **Write ADR-001** (Auth), **ADR-002** (ORM), **ADR-003** (Monorepo).
3. **Contract SMS provider** for OTP delivery (registration prerequisite).
4. **Select football data provider** or define mock strategy for Phase 1.
5. **Bootstrap Turborepo monorepo** with package structure.
6. **Begin Terraform networking** (Issue 003).
7. **Define Phase 1 MVP scope** — ruthlessly reduce scope to deliver value in Week 8.

### Week 2

8. **Complete Terraform infrastructure** (MSK, Aurora, Redis, ECR, S3).
9. **Bootstrap Identity Service** (Prisma schema, health check, registration endpoint).
10. **Start Football Service** (schema, seed data, GraphQL queries).
11. **GitHub Actions CI** green.
12. **POPIA legal review** — get sign-off on consent model.

### Week 3-4

13. **Identity Service complete** (registration, OTP, login, JWT, RBAC).
14. **Football Service complete** (fixtures, standings, GraphQL).
15. **Fan Service complete** (profile creation, club affiliation).
16. **Web App skeleton** (registration, login, fixture list).
17. **GraphQL Federation Gateway** running.

### Week 5-8

18. **Fantasy Service** (squad creation, transfers, scoring).
19. **GTS Service** (predictions, settlement).
20. **Loyalty Service** (points, tiers).
21. **Wallet Service** (ledger, credits).
22. **Notifications** (push, email).
23. **Web App features** (fantasy UI, GTS UI, profile UI).

### Week 9-12

24. **Sponsor portal** (basic campaign management).
25. **Admin portal** (user management, content management).
26. **Load testing** (matchday peak simulation).
27. **Security review** (OWASP, penetration test scope).
28. **Staging deployment** and user acceptance testing.
29. **Soft launch** to pilot club communities.

---

## Readiness Score

```
Category                    Score    Notes
─────────────────────────────────────────────────────────
Strategic Clarity:          90/100   Vision clear, BRD comprehensive
Architecture Design:        78/100   Sound but incomplete (PRD, TDAP gaps)
Technical Foundation:        0/100   Zero code written
Infrastructure:              0/100   Zero infrastructure built
Security & Compliance:      15/100   Designed but not implemented
Testing:                     0/100   No tests exist
CI/CD:                       0/100   No pipelines
Team / Agent Readiness:     60/100   Agents configured, humans not confirmed
Integration Readiness:       5/100   No providers contracted
Delivery Planning:          10/100   No real sprint plan exists

OVERALL READINESS SCORE:    26/100
```

---

## Launch Confidence Score

**Current:** 18/100

Without immediate action on the critical gaps identified above, a 12-week production launch is very low probability.

**With scope reduction + immediate action on critical decisions:**

Confidence of delivering a Phase 1 MVP in 12 weeks: **52/100**

Confidence of delivering a Phase 1 MVP in 16 weeks: **78/100**

**Recommendation:** Negotiate a 16-week timeline for Phase 1 MVP, or significantly reduce scope for a 12-week sprint. The architecture is right — the timeline is the risk.

---

## Architecture Readiness Score (Design Only)

Evaluating the architecture as *designed* (not as built):

```
DDD Alignment:             85/100   Correct bounded contexts, event flows
Event Architecture:        80/100   Kafka correct, schema governance needed
API Design:                75/100   GraphQL Federation is right, gaps remain
Security Design:           70/100   Framework correct, implementation detail missing
Scalability Design:        82/100   Correct choices, sizing validation needed
Observability Design:      75/100   Stack correct, implementation not started
Multi-tenancy Design:      72/100   Logical tenancy correct, implementation unclear
Data Architecture:         78/100   Correct, Snowflake timing question
DevOps Design:             65/100   Terraform + GitHub Actions correct, nothing built

ARCHITECTURE DESIGN SCORE: 76/100
```

The architecture deserves a 76/100 for design quality. This is a solid, modern architecture for this use case. The work now is to implement it.
