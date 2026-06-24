# Sprint 30 — Free Data Options for WC2026 Beta

**Status:** RESEARCH_COMPLETE | PSL INACTIVE | BETA ONLY
**Date:** 2026-06-24

## Purpose

Options available for WC2026 data without paid API keys, suitable for beta use.

---

## Option 1: football-data.org Free Tier

**Rate limit:** 10 requests per minute  
**Key:** `FOOTBALL_DATA_API_KEY` env var (never committed, never in frontend)

### Free endpoints available
```
GET /v4/competitions/2000/matches   — WC fixtures (all rounds)
GET /v4/competitions/2000/teams     — WC teams (48 teams)
GET /v4/competitions/2000/standings — Group standings
GET /v4/matches/{id}                — Individual match details
```

Competition ID for WC2026: `2000` (FIFA World Cup).

### Usage pattern for beta ingestion (dry-run)
```bash
# Read the fixture list (dry-run, no writes)
DATA_PROVIDER=football-data-org \
FOOTBALL_DATA_API_KEY=<key-from-owner> \
node tools/staging/sprint-30-world-cup-import-dry-run.mjs
```

### Rate limit strategy
- 10 req/min × 3 min = 30 requests max per session
- WC fixture list fits in 1–2 requests
- Add 6s delay between requests to stay safe
- Use cached responses where possible

### What is NOT free
- Player statistics per match
- Squad rosters (limited depth)
- Live commentary
- Historical head-to-head

---

## Option 2: Manual CSV/JSON Workflow

### When to use
- Squad data (48 teams × 23+ players)
- Any data not covered by free-tier API
- Quick calibration for fantasy player pool

### CSV format for squad import
```csv
externalId,playerName,position,teamSlug,shirtNumber,nationality
WC2026-BRA-001,Alisson Becker,GOALKEEPER,brazil,1,Brazil
WC2026-BRA-002,Danilo,DEFENDER,brazil,2,Brazil
...
```

### Upload workflow
1. Prepare CSV as above
2. POST to `/admin/squad-import/batch` (requires PSL_ADMIN JWT)
3. Review import rows at `/admin/squad-import/review`
4. Confirm write at `/admin/squad-import/confirm`
5. Check players at `/admin/players`

### Sources for manual squad data
- National team official websites (publicly available)
- Wikipedia national football team pages
- UEFA / CONMEBOL official team pages
- Cross-verify against FIFA public pages

### Provenance marking
All manually-entered records should set `provenance: MANUAL_CSV` in the SquadImportBatch so admin can filter provisional vs confirmed data.

---

## Option 3: Mock/Seed Data for UI Testing

### When to use
- Testing the fantasy team builder UI
- Testing Guess the Score prediction cards
- Testing leaderboard display
- Testing admin dashboards

### How to use
- Use existing seed data (WC2026 already seeded in beta EC2 DB)
- Add additional player seeds via `prisma/seed.ts` (dev only)
- Never seed production DB with fake data

### Current seed state (beta EC2)
- Competition: FIFA World Cup 2026 (ACTIVE)
- Teams: 65 WC teams seeded (confirmed from Sprint 29 smoke)
- Players: provisional WC players from SquadImportModule
- Fixtures: sourced from football-data.org validation run

---

## Recommendation by Data Type

| Data | Best Free Source | Quality | Notes |
|------|-----------------|---------|-------|
| Fixtures | football-data.org free tier | HIGH | 104 matches confirmed |
| Teams | football-data.org free tier | HIGH | 48 teams |
| Groups/Standings | football-data.org free tier | HIGH | Calculated |
| Squads | Manual CSV | MEDIUM | Labour-intensive |
| Player stats | Not available free | N/A | Needs paid plan |
| Live match | Not available free | N/A | Needs paid plan |

---

*PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | BETA ONLY*
