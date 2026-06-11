# PSL One — ADR Backlog

**Version:** 1.0  
**Date:** 2026-06-08  
**Author:** PSL One Chief Architecture Agent  
**Location:** Decisions to be written to `docs/adr/ADR-NNN.md`

All ADRs must be completed and merged before Sprint 1 feature development begins.

---

## ADR Template

Each ADR must follow this structure:

```markdown
# ADR-NNN: [Title]

**Date:** YYYY-MM-DD
**Status:** PROPOSED | ACCEPTED | SUPERSEDED | DEPRECATED
**Owner:** [Agent or Team]
**Reviewed By:** Programme Director Agent, Technical Review Board

## Context
[Why is this decision needed? What problem does it solve?]

## Decision
[What we decided]

## Options Considered
### Option A: [Name]
Pros: ...  Cons: ...

### Option B: [Name]
Pros: ...  Cons: ...

## Consequences
### Positive
### Negative
### Risks

## Implementation Notes
[Specific implementation guidance for agents]
```

---

## ADR-001: Authentication Strategy

**Decision Required:** Which authentication provider to use for fan registration, login, MFA, social auth and admin access.

**Priority:** CRITICAL  
**Owner Agent:** Platform Agent (Identity)  
**Deadline:** Sprint 0, Day 1  
**Blocks:** Identity Service, all RBAC guards, all protected endpoints

### Options to Evaluate

| Option | Pros | Cons |
|---|---|---|
| **AWS Cognito** | Native AWS, SA data residency, free to 50K MAU, Lambda triggers for customisation | Limited custom UI, migration complexity, some POPIA consent customisation required |
| **Auth0** | Best-in-class DX, excellent social login, rich customisation | Cost at scale (~$0.70/MAU beyond 7,000), data residency may require configuration |
| **Keycloak (self-hosted)** | Full control, no per-MAU cost, POPIA-friendly | Operational burden, requires infrastructure management, upgrade complexity |
| **Supabase Auth** | Simple, PostgreSQL-native, open source | Less enterprise-grade, limited MFA options |

### Recommendation Status

**Recommended: AWS Cognito**

Rationale:
- Platform is AWS-native — Cognito integrates natively with IAM, API Gateway, Secrets Manager
- South African data residency in `af-south-1` (Cape Town region)
- Free tier covers 50,000 MAU (covers Year 1 completely)
- Lambda triggers enable custom POPIA consent flow, email verification customisation
- Federates with Google, Facebook, Apple for social login
- Scales to 2M users without architectural change

POPIA Gap: Cognito does not natively track granular consent purposes. Requires a supplementary `ConsentRecord` table in the Identity service database. Lambda post-confirmation trigger writes initial consent record.

---

## ADR-002: Monorepo Strategy

**Decision Required:** Monorepo tooling for managing 14+ services, 4 apps and 8 packages in a single repository.

**Priority:** CRITICAL  
**Owner Agent:** Platform Agent  
**Deadline:** Sprint 0, Day 1  
**Blocks:** All development — nothing can be built without this

### Options to Evaluate

| Option | Pros | Cons |
|---|---|---|
| **Turborepo** | Excellent caching, simple config, TypeScript-first, Vercel-backed | Less enterprise feature set than NX |
| **NX** | Powerful generators, task graphs, large ecosystem, affected-only CI | More complex config, learning curve, opinionated |
| **Lerna + pnpm** | Flexible, well-understood | Less intelligent caching, more manual config |
| **Single repo per service** | Maximum isolation | Extreme coordination overhead, shared-types hell |

### Recommendation Status

**Recommended: Turborepo + pnpm workspaces**

Rationale:
- Turborepo is simpler to configure than NX — faster to set up in Sprint 0
- pnpm provides excellent workspace management and faster installs than npm/yarn
- Turborepo's remote cache (Vercel) works with GitHub Actions out of the box
- `turbo run build --filter=...` enables affected-only CI without complex setup
- The team (agents) will benefit from simple, readable config

Package manager: `pnpm@9+`  
Node version: `22 LTS`

---

## ADR-003: API Strategy

**Decision Required:** When to use GraphQL vs REST vs WebSocket for PSL One service interfaces.

**Priority:** HIGH  
**Owner Agent:** Platform Agent (Gateway)  
**Deadline:** Sprint 0, Day 2  
**Blocks:** Gateway architecture, all service API design

### Options to Evaluate

| Approach | Pros | Cons |
|---|---|---|
| **GraphQL Federation only** | Unified client API, flexible querying, optimal for fans | Complex setup, N+1 risk, auth propagation complexity |
| **REST only** | Simple, cacheable, well-understood | Multiple round trips for complex queries, over-fetching |
| **GraphQL (external) + REST (internal)** | Best of both — simple internal, flexible external | More to maintain |
| **tRPC** | Type-safe, TS-first, great DX | Limited to TypeScript clients, not suitable for external partners |

