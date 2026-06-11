# PSL One — Build Sequence

**Version:** 1.0  
**Date:** 2026-06-08  
**Author:** PSL One Chief Architecture Agent  
**Constraint:** 12 weeks to Phase 1 MVP

---

## Critical Path

The critical path — the sequence where any delay pushes the end date — is:

```
ADR-001 (Auth)
    → Identity Service bootstrapped
        → Fan Service (consumes UserRegistered)
            → Gateway (composes Identity + Fan + Football subgraphs)
                → Web App auth flow
                    → Web App features (require auth)
                        → MVP LAUNCH
```

**Parallel path (not on critical path but must finish by Week 8):**
```
ADR-004 (Kafka) + ADR-007 (Football Data)
    → Football Service
        → Fantasy Service (consumes match.finished)
        → GTS Service (consumes match.finished)
            → Loyalty Service (consumes settled events)
                → Wallet Service (consumes points events)
```

**Infrastructure path (must complete by Week 2):**
```
Terraform networking → MSK + Aurora + Redis + ECR
    → ECS cluster
        → CI/CD pipelines
            → First service deployed to dev
```

---

## Week-by-Week Plan

### WEEK 1 — Foundation & Decisions (Sprint 0, Week 1)

**Goal:** No blockers exist. Every agent knows what to build.

| Track | Work | Agent | Output |
|---|---|---|---|
| Architecture | ADR-001 (Auth), ADR-002 (Monorepo), ADR-003 (API) | Programme Director | `docs/adr/ADR-001.md` - `003.md` |
| Architecture | ADR-004 (Kafka), ADR-005 (DB), ADR-006 (AWS) | Programme Director | `docs/adr/ADR-004.md` - `006.md` |
| Architecture | ADR-007 (Football Data), ADR-008 (Frontend), ADR-009 (Testing), ADR-010 (Security) | Programme Director | `docs/adr/ADR-007.md` - `010.md` |
| Product | PRD Phase 1 user stories (30 minimum) | Product Owner | `docs/product/PRD.md` |
| Infrastructure | Terraform networking + MSK + Aurora | DevOps Agent | `infra/terraform/modules/` |
| Monorepo | Bootstrap Turborepo + `packages/config` | Platform Agent | Root `package.json`, `turbo.json` |
| Monorepo | `packages/shared-types`, `packages/event-schemas` | Platform Agent | Shared packages |

**Week 1 Exit Criteria:**
- [ ] All 10 ADRs written and in review
- [ ] PRD has ≥20 user stories
- [ ] Monorepo installs (`pnpm install` works)
- [ ] Terraform plan runs clean

---

### WEEK 2 — Sprint 0 Complete (Sprint 0, Week 2)

**Goal:** Build environment is live. Agents have a green pipeline to work in.

| Track | Work | Agent | Output |
|---|---|---|---|
| Architecture | ADRs finalised and merged | Programme Director | All ADRs merged |
| Architecture | Kafka event catalogue | Programme Director | `docs/architecture/event-catalogue.md` |
| Infrastructure | `terraform apply` dev environment | DevOps Agent | All AWS resources live |
| Infrastructure | ECR repos, ECS cluster, Redis, S3, CloudFront | DevOps Agent | All resources live |
| CI/CD | GitHub Actions: ci.yml, deploy-dev.yml | DevOps Agent | Pipelines green |
| CI/CD | Branch protection, CODEOWNERS | DevOps Agent | Rules active |
| Monorepo | `packages/kafka-client`, `packages/auth-guards` | Platform Agent | Packages complete |
| Monorepo | `packages/testing`, `packages/ui` (skeleton) | Platform Agent | Packages complete |
| Services | All 14 service directories scaffolded (NestJS) | Platform Agent | Services boot, return /health |
| Apps | `apps/web` and `apps/admin` scaffolded (Next.js) | Frontend Agent | Apps boot |
| Developer | `docker-compose.yml` local stack | DevOps Agent | Local dev works |

**Week 2 Exit Criteria (Sprint 0 DoD):**
- [ ] All ADRs merged
- [ ] `terraform apply` green in dev
- [ ] `turbo build` green
- [ ] CI pipeline green on first PR
- [ ] All 14 service health checks return 200
- [ ] `docker-compose up` starts Kafka + PostgreSQL + Redis locally

**SPRINT 0 COMPLETE. CODING BEGINS.**

---

