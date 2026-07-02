# World Cup 2026 Live Fixture Recovery Runbook

## Purpose

Recover stale World Cup 2026 beta fixture data without activating PSL, exposing
provider secrets, or modifying historical results unsafely.

## Immediate Manual Recovery

Use an admin JWT for a `PSL_ADMIN` user. The endpoint is RBAC protected and
writes an admin audit log.

```bash
curl -fsS -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://api.beta.pslone.co.za/admin/data-provider/world-cup/fixtures/refresh-status
```

Expected response fields:

- `provider`
- `sourceStatus`
- `discovered`
- `matched`
- `updated`
- `skipped`
- `errors`
- `safety.noNewFixtures`
- `safety.noPslActivation`
- `safety.noRealMoney`

## Post-Refresh Smoke Checks

```bash
curl -fsS https://api.beta.pslone.co.za/football/seasons/active
curl -fsS "https://api.beta.pslone.co.za/football/fixtures?seasonSlug=fifa-world-cup-2026"
curl -fsS -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://api.beta.pslone.co.za/admin/data-provider/world-cup/sync-status
```

Verify:

- active season slug is `fifa-world-cup-2026`
- total fixtures remain `104`
- finished fixtures do not lose scores
- `lastSyncedAtLatest` advances
- `staleSyncedCount` decreases after refresh
- `tbdFixtureCount` decreases when the provider has resolved teams
- `missingProviderFixtureIdCount` decreases when safe matches are available

## Durable Sync Model

No scheduler is enabled by this runbook. A future automated refresh must be
server-side only, disabled by default, and gated by an explicit environment flag
such as `ENABLE_WC_FIXTURE_SYNC=true`.

Recommended cadence if approved:

- every 5 minutes during live match windows
- every 30-60 minutes outside live windows during the tournament
- one football-data.org competition fixtures request per cycle
- retry transient provider failures with bounded backoff

Adding that scheduler requires an ADR because it changes the ingestion
operational boundary.

## Safety Invariants

- Do not activate PSL.
- Do not modify PSL fixtures.
- Do not erase non-null historical scores with provider nulls.
- Do not overwrite non-`TBD` teams.
- Do not expose provider keys in frontend code or `NEXT_PUBLIC_*`.
- Do not add browser-side provider calls.
- Do not introduce betting, odds, prizes, or real-money behavior.