### Recommendation Status

**Recommended: GraphQL Federation (external) + REST (internal admin + health)**

Decision:
- **External-facing API** (mobile app, web app, partner integrations): GraphQL Federation via Apollo Router
- **Service-to-service** communication: Direct service calls or Kafka events (not HTTP)
- **Admin endpoints** (Terraform, health checks, internal tooling): REST/OpenAPI
- **Real-time** (live scores, notifications): WebSocket via dedicated subscription endpoint on gateway
- **Webhooks** (ticketing partners, payment callbacks): REST endpoints with HMAC verification

GraphQL Library: `@nestjs/graphql` with `@apollo/subgraph` for federation  
Gateway: Apollo Router (Rust, high performance)

---

## ADR-004: Kafka / Event Strategy

**Decision Required:** Kafka deployment strategy, topic naming, schema format, and event governance.

**Priority:** CRITICAL  
**Owner Agent:** Platform Agent  
**Deadline:** Sprint 0, Day 1  
**Blocks:** All event-driven features — every service publishes or consumes events

### Options to Evaluate

**Kafka Deployment:**

| Option | Pros | Cons |
|---|---|---|
| **AWS MSK Serverless** | No broker management, scales to zero, pay-per-use | Less control, higher per-message cost at scale |
| **AWS MSK Provisioned** | Predictable cost at volume, full control | Requires capacity planning, running cost even at idle |
| **Confluent Cloud** | Best-in-class Kafka, schema registry included | Cost, external dependency |
| **Self-hosted Kafka on ECS** | Full control | Significant operational overhead |

**Schema Format:**

| Option | Pros | Cons |
|---|---|---|
| **JSON Schema + Zod** | TypeScript-native, readable, easy to validate | Larger message size than binary |
| **Avro + Confluent Schema Registry** | Compact binary, strong schema evolution | More complex tooling, Java-origin |
| **Protobuf** | Compact, language-agnostic | Complex tooling for TypeScript |

### Recommendation Status

**Recommended:**
- **Deployment:** AWS MSK Serverless (Phase 1) → AWS MSK Provisioned (Phase 3, when volume justifies)
- **Schema:** JSON Schema with Zod validation in TypeScript, stored in `packages/event-schemas`
- **Registry:** AWS Glue Schema Registry (native integration with MSK)

**Topic naming convention:**
```
<domain>.<entity>.<action>
Examples:
  identity.user.registered
  football.match.finished
  loyalty.points.awarded
  wallet.transaction.credited
```

**Event envelope (all events must include):**
```typescript
interface KafkaEvent<T> {
  eventId: string;      // UUID v4
  eventType: string;    // e.g. "identity.user.registered"
  version: string;      // e.g. "1.0.0"
  timestamp: string;    // ISO 8601
  tenantId: string;     // multi-tenancy
  correlationId: string; // request tracing
  payload: T;
}
```

**Outbox Pattern:** All services must use the Transactional Outbox Pattern to ensure events are published reliably (no event lost on service crash).

---

## ADR-005: Database Strategy

**Decision Required:** ORM selection, database hosting, schema management and migration strategy.

**Priority:** CRITICAL  
**Owner Agent:** All service agents  
**Deadline:** Sprint 0, Day 2  
**Blocks:** All service data models

### Options to Evaluate

**ORM:**

| Option | Pros | Cons |
|---|---|---|
| **Prisma** | TypeScript-first, excellent migrations, Prisma Studio, great DX, auto-generated client | Less flexible for complex queries, schema.prisma per service |
| **TypeORM** | Mature, NestJS-native decorators, flexible | Verbose, migration management is harder, less type-safe |
| **Drizzle ORM** | Lightweight, SQL-like syntax, very fast | Newer, less ecosystem |
| **MikroORM** | DDD-friendly (Unit of Work), good TypeScript | Steeper learning curve |

**Database:**

| Option | Pros | Cons |
|---|---|---|
| **Aurora Serverless v2** | Auto-scales, SA region, pay-per-ACU, compatible with PostgreSQL | Slightly higher latency than provisioned at steady load |
| **RDS PostgreSQL provisioned** | Predictable performance | Running cost even at zero load |
| **Neon (serverless Postgres)** | Excellent developer experience, branching | Not AWS-native, data residency consideration |

### Recommendation Status

