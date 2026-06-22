# Sprint 17 — Owner Review Guide

## What to Review

Sprint 17 adds a manual fixture ingestion admin workflow. There are two things to review:

### 1. Admin UI Page — `/admin/data-provider/parse-psl`

- Navigate to the admin UI.
- Click **Run Dry-Run Preview**.
  - Expected result: `SOURCE_EMPTY` status with blue info box (no fixtures yet).
- Confirm the blue info box message is clear and non-alarming.
- Confirm the write section is present but requires `seasonId` + checkbox.
- Confirm no provider keys appear anywhere on the page.

### 2. API Behaviour

- `POST /admin/data-provider/parse-psl/fixtures/ingest` with no body.
  - Expected: 200, `dryRun: true`, `sourceStatus: SOURCE_EMPTY`.
- `POST ... { dryRun: false }` (no seasonId).
  - Expected: 400 `seasonId is required for write mode`.
- `POST ... { dryRun: false, seasonId: "x" }` (no confirmWrite).
  - Expected: 400 `confirmWrite=true is required`.
- `POST ... { dryRun: false, seasonId: "x", confirmWrite: true }`.
  - Expected: 200, `dryRun: false`, `sourceStatus: SOURCE_EMPTY`, `created: 0`.

### 3. Security

- Confirm `PARSE_API_KEY` is not present in any file under `apps/experience/`.
- Confirm no `NEXT_PUBLIC_PARSE_API_KEY` anywhere.
- Confirm admin page calls the PSL One API (not Parse PSL directly).

## Acceptance Criteria

All gates listed in [SPRINT-17-BETA-GO-NOGO.md](SPRINT-17-BETA-GO-NOGO.md) pass.

- Source-empty UI message is operator-friendly.
- No secrets exposed in the browser layer.
- Write-mode guards work (400 on missing seasonId / confirmWrite).
- Fixtures import as `isPublished=false`.
- PSL season is NOT activated.

## Not In Scope for This Review

- Fixture data correctness (source is empty until July/August).
- Team resolution accuracy (no real fixtures yet to test against).
- Scheduled ingestion (not implemented).
