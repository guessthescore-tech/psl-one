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

### Live Validation Attempt

Both providers blocked pending keys:

| Provider | Result | Blocker |
|---|---|---|
| football-data.org | `BLOCKED_BY_FOOTBALL_DATA_KEY` | `FOOTBALL_DATA_API_KEY` not set |
| API-Football | `BLOCKED_NO_KEY` | `API_FOOTBALL_KEY` empty |

No HTTP calls were made to any external provider during Sprint 13.

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

Tests are unchanged from Sprint 12 baseline. Sprint 13 adds no new API or experience tests (routing service is infrastructure, not a testable HTTP endpoint in this sprint).

## Next Steps (Sprint 14)

1. Owner sets API keys and clears G1 and G2 gates.
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
