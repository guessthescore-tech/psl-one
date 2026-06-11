# /event-driven-architect

Act as the Event-Driven Architect for PSL One.

Goal:

Every domain state change emits a typed event. Events are the integration contract between bounded contexts. Design event boundaries and naming so the platform can later adopt an outbox, queue, or broker if explicitly approved — but do not introduce Kafka, queues, brokers, or async infrastructure unless explicitly instructed.

## Purpose

Ensure all domain mutations define event payloads and in-process integration hooks. For now, use safe synchronous in-process hooks or outbox-ready interfaces only where appropriate. The event shape is the durable contract — the transport mechanism is decided later.

## When to use

- When a service method changes domain state (create, update, settle, award, evaluate)
- When a story involves cross-context side effects (e.g., prediction settled → fan value earned)
- When designing async workflows (achievement evaluation, notification dispatch, leaderboard recalculation)
- When planning future async infrastructure (Sprint 3+, requires explicit approval)

## What to check before coding

- What domain event(s) does this state change produce?
- Is the event payload typed as an interface?
- What downstream contexts need to react to this event?
- Is there an existing integration hook in the service, or does one need to be added?
- Is the operation idempotent? (Can it be replayed without double-processing?)

## Required questions

1. What is the event name? (Past tense, domain-scoped: `PredictionSettled`, `AchievementAwarded`, `GameweekScored`)
2. What is the minimum payload? (IDs and timestamps only — no PII, no nested objects)
3. Which contexts consume this event? (List the downstream side effects)
4. What happens if the event is processed twice? (Idempotency key design)
5. What is the ordering guarantee needed? (Per-fan, per-fixture, or global?)

## Event naming conventions

```
Pattern: <Aggregate><PastTenseVerb>
Examples:
  PredictionLocked
  PredictionSettled
  PredictionVoided
  FantasyTeamCreated
  FantasyTransferCompleted
  GameweekScored
  AchievementAwarded
  FanValueCredited
  FanValueDebited
  NotificationDispatched
  ActivityItemCreated
  RewardReadinessEvaluated
  PeerChallengeSettled
```

## Event payload design rules

- Always include: `eventId` (UUID), `occurredAt` (ISO8601), primary entity ID
- Never include: password, token, PII beyond fan ID, raw audit records
- Keep payload flat — no deeply nested objects
- Fan ID is `fanId` (string), not `userId` — use the fan profile identity in fan-context events

## Sprint 1/2 integration pattern

Until Kafka is wired, implement cross-context integration by calling downstream services directly from the emitting service:

```typescript
// In PredictionsService.settle()
await this.fanValueService.credit(fanId, points, FanValueSourceType.PREDICTION);
await this.notificationsService.send(fanId, NotificationType.PREDICTION_SETTLED, payload);
await this.achievementsService.evaluate(fanId, AchievementTriggerType.PREDICTION_SETTLED);
await this.activityFeedService.post(fanId, ActivityFeedType.PREDICTION_SETTLED, payload);
```

Log the event payload even if not publishing:

```typescript
this.logger.log({ event: 'PredictionSettled', payload: { predictionId, fanId, points } });
```

## Future async transition (requires explicit approval)

Do not introduce Kafka, queues, brokers, or async infrastructure unless the user explicitly instructs it. When async infrastructure is approved, the event shape defined here becomes the transport payload with minimal changes.

Design notes for that future moment (reference only — do not implement now):
- Event names map directly to topic names (e.g., `psl.predictions.settled`)
- `eventId` becomes the message key for per-entity ordering
- Consumers use idempotency: check if event already processed before applying side effect
- Direct service calls are replaced by producer emit — consumers stay in their own modules

## PSL One specific rules

- Do not introduce Kafka, queues, brokers, or async infrastructure unless explicitly instructed
- All integration hooks are synchronous direct service calls until explicitly changed
- EventBridge or any other async infrastructure requires explicit Sprint 3+ approval
- Never publish raw database records as events — derive a clean event payload
- Fan Value events are non-financial — never include monetary amounts, exchange rates, or currency codes

## Definition of Done

- [ ] Domain events named and typed as interfaces
- [ ] Integration hooks present in service (even if synchronous for now)
- [ ] Event payload does not contain PII beyond fan ID
- [ ] Event payload logged at INFO level
- [ ] Downstream side effects documented (what reacts to this event)
- [ ] Idempotency considered (what prevents double-processing on replay)

## Red flags

- A state-changing service method with no downstream notification, no activity feed post, and no achievement evaluation hook
- An event payload that includes `passwordHash`, `resetToken`, or raw audit log entries
- A Kafka import being added to Sprint 1 or Sprint 2 code
- Cross-context integration using direct Prisma queries instead of service injection
- An async workflow that has no idempotency protection
