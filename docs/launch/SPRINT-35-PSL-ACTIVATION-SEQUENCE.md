# Sprint 35 — PSL Season Activation Sequence

**WARNING: Do not execute this sequence without owner gate OG-35-PSL-ACT authorisation.**

## Pre-Activation Checklist

Run `PslActivationPreflightService.runAllChecks()` and verify all 13+ checks return PASS:

```bash
# On EC2 staging/production
curl -X GET https://api.psl.co.za/admin/psl/preflight \
  -H "Authorization: Bearer $PSL_ADMIN_TOKEN"
```

Expected response: all checks `{ status: "PASS" }`.

## Activation Sequence

### Step 1 — Validate fixtures
```bash
curl -X GET https://api.psl.co.za/admin/fixtures?season=psl-2026-27&status=PUBLISHED \
  -H "Authorization: Bearer $PSL_ADMIN_TOKEN"
# Verify: >= 10 published fixtures
```

### Step 2 — Dry-run activation
```bash
curl -X POST https://api.psl.co.za/admin/competition-switching/dry-run \
  -H "Authorization: Bearer $PSL_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "targetSeasonId": "<PSL_SEASON_ID>" }'
# Verify: all dry-run checks PASS
```

### Step 3 — Activate (IRREVERSIBLE — requires OG-35-PSL-ACT)
```bash
curl -X POST https://api.psl.co.za/admin/competition-switching/activate \
  -H "Authorization: Bearer $PSL_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "targetSeasonId": "<PSL_SEASON_ID>", "ownerGate": "OG-35-PSL-ACT" }'
```

### Step 4 — Verify activation
```bash
curl -X GET https://api.psl.co.za/admin/seasons \
  -H "Authorization: Bearer $PSL_ADMIN_TOKEN"
# Verify: PSL season status = ACTIVE
```

### Step 5 — Smoke test
Run the 21-check smoke suite and verify all PASS.

## Rollback

If activation causes unexpected issues within the first 30 minutes:
```bash
curl -X POST https://api.psl.co.za/admin/competition-switching/rollback \
  -H "Authorization: Bearer $PSL_ADMIN_TOKEN"
```

A `SeasonSwitchAudit` record is created for every activation and rollback attempt.

## Safety Constraints

- PSL MUST remain INACTIVE until this sequence is authorised and executed.
- Do not activate the PSL season in any automated workflow.
- Never activate PSL as part of CI/CD or deployment automation.
- The `isActivated` flag is persisted in the database — check the DB state if uncertain.
