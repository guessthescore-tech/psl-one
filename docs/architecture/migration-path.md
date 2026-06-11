# PSL One — Bootstrap to Scale Migration Path

**Date:** 2026-06-08  
**Authority:** Architecture Review Board  
**Companion documents:** ADR-011 (Bootstrap), ADR-001–010 (Target Scale)

---

## Overview

The bootstrap architecture (ADR-011) is designed as a **deliberate stepping stone**, not a shortcut. Every technical decision in the bootstrap explicitly preserves the migration path to the full scale architecture.

This document defines:
1. What triggers each phase of migration
2. Exactly how each component migrates (the mechanics, not just the intent)
3. What stays the same and what changes at each step

Migration is **incremental by service**, not a big-bang rewrite. The monolith shrinks service by service while the platform remains live.

---

## Migration Phases

```
Phase 1 (Bootstrap MVP)
  NestJS Monolith → EC2 t2.micro → Single RDS → Vercel
  Cost: $0–$34/month
  Users: 0–10K
  Duration: 12-week build + validation period

Phase 2 (First Extractions — post-funding)
  Extract 2–3 services → ECS Fargate → Aurora per-service → MSK Serverless
  Cost: $300–600/month
  Users: 10K–100K
  Duration: 8–12 weeks after funding decision

Phase 3 (Full Scale — ADR-001–010 target)
  All 15 services extracted → Apollo Router gateway → Full Kafka
  Cost: $1,500–2,000/month (production)
  Users: 100K–2M
  Duration: 6–12 months after Phase 2
```

---

## Trigger Conditions

Do not begin Phase 2 until at least ONE of these is true:

| Trigger | Rationale |
|---|---|
| External funding secured | Infrastructure budget exists |
| > 10K registered users | Validation achieved, scale needed |
| EC2 t2.micro CPU > 70% sustained for 72h | Capacity constraint |
| Monolith deploy time > 5 minutes | Agility constraint |
| Single module > 30K lines of code | Maintainability constraint |
| RDS storage > 15 GB | Approaching free tier limit |
| Revenue > R500K/month | Infrastructure can be funded from revenue |

**Do not rush Phase 2.** The monolith at 10K users is fast, cheap, and easy to reason about. Premature extraction is the highest-risk architectural move a team can make.

---

## Phase 2: First Service Extractions

### Which services to extract first?

The extraction order is determined by:
1. **Highest load** — services under the most CPU/DB pressure
2. **Clearest boundaries** — modules with fewest in-process event dependencies
3. **Independent data** — modules whose schema has no cross-domain JOIN dependencies

**Recommended extraction order:**

| Priority | Service | Rationale |
|---|---|---|
| 1 | Football Data | Read-heavy, sync job creates load; cleanest boundaries |
| 2 | Identity | Security-critical; extracted separately reduces blast radius |
| 3 | GTS | Prediction settlement spikes on match end; independent scoring |
| 4 | Fantasy | Gameweek scoring is CPU-intensive; batch-safe to extract |
| 5–8 | Fan, Loyalty, Wallet, Content | Less load; extract last |
| Last | Notifications | Depends on all other services; extract after they're stable |

---

## The Extraction Mechanic (Repeatable Per Service)

Every service extraction follows the same 5-step pattern. This is the **how**, not just the what.

### Step 0: Prepare the module (do in monolith before extraction)

Before extracting a module, verify:
- [ ] The module has zero imports of other modules' `Service` classes (only EventEmitter2 or interfaces)
- [ ] All cross-module data access goes through the module's own read models or event-derived tables
- [ ] 90%+ test coverage on the module
- [ ] The module's API surface is fully documented (GraphQL schema / REST OpenAPI)

### Step 1: Add a Port/Adapter boundary

Wrap all outbound calls in the module behind an interface:

