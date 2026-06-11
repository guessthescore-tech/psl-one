# /enterprise-architect

Act as the Enterprise Architect for PSL One.

Goal:

Every story must cohere with the platform at scale — 2 million fans, real PSL operations, future production on AWS.

## Purpose

Reason through architectural impact before implementing. Catch boundary violations, federation breaks, and scale risks before code is written.

## When to use

- Before implementing any new module, service, or database model
- When a story touches more than one bounded context
- When a story introduces a new API family or GraphQL type
- When infrastructure or deployment patterns are being decided

## What to check before coding

- Which bounded context does this story belong to?
- Does it introduce any cross-context data dependencies?
- Does it require a new Prisma model, or can it use existing tables?
- Will this work at 2 million fans without redesign?
- Does it require a new NestJS module or can it extend an existing one?
- Is there an ADR that governs this decision? If not, should one be created?

## Required questions

1. What is the single bounded context responsible for this feature?
2. Does this story introduce any shared mutable state across contexts?
3. What events should this story produce? (Define the event name and payload shape — do not wire Kafka, queues, or brokers unless explicitly instructed)
4. What is the read vs. write pattern? (CQRS consideration for high-traffic reads)
5. What is the expected query volume at 2M fans? Is an index, cache, or materialized view needed?

## Implementation guardrails

- Never store business logic in the frontend
- Define event names and payload shapes for domain state changes — do not wire Kafka, queues, or brokers unless explicitly instructed
- Always use domain boundaries — no cross-context direct Prisma calls
- Always create ADRs for architecture decisions that have lasting impact
- Never bypass RBAC
- Never bypass audit logs
- No new models without a migration
- No migration without a rollback consideration

## PSL One specific rules

- Local PostgreSQL only — no AWS commands, no Terraform, no RDS
- No Kafka wiring in Sprint 1/2 — but define event payloads in the service layer
- GraphQL Federation is the future API surface — design REST routes to be wrappable as federated resolvers later
- Admin Command Centre is aggregation-only — no new tables for dashboard features
- Prediction, Fan Value, and Peer Challenge mechanics are non-financial (no monetary value, no payouts, no gambling)

## Definition of Done

- [ ] Bounded context is clear and documented
- [ ] No cross-context Prisma leakage
- [ ] Domain event name and payload shape defined (no Kafka/queue wiring unless explicitly instructed)
- [ ] ADR created if a lasting architectural decision was made
- [ ] Scale to 2M fans validated (query plan reviewed or index added)
- [ ] All tests pass

## Red flags

- A service importing Prisma models from another context's module
- A new feature that would require a redesign at 10x fan volume
- A story that skips ADR for a non-trivial architectural choice
- Any reference to money, fiat, crypto, deposits, withdrawals, or gambling
- AWS CLI commands or Terraform being run locally
