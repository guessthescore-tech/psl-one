# Hotfix: WC Aliases & Fantasy Season Scope — Before State

**Date:** 2026-06-26  
**Branch:** hotfix/world-cup-aliases-fantasy-season-scope  
**Base SHA:** bf6621e (PR #49 merged)

---

## Fixture State Before

| Metric | Value |
|---|---|
| `fixtureCount` | 104 |
| `providerBacked` | 72 |
| `providerFixtureId` | 72 |
| `synced` | 72 |
| `finishedCount` | 59 |
| `finishedWithScores` | 50 |
| `finishedMissingScores` | **9** |

### 9 FINISHED Fixtures With Missing Scores (all `providerFixtureId: null`)

| Home | Away | Root Cause |
|---|---|---|
| Canada | Bosnia and Herzegovina | football-data.org sends "Bosnia-Herzegovina", DB has "Bosnia and Herzegovina" |
| Australia | Türkiye | football-data.org sends "Turkey", DB has "Türkiye" |
| Spain | Cape Verde | football-data.org sends "Cape Verde Islands", DB has "Cape Verde" |
| Portugal | DR Congo | football-data.org sends "Congo DR" or similar, DB has "DR Congo" |
| Switzerland | Bosnia and Herzegovina | same as above |
| Türkiye | Paraguay | same Türkiye alias issue |
| Uruguay | Cape Verde | same Cape Verde alias issue |
| Colombia | DR Congo | same DR Congo alias issue |
| Bosnia and Herzegovina | Qatar | same Bosnia alias issue |

---

## Fantasy State Before

| Metric | Value |
|---|---|
| `playerPoolCount` | **1296** |
| `wcPlayers` (source: fifa-wc2026) | 1200 |
| `pslPlaceholders` (source: PSL_PLACEHOLDER) | **96** |
| `pricesUnfilteredCount` | **1296** |

### PSL Placeholder Sample

```json
{
  "name": "AmaZulu GK",
  "source": "PSL_PLACEHOLDER",
  "team": { "name": "AmaZulu FC" }
}
```

PSL placeholders appear in the WC fantasy pool because:
1. `getPlayerPool` called `getActiveSeason()` but did not use the result — the Prisma query had no season filter
2. `getPlayerPrices` accepted `seasonId?: string` from the controller but Prisma received `undefined`, which means no WHERE clause on seasonId → all 1296 prices returned

---

## Root Causes Fixed in This Hotfix

| # | Root Cause | Fix |
|---|---|---|
| 1 | `resolveTeam` only tries exact + contains — misses "Bosnia-Herzegovina" → "Bosnia and Herzegovina" | Added static `TEAM_ALIASES` map with 10 alias pairs; 3-step lookup: exact → alias → contains |
| 2 | `getPlayerPool` didn't scope to active season | Added `prices: { some: { seasonId: season.id } }` to Prisma WHERE |
| 3 | `getPlayerPrices` passed `undefined` to Prisma when no seasonId → unfiltered result | Made `seasonId` optional; falls back to `resolveActiveSeasonId()` |
