# Sprint 37 — Owner Review Guide

## What Was Built in Sprint 37

| Artifact | Path | Purpose |
|----------|------|---------|
| Enhanced readiness endpoint | `GET /admin/data-provider/psl-fixture-readiness` | +providerDecision, +dryRunEligible, +writeImportForbidden, +pslActivationForbidden |
| Provider env check tool | `tools/staging/sprint-37-provider-env-check.mjs` | Checks env var presence/pairing — no API calls |
| PSL availability check tool | `tools/staging/sprint-37-psl-provider-availability-check.mjs` | Read-only PSL readiness check via admin API |
| WC availability check tool | `tools/staging/sprint-37-world-cup-provider-availability-check.mjs` | Read-only WC provider check |
| Dry-run readiness tool | `tools/staging/sprint-37-fixture-import-dry-run-readiness.mjs` | Precheck + optional dry-run import |
| Provider architecture baseline | `docs/data/SPRINT-37-PROVIDER-ARCHITECTURE-BASELINE.md` | Full architecture snapshot |
| Provider procurement matrix | `docs/data/SPRINT-37-LIVE-PROVIDER-PROCUREMENT-MATRIX.md` | Provider comparison and recommendation |
| Env validation doc | `docs/data/SPRINT-37-PROVIDER-ENV-VALIDATION.md` | Env var security rules |
| Dry-run readiness doc | `docs/data/SPRINT-37-FIXTURE-IMPORT-DRY-RUN-READINESS.md` | Gates and process |
| Owner approval pack | `docs/data/SPRINT-37-OWNER-APPROVAL-PACK-FIXTURE-WRITE-IMPORT.md` | Write import checklist (NOT approved yet) |
| Live provider readiness | `docs/data/SPRINT-37-LIVE-DATA-PROVIDER-READINESS.md` | Current status |
| PSL Go/No-Go | `docs/data/SPRINT-37-PSL-FIXTURE-PROVIDER-GO-NOGO.md` | Provider decision |
| WC status | `docs/data/SPRINT-37-WORLD-CUP-DATA-PROVIDER-STATUS.md` | WC provider status |
| Runbook | `docs/staging/SPRINT-37-PROVIDER-CHECK-RUNBOOK.md` | Operations guide |

## What Owner Needs to Do

### Immediate (before July/August 2026)

1. **Configure Parse PSL in beta env** — Set `DATA_PROVIDER=parse-psl` + `PARSE_API_KEY` in beta EC2 `.env.beta` (redeploy via `deploy-beta-ec2.yml` with `run_migrations=false`)
2. **Confirm football-data.org key** — Verify `FOOTBALL_DATA_API_KEY` is in beta EC2 `.env.beta`
3. **Optionally procure API-Football** — New account for PSL 288 if Parse PSL is not suitable

### July/August 2026 (when PSL publishes fixtures)

1. Run `sprint-37-psl-provider-availability-check.mjs`
2. If `readinessStatus=FIXTURES_AVAILABLE_DRY_RUN_REQUIRED`, review dry-run approval pack
3. Approve dry-run: `RUN_DRY_RUN=true` on `sprint-37-fixture-import-dry-run-readiness.mjs`
4. Review fixture candidates
5. Separately approve write import (sign off on `docs/data/SPRINT-37-OWNER-APPROVAL-PACK-FIXTURE-WRITE-IMPORT.md`)
6. Separately approve fixture publication
7. Separately approve PSL activation via 13-check preflight

### Not Required Now

- No code changes needed before July/August
- No deployment needed for Sprint 37 (docs + tools only change in tools/staging + docs)
- No migrations

## What This Sprint Does NOT Do

| Boundary | Confirmed |
|----------|-----------|
| PSL activation | NOT DONE — PSL remains INACTIVE |
| Fixture import write | NOT DONE — no `dryRun=false` anywhere |
| Fixture publication | NOT DONE |
| Scheduled ingestion | NOT DONE — disabled by design |
| Production ingestion | NOT DONE |
| Real-money | NOT DONE — points-only platform |
| Provider key in response | NOT DONE — presence flag only |
| Provider key in frontend | NOT DONE — server-side only |
| Wallet production | NOT DONE — sandbox-only |

## PR

Sprint 37 PR is draft. Owner reviews docs and tools, then merges when satisfied.
