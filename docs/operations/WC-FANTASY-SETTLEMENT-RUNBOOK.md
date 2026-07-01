# WC Fantasy Gameweek Settlement — Operator Runbook

**Audience:** PSL_ADMIN operators  
**Status:** Current  
**Last verified:** 2026-07-01

---

## Overview

This runbook describes the safe sequence for settling World Cup fantasy gameweek
scores. Running the steps out of order, or skipping the stats sync, writes zero-point
`FantasyGameweekScore` rows that surface as real scores in the fan UI via the `.then()`
path — not `.catch()`. Those zeros look correct to users but are wrong.

The service enforces the correct order via a preflight guard. Calling
`POST /fantasy/admin/scoring/gameweeks/:id/settle` before syncing stats will return
HTTP 400 with a message that names each unsynced fixture by ID.

---

## Safe Settlement Sequence

### Step 1 — Populate player stats from the FDO scorers feed

> **Beta data source:** The beta leaderboard and fantasy stats are populated from
> football-data.org's competition-aggregate scorers endpoint
> (`/v4/competitions/WC/scorers`), not from per-match event ingestion. One
> `PlayerMatchStats` row is written per scorer (attached to the team's first
> finished fixture). This gives correct competition totals but no per-match breakdown.
>
> **Do NOT use `sync:world-cup-player-stats` on the FDO free tier.** That script
> calls `/v4/matches/{id}` per fixture, which returns no lineups or goal events on
> the free tier. It will write 0 rows and look like it succeeded.

```bash
# On EC2 via SSM — inside the API container:
docker compose --env-file .env.beta -f compose.beta.yaml exec -T api \
  node apps/api/dist/scripts/sync-world-cup-scorers.js --confirm=SYNC_WC_SCORERS
```

Or locally (against a database with FOOTBALL_DATA_API_KEY set):

```bash
pnpm --filter @psl-one/api sync:world-cup-scorers -- --confirm=SYNC_WC_SCORERS
```

This writes `PlayerMatchStats` rows with `status=VERIFIED` for every matched scorer.
It is idempotent: running it twice is safe (upsert on `(playerId, fixtureId)`).

**Dry-run first:**

```bash
pnpm --filter @psl-one/api sync:world-cup-scorers -- --dry-run
```

Expected output: `matched: 52, written: 52, skipped: 48` (48 scorers have name
variants not yet in the seed data — see data gap section below).

**Verify top-performers:**

```bash
curl https://api.beta.pslone.co.za/players/season/fifa-world-cup-2026/top-performers | jq length
# Expected: 10+ entries
```

**Note:** The settlement preflight checks for `FantasyPlayerMatchStat` rows, which
are written by `syncProviderPlayerStats()` (the per-match sync path, not the scorers
sync). The scorers sync only writes `PlayerMatchStats`. For fantasy settlement to
succeed, per-match `FantasyPlayerMatchStat` coverage must also be present. If the
preflight blocks with "run sync:world-cup-player-stats first", it means the per-match
path has not run — see the data gap section below.

### Step 2 — Mark the gameweek COMPLETED (optional but recommended)

```bash
curl -X PATCH https://api.beta.pslone.co.za/admin/gameweeks/<gameweekId>/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "COMPLETED"}'
```

This is optional from the settlement service's perspective — the preflight checks
fixture-level coverage, not gameweek status. However, marking the gameweek COMPLETED
is semantically correct and prevents the transfer window from opening prematurely.

### Step 3 — Run settlement

