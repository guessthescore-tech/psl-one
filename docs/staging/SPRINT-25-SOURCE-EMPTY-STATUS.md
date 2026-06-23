# Sprint 25 — Source Empty Status Record

## Current State

| Attribute | Value |
|-----------|-------|
| Status | `INGESTION_SOURCE_EMPTY_NOOP` |
| Source | psl.co.za (via Parse.bot) |
| Adapter | `ParsePslAdapter` |
| Date checked | 2026-06-23 |
| Fixtures available | NO |
| Action required now | None — monitor and retry |

## Is This a System Failure?

**No.** This is expected system behaviour, documented in Sprint 16 and Sprint 17.

The `ParsePslFixtureIngestionService` explicitly handles the case where the upstream source returns an empty result set:

- Returns `INGESTION_SOURCE_EMPTY_NOOP`
- Makes zero DB changes
- Does not raise an error or alert

The 2026/27 PSL fixture schedule has not yet been published on psl.co.za. This is normal in June — PSL fixture schedules are typically published in July/August before the season starts.

## When Will Fixtures Be Available?

| Milestone | Expected timing |
|-----------|----------------|
| PSL 2026/27 fixture schedule published on psl.co.za | ~July/August 2026 |
| Parse.bot able to scrape fixture data | Within days of publication |
| Dry-run returns candidates | Within hours of fixture data appearing |

## Monitoring Protocol

1. Run `tools/staging/sprint-25-psl-fixture-availability-check.mjs` weekly (manual, admin only)
2. Look for `PSL_FIXTURE_CANDIDATES_FOUND` in output
3. When candidates appear, notify owner immediately — do NOT import automatically
4. Owner approves all 10 gates in `SPRINT-25-OWNER-APPROVAL-GATES.md` before any write

## No Automated Ingestion

Scheduled ingestion is **DISABLED**. There is no cron job or trigger polling for fixture availability. All checks are manual and owner-approved.

This matches the `SOURCE_EMPTY_NOOP` design intent: source-empty is a safe terminal state requiring human review before any next step.

## Safety

- PSL: INACTIVE
- Wallet: SANDBOX
- Scheduled ingestion: DISABLED
- Production ingestion: DISABLED
- Real-money: NONE
