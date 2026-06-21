# Sprint 7 — Known Gaps

## Intentional Deferrals

| Gap | Deferred To | Reason |
|-----|-------------|--------|
| Automatic settlement trigger (cron/event) | Sprint 8 | Settlement is manual (admin-only) in Sprint 7 — requires fixture FINISHED detection |
| Retry logic for Sportmonks 429 | Sprint 8 | Trial tier; exponential backoff not needed until production |
| Real-time score ingestion | Sprint 8 | Requires Sportmonks paid plan |
| Fan notification on challenge settle | Sprint 8 | Notification system exists (STORY-22) but not wired to settlement |
| Fan Value Ledger update on settlement | Sprint 8 | Points-only in beta; no FVL movement in Sprint 7 |
| Sportmonks webhook support | Sprint 8+ | Trial does not include webhooks |
| Acceptor points in settlement share card | Sprint 8 | Share card currently shows prediction only |

## Technical Debt

| Item | Notes |
|------|-------|
| `DataProviderService` uses `new SportmonksAdapter()` directly | Should be injected via NestJS DI in Sprint 8 refactor |
| Fixture includes in getFixtures() | Sportmonks requires `?include=...` params for scores/participants; current impl may need adjustment once API key is active |

## Product Decisions Pending

- Should a draw result in tie-breaker by time (faster prediction wins)? Currently: draw = no winner
- Should settlement trigger a notification push? Currently: no
- Should points flow to FanValueLedger? Currently: no (beta only)
