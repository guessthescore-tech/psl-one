# PSL One — Platform Architecture Review

**Generated:** 2026-06-08  
**Author:** PSL One Chief Architecture Agent  
**Classification:** Internal — Architecture Team

---

## Executive Summary

The PSL One architecture blueprint (EAB v1.0) is **sound in design but unbuilt in practice**. The intended architecture is modern, scalable and aligned with industry best practice for sports platforms. However, zero infrastructure exists today. This review assesses the architecture as designed and identifies the decisions still needed before build can begin.

---

## Architecture Alignment Assessment

### 1. Cloud Native — ALIGNED ✓

The EAB specifies AWS ECS Fargate for all services. This is the correct approach for a microservices platform targeting 2M fans:
- No server management overhead
- Independent scaling per service
- Pay-for-use cost model

**Gap:** No Terraform infrastructure written. No ECS task definitions. No ECR repositories.

---

### 2. Domain Driven Design — ALIGNED IN DESIGN, UNVALIDATED IN CODE ⚠

The EAB correctly identifies 14+ bounded contexts with independent databases. The agent configurations (football-core.md, fantasy-platform.md, etc.) correctly enforce domain rules.

**Risk:** The agent-based build model could cause domain boundary drift if agents build overlapping services. A shared schema or shared database between services would violate DDD principles and create coupling that is hard to reverse.

**Recommendation:** Enforce a `CODEOWNERS` file and automated architecture tests (ArchUnit or custom) from day one.

---

### 3. Event Driven Architecture — ALIGNED IN DESIGN ⚠

Kafka is the correct choice. The event catalogue in the EAB identifies all major event flows correctly.

**Critical Gap:** No Kafka topic naming convention defined. No schema registry configured. No event schema contracts written. Without schema governance, producers and consumers will drift.

**Recommendation:** Define Kafka topic naming convention before first service is built:
```
<domain>.<entity>.<action>
# Examples:
identity.user.registered
football.match.finished
loyalty.points.awarded
```

Use Confluent Schema Registry with JSON Schema (simpler than Avro for this team size).

---

### 4. GraphQL Federation — ALIGNED, HIGH COMPLEXITY RISK ⚠

GraphQL Federation is the right approach for a multi-service platform where clients need a unified API. However, it adds operational complexity:
- Gateway must be configured and kept in sync with all subgraphs
- Federation version compatibility (Apollo Federation v2)
- Schema conflicts between subgraphs must be actively managed

**Recommendation:** Use Apollo Router (Rust, high performance) as the federation gateway. Each service exposes its own subgraph schema. Auto-merge via CI.

**Alternative considered:** REST-only for Phase 1, add GraphQL in Phase 2. Rejected because Fantasy and Fan Profile are genuinely graph-shaped — GraphQL adds real value for client queries.

---

### 5. Scalability Assessment

**Year 1 Targets:** 50K MAU, <300ms API, <500ms search
**Year 5 Targets:** 2M registered fans, 400K MAU, 50K peak concurrent

The architecture can support these targets with the right sizing:

| Tier | Year 1 | Year 5 |
|---|---|---|
| ECS Fargate vCPU per service | 0.5 | 2-4 |
| RDS Aurora Serverless | Min 0.5 ACU | Up to 32 ACU |
| Redis ElastiCache | cache.t3.micro | cache.r6g.large |
| Kafka | 3 brokers (MSK) | 6+ brokers |
| CloudFront | Global CDN | Global CDN |

**Peak Event Risk:** Matchday for a major PSL fixture. Estimate 100K concurrent users for a championship decider. The architecture handles this via:
- CloudFront absorbing static/cached content
- WAF rate limiting protecting API layer
- Horizontal scaling via ECS auto-scaling
- Redis caching for standings, leaderboards, match data

---

### 6. Security Architecture — ALIGNED IN DESIGN, UNIMPLEMENTED ⚠

The EAB specifies the correct security stack: OAuth2, OIDC, MFA, WAF, KMS, GuardDuty, CloudTrail.

**Unresolved Decision:** Auth provider not selected.

**Options:**
| Provider | Pros | Cons |
|---|---|---|
| AWS Cognito | Native AWS integration, cost-effective, SA data residency | Limited customisation, complex migration |
| Auth0 | Feature-rich, excellent docs, social login | Cost at scale, data residency concerns |
| Keycloak (self-hosted) | Full control, no per-MAU cost | Operational burden |

