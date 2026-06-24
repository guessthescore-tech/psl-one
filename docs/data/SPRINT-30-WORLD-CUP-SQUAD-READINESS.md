# Sprint 30 — World Cup 2026 Squad Readiness

**Status:** PARTIAL | PSL INACTIVE | BETA ONLY
**Date:** 2026-06-24

## Target

48 WC teams × 23–26 players = 1,104–1,248 player records needed for full coverage.

## Current State

| Metric | Count | Source |
|--------|-------|--------|
| Teams seeded (WC) | 48 of 65 total | Sprint 29 smoke (65 Team records) |
| Players seeded | ~96 provisional | Sprint 29 (FantasyCalibrationModule) |
| Coverage | ~2 players/team | INSUFFICIENT for full fantasy |
| Completeness | ~8% | PARTIAL |

## Provenance Model

All player records track provenance via `Player.externalId` and `SquadImportBatch.source`:

| Provenance | Meaning |
|-----------|---------|
| `FOOTBALL_DATA_ORG` | Imported via football-data.org API |
| `API_FOOTBALL` | Imported via API-Football |
| `PARSE_PSL` | Imported via Parse PSL adapter (PSL only) |
| `MANUAL_CSV` | Admin uploaded via SquadImportModule CSV |
| `PROVISIONAL` | Sprint seed data, not yet verified |

## Per-Team Coverage Status

| Confederation | Teams | Players Needed | Status |
|--------------|-------|---------------|--------|
| CONMEBOL (South America) | 6 | ~138 | PARTIAL |
| UEFA (Europe) | 16 | ~368 | PARTIAL |
| CONCACAF (North/Central America) | 6 | ~138 | PARTIAL |
| CAF (Africa) | 9 | ~207 | PARTIAL |
| AFC (Asia) | 8 | ~184 | PARTIAL |
| OFC (Oceania) | 1 | ~23 | PARTIAL |
| Host nations (USA/CAN/MEX) | 3 | ~69 | PARTIAL |
| **Total** | **48** | **~1,104+** | **PARTIAL** |

## Manual Correction Admin Flow

When squad data is incomplete, admins can:

1. **Bulk import via CSV**  
   Route: `POST /admin/squad-import/batch`  
   Format: `externalId,name,position,teamSlug,shirtNumber,nationality`

2. **Review import batch**  
   Route: `GET /admin/squad-import/review`  
   UI: `/admin/players` (filter by importBatchId)

3. **Manual player edit**  
   Route: `PATCH /admin/players/:id`  
   Fields: name, position, isEligibleForFantasy, teamId

4. **Individual player create**  
   Route: `POST /admin/players`

## Position Distribution Target

For a balanced fantasy player pool (per team, 23-player squad):
- Goalkeepers: 3 per team = 144 total GK
- Defenders: 6–7 per team = 288–336 total DEF
- Midfielders: 6–7 per team = 288–336 total MID
- Forwards: 4–5 per team = 192–240 total FWD

Current state: insufficient across all positions.

## Recommended Action for Beta

**Path A (Recommended): Manual CSV upload**
1. Admin downloads official WC2026 squad lists from national team pages
2. Formats 48-team CSV (~1,200 rows)
3. Uploads via SquadImportModule (3 routes: batch → review → confirm)
4. Mark all records as `PROVISIONAL` until confirmed by FIFA
5. Complete within 1 admin session (~2 hours)

**Path B: API-Football paid key**
1. Owner procures API-Football key with WC coverage
2. Admin triggers bulk squad import via DataProviderModule
3. All 48 squads imported in one run (~10 minutes)
4. Mark as `API_FOOTBALL` provenance

**Path C: Continue with provisional data**
1. Keep 96 provisional players
2. Fantasy feature works but limited selection
3. Acceptable for early beta with small tester group

## Owner Gates

| Gate | Decision | Impact |
|------|----------|--------|
| OG-30-02 | Authorise Path A (CSV upload) | Fantasy player pool |
| OG-30-01 | Procure Path B (API-Football key) | Full squad automation |

---

*PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | NON-FINANCIAL FANTASY | BETA ONLY*
