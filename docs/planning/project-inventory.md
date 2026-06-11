# PSL One — Project Inventory

**Generated:** 2026-06-08  
**Author:** PSL One Chief Architecture Agent  
**Status:** Initial Discovery

---

## 1. Repository Structure

```
psl-one/
├── .claude/
│   ├── agents/             # 5 specialist build agents
│   ├── operations/         # 2 autonomous operation agents
│   ├── review-agents/      # 1 PR review agent
│   ├── skills/             # 4 frontend design skills
│   └── tasks/              # 2 task management agents
├── .codex/
│   └── review-agents/      # 3 code review agents
├── .github/
│   ├── ISSUE_TEMPLATE/     # EMPTY
│   └── workflows/          # EMPTY
├── docs/
│   ├── adr/                # EMPTY — no ADRs yet
│   ├── architecture/       # EAB.md, TDAP.md
│   ├── business/           # BRD.md
│   ├── delivery/           # implementation-programme.md (duplicate of BRD)
│   ├── planning/           # This directory (being created now)
│   ├── product/            # PRD.md (EMPTY — 1 line)
│   └── work-packages/      # EMPTY
├── scripts/                # EMPTY
├── src/                    # EMPTY — no application code
├── tests/                  # EMPTY — no tests
└── CLAUDE.md
```

---

## 2. Existing Applications

| Application | Status | Notes |
|---|---|---|
| Mobile App (React Native / Expo) | **NOT STARTED** | Not in codebase |
| Web App (Next.js 15) | **NOT STARTED** | Not in codebase |
| Club Portal | **NOT STARTED** | Not in codebase |
| Sponsor Portal | **NOT STARTED** | Not in codebase |
| Admin Portal | **NOT STARTED** | Not in codebase |

---

## 3. Existing Services

| Service | Status | Notes |
|---|---|---|
| Identity Service | **NOT STARTED** | — |
| Fan Service | **NOT STARTED** | — |
| Club Service | **NOT STARTED** | — |
| Football Service | **NOT STARTED** | — |
| Content Service | **NOT STARTED** | — |
| Fantasy Service | **NOT STARTED** | — |
| Loyalty / Rewards Service | **NOT STARTED** | — |
| Wallet Service | **NOT STARTED** | — |
| Ticketing Service | **NOT STARTED** | — |
| Marketplace Service | **NOT STARTED** | — |
| Sponsor Service | **NOT STARTED** | — |
| Analytics Service | **NOT STARTED** | — |
| Notification Service | **NOT STARTED** | — |
| Search Service | **NOT STARTED** | — |
| Media Service | **NOT STARTED** | — |
| GTS / Predictions Engine | **NOT STARTED** | — |

---

## 4. Existing Packages / Shared Libraries

| Package | Status | Notes |
|---|---|---|
| Shared DTOs / Contracts | **NOT STARTED** | — |
| Event Schemas | **NOT STARTED** | — |
| Auth Guards / Decorators | **NOT STARTED** | — |
| Database Abstractions | **NOT STARTED** | — |
| UI Component Library | **NOT STARTED** | — |
| GraphQL Shared Types | **NOT STARTED** | — |

---

## 5. Existing Infrastructure

| Component | Status | Notes |
|---|---|---|
| Terraform Modules | **NOT STARTED** | Directory empty |
| AWS ECS Fargate Config | **NOT STARTED** | — |
| CloudFront Distribution | **NOT STARTED** | — |
| AWS WAF Rules | **NOT STARTED** | — |
| API Gateway Config | **NOT STARTED** | — |
| Kafka Cluster Config | **NOT STARTED** | — |
| PostgreSQL RDS Setup | **NOT STARTED** | — |
| Redis ElastiCache Config | **NOT STARTED** | — |
| OpenSearch Domain | **NOT STARTED** | — |
| S3 Buckets | **NOT STARTED** | — |
| Snowflake Setup | **NOT STARTED** | — |
| VPC / Networking | **NOT STARTED** | — |
| IAM Roles / Policies | **NOT STARTED** | — |
| KMS Keys | **NOT STARTED** | — |
| Secrets Manager Config | **NOT STARTED** | — |
| GuardDuty / Security Hub | **NOT STARTED** | — |
| CloudTrail | **NOT STARTED** | — |
| Prometheus / Grafana | **NOT STARTED** | — |
| OpenTelemetry Config | **NOT STARTED** | — |

