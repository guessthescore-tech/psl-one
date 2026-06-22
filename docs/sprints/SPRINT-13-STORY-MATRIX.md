# Sprint 13 — Story Matrix

| Story | Title | Status |
|-------|-------|--------|
| STORY-S13-01 | Live Validation Attempt (football-data.org) | ✅ DONE — BLOCKED_BY_FOOTBALL_DATA_KEY |
| STORY-S13-02 | Live Validation Attempt (API-Football) | ✅ DONE — BLOCKED_NO_KEY |
| STORY-S13-03 | Live Validation Summary | ✅ DONE — ALL_BLOCKED_PENDING_KEYS |
| STORY-S13-04 | ProviderRouterService (per-competition routing) | ✅ DONE |
| STORY-S13-05 | Sprint 13 Discovery Tools (4 tools) | ✅ DONE |
| STORY-S13-06 | Sprint 13 Handover Package (5 docs) | ✅ DONE |

## Sprint Outcome

Per-competition routing implemented. `ProviderRouterService` routes WC competition codes to `FootballDataOrgAdapter` and PSL codes to `ApiFootballAdapter`, with `NoOpAdapter` fallback in both cases when keys are absent. Live validation for both providers is blocked pending owner key provisioning. `DataProviderService` global behaviour is unchanged. No production ingestion enabled. PSL remains inactive.
