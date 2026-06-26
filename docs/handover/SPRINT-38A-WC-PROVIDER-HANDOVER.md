# Sprint 38A — World Cup Live Provider Integration Handover

## What Was Built

### New Adapters
- `SportRadarSoccerAdapter` — full `ProviderAdapter` implementation for SR v4
- `ScoreBatWidgetAdapter` — partial implementation (widget attribution only)

### Enhanced Routing
- `ProviderRouterService`: WC chain now → FD.org → SportRadar → NoOp

### New API Routes
- `GET /admin/data-provider/world-cup-live-readiness` — read-only env check
- `POST /admin/data-provider/world-cup/fixtures/import` — dry-run default
- `GET /admin/data-provider/world-cup/scorebat-widget-config` — embed config

### New Frontend
- `/world-cup/live` — live match hub; ScoreBat is video/highlights only, not live match data
- `ScoreBatWorldCupWidget` — iframe component with server-side token handling

### Staging Tools (6)
1. `sprint-38a-world-cup-provider-health.mjs` — provider health check
2. `sprint-38a-world-cup-fixture-import.mjs` — dry-run / write fixture import
3. `sprint-38a-world-cup-team-import.mjs` — team discovery preview
4. `sprint-38a-world-cup-squad-import.mjs` — squad/player discovery
5. `sprint-38a-world-cup-fantasy-pool-build.mjs` — fantasy pool readiness
6. `sprint-38a-world-cup-gts-card-build.mjs` — GTS card generation preview

## Known Gaps

| Gap | Severity | Resolution |
|---|---|---|
| SportRadar key not set | LOW | Fallback to NoOp; FD.org is primary |
| ScoreBat token not set | LOW | Widget slot shows placeholder; highlights optional |
| WC teams not in PSL DB | INFO | Team resolution shows ⚠️ in dry-run; expected |
| WC season ID auto-detect | INFO | Uses competition.code IN WC_CODES to find season |

## Safety Preserved

- PSL INACTIVE throughout Sprint 38A
- No PSL fixture import or publication
- No real money
- No scheduled ingestion
- All write imports require double-flag confirmation

## Next Sprint Recommendation

Sprint 38B: Run owner-approved WC write import → verify 104 fixtures in DB →
enable GTS prediction cards for WC matches → validate ScoreBat highlights widget.
