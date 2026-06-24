# Sprint 37 — Owner Approval Pack: Fixture Write Import

## Status: NOT APPROVED IN SPRINT 37

This document is a reference template for when the owner is ready to approve fixture write import. **Sprint 37 does not approve this action.**

---

## Preconditions Checklist (all must be satisfied)

### Provider
- [ ] Provider selected: `parse-psl` (primary) or `api-football` (fallback)
- [ ] Provider key configured server-side on beta EC2 (`PARSE_API_KEY` or `API_FOOTBALL_KEY`)
- [ ] Provider key is NOT in any `NEXT_PUBLIC_*` variable
- [ ] `GET /admin/data-provider/psl-fixture-readiness` returns `dryRunEligible=true`
- [ ] `readinessStatus` is `FIXTURES_AVAILABLE_DRY_RUN_REQUIRED` or `READY_FOR_OWNER_IMPORT_REVIEW`

### Dry-Run Completed
- [ ] `POST /admin/data-provider/parse-psl/fixtures/ingest` with `dryRun=true` completed successfully
- [ ] `candidateFixtureCount` > 0
- [ ] `sourceStatus` = `SOURCE_AVAILABLE`
- [ ] Dry-run response provided to owner for review

### Team Resolution
- [ ] All 16 PSL clubs matched in candidate list (`homeTeamMatched=true`, `awayTeamMatched=true`)
- [ ] No unresolved team warnings in dry-run response
- [ ] If any warnings: owner has reviewed and approved the resolution

### Season
- [ ] PSL 2026/27 season record exists in DB (`GET /admin/seasons`)
- [ ] PSL season has `isActive=false` (PSL is not yet activated)
- [ ] `seasonId` confirmed by owner

### Rollback Plan
- [ ] Rollback procedure confirmed: delete all fixtures with `seasonId=<psl-2026-27-id>` and `providerSource=parse-psl`
- [ ] Backup of current DB state confirmed
- [ ] Rollback can be executed without activating PSL

### Write Import
- [ ] Owner explicitly approves: `dryRun=false` + `confirmWrite=true`
- [ ] `seasonId` parameter confirmed

---

## Write Import Command (requires owner approval to execute)

```bash
# THIS IS NOT APPROVED IN SPRINT 37
# Run only after owner signs off on all preconditions above

BASE_URL=http://api:4000
ADMIN_TOKEN=<psl-admin-jwt>       # Never print this
PSL_SEASON_ID=<psl-2026-27-id>   # Get from GET /admin/seasons

curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"dryRun\": false, \"confirmWrite\": true, \"seasonId\": \"$PSL_SEASON_ID\", \"competitionCode\": \"BETWAY_PREMIERSHIP\"}" \
  "$BASE_URL/admin/data-provider/parse-psl/fixtures/ingest"
```

---

## Post-Write Verification

Run after write import completes:

```bash
# Check fixture count
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BASE_URL/admin/fixtures?seasonId=$PSL_SEASON_ID" | jq '.total'

# Confirm all unpublished
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BASE_URL/admin/fixtures?seasonId=$PSL_SEASON_ID" | jq '[.fixtures[] | select(.isPublished == true)] | length'
# Must be 0
```

---

## After Write Import — Separate Actions Required

**These are NOT approved by approving write import:**

| Action | Separate approval required |
|--------|---------------------------|
| Fixture publication (`isPublished=true`) | Yes — per-fixture admin action |
| PSL season activation | Yes — 13-check preflight + owner approval |
| Scheduled ingestion | Yes — currently disabled by design |
| Any real-money feature | Not applicable — points-only platform |

---

## Forbidden Without This Pack

| Action | Gate |
|--------|------|
| `dryRun=false` without owner sign-off | 400 from controller (no `confirmWrite`) |
| `confirmWrite=true` without `seasonId` | 400 from controller |
| Publishing fixtures before write import | Impossible (no fixtures to publish) |
| Activating PSL before 13-check preflight | 400 from season switching service |
| Enabling scheduled ingestion | No scheduler configured — by design |

---

## Safety Boundaries Remain Active

```
PSL = INACTIVE (not changed by fixture import)
No real-money functionality
Fantasy = points-only
Social prediction = points-only
Commerce = CATALOGUE_ONLY
Wallet = sandbox-only
Fixture publishing ≠ PSL activation
```