**Recommended:**
- **ORM:** Prisma (schema.prisma per service, auto-generated client, excellent migration tooling)
- **Database:** AWS Aurora Serverless v2 PostgreSQL in `af-south-1`
- **Migrations:** Prisma Migrate (version-controlled in each service's `prisma/migrations/`)
- **Naming:** snake_case for all tables and columns. PascalCase for Prisma model names.
- **Per-service isolation:** Each service has its own database. No cross-service database access. Period.

**Database naming convention:**
```
psl_<service>_<env>
Examples:
  psl_identity_dev
  psl_football_dev
  psl_fantasy_prod
```

---

## ADR-006: AWS Deployment Strategy

**Decision Required:** AWS account structure, deployment regions, container orchestration and environment isolation.

**Priority:** HIGH  
**Owner Agent:** DevOps Agent  
**Deadline:** Sprint 0, Day 2  
**Blocks:** Terraform, CI/CD

### Options to Evaluate

**Account Strategy:**

| Option | Pros | Cons |
|---|---|---|
| **Single AWS account (all envs)** | Simple, low cost | Security blast radius risk, no billing isolation |
| **Multi-account (dev/staging/prod)** | Security isolation, billing clarity, independent IAM | More complex, higher overhead |
| **AWS Organisations + OU structure** | Enterprise-grade governance | Over-engineered for Phase 1 |

**Container Orchestration:**

| Option | Pros | Cons |
|---|---|---|
| **AWS ECS Fargate** | No server management, native AWS, integrates with ECR/Secrets Manager | Less flexible than Kubernetes |
| **AWS EKS** | Full Kubernetes ecosystem | Complex, expensive, over-engineered for Phase 1 |
| **AWS Lambda** | Cost-effective for sporadic loads | Cold starts problematic for API services |

### Recommendation Status

**Recommended:**
- **Account structure:** 3 AWS accounts — `psl-dev`, `psl-staging`, `psl-prod` — managed via AWS Organisations
- **Primary region:** `af-south-1` (Cape Town) — data residency for POPIA
- **Failover region:** `eu-west-1` (Ireland) — for DR only
- **Orchestration:** AWS ECS Fargate (no Kubernetes complexity in Phase 1)
- **Container registry:** AWS ECR (one repo per service)
- **Secrets:** AWS Secrets Manager with automatic rotation

**Deployment strategy:**
- Blue/green deployment via ECS for zero-downtime
- Health check required before traffic shift
- Rollback: repoint to previous task definition

---

## ADR-007: Football Data Provider Strategy

**Decision Required:** How to source reliable, real-time football data for PSL fixtures, results, player stats and live events.

**Priority:** HIGH  
**Owner Agent:** Football Core Agent  
**Deadline:** Sprint 0, Day 3 (commercial decision needed urgently)  
**Blocks:** Fantasy scoring, GTS settlement, live match centre

### Options to Evaluate

| Provider | Coverage | Cost (est.) | Real-time | PSL Coverage |
|---|---|---|---|---|
| **Sportradar** | Global, comprehensive | R15K-50K/month | Yes (<10s) | Yes |
| **Opta (Stats Perform)** | Premium, broadcast-grade | R20K-80K/month | Yes | Yes |
| **API-Football (RapidAPI)** | Good, affordable | R500-2K/month | 15-min delay | Partial |
| **LiveScore API** | Basic | R200-500/month | 15-min delay | Limited |
| **Manual data entry** | Full control | Staff cost only | No | Full |
| **Hybrid: API-Football + manual** | Practical | R500/month + staff | Delayed + manual | Full |

### Recommendation Status

**Recommended: API-Football (Phase 1) + manual override capability**

Rationale:
- Budget-appropriate for Phase 1 (R2M Year 1 revenue)
- PSL fixture schedule is known in advance — manual entry is feasible for Phase 1
- Fantasy scoring can tolerate 15-minute delay (not live-scoring)
- Build `FootballDataProviderPort` interface — switch to Sportradar in Phase 2 when budget allows

**Implementation requirement:** The Football domain MUST abstract behind a `FootballDataProviderPort` interface. The provider implementation is swappable without domain model changes. This is enforced by the ACL pattern.

---

## ADR-008: Frontend State Management Strategy

**Decision Required:** How to manage client-side state in Next.js 15 app.

**Priority:** HIGH  
**Owner Agent:** Frontend Agent  
**Deadline:** Sprint 0, Day 2  
**Blocks:** Web app development

### Options to Evaluate

| Option | Pros | Cons |
|---|---|---|
| **TanStack Query (server state) + Zustand (UI state)** | Best separation of concerns, excellent DX, lightweight | Two libraries |
| **TanStack Query only** | Sufficient for most cases | No good solution for complex local UI state |
| **Redux Toolkit + RTK Query** | Mature, well-known | Verbose, over-engineered for this scale |
| **SWR** | Simple, Next.js-compatible | Less feature-rich than TanStack Query |
| **Apollo Client (GraphQL)** | Native GraphQL caching | Heavy, cache complexity |

### Recommendation Status

**Recommended: TanStack Query v5 (server state) + Zustand (UI state)**

- **TanStack Query** handles all API/GraphQL data fetching, caching, background refresh, optimistic updates
- **Zustand** handles ephemeral UI state (modal open/close, form state, wizard steps)
- **Next.js App Router** server components used for initial page renders (no client-side fetch for static data)
- **Apollo Client** used alongside TanStack Query for GraphQL subscriptions (live match events)

---

## ADR-009: Testing Strategy

**Decision Required:** Test framework selection, coverage requirements, test types and CI enforcement.

**Priority:** HIGH  
**Owner Agent:** All agents  
**Deadline:** Sprint 0, Day 3  
**Blocks:** CI pipeline, all feature development

### Decision Points

| Area | Decision | Rationale |
|---|---|---|
| Unit test framework | **Vitest** | Faster than Jest, native ESM, compatible with NestJS |
| E2E framework | **Playwright** | Cross-browser, excellent for Next.js |
| Contract tests | **Pact.js** | Consumer-driven contract testing for Kafka events |
| Load tests | **K6** | Scripted load tests, integrates with GitHub Actions |
| API tests | **Supertest** (NestJS) | Standard for NestJS integration tests |
| Coverage tool | **V8 coverage** (built into Vitest) | Native, fast |

### Coverage Requirements

| Test Type | Minimum Coverage | Enforced By |
|---|---|---|
| Unit tests | 80% line coverage | CI (blocks merge) |
| Integration tests | Key flows covered | Required per service |
| Contract tests | All Kafka producers | CI (blocks merge) |
| E2E tests | Happy path per feature | Required per feature |

### Testing Rules (all agents must follow)
1. Every domain service method has a unit test
2. Every Kafka producer has a contract test (Pact)
3. Every API endpoint has an integration test (Supertest)
4. No mock of the database in integration tests — use test containers
5. Tests run in CI — no merge without green tests
6. Coverage report posted to every PR

---

## ADR-010: Security & POPIA Strategy

**Decision Required:** Security architecture implementation details and POPIA compliance approach.

**Priority:** CRITICAL  
**Owner Agent:** Platform Agent (Security)  
**Deadline:** Sprint 0, Day 3  
**Blocks:** Identity Service, data storage, all user-facing features

### Security Decisions

| Area | Decision |
|---|---|
| Auth tokens | JWT (RS256, not HS256). Public key distributed to all services. |
| Token lifetime | Access: 15 minutes. Refresh: 30 days. |
| Password hashing | bcrypt, cost factor 12 |
| Rate limiting | 10 requests/15 min for auth endpoints. 100 req/min general. |
| Input validation | Zod schemas at all API boundaries. Class-validator in NestJS. |
| SQL injection | Prisma parameterised queries (automatic protection) |
| XSS | CSP headers, no innerHTML, React DOM XSS protection |
| CSRF | SameSite=Strict cookies, CSRF token for state-changing ops |
| Secrets | AWS Secrets Manager only. No secrets in environment variables in prod. No secrets in git. |
| HTTPS | TLS 1.3 minimum. HSTS enabled. |
| Dependencies | Dependabot weekly scans. No known critical CVEs in production. |

### POPIA Compliance Decisions

| Requirement | Implementation |
|---|---|
| **Lawful basis for processing** | Consent (explicit, granular, per purpose) |
| **Consent capture** | At registration: MARKETING, ANALYTICS, THIRD_PARTY purposes shown separately |
| **Consent storage** | Immutable `consent_records` table: userId, purpose, granted, timestamp, ipAddress |
| **Right to access** | `GET /my/data` — returns all stored personal data within 24 hours |
| **Right to erasure** | `DELETE /my/account` — soft delete PII, replace with anonymised tokens, within 30 days |
| **Data minimisation** | Only collect: name, mobile, email, province, club preference. No ID number. |
| **Data retention** | Active users: indefinite. Deleted users: anonymised after 30 days. Logs: 90 days. |
| **Breach notification** | POPIA requires notification within 72 hours. Runbook must be documented. |
| **Data portability** | `GET /my/data/export` — JSON export of all personal data |
| **Minor protection** | Age gate at registration. Under-18 require guardian consent (Phase 2). |
| **Information Officer** | Must be designated. Contact details in privacy policy. |

**POPIA Review Required:** A qualified POPIA practitioner must review the consent model before go-live. This is not optional.
