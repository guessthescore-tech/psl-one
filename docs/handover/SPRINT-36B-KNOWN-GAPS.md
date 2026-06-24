# Sprint 36B — Known Gaps

## GAP-36B-01: Provider check is config-only (no live network call)

| Field | Value |
|-------|-------|
| Gap ID | GAP-36B-01 |
| Severity | LOW |
| Status | BY_DESIGN |

The readiness endpoint inspects `DATA_PROVIDER` and key env vars for presence only. It does not make a live network call to Parse PSL or API-Football.

**Reason:** A live check requires a valid key and would consume provider quota. The existing `POST /admin/data-provider/parse-psl/fixtures/ingest` with `dryRun=true` is the correct tool for a live provider check.

**Resolution:** Run the Sprint 25 tool for a live check:
```bash
BASE_URL=http://api:4000 ADMIN_TOKEN=<jwt> \
  node tools/staging/sprint-25-psl-fixture-availability-check.mjs
```

## GAP-36B-02: API-Football PSL 288 not checked live

| Field | Value |
|-------|-------|
| Gap ID | GAP-36B-02 |
| Severity | LOW |
| Status | DEFERRED |

API-Football PSL (league 288) returned ACCOUNT_SUSPENDED in Sprint 13. No live check is wired because the account may still be suspended.

**Resolution:** Owner must obtain a valid API-Football key and set `DATA_PROVIDER=api-football API_FOOTBALL_KEY=<key>`. Then the readiness endpoint will reflect `configured=true`.

## GAP-36B-03: readinessStatus does not auto-update

| Field | Value |
|-------|-------|
| Gap ID | GAP-36B-03 |
| Severity | LOW |
| Status | BY_DESIGN |

The readiness endpoint is called on-demand. There is no background polling or EventBridge trigger.

**Reason:** No scheduled ingestion is authorised. Manual-only is the intended operating model.

**Resolution:** Admin or owner runs the monitoring tool periodically. No cron required.

## GAP-36B-04: Parse PSL SOURCE_EMPTY until July/August 2026

| Field | Value |
|-------|-------|
| Gap ID | GAP-36B-04 |
| Severity | NONE |
| Status | EXPECTED |

psl.co.za has not published the 2026/27 Betway Premiership fixture schedule. SOURCE_EMPTY is the correct and expected state.

**Resolution:** Re-run monitoring tool in July/August 2026 when PSL publishes the season fixture schedule.

## Safety State

All safety boundaries confirmed active:
- PSL = INACTIVE
- No fixture import write
- No fixture publication
- No PSL activation
- No scheduled ingestion
- No production ingestion
- No wallet production
- No real-money functionality
