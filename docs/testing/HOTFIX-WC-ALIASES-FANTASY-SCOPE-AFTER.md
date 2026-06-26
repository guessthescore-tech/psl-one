# Hotfix: WC Aliases & Fantasy Season Scope — After Evidence

**Date:** 2026-06-26  
**SHA:** 2525aa2 (PR #50 merged)  
**Deploy run:** 28236930902 — SUCCESS (5/5 jobs)

---

## Fixture State After

| Metric | BEFORE | AFTER | Delta |
|---|---|---|---|
| `providerBacked` | 72 | **85** | +13 |
| `providerFixtureId` | 72 | **85** | +13 |
| `synced (lastSyncedAt)` | 72 | **85** | +13 |
| `finishedCount` | 59 | **60** | +1 |
| `finishedWithScores` | 50 | **60** | +10 |
| `finishedMissingScores` | **9** | **0** | -9 ✓ |
| `lastSyncedAt` latest | 2026-06-26T11:16Z | **2026-06-26T12:13Z** | updated |

**refresh-status result:** `updated: 104, skipped: 0, errors: []`

---

## Previously Missing Scores — Now Confirmed Live

| Match | Score | providerFixtureId |
|---|---|---|
| Canada vs Bosnia and Herzegovina | **1–1** | 537333 ✓ |
| Australia vs Türkiye | **2–0** | 537346 ✓ |
| Spain vs Cape Verde | **0–0** | 537369 ✓ |
| Portugal vs DR Congo | (resolved via alias) | linked ✓ |

---

## Fantasy State After

| Metric | BEFORE | AFTER | Delta |
|---|---|---|---|
| `playerPoolCount` | 1296 | **1200** | -96 ✓ |
| `pslPlaceholders` | 96 | **0** | -96 ✓ |
| `playerPoolBySrc` | `{fifa-wc2026: 1200, PSL_PLACEHOLDER: 96}` | `{fifa-wc2026: 1200}` | clean ✓ |
| `pricesUnfilteredCount` | 1296 | **1200** | -96 ✓ |

---

## Team Alias Resolution Confirmed

These football-data.org names now resolve via `TEAM_ALIASES`:

| Provider Name | DB Canonical | Resolved |
|---|---|---|
| Bosnia-Herzegovina | Bosnia and Herzegovina | ✓ |
| Turkey | Türkiye | ✓ |
| Turkiye | Türkiye | ✓ |
| Cape Verde Islands | Cape Verde | ✓ |
| Cabo Verde | Cape Verde | ✓ |
| Congo DR | DR Congo | ✓ |
| Democratic Republic of Congo | DR Congo | ✓ |
| Korea Republic | South Korea | ✓ |
| Ivory Coast | Côte d'Ivoire | ✓ |
| Cote d'Ivoire | Côte d'Ivoire | ✓ |

---

## Remaining `PARTIAL_PROVIDER_SYNC` Explanation

`dataState: PARTIAL_PROVIDER_SYNC` (not yet `PROVIDER_SYNCED`):
- 85 provider-backed of 105 total = 19 fixtures not yet linked
- All 19 are knockout-stage fixtures where football-data.org returns `homeTeamName: "TBD"` (teams not yet qualified)
- These will automatically resolve when knockout matches are played (July 2026) and provider returns actual team names
- `finishedMissingScoresCount: 0` — all played matches have scores

---

## Smoke Checks

| Check | Result |
|---|---|
| `GET /health` | `ok` ✓ |
| Bosnia and Herzegovina fixture with score | `1–1` ✓ |
| Türkiye fixture with score | `2–0` ✓ |
| Cape Verde fixture with score | `0–0` ✓ |
| `GET /fantasy/player-pool` total | `1200` ✓ |
| `GET /fantasy/player-pool` PSL placeholders | `0` ✓ |
| `GET /fantasy/player-prices` (unfiltered) | `1200` ✓ |
| PSL fixtures (must be 0) | `0` ✓ |

---

## Safety Confirmation

| Guard | Status |
|---|---|
| PSL season activated | NO |
| PSL fixtures imported | NO |
| PSL fixtures published | NO |
| Real money enabled | NO |
| Provider key exposed to frontend | NO |
| Fantasy points-only | YES |
| World Cup 2026 beta context | YES |
