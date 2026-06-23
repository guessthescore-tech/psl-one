# Sprint 25 — Parse PSL Fixture Availability Status

## Status

**Current result: PSL_FIXTURES_SOURCE_EMPTY**

The Parse PSL adapter (`ParsePslAdapter`) calls psl.co.za via Parse.bot. As of 2026-06-23, psl.co.za has not yet published the 2026/27 PSL fixture schedule.

This is **expected behaviour** — not a provider failure.

## How to Verify

Run the fixture availability tool from beta EC2:

```bash
# On beta EC2 via SSM — requires ADMIN_TOKEN env var
BASE_URL=http://localhost:4000 \
ADMIN_TOKEN=<psl-admin-jwt> \
node tools/staging/sprint-25-psl-fixture-availability-check.mjs
```

Expected output while fixtures are unavailable:
```
[INFO] Source status — SOURCE_EMPTY
[INFO] Expected date — PSL 2026/27 fixture schedule expected ~July/August 2026
PSL_FIXTURES_SOURCE_EMPTY
```

## Provider Chain

| Priority | Provider | Status |
|----------|----------|--------|
| 1 | ParsePslAdapter (psl.co.za) | SOURCE_EMPTY |
| 2 | ApiFootballAdapter (API-Football id 288) | PSL account suspended |
| 3 | NoOpAdapter | Fallback always active |

## Gates Before Import Write

No fixture import write may occur until all of the following are true:

- [ ] Source returns `PSL_FIXTURE_CANDIDATES_FOUND` (not SOURCE_EMPTY)
- [ ] Team resolution check: `TEAM_RESOLUTION_READY`
- [ ] Owner has reviewed dry-run results and approved write
- [ ] `dryRun:false` and `confirmWrite:true` explicitly authorised by owner
- [ ] See `SPRINT-25-OWNER-APPROVAL-GATES.md` for full gate list

## Safety

- `dryRun=true` is always enforced in automated tools
- Source-empty returns `INGESTION_SOURCE_EMPTY_NOOP` from the API — no DB changes
- PSL remains INACTIVE throughout this sprint