---

## 6. Existing Documentation

| Document | Status | Quality | Notes |
|---|---|---|---|
| Executive Summary | ✓ PRESENT | Good | Clear strategic narrative |
| BRD v1.3 | ✓ PRESENT | Good | Comprehensive business requirements |
| PRD | ⚠ EMPTY | None | File exists but contains 1 line only |
| EAB v1.0 | ✓ PRESENT | Good | Sound architecture blueprint |
| TDAP v1.0 | ⚠ TRUNCATED | Partial | Only 127 lines — engineering principles cut off |
| Implementation Programme | ⚠ DUPLICATE | None | Contains exact copy of BRD — not a real delivery plan |
| ADRs | ✗ MISSING | None | Directory empty |
| API Contracts (OpenAPI) | ✗ MISSING | None | Not in codebase |
| Database Schemas | ✗ MISSING | None | Not in codebase |
| Kafka Event Catalogue | ✗ MISSING | None | Not in codebase |
| GraphQL Schema | ✗ MISSING | None | Not in codebase |
| Runbooks | ✗ MISSING | None | Not in codebase |
| GitHub Issue Templates | ✗ MISSING | None | Directory empty |
| GitHub Workflows (CI/CD) | ✗ MISSING | None | Directory empty |

---

## 7. Existing Integrations

| Integration | Status | Notes |
|---|---|---|
| Betway / Betting Partner | **NOT STARTED** | Referenced in BRD only |
| Computicket | **NOT STARTED** | — |
| TicketPro | **NOT STARTED** | — |
| Payment Provider | **NOT STARTED** | TBD — Peach, Ozow, PayFast |
| Banking Partner | **NOT STARTED** | TBD |
| WhatsApp Business API | **NOT STARTED** | — |
| Email Provider (SES) | **NOT STARTED** | — |
| SMS Provider | **NOT STARTED** | — |
| Football Data / Statistics | **NOT STARTED** | TBD |
| Snowflake | **NOT STARTED** | — |
| AWS services | **NOT STARTED** | — |

---

## 8. Existing CI/CD

| Component | Status | Notes |
|---|---|---|
| GitHub Actions Workflows | **NOT STARTED** | `.github/workflows/` is empty |
| Branch Protection Rules | **NOT CONFIGURED** | No config present |
| Test Pipeline | **NOT STARTED** | — |
| Build Pipeline | **NOT STARTED** | — |
| Deploy Pipeline | **NOT STARTED** | — |
| Security Scanning | **NOT STARTED** | — |
| Dependency Scanning | **NOT STARTED** | — |
| Docker Image Build | **NOT STARTED** | — |
| Terraform Plan/Apply | **NOT STARTED** | — |
| Semantic Versioning | **NOT STARTED** | — |

---

## 9. Existing Tests

| Test Type | Status | Notes |
|---|---|---|
| Unit Tests | **NONE** | `tests/` directory empty |
| Integration Tests | **NONE** | — |
| E2E Tests | **NONE** | — |
| Load Tests | **NONE** | — |
| Security Tests | **NONE** | — |
| Contract Tests (Pact) | **NONE** | — |
| Infrastructure Tests | **NONE** | — |
| Coverage | **0%** | No application code exists |

---

## 10. Existing Gaps

### Critical Gaps (Blocks all delivery)

