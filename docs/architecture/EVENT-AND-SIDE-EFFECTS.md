# PSL One — Events and Side Effects

**Purpose:** How domain events and side effects are currently handled, and the planned Kafka migration  
**Audience:** Backend engineers, architects  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Current Implementation: Direct Service Calls

PSL One currently uses **direct synchronous service calls** for all side effects. There is no Kafka, no event bus, and no message queue in active use.

When a domain event occurs (e.g., prediction settled, achievement unlocked), the originating service calls downstream services directly:

```typescript
// Example: prediction settled side effects
async settlePrediction(id: string, result: ...) {
  // 1. Update prediction status
  await this.prisma.prediction.update({ where: { id }, data: { status } });
  // 2. Write points ledger
  await this.prisma.predictionPointsLedger.create({ data: { ... } });
  // 3. Write Fan Value (direct call)
  await this.fanValueService.award(userId, FanValueType.PREDICTION_SETTLED, ...);
  // 4. Write notification (direct call)
  await this.notificationsService.create(userId, NotificationType.PREDICTION_SETTLED, ...);
  // 5. Write activity feed (direct call)
  await this.activityFeedService.create(userId, ActivityFeedType.PREDICTION_SETTLED, ...);
}
```

---

## Known Side Effect Chains

| Trigger | Side effects |
|---------|-------------|
| Prediction submitted | `FanValueLedger` (engagement), `ActivityFeedItem` |
| Prediction settled (WON) | `PredictionPointsLedger`, `FanValueLedger`, `Notification`, `ActivityFeedItem` |
| Fantasy transfer | `FanValueLedger` (engagement) |
| Fantasy gameweek scored | `FantasyGameweekScore`, `FanValueLedger` |
| Achievement unlocked | `UserAchievement`, `Badge`, `Notification`, `FanValueLedger` |
| Social challenge accepted | `SocialPredictionPointsEntry` (COMMITTED), `ChallengeIdempotency`, `CampaignTriggerLog` |
| Social challenge result | `SocialPredictionPointsEntry` (AWARDED or FORGONE), `FanValueLedger` |
| Beta cohort started | `BetaCohort.status = ACTIVE`, `Notification` per member |
| Campaign trigger | `CampaignTriggerLog`, optional reward entry |

---

## Planned Kafka Migration

The project rules state: **Always publish Kafka events**.

Kafka and Kafka-related infrastructure are included in `docker-compose.yml` (broker + kafka-ui). However, no Kafka producers or consumers are wired into the application code.

The planned migration:

1. Each domain service publishes a domain event to a Kafka topic on write
2. Side-effect handlers (Fan Value, Notifications, Activity Feed, Campaign Triggers) consume events
3. Direct service calls are replaced by event-driven handlers
4. This enables retries, dead-letter queues, and decoupling

**Current state:** Direct synchronous calls only. Kafka is DECISION_REQUIRED for Sprint 3 — load justification needed before wiring.

---

## Campaign Trigger Service

`CampaignTriggerService` (`apps/api/src/campaigns/campaign-trigger.service.ts`) is a lightweight event hook that:

- Is called directly from `SocialPredictionModule` on challenge acceptance and result
- Checks active campaigns for matching trigger rules
- Writes `CampaignTriggerLog` records
- Does not yet integrate with wallet rewards (PROVIDER_REQUIRED)

This is the closest thing to an event-driven pattern currently in use.

---

## Idempotency

Social prediction challenge acceptance uses an idempotency key to prevent duplicate matches:

- `ChallengeIdempotency.key = 'direct-accept:{listingId}:{fanUserId}'`
- Written atomically in the same transaction as point commitment
- Duplicate requests fail gracefully with a conflict response

---

## Notification Service

`NotificationsService` writes `Notification` records directly to the database. There is no email, SMS, or push delivery in the current build. Delivery providers are PROVIDER_REQUIRED for Sprint 3.

Fans read notifications via `GET /notifications` polling — no WebSocket or server-sent events.

---

## Audit Side Effect

`AdminAuditLog` is written in every admin mutation service. This is a synchronous direct call and must remain synchronous — audit records must be committed before the mutation response is returned.

---

## Side Effect Failure Handling

Currently, side effect failures (Fan Value, Notifications, Activity Feed) will bubble up as unhandled exceptions and may fail the parent transaction. This is acceptable in beta/development.

Production recommendation: wrap side effects in try/catch and log failures separately, ensuring the primary mutation succeeds even if side effects fail. Kafka would solve this by decoupling reliability.
