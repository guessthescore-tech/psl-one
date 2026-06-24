# Sprint 37 — Known Gaps

## GAP-37-01: PSL Fixture Source Empty Until July/August 2026

| Field | Value |
|-------|-------|
| Gap ID | GAP-37-01 |
| Severity | NONE |
| Status | EXPECTED |

psl.co.za publishes the Betway Premiership fixture schedule annually, typically July/August. No fixtures are available now.

**Resolution:** Re-run `sprint-36b-psl-fixture-readiness-monitor.mjs` and `sprint-37-psl-provider-availability-check.mjs` in July/August 2026.

## GAP-37-02: API-Football PSL Account Suspended

| Field | Value |
|-------|-------|
| Gap ID | GAP-37-02 |
| Severity | LOW (Parse PSL is primary) |
| Status | BLOCKED_BY_OWNER |

API-Football PSL 288 returned `ACCOUNT_SUSPENDED` in Sprint 13. The adapter code is functional but the account is invalid.

**Resolution:** Owner procures a new API-Football account with PSL 288 access.

## GAP-37-03: Parse PSL Key Not in Beta Env

| Field | Value |
|-------|-------|
| Gap ID | GAP-37-03 |
| Severity | LOW (SOURCE_EMPTY anyway) |
| Status | OWNER_ACTION_REQUIRED |

`DATA_PROVIDER` and `PARSE_API_KEY` are not confirmed to be set in the beta EC2 `.env.beta`. Even if set, SOURCE_EMPTY is the current state.

**Resolution:** Owner sets `DATA_PROVIDER=parse-psl` + `PARSE_API_KEY` in beta `.env` before July/August 2026 monitoring run.

## GAP-37-04: football-data.org Key Confirmation

| Field | Value |
|-------|-------|
| Gap ID | GAP-37-04 |
| Severity | LOW |
| Status | PENDING_OWNER_CONFIRMATION |

`FOOTBALL_DATA_API_KEY` is expected to be set for WC 2026 data, but has not been re-verified in Sprint 37 (cannot be checked without admin token).

**Resolution:** Owner confirms key is set in beta EC2 `.env.beta`. Run `sprint-37-world-cup-provider-availability-check.mjs`.

## GAP-37-05: No Manual CSV/JSON Fallback Implemented

| Field | Value |
|-------|-------|
| Gap ID | GAP-37-05 |
| Severity | LOW |
| Status | DEFERRED |

No manual fixture CSV/JSON import endpoint exists. If both Parse PSL and API-Football fail after fixture season starts, a manual path would be needed.

**Resolution:** Implement Sprint 38+ if needed. Current priority is Parse PSL (primary).

## GAP-37-06: PR #39 (Sprint 36C Evidence) Pending Merge

| Field | Value |
|-------|-------|
| Gap ID | GAP-37-06 |
| Severity | NONE |
| Status | PENDING_OWNER_MERGE |

PR #39 (Sprint 36C beta EC2 redeployment evidence, 3 docs) is open as draft on `feature/sprint-36c-ec2-readiness-monitoring-deploy-evidence`. Sprint 37 does not depend on it.

**Resolution:** Owner reviews and merges PR #39 when ready.

## Safety State

All safety boundaries remain active:
- PSL = INACTIVE
- No fixture import write
- No fixture publication
- No PSL activation
- No scheduled ingestion
- No production ingestion
- No real-money functionality
- Wallet = sandbox-only