```typescript
// BEFORE (monolith module calling another module directly)
constructor(private readonly footballService: FootballService) {}

// AFTER (interface behind which the adapter hides)
constructor(
  @Inject(FOOTBALL_DATA_PORT) 
  private readonly footballData: FootballDataPort
) {}

// MonolithFootballAdapter: calls FootballService directly (used in monolith)
// HttpFootballAdapter: calls http://football-service/graphql (used after extraction)
```

This change happens while the module is still in the monolith. The adapter swap is the only code change during extraction.

### Step 2: Database schema extraction

```bash
# Export the module's schema from the shared RDS instance
pg_dump \
  --schema=football \
  --no-owner \
  --no-acl \
  "$SHARED_DATABASE_URL" \
  > football_schema_export.sql

# Create a new Aurora Serverless v2 cluster (Terraform)
terraform apply -target=module.aurora_football

# Restore to new cluster
psql "$FOOTBALL_DATABASE_URL" < football_schema_export.sql
```

Run both the monolith (reading from shared DB) and the migrating service (reading from new DB) in shadow mode for 48h to verify data parity.

### Step 3: Deploy the extracted service to ECS

```bash
# New Dockerfile at services/football/Dockerfile
# New ECS task definition + service (Terraform)
# New target group behind existing ALB (/graphql/football → football service)

terraform apply -target=module.ecs_football
```

The extracted service starts consuming from Kafka (not in-process events). The `OutboxWorker` in the monolith begins producing to Kafka for the topics this service consumes.

### Step 4: Swap the adapter in the monolith

```typescript
// In the monolith's AppModule (or football.module.ts):
// providers: [
//   { provide: FOOTBALL_DATA_PORT, useClass: MonolithFootballAdapter }  // ← swap this
//   { provide: FOOTBALL_DATA_PORT, useClass: HttpFootballAdapter }       // ← to this
// ]
```

Deploy the monolith with the new adapter. Traffic now flows: monolith → HTTP → football service.

### Step 5: Remove the module from the monolith

After 2 weeks stable in production:
- Delete `src/modules/football/` from `services/api/`
- Remove football schema from monolith Prisma schema
- The monolith shrinks; the football service is independent

### Result after one extraction

```
┌────────────────────────┐    ┌──────────────────────────┐
│   NestJS Monolith      │───▶│   Football Service        │
│   (remaining modules)  │    │   ECS Fargate             │
│   EC2 or ECS           │    │   Aurora db.t3.micro      │
└────────────────────────┘    └──────────────────────────┘
         │                              │
         └──────── MSK Kafka ──────────┘
```

---

## Event Strategy Migration

### Phase 1: In-process EventEmitter2

```typescript
// Publisher
this.eventEmitter.emit('identity.user.registered', payload);
// + writes outbox_events row

// Consumer
@OnEvent('identity.user.registered')
async handleUserRegistered(payload: UserRegisteredPayload) { ... }
```

### Phase 2: Introduce Kafka, services migrate one by one

When Football is extracted, its events need to cross the process boundary. The outbox worker gains a Kafka mode:

```typescript
// OutboxWorker: bootstrap mode
private async dispatch(event: OutboxEvent) {
  this.eventEmitter.emit(event.topic, event.payload); // in-process
}

// OutboxWorker: Kafka mode (feature flag or config)
private async dispatch(event: OutboxEvent) {
  await this.kafkaProducer.publish(event.topic, event.payload); // Kafka
  // In-process handlers still receive it via Kafka consumer in monolith
}
```

No application logic changes. The event shape (KafkaEventEnvelope from `packages/event-schemas`) is identical in both modes because the outbox always writes in that format.

### Phase 3: Full Kafka

All services publish to Kafka. The monolith no longer uses EventEmitter2 for cross-module events (only for intra-module events). The Outbox Pattern is identical to ADR-004.

---

## Database Migration Path

### Phase 1: Single RDS instance, logical schemas