### WEEK 3 — Identity + Football + Fan Core (Sprint 1, Week 1)

**Goal:** Fans can register. Football data exists.

| Service | Work | Agent | Priority |
|---|---|---|---|
| Identity | Registration endpoint (name, email, mobile, password, club, consent) | Platform Agent | P0 |
| Identity | Mobile OTP verification | Platform Agent | P0 |
| Identity | Login + JWT + refresh token | Platform Agent | P0 |
| Identity | RBAC guards + role assignment | Platform Agent | P0 |
| Identity | POPIA consent capture + ConsentRecord | Platform Agent | P0 |
| Football | Prisma schema (competitions, clubs, players, fixtures, results) | Football Agent | P0 |
| Football | Seed data (PSL 2025/26, MTN8 2025) | Football Agent | P0 |
| Football | GraphQL subgraph (competitions, fixtures, standings) | Football Agent | P0 |
| Fan | Scaffold + subscribe to `identity.user.registered` | Platform Agent | P0 |
| Infra | Identity + Football databases migrated | DevOps Agent | P0 |

---

### WEEK 4 — Identity Complete + Football Events + Gateway (Sprint 1, Week 2)

**Goal:** Auth is complete. Football publishes events. Gateway is live.

| Service | Work | Agent | Priority |
|---|---|---|---|
| Identity | Password reset flow | Platform Agent | P1 |
| Identity | GraphQL subgraph (`Query.me`) | Platform Agent | P0 |
| Football | Kafka producers (fixture.created, match.started, match.finished, goal.scored) | Football Agent | P0 |
| Football | External data provider ACL (or mock) | Football Agent | P1 |
| Football | Admin API (manual result entry) | Football Agent | P1 |
| Fan | Club affiliation + preferences | Platform Agent | P1 |
| Fan | GraphQL subgraph (`Query.myProfile`) | Platform Agent | P0 |
| Gateway | Apollo Router federation gateway | Platform Agent | P0 |
| Gateway | Auth propagation to all subgraphs | Platform Agent | P0 |
| Web App | Registration + login UI | Frontend Agent | P0 |
| Web App | Fixture list + standings | Frontend Agent | P1 |

**Week 4 Exit Criteria:**
- [ ] Fan can register, verify mobile, log in via web app
- [ ] PSL 2025/26 fixtures visible
- [ ] Gateway composes Identity, Fan, Football subgraphs
- [ ] `football.match.finished` event flowing in dev

---

### WEEK 5 — Fantasy Service (Sprint 2, Week 1)

**Goal:** Fantasy squad creation works.

| Service | Work | Agent | Priority |
|---|---|---|---|
| Fantasy | Prisma schema (teams, squads, transfers, chips) | Fantasy Agent | P1 |
| Fantasy | Squad validation engine (all 9 rules) | Fantasy Agent | P0 |
| Fantasy | Team creation + captain/vice-captain | Fantasy Agent | P1 |
| Fantasy | Transfer system + cost calculation | Fantasy Agent | P1 |
| Fantasy | GraphQL subgraph | Fantasy Agent | P1 |
| Fantasy | Subscribe to `football.match.finished` (scaffold) | Fantasy Agent | P1 |
| Web App | Fantasy pitch view (read only) | Frontend Agent | P1 |
| Loyalty | Scaffold + LoyaltyAccount creation | GTS Agent | P1 |

---

### WEEK 6 — Fantasy Scoring + GTS Predictions (Sprint 2, Week 2)

**Goal:** Fantasy scores compute. GTS predictions work.

| Service | Work | Agent | Priority |
|---|---|---|---|
| Fantasy | Gameweek scoring engine | Fantasy Agent | P1 |
| Fantasy | Bench logic + captain multipliers | Fantasy Agent | P1 |
| Fantasy | Chip activation (Wildcard, TC, BB, FH) | Fantasy Agent | P1 |
| Fantasy | Leaderboard (Redis cached) | Fantasy Agent | P1 |
| GTS | Prediction engine (create, validate, lock at kickoff) | GTS Agent | P1 |
| GTS | Settlement engine (exact score, correct result, wrong) | GTS Agent | P1 |
| GTS | `gts.prediction.settled` Kafka event | GTS Agent | P1 |
| Loyalty | Earning rules engine | GTS Agent | P1 |
| Loyalty | Points awarded on GTS settlement | GTS Agent | P1 |
| Web App | Fantasy team management UI | Frontend Agent | P1 |
| Web App | GTS prediction UI | Frontend Agent | P1 |

