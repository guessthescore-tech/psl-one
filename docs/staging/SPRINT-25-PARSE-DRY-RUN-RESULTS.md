# Sprint 25 — Parse PSL Dry-Run Results

## Dry-Run Endpoint

```
POST /admin/data-provider/parse-psl/fixtures/ingest
Body: { "dryRun": true }
```

## Result as of 2026-06-23

| Field | Value |
|-------|-------|
| Result status | `INGESTION_SOURCE_EMPTY_NOOP` |
| Candidates found | 0 |
| DB changes made | None (dryRun=true + source empty) |
| Provider | ParsePslAdapter |
| Source | psl.co.za via Parse.bot |

## What the API Returns for Source-Empty

```json
{
  "status": "INGESTION_SOURCE_EMPTY_NOOP",
  "message": "Source returned no fixture candidates — no changes made",
  "candidateCount": 0,
  "dryRun": true
}
```

## Interpretation

The `INGESTION_SOURCE_EMPTY_NOOP` result means psl.co.za has not yet published fixture data for 2026/27. The adapter correctly distinguishes this from a provider error — it is a **no-op**, not a failure.

## What Happens When Fixtures Become Available

When psl.co.za publishes the 2026/27 schedule, the dry-run will return:

```json
{
  "status": "DRY_RUN_COMPLETE",
  "candidateCount": <N>,
  "candidates": [
    {
      "homeTeam": "Kaizer Chiefs",
      "awayTeam": "Orlando Pirates",
      "kickoff": "2026-08-01T15:00:00Z",
      "homeTeamResolved": true,
      "awayTeamResolved": true
    }
  ]
}
```

At that point:
1. Run the team resolution check: `sprint-25-team-resolution-readiness.mjs`
2. Owner reviews candidates
3. If all gates pass, owner authorises `dryRun:false` + `confirmWrite:true`
4. Follow `SPRINT-25-FIXTURE-IMPORT-WRITE-RUNBOOK.md`

## Safety Constraints

- `dryRun=true` enforced in all automated tools — never bypassed
- Source-empty is not an error — no alert/escalation needed
- Re-run the availability check weekly or when owner requests
- No fixture write, no PSL activation, no scheduled ingestion during Sprint 25