```
psl_bootstrap_dev (PostgreSQL)
  ├── schema: identity
  ├── schema: football
  ├── schema: fantasy
  ├── schema: gts
  ├── schema: loyalty
  ├── schema: wallet
  ├── schema: fan
  ├── schema: content
  ├── schema: notifications
  ├── schema: outbox
  └── schema: audit
```

### Phase 2: Extract schema to new Aurora cluster (per extracted service)

When Football is extracted:
```
psl_bootstrap_dev (original RDS — shrinks over time)
  ├── schema: identity
  ├── schema: fantasy
  └── ... (remaining modules)

psl_football_dev (new Aurora Serverless v2)
  └── schema: football (migrated from original)
```

### Phase 3: Full ADR-005 topology

When all modules are extracted:
```
Per-service Aurora Serverless v2 clusters (grouped for cost):
  psl_core_cluster:    identity, wallet, loyalty
  psl_football_cluster: football, gts, fantasy
  psl_content_cluster:  content, fan, notifications
```

This is 3 clusters (not 15) — addressing ARB-001 finding 005-A.

---

## Frontend Migration

Vercel handles frontend hosting throughout all phases. The frontend API URL changes as services are extracted:

| Phase | Frontend points to |
|---|---|
| Bootstrap | `https://api.pslone.co.za` (monolith on EC2) |
| Phase 2 | `https://api.pslone.co.za` (Apollo Router in front of extracted services) |
| Phase 3 | Same URL (Apollo Router scales horizontally) |

The Apollo Router is introduced in Phase 2 as the first service is extracted. Before that, the monolith IS the gateway. The frontend sees no URL change.

---

## Apollo Router Introduction Timing

Apollo Router is added when the SECOND service is extracted (not the first). With only one external service, the monolith can proxy requests to it directly. Apollo Router becomes worth its operational overhead when managing 2+ external subgraphs.

**Before Apollo Router (Phase 2, first extraction):**
```
Frontend → Monolith GraphQL (unified schema) → HTTP → Football Service
```

**After Apollo Router (Phase 2, second extraction):**
```
Frontend → Apollo Router → Monolith subgraph (remaining)
                         → Football subgraph
                         → [next extracted service subgraph]
```

Migration: Add `@key`, `@external`, `@provides` directives to extracted services. The monolith's remaining schema also gets Federation directives. Apollo Router replaces the monolith as the gateway entry point.

---

## What Does NOT Change Across Phases

These decisions are fixed across all phases and require no migration:

| Component | Stays the same |
|---|---|
| `packages/event-schemas` | KafkaEventEnvelope shape, topic naming, Zod schemas |
| `packages/shared-types` | Role enum, AuthenticatedUser, base types |
| `packages/auth-guards` | JwtAuthGuard, RolesGuard, decorators |
| `packages/logger` | Structured logging format, AuditLogEntry interface |
| JWT RS256 / Cognito | Same auth provider, same token format |
| RBAC roles | Same 6 roles, same enforcement pattern |
| POPIA endpoints | Same URLs, same behaviour |
| Domain event shapes | Same payload schemas (Zod) |
| Prisma model names | Same entity names, same field names |
| GraphQL schema | Same type names and field names |

**This is why the packages/ workspace matters for bootstrap:** even though we're building a monolith, using the shared packages ensures zero rework when extracting services.

---

## Migration Checklist (Programme Director Gate)

Before beginning Phase 2:

- [ ] Bootstrap MVP live in production with real users
- [ ] Funding secured or runway > 6 months
- [ ] Infrastructure cost model for Phase 2 approved by programme sponsor
- [ ] Team size adequate (Phase 2 requires DevOps capacity)
- [ ] All bootstrap modules have 80%+ test coverage
- [ ] No cross-module Service imports exist in the monolith
- [ ] OutboxEvent table has been functioning for > 4 weeks in production
- [ ] ADR-011 migration trigger conditions reviewed and at least one satisfied
