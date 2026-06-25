# Sprint 40 — Final Live Beta Link Pack

Generated: 2026-06-25 | SHA: b0d15b5

---

## PRIMARY LIVE BETA

```
http://16.28.84.11
```

- Real EC2 instance (af-south-1b, i-0a5f16539c9626f90)
- Real PostgreSQL database (104 WC fixtures)
- All routes from apps/experience (complete WC beta frontend)
- NEXT_PUBLIC_DATA_MODE=WC_BETA (baked at build time in image b0d15b5)
- Port 80 open to 0.0.0.0/0

**This is the only correct shareable beta URL.**

---

## VERCEL PREVIEW (SECONDARY — DEMO DATA ONLY)

```
https://psl-one-experience-preview-ecg21ogxi-guess-the-score.vercel.app
```

- WC_BETA mode, but uses WC_FALLBACK_FIXTURES (8 static fixtures)
- NOT connected to the live EC2 API
- Use for UI/design review only
- Do not share with functional testers as the "live beta"

---

## Fan Pages

| Page | URL | Data source |
|------|-----|-------------|
| Home | http://16.28.84.11/ | EC2 API |
| Fixtures | http://16.28.84.11/fixtures | EC2 API |
| Match Centre | http://16.28.84.11/match-centre | EC2 API |
| World Cup Hub | http://16.28.84.11/world-cup | EC2 API |
| World Cup Live | http://16.28.84.11/world-cup/live | EC2 API |
| Guess the Score | http://16.28.84.11/guess-the-score | EC2 API |
| Fantasy | http://16.28.84.11/fantasy | EC2 API (auth required) |
| Leaderboards | http://16.28.84.11/leaderboards | EC2 API |
| News | http://16.28.84.11/news | Static editorial |
| Videos | http://16.28.84.11/videos | ScoreBat / fallback |
| Shop | http://16.28.84.11/shop | Catalogue only |
| Trust | http://16.28.84.11/trust | Static |

## Admin Pages (PSL_ADMIN JWT required)

| Page | URL |
|------|-----|
| Admin Dashboard | http://16.28.84.11/admin |
| Fixture Management | http://16.28.84.11/admin/fixtures |
| Player Pool | http://16.28.84.11/admin/fantasy/player-pool |
| Data Provider | http://16.28.84.11/admin/data-provider |
| Season Management | http://16.28.84.11/admin/seasons |
| PSL Readiness | http://16.28.84.11/admin/data-provider/psl-fixture-readiness (API) |

## Portal Pages (Role-gated)

| Portal | URL | Role required |
|--------|-----|---------------|
| Club Portal | http://16.28.84.11/club | CLUB_ADMIN |
| Sponsor Portal | http://16.28.84.11/sponsor | SPONSOR |

## API Endpoints

| Endpoint | URL | Auth |
|----------|-----|------|
| Health | http://16.28.84.11/api/health | Public |
| WC Fixtures | http://16.28.84.11/api/football/fixtures?seasonSlug=fifa-world-cup-2026 | Public |
| Active Season | http://16.28.84.11/api/football/seasons/active | Public |
| Open Predictions | http://16.28.84.11/api/predictions/fixtures | Auth |
| Fantasy Player Pool | http://16.28.84.11/api/fantasy/player-pool | Public |
| Fantasy Leaderboard | http://16.28.84.11/api/fantasy/leaderboard | Public |
| Auth Login | http://16.28.84.11/api/auth/login | POST (public) |

---

## Authentication

To get a JWT:
```
POST http://16.28.84.11/api/auth/login
Content-Type: application/json
{"email":"<email>","password":"<password>"}
```

Returns `accessToken`. Use as: `Authorization: Bearer <token>`

No passwords or tokens in this document.

---

## Known State (2026-06-25)

| Item | Status |
|------|--------|
| WC fixtures in DB | 104 (50 FINISHED, 54 SCHEDULED — seed data from 2026-06-24) |
| Data provider | NoOp — no live ingestion |
| Fixture data freshness | Seeded state; manual refresh required for live scores |
| PSL season | INACTIVE — not activated |
| EC2 SHA | b0d15b5 (deployed by run 28151006384) |
| NEXT_PUBLIC_DATA_MODE | WC_BETA |

## Known Auth Requirements

| Feature | Auth needed |
|---------|-------------|
| View fixtures | None |
| View leaderboards | None |
| Submit GTS prediction | FAN JWT |
| Build fantasy team | FAN JWT |
| View my predictions | FAN JWT |
| Admin routes | PSL_ADMIN JWT |
| Club routes | CLUB_ADMIN JWT |
| Sponsor routes | SPONSOR JWT |

## If Fixture Data Is Stale

Manual refresh (requires PSL_ADMIN JWT, available via SSM):
```bash
curl -s -X POST \
  -H "Authorization: Bearer <runtime-only-token>" \
  "http://16.28.84.11/api/admin/data-provider/world-cup/fixtures/refresh-status"
```

Rules: World Cup only. No PSL writes. No scheduled ingestion.

---

## What Users Can Test Now

- Browse WC 2026 fixtures and results
- View match centre with upcoming WC matches
- Register a new fan account and log in
- Submit Guess the Score predictions on open WC markets (if markets are seeded)
- Browse fantasy player pool (1,200 players)
- View fantasy leaderboard
- Admin: test provider readiness, player pool, fixture management (requires PSL_ADMIN token)
- Club portal (requires CLUB_ADMIN token)
- Sponsor portal (requires SPONSOR token)

## What Requires Owner Action Before Full Testing

1. Get PSL_ADMIN JWT from EC2 via SSM (`docker exec` → `/api/auth/login`)
2. Run manual WC fixture refresh if data is stale
3. Verify open GTS markets exist for upcoming fixtures
4. Optional: add `INTERNAL_API_URL=http://16.28.84.11/api` to Vercel env dashboard to connect Vercel to real data