| Gap | Impact | Priority |
|---|---|---|
| No monorepo scaffolding (Turborepo / NX) | Cannot build any service | CRITICAL |
| No NestJS microservices bootstrapped | No backend at all | CRITICAL |
| No Next.js apps bootstrapped | No frontend at all | CRITICAL |
| PRD is empty | No product requirements to build against | CRITICAL |
| TDAP is incomplete (truncated) | No complete build authority | CRITICAL |
| No Terraform infrastructure | Cannot deploy anything | CRITICAL |
| No CI/CD pipelines | Cannot ship anything | CRITICAL |
| No database schemas | No data model | CRITICAL |
| No event schema catalogue | Cannot build event-driven architecture | CRITICAL |
| No GraphQL schemas | Cannot federate API | CRITICAL |

### Major Gaps (Blocks specific domains)

| Gap | Impact | Priority |
|---|---|---|
| No ADRs | No recorded architecture decisions — risk of drift | HIGH |
| No API contracts (OpenAPI) | Cannot build integrations | HIGH |
| No identity provider selected | Blocks all authentication | HIGH |
| No payment provider contracted | Blocks all commerce | HIGH |
| No football data provider contracted | Blocks Football Core domain | HIGH |
| No Kafka topic naming convention | Blocks event-driven architecture | HIGH |
| No monorepo package manager config | Blocks code sharing | HIGH |
| No POPIA compliance implementation | Regulatory risk | HIGH |

### Minor Gaps

| Gap | Impact | Priority |
|---|---|---|
| No GitHub Issue Templates | Slows delivery coordination | MEDIUM |
| No contributing guidelines | Slows onboarding | MEDIUM |
| No runbooks | Operational risk | MEDIUM |
| Implementation Programme is duplicate | No actual delivery timeline | MEDIUM |
| No environment variable strategy | Blocks deployment | MEDIUM |

---

## Repository Health Score

```
Documentation Quality:     ████████░░  40%
Architecture Clarity:      ████████░░  78%
Code Completeness:         ░░░░░░░░░░   0%
Infrastructure Readiness:  ░░░░░░░░░░   0%
CI/CD Readiness:           ░░░░░░░░░░   0%
Test Coverage:             ░░░░░░░░░░   0%
Integration Readiness:     ░░░░░░░░░░   0%
Security Controls:         ░░░░░░░░░░   0%

OVERALL HEALTH SCORE:      ██░░░░░░░░  15/100
```

---

## Implementation Progress

```
Strategy & Vision:         ████████████  100%
Business Requirements:     ████████████  100%
Architecture Design:       ████████░░░   78%
Product Requirements:      ░░░░░░░░░░░    0%
Application Code:          ░░░░░░░░░░░    0%
Infrastructure Code:       ░░░░░░░░░░░    0%
Tests:                     ░░░░░░░░░░░    0%
CI/CD:                     ░░░░░░░░░░░    0%
Integrations:              ░░░░░░░░░░░    0%

OVERALL PROGRESS:          ██░░░░░░░░░   12%
```

---

## Risk Assessment

| Risk | Severity | Likelihood | Impact |
|---|---|---|---|
| PRD is empty — no product requirements | CRITICAL | Certain | Cannot build the right product |
| TDAP is truncated — incomplete build authority | HIGH | Certain | Architectural drift |
| Zero code means 12-week timeline is extremely aggressive | CRITICAL | High | Missed delivery |
| No infrastructure means no deployment path | HIGH | Certain | Cannot go live |
| No payment provider contracted | HIGH | High | Commerce blocked |
| No football data provider | HIGH | Medium | Football Core blocked |
| Identity provider not selected | HIGH | High | All auth blocked |
| Implementation Programme is duplicate BRD | HIGH | Certain | No delivery plan exists |
| Agent operating model not tested | MEDIUM | Medium | Coordination failures |
| Scale target (2M fans) conflicts with Year 1 budget (R2M) | HIGH | High | Under-investment risk |