---

### WEEK 7 — Wallet + Notifications + Loyalty Complete (Sprint 3, Week 1)

**Goal:** Fan has a wallet with points. Notifications working.

| Service | Work | Agent | Priority |
|---|---|---|---|
| Wallet | Double-entry ledger + WalletCreated on registration | Wallet Agent | P1 |
| Wallet | Credit on `loyalty.points.awarded` | Wallet Agent | P1 |
| Wallet | Debit on `loyalty.reward.redeemed` | Wallet Agent | P1 |
| Wallet | GraphQL subgraph (`Query.myWallet`) | Wallet Agent | P1 |
| Loyalty | Tier computation + upgrade | GTS Agent | P1 |
| Loyalty | Reward catalogue + redemption | GTS Agent | P1 |
| Notifications | Multi-channel engine scaffold | Notifications Agent | P1 |
| Notifications | Welcome email on registration | Notifications Agent | P1 |
| Notifications | Fantasy gameweek result notification | Notifications Agent | P1 |
| Notifications | GTS result notification | Notifications Agent | P1 |
| Web App | Wallet display + transaction history | Frontend Agent | P1 |
| Web App | Profile page + loyalty tier display | Frontend Agent | P1 |

---

### WEEK 8 — Content + Admin + Integration (Sprint 3, Week 2)

**Goal:** Content publishing works. Admin portal functional. Full integration test.

| Service | Work | Agent | Priority |
|---|---|---|---|
| Content | Article + video CRUD | Content Agent | P2 |
| Content | GraphQL subgraph (articles, videos) | Content Agent | P2 |
| Admin | User management (search, suspend, view) | Platform Agent | P1 |
| Admin | Reward management | Platform Agent | P1 |
| Admin | Content management | Platform Agent | P2 |
| Web App | Content feed on home screen | Frontend Agent | P2 |
| Web App | Admin portal: user management | Frontend Agent | P1 |
| All | Integration test: full registration-to-fantasy journey | All | P0 |
| All | Contract tests (Pact) for all Kafka producers | All | P1 |

---

### WEEK 9 — Hardening + Security + Performance (Sprint 4, Week 1)

**Goal:** Platform is production-grade.

| Track | Work | Agent | Priority |
|---|---|---|---|
| Security | OWASP hardening checklist | Security Review | P0 |
| Security | POPIA consent audit + legal review | Platform Agent | P0 |
| Security | AWS GuardDuty + CloudTrail + Security Hub | DevOps Agent | P1 |
| Security | Penetration test scope (external) | External | P1 |
| Performance | Redis caching for hot paths | All | P1 |
| Performance | Database index optimisation | All | P1 |
| Performance | CloudFront caching for static + semi-static | DevOps Agent | P1 |
| Observability | OpenTelemetry in all services | All | P1 |
| Observability | Grafana dashboards (MAU, errors, latency) | DevOps Agent | P1 |
| Testing | Load test: 10K concurrent (K6) | DevOps Agent | P1 |

---

### WEEK 10 — Sponsor Basics + Staging Deployment (Sprint 4, Week 2)

**Goal:** Staging deployed. Sponsor portal MVP.

| Track | Work | Agent | Priority |
|---|---|---|---|
| Sponsor | Sponsor onboarding + basic campaign management | Sponsor Agent | P2 |
| Sponsor | Audience segment creation | Sponsor Agent | P2 |
| Infrastructure | Staging Terraform applied | DevOps Agent | P0 |
| Staging | Full platform deployed to staging | DevOps Agent | P0 |
| Staging | Smoke tests in staging | All | P0 |
| QA | UAT with internal test users | Product Team | P0 |

---

### WEEK 11 — Pilot Launch Preparation (Sprint 5, Week 1)

**Goal:** Platform ready for pilot club launch (1 club, 1,000 fans).

| Track | Work | Agent | Priority |
|---|---|---|---|
| QA | Bug fixes from UAT | All | P0 |
| Marketing | Onboarding flow optimisation | Frontend Agent | P1 |
| Infrastructure | Production Terraform applied | DevOps Agent | P0 |
| Operations | Runbooks written | DevOps Agent | P1 |
| Operations | On-call rotation established | Operations | P1 |
| Release Readiness | Gate check against all criteria | Release Agent | P0 |

---

### WEEK 12 — Soft Launch (Sprint 5, Week 2)

