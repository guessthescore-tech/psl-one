# Sprint 13 — Handover

## Sprint Status: CONDITIONAL_GO

Sprint 13 delivers per-competition provider routing and live validation tooling. Both providers are blocked pending API keys set by the owner. All code-side deliverables are complete.

## Deliverables

### ProviderRouterService

- Class: `ProviderRouterService`
- File: `apps/api/src/data-provider/provider-router.service.ts`
- Routes World Cup competitions to `FootballDataOrgAdapter`
- Routes PSL competitions to `ApiFootballAdapter`
- Falls back to `NoOpAdapter` when key is absent or competition is unknown
- Opt-in only — not wired into any active request path
- `DataProviderService` global behaviour is **unchanged**

### Live Validation Results

| Provider | Result | Detail |
|---|---|---|
| football-data.org | `WC_BETA_VALIDATED` | 104 WC 2026 matches, score data on free tier, 2026-06-22 |
| API-Football | `API_FOOTBALL_ACCOUNT_SUSPENDED` | HTTP 200 but `errors.access` in body; adapter fixed to detect this |

football-data.org WC path is fully validated. API-Football PSL path is blocked by account suspension — owner must reactivate at dashboard.api-football.com.

### Documentation

- `docs/data/SPRINT-13-FOOTBALL-DATA-LIVE-VALIDATION.md`
- `docs/data/SPRINT-13-API-FOOTBALL-LIVE-VALIDATION.md`
- `docs/data/SPRINT-13-PROVIDER-LIVE-VALIDATION-SUMMARY.md`
- `docs/data/SPRINT-13-PER-COMPETITION-ROUTING.md`
- `docs/data/SPRINT-13-PROVIDER-ROUTING-GO-NOGO.md`
- `docs/handover/SPRINT-13-HANDOVER.md` (this file)
- `docs/handover/SPRINT-13-BETA-GO-NOGO.md`
- `docs/handover/SPRINT-13-KNOWN-GAPS.md`
- `docs/handover/SPRINT-13-OWNER-REVIEW-GUIDE.md`
- `docs/handover/SPRINT-13-ROLLBACK-PLAN.md`

### Discovery Tools (4 new tools)

Located in `tools/discovery/`:

- `sprint-13-provider-key-status.mjs` — checks presence and length of both keys
- `sprint-13-worldcup-sample.mjs` — fetches a WC fixture sample once key is set
- `sprint-13-psl-sample.mjs` — fetches a PSL league 288 sample once key is set
- `sprint-13-routing-check.mjs` — validates routing decisions for known competition codes

## What Is NOT Active

| Item | Status |
|---|---|
| Production data ingestion | NOT active |
| PSL season activation | NOT active — PSL INACTIVE |
| EC2 staging migration | NOT applied — pending authorisation |
| Wallet production | NOT active |
| Real-money features | NOT active |
| Sportmonks | REJECTED — not referenced |
| Betting/odds endpoints | NOT implemented |

## Test Counts

Sprint 13 API tests: **1,845** (76 files) — includes 21 ProviderRouterService tests and 2 new suspended-account adapter tests. Experience tests: **634**.

## Next Steps (Sprint 14)

1. Owner reactivates API-Football account at dashboard.api-football.com and re-runs PSL validation (G1 already cleared).
2. Owner reviews commercial terms for football-data.org and API-Football.
3. After full GO: wire `ProviderRouterService` into safe read-only ingestion job (no DB writes initially).
4. Apply EC2 staging migration.
5. Run staging live smoke with real provider data.

## Related Documents

- `docs/handover/SPRINT-12-HANDOVER.md` — prior sprint baseline
- `docs/handover/SPRINT-13-BETA-GO-NOGO.md`
- `docs/handover/SPRINT-13-KNOWN-GAPS.md`
- `docs/handover/SPRINT-13-OWNER-REVIEW-GUIDE.md`
- `docs/handover/SPRINT-13-ROLLBACK-PLAN.md`