**Recommendation:** AWS Cognito for Phase 1. Customise with Lambda triggers for POPIA consent flow. Migrate to Keycloak only if Cognito limitations become blocking.

**POPIA Gap:** Consent management requires custom implementation beyond what any auth provider offers out-of-the-box. A dedicated `ConsentRecord` table with purpose-based granular consent is required.

---

### 7. Observability Assessment

**Specified stack:** CloudWatch, OpenSearch (logs), Prometheus, Grafana, OpenTelemetry, AWS X-Ray.

**Assessment:** This is a mature observability stack. The challenge is cost and configuration.

**Recommended simplification for Phase 1:**
- CloudWatch Logs for all services (built-in with ECS)
- AWS X-Ray for distributed tracing (built-in with ECS)
- Grafana Cloud (managed) instead of self-hosted Grafana
- OpenTelemetry SDK in all NestJS services from day one

**Defer to Phase 2:** Self-hosted Prometheus, OpenSearch cluster (use CloudWatch Insights instead).

---

### 8. Data Architecture Assessment

**Operational:** PostgreSQL per service — correct. RDS Aurora Serverless v2 recommended.

**Cache:** Redis ElastiCache — correct for leaderboards, session state, rate limiting.

**Search:** OpenSearch — correct but expensive. Consider AWS Managed OpenSearch.

**Analytics:** Snowflake — excellent choice but expensive and complex. 

**Recommendation for Phase 1:** Use PostgreSQL read replicas for basic analytics queries. Introduce Snowflake in Phase 2 when sponsor reporting justifies the cost.

**Data Lake (S3):** Correct. All Kafka events should also be archived to S3 via Kafka S3 Sink Connector for replay and audit.

---

### 9. DevOps Architecture Assessment

**Source Control:** GitHub — correct.

**CI/CD:** GitHub Actions — correct. Zero workflows exist today.

**Terraform:** Specified but not started.

**Critical DevOps Decisions Needed:**

1. **Monorepo strategy:** Turborepo (recommended) or NX
2. **Docker base images:** Which Node.js base image? Alpine vs Debian?
3. **Environment strategy:** `dev`, `staging`, `production` — separate AWS accounts recommended
4. **Secret management:** All secrets in AWS Secrets Manager, rotated automatically
5. **Database migration strategy:** Prisma Migrate or Flyway — recommend Prisma for NestJS ecosystem

---

### 10. Multi-Tenancy Model Assessment

**Specified:** Logical multi-tenancy (shared infrastructure, tenant isolation via data).

**Assessment:** Correct for Phase 1. Physical isolation per tenant would be prohibitively expensive at this stage.

**Implementation Required:**
- `tenantId` on all requests (resolved from JWT)
- Row-level filtering in all database queries
- GraphQL context propagation of tenantId
- Audit logs must include tenantId

**Tenant Types:** PSL (league), Clubs (16+ in PSL), Sponsors, Merchants

---

## Technology Stack Assessment

| Component | Specified | Assessment | Recommendation |
|---|---|---|---|
| Frontend Framework | Next.js 15 | Excellent — App Router, RSC, streaming | Proceed |
| Frontend State | TanStack Query | Excellent for data fetching | Proceed |
| UI Components | ShadCN + Tailwind | Good, but lacks sports-specific components | Proceed with custom extensions |
| Backend Framework | NestJS | Excellent for microservices in TypeScript | Proceed |
| GraphQL Server | Apollo Federation | Correct choice | Apollo Router v2 |
| ORM | Not specified | **Gap** | Prisma ORM (TypeScript-first) |
| Message Broker | Kafka (MSK) | Correct | AWS MSK Serverless for Phase 1 |
| Cache | Redis | Correct | AWS ElastiCache Serverless |
| Primary DB | PostgreSQL | Correct | Aurora Serverless v2 |
| Search | OpenSearch | Correct | AWS Managed OpenSearch |
| Data Warehouse | Snowflake | Phase 2+ | Use RDS replicas for Phase 1 |
| Auth | Not specified | **Gap** | AWS Cognito |
| Infrastructure | Terraform | Correct | Terraform + Terragrunt |
| Container Orchestration | ECS Fargate | Correct | AWS ECS Fargate |
| CDN | CloudFront | Correct | Proceed |

---

## Strengths

1. **Architecture is well-conceived.** Domain-driven, event-driven, cloud-native — this is the right stack for a sports operating system.

2. **Agent model is innovative.** The use of Claude AI agents with domain-specific context (football-core, fantasy-platform, wallet) is a force multiplier that can accelerate delivery significantly.