**Goal:** Phase 1 MVP live with pilot club community.

| Track | Work | Agent | Priority |
|---|---|---|---|
| Launch | Production deployment | DevOps Agent | P0 |
| Launch | DNS cutover + SSL validation | DevOps Agent | P0 |
| Launch | Monitoring dashboards live | DevOps Agent | P0 |
| Launch | Pilot club fan onboarding begins | Marketing | P0 |
| Launch | Real-time incident response monitoring | All | P0 |
| Post-launch | 48-hour stabilisation window | All | P0 |

---

## Parallel Workstreams Summary

```
WEEK:  1    2    3    4    5    6    7    8    9    10   11   12
       ─────────────────────────────────────────────────────────
INFRA  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████████
DOCS   ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
IDENT  ░░░░░░░░████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
FOOTB  ░░░░░░░░░░░░████████████████████░░░░░░░░░░░░░░░░░░░░░░░░
FAN    ░░░░░░░░░░░░████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
GATEW  ░░░░░░░░░░░░░░░░░░░░░░░░████████░░░░░░░░░░░░░░░░░░░░░░░░
FANTA  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████████████░░░░░░░░░░░░
GTS    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████████░░░░░░░░░░░░
WALLE  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████░░░░░░░░░░
NOTIF  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████░░░░░░
WEB    ░░░░░░░░░░░░░░░░████████████████████████████████████████
ADMIN  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████████░░░░
SECUR  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████░░░░
PERF   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████░░░░
STAGE  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████
PROD   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█
```

---

## What Starts First

**The very first action** is writing ADR-001 (Authentication Provider). Nothing feature-related can begin until the auth strategy is decided. This is a 2-hour task that unblocks weeks of work.

**Simultaneously on Day 1:**
1. ADR-001 through ADR-004 writing (Documentation workstream)
2. Terraform VPC networking (Infrastructure workstream)
3. Turborepo bootstrap + `packages/config` (Monorepo workstream)

---

## What Is Blocked

| Blocked Item | Blocked By | Unblocked When |
|---|---|---|
| Identity Service feature code | ADR-001 (auth) | ADR-001 signed off |
| All service database schemas | ADR-005 (DB/ORM) | ADR-005 signed off |
| All Kafka producers | ADR-004 (Kafka format) | ADR-004 + event schemas |
| Fantasy scoring | Football Service events | `football.match.finished` flowing |
| GTS settlement | Football Service events | `football.match.finished` flowing |
| Loyalty points | GTS settlement + Fantasy scoring | Both services publishing |
| Wallet credits | Loyalty events | `loyalty.points.awarded` flowing |
| Web app features | GraphQL Gateway | Gateway composing subgraphs |
| Phase 3 Wallet | FSP licensing | External — not on 12-week path |

---

## First Agent to Write Production Code

**Football Core Agent** writes the first production code — the Prisma schema for the Football domain.

**Why Football first (not Identity)?**

The Football domain has no external dependencies. It can be built immediately once:
1. ADR-005 (ORM = Prisma) is signed off
2. `packages/shared-types` exists
3. `packages/kafka-client` exists

The Football Service schema and seed data can be written on Day 1 of Sprint 1 (Week 3) while Identity service is still waiting for auth provider configuration.

**Identity Service** writes second — the POPIA consent model and registration endpoint. This requires auth provider configuration which has a 1-3 day setup time.

---

## Scope Decisions That Protect the Timeline

The following descoping decisions are **recommended** to protect the 12-week target:

| Feature | Recommendation | Saves |
|---|---|---|
| Mobile native app (React Native) | Defer to Phase 2 — web app only | 4 weeks |
| Snowflake data warehouse | Defer to Phase 2 — use RDS replicas | 2 weeks |
| Sponsor portal (full) | Phase 1: basic campaign creation only | 2 weeks |
| Marketplace | Phase 3 | 4 weeks |
| Native ticketing engine | Phase 2 — use aggregator ACL | 3 weeks |
| Financial wallet (ZAR) | Phase 3 | 3 weeks |
| WhatsApp notifications | Phase 2 — email + push only in Phase 1 | 1 week |
| Club portal (full) | Phase 2 — club admin via admin portal | 2 weeks |
| AI recommendations | Phase 3 | 2 weeks |
| Africa expansion | Phase 4 | N/A |

**Total scope risk removed from 12-week plan:** ~23 weeks of work deferred.
