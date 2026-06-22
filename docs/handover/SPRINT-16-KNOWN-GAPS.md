# Sprint 16 — Known Gaps

## P1 — Owner Action Required

| Gap | Detail | Resolution |
|-----|--------|------------|
| No fixtures yet | psl.co.za returns SOURCE_EMPTY | Re-run dry-run in July/August 2026 when fixtures published |
| No write run | No fixtures to write; no owner approval | Block until fixtures available + owner gates |
| No PSL activation | Separate gate from ingestion | Future sprint with owner approval |

## P2 — Deferred to Future Sprint

| Gap | Detail | Deferred To |
|-----|--------|-------------|
| Scheduled ingestion | No @Cron — manual only | Sprint 17+ |
| Team name fuzzy matching | Contains search may miss exact spellings | Sprint 17+ refinement |
| Audit table write | Logger only; no formal AdminAuditLog entry | Sprint 17+ |
| Conflict resolution UX | No admin UI for review/confirm before write | Sprint 17+ |
| Error recovery | No retry logic in service | Sprint 17+ |
| Fixture diff / re-sync | No detection of changed fixture details | Sprint 17+ |

## P3 — Infrastructure Not In Scope

| Gap | Detail |
|-----|--------|
| EC2 staging migration | Database URL configuration pending on EC2 instance |
| CloudFront CDN | Not yet in scope for fixture data |
| EventBridge events | PARSE_PSL_FIXTURES_INGESTED event not yet published to Kafka |

## P4 — Non-Blocking Observations

| Observation | Notes |
|-------------|-------|
| Parse rate limits unconfirmed | Using conservative 1-req/s assumption |
| Team name resolution | Using fuzzy `contains` match — may need manual mapping for club name variants |
| Parse API version | No versioning in the API endpoint URL — watch for breaking changes |