```bash
curl -X POST https://api.beta.pslone.co.za/fantasy/admin/scoring/gameweeks/<gameweekId>/settle \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected response (all teams settled):

```json
{
  "teamsSettled": <N>,
  "errors": []
}
```

If `errors` is non-empty, those team IDs failed individually. The bulk result is still
returned — the failing teams can be recalculated with the per-team endpoint once the
root cause is resolved.

---

## Preflight Guard

The settlement endpoint enforces two invariants before writing any scores:

1. **At least one FINISHED fixture must exist** in the gameweek. Settlement is refused
   if no fixtures have `status: FINISHED`.
2. **Every FINISHED fixture must have at least one `FantasyPlayerMatchStat` row.** A
   count-based check is not sufficient — one synced fixture would wrongly allow
   settlement while leaving every other fixture's players at zero. The guard checks
   per-fixture completeness via a `SELECT DISTINCT fixtureId` on the stat table.

If the guard fails, the response is HTTP 400 with a message listing the unsynced
fixture IDs:

```
2 FINISHED fixture(s) have no FantasyPlayerMatchStat rows: [fix-abc, fix-xyz]
— run sync:world-cup-player-stats first
```

> **Important:** On the FDO free tier, `sync:world-cup-player-stats` will NOT
> populate `FantasyPlayerMatchStat` rows (the per-match endpoint returns no
> lineups/events). The preflight will remain blocked until either:
> (a) the FDO tier is upgraded so `/v4/matches/{id}` returns lineups, or
> (b) per-match stats are entered manually via the admin endpoint.
> The scorers-aggregate sync (`sync:world-cup-scorers`) populates `PlayerMatchStats`
> only — it does not satisfy the `FantasyPlayerMatchStat` preflight.

Run `sync:world-cup-player-stats` only if you have confirmed that `/v4/matches/{id}`
returns lineups for WC fixtures (requires paid FDO tier). Then re-attempt Step 3.

---

## Why Gameweek Status is Not Part of the Guard

`GameweekStatus` (`UPCOMING → OPEN → LOCKED → LIVE → COMPLETED`) is a
scheduling concept, not a stats-completeness concept. A gameweek can be
`COMPLETED` while stats are still unsynced, or `LIVE` while stats are fully
synced for the fixtures that have finished. Anchoring the guard on
`fixture.status === FINISHED` is more direct and less prone to operator confusion.

WC gameweeks are seeded as `UPCOMING`. Requiring `COMPLETED` would force a
status-machine walk before every settlement — an extra footgun with no correctness
benefit.

---

## Recalculate After a Premature Settlement

If settlement was called before stats sync (e.g. in a previous code version before
the preflight was added), zero-point `FantasyGameweekScore` rows may already exist.

**Full gameweek recalculate** (re-runs the same guard; only succeeds after stats sync):

```bash
curl -X POST https://api.beta.pslone.co.za/fantasy/admin/scoring/gameweeks/<gameweekId>/recalculate \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Per-team recalculate** (no preflight — surgical override for one team):

```bash
curl -X POST https://api.beta.pslone.co.za/fantasy/admin/scoring/teams/<teamId>/gameweeks/<gameweekId>/recalculate \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

> **Note:** The per-team endpoint bypasses the preflight guard. Use it only after
> verifying that the target fixture's stats are synced. Calling it before sync will
> again write zero-point rows for that team.

---

## UI Behaviour Before and After Settlement

| State | `GET /fantasy/gameweeks/:id/score` | Fan UI renders |
|-------|------------------------------------|----------------|
| Pre-settlement (UPCOMING gameweek, no score row) | HTTP 404 | `gameweekPoints: 0` (`.catch()` path) |
| Post-settlement (score row exists) | HTTP 200 with real `netPoints` | Actual points (`.then()` path) |

The zero shown before settlement is correct — it comes from the `.catch()` branch
in the experience app and is not stored anywhere. Once settlement runs, the `.then()`
path fires with real points.

---

## Operator Checklist

```
[ ] 1. All target fixtures have status FINISHED in the database
[ ] 2. sync:world-cup-scorers ran successfully (check top-performers endpoint returns ≥10 rows)
[ ] 3. FantasyPlayerMatchStat rows exist for every FINISHED fixture
       — FDO free tier: requires manual admin entry or paid tier upgrade
       — Paid FDO tier: run sync:world-cup-player-stats --confirm=SYNC_PROVIDER_PLAYER_STATS
[ ] 4. POST /fantasy/admin/scoring/gameweeks/:id/settle returns 200 with teamsSettled > 0
[ ] 5. Fan UI shows real points (not 0) on the fantasy team page
[ ] 6. Optional: PATCH gameweek status to COMPLETED
```

---

## Data Gaps (beta, FDO free tier)

| Gap | Impact | Resolution |
|---|---|---|
| `/v4/matches/{id}` returns no lineups/events | `FantasyPlayerMatchStat` rows cannot be written by the per-match sync; fantasy settlement preflight will block | Upgrade FDO tier OR enter stats manually |
| 48/100 top scorers have no seed player match | Those players' goals/assists are absent from the leaderboard | Update seed data player names to match FDO spelling variants |
| `minutesPlayed` is approximate (playedMatches × 85) | Slightly inaccurate for players who were substituted | Acceptable for beta; requires per-match data to fix |
| No per-match breakdown | Fixture detail view shows all goals in one fixture, not spread correctly | Architectural limitation of aggregate sync; requires per-match data |
