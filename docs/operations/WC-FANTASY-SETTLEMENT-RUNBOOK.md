# WC Fantasy Gameweek Settlement — Operator Runbook

**Audience:** PSL_ADMIN operators  
**Status:** Current  
**Last verified:** 2026-06-30

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

### Step 1 — Sync player stats for all FINISHED fixtures

```bash
pnpm --filter @psl-one/api \
  sync:world-cup-player-stats -- --confirm=SYNC_PROVIDER_PLAYER_STATS
```

This writes `FantasyPlayerMatchStat` rows (and `PlayerMatchStats`) for every
FINISHED fixture that has a `providerFixtureId` set. It is idempotent: running it
twice is safe.

**Verify:** Check that every FINISHED fixture in the target gameweek now has
`FantasyPlayerMatchStat` rows. The settle endpoint will tell you exactly which
fixture IDs are still missing if it is called before this step is complete.

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

Run Step 1 again, then re-attempt Step 3.

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
[ ] 2. sync:world-cup-player-stats ran successfully (check for FantasyPlayerMatchStat rows)
[ ] 3. Every FINISHED fixture ID is covered (verify by calling settle — if 400, sync again)
[ ] 4. POST /fantasy/admin/scoring/gameweeks/:id/settle returns 200 with teamsSettled > 0
[ ] 5. Fan UI shows real points (not 0) on the fantasy team page
[ ] 6. Optional: PATCH gameweek status to COMPLETED
```
