# Sprint 15 — Canonical Data Boundary

## Purpose

This document defines which data fields are owned by the provider (Parse PSL), which are owned by PSL One admin, and which are fan-generated. It prevents provider ingestion from silently overwriting trusted data.

## Data Ownership Matrix

| Entity | Field | Owner | Provider Can Write? | Locked Condition |
|--------|-------|-------|---------------------|-----------------|
| Fixture | `externalId` | Provider | Yes (initial set) | Immutable once set |
| Fixture | `scheduledAt` | Provider | Yes | Owner edits override |
| Fixture | `status` | Provider | Yes (advance only) | Cannot revert (e.g., FINISHED → SCHEDULED) |
| Fixture | `homeScore` / `awayScore` | Provider | Yes | Locked if `manualScore=true` |
| Fixture | `isPublished` | Admin | No | Admin-only action |
| Fixture | `adminNotes` | Admin | No | Never overwritten |
| Fixture | `gameweekId` | Admin | No | Fantasy assignment |
| Team | `name` | Admin (canonical) | No | Display name never overwritten |
| Team | `shortCode` | Admin | No | |
| Team | `externalId` (provider) | Provider | Via mapping table | Stored in ProviderTeamMapping |
| Player | All fields | Admin / Calibration | No (Sprint 15) | Player ingestion deferred |
| Standing | All fields | Provider (read-only) | N/A — not persisted | Display only |

## Canonical vs Provider Data

PSL One maintains **canonical** data: fixture dates, team names, player names, squad compositions. These may differ from provider data due to:
- Name translations (e.g., "Betway Premiership" vs "PSL")
- Official cancellation/rescheduling not yet reflected in provider
- Data lag at psl.co.za

**Resolution rule:** When canonical and provider data conflict:
1. Log the conflict in `ProviderIngestionWarning`.
2. Keep the canonical value.
3. Queue for owner review.

## Provider Provenance Column

Every row ingested from a provider records:
```
providerName: 'parse-psl' | 'football-data-org' | 'api-football'
providerLastSyncAt: DateTime
```

This allows auditing which data came from which provider and when.

## Locked Data Definition

Data is **locked** if:
- `isPublished = true` on a Fixture (fans can see it)
- `manualScore = true` (admin has confirmed the result)
- Row is referenced by active fantasy gameweek scoring

Locked rows must not be overwritten by provider ingestion without explicit admin approval.

## Related Documents

- `docs/data/SPRINT-15-FIXTURE-INGESTION-DESIGN.md`
- `docs/data/SPRINT-15-IDEMPOTENT-INGESTION-RULES.md`