3. **Event catalogue is pre-defined.** The EAB identifies most of the key events before code is written. This prevents event proliferation and ensures consistent patterns.

4. **Multi-competition by design.** The `ActiveSeasonContext` pattern and prohibition on hardcoding PSL ensures the platform can expand to MTN8, CAF and beyond without architectural rework.

5. **Phased rollout strategy is realistic.** The BRD's Phase 1→5 approach prevents scope creep and gives a credible path to production.

---

## Weaknesses

1. **PRD is empty.** There are no product requirements to build against. The architecture and business requirements are clear, but product specifications (wireframes, user stories, acceptance criteria) do not exist. This is the single biggest delivery risk.

2. **TDAP is incomplete.** The Technical Design Authority Pack is truncated at 127 lines. Engineering teams and AI agents are building without a complete build authority document.

3. **Implementation Programme is a duplicate of BRD.** There is no delivery timeline, sprint plan or resource allocation. The 12-week target has no basis in planning.

4. **No ADRs.** Key decisions (auth provider, ORM, monorepo tool, Kafka schema format, test framework) have not been documented. Without ADRs, these will be made inconsistently by different agents.

5. **Financial Wallet regulatory risk is unaddressed.** Phase 3 Wallet requires either an FSP licence or partnership with a licensed entity. This has a minimum 6-12 month lead time and is not reflected in the roadmap.

6. **Football data provider not contracted.** Fantasy scoring and GTS settlement depend on reliable real-time match data. Without a contracted provider and tested API, these features cannot launch.

---

## Recommendations

### Immediate (Before Sprint 1)

1. **Complete the PRD** — Define user stories for Phase 1 scope (Identity, Fan, Football, Fantasy, GTS, basic Loyalty).
2. **Complete the TDAP** — Add: ORM choice, monorepo setup, test standards, naming conventions, Kafka topic conventions, environment strategy.
3. **Write ADR-001: Auth Provider** — Select and document Cognito vs Auth0.
4. **Write ADR-002: Monorepo Strategy** — Select and document Turborepo vs NX.
5. **Write ADR-003: ORM** — Prisma vs TypeORM.
6. **Write ADR-004: Kafka Schema Registry** — JSON Schema vs Avro.
7. **Contract a football data provider** — Evaluate Sportradar, API-Football, OptaSports.

### Phase 1 Architecture Optimisations

1. **Use AWS MSK Serverless** for Kafka — eliminates broker management complexity.
2. **Use Aurora Serverless v2** — automatic scaling, cost-effective for variable loads.
3. **Defer Snowflake** — use PostgreSQL read replicas until sponsor reporting justifies Snowflake cost (~$400/month minimum).
4. **Grafana Cloud free tier** instead of self-hosted for Phase 1.

---

## Risks

| Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|
| PRD empty — wrong product built | CRITICAL | High | Complete PRD before Sprint 1 |
| Football data provider not available | HIGH | High | Contract now; use mock data for dev |
| Auth provider migration mid-build | HIGH | Medium | Decide before first service built |
| Domain boundary violations between agents | HIGH | Medium | ArchUnit tests + CODEOWNERS |
| Kafka schema drift | HIGH | High | Schema Registry + contract tests (Pact) |
| Financial Wallet regulatory risk | HIGH | Certain | Legal review before Phase 3 design |
| 12-week timeline with zero code today | CRITICAL | High | Reduce Phase 1 scope to MVP |
| AWS cost overrun | MEDIUM | Medium | Cost budgets + auto-stop in dev |
| POPIA compliance not implemented | HIGH | High | POPIA review in Sprint 0 |
| Single football data provider | MEDIUM | High | Design for provider abstraction |

---

## Readiness Scores

```
Architecture Design:       ████████░░  78/100
Technology Choices:        ████████░░  75/100  (gaps: auth, ORM, schema format)
Security Design:           ███████░░░  65/100  (designed but unimplemented)
Scalability Design:        ████████░░  80/100  (sound but untested)
DevOps Readiness:          ██░░░░░░░░  15/100  (nothing built)
Infrastructure Readiness:  ░░░░░░░░░░   0/100  (nothing built)
Compliance Readiness:      ███░░░░░░░  25/100  (POPIA identified, not implemented)
Build Readiness:           ██░░░░░░░░  18/100  (documentation phase only)

OVERALL ARCHITECTURE SCORE: 45/100
```

The architecture is well-designed but the implementation is at 0%. The 45/100 score reflects strong design with zero execution to date.
