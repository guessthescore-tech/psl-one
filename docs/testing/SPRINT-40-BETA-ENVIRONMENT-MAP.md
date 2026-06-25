# Sprint 40 — Beta Environment Map

Generated: 2026-06-25

## Primary Beta Environment (Real Data)

| Property | Value |
|----------|-------|
| **URL** | http://16.28.84.11 |
| **Type** | EC2 Direct IP (af-south-1b) |
| **Instance ID** | i-0a5f16539c9626f90 |
| **Data mode** | WC_BETA (after deploy run 28147944237 completes) |
| **Data source** | Live PostgreSQL DB (psl_beta) |
| **WC Fixtures** | 104 (50 FINISHED / 54 SCHEDULED) |
| **PSL Status** | INACTIVE |
| **Port 80** | Open to 0.0.0.0/0 (sgr-076c905eb942f0213) |

## API Surface

| Endpoint | URL | Auth |
|----------|-----|------|
| Health | http://16.28.84.11/api/health | Public |
| WC Fixtures | http://16.28.84.11/api/football/fixtures?seasonSlug=fifa-world-cup-2026 | Public |
| Open Predictions | http://16.28.84.11/api/predictions/open | Public |
| Leaderboards | http://16.28.84.11/api/leaderboards | Public |
| PSL Fixture Readiness | http://16.28.84.11/api/admin/data-provider/psl-fixture-readiness | PSL_ADMIN |
| Fantasy Player Pool | http://16.28.84.11/api/admin/fantasy/player-pool | PSL_ADMIN |
| Admin Season | http://16.28.84.11/api/admin/seasons | PSL_ADMIN |
| Auth Login | http://16.28.84.11/api/auth/login | Public (POST) |
| Auth Register | http://16.28.84.11/api/auth/register | Public (POST) |

## Frontend Routes

| Section | Route | Auth | Notes |
|---------|-------|------|-------|
| Home | / | Public | Hero + fixtures + feature hub |
| Fixtures | /fixtures | Public | 104 WC fixtures or fallback |
| Match Centre | /match-centre | Public | Today's fixtures |
| World Cup Hub | /world-cup | Public | 6 featured fixtures |
| World Cup Live | /world-cup/live | Public | Status-filtered fixtures |
| Guess the Score | /guess-the-score | Public/Auth | Browse open; submit requires auth |
| Fantasy | /fantasy | Auth | Points-only |
| Fantasy Setup | /fantasy/setup | Auth | Team creation |
| Leaderboards | /leaderboards | Public | Season scope |
| News | /news | Public | WC 2026 editorial |
| Videos | /videos | Public | ScoreBat widget or fallback |
| Profile | /profile | Auth | Fan profile |
| Admin Dashboard | /admin | PSL_ADMIN | Command centre |
| Admin Players | /admin/fantasy/player-pool | PSL_ADMIN | 1200 players |
| Admin Fixtures | /admin/fixtures | PSL_ADMIN | Fixture management |
| Admin Data Provider | /admin/data-provider | PSL_ADMIN | Provider readiness |
| Club Portal | /club | CLUB_ADMIN | Club management |
| Sponsor Portal | /sponsor | SPONSOR | Campaign management |

## Secondary Environment (Demo Fallback — Vercel)

| Property | Value |
|----------|-------|
| **URL** | https://psl-one-experience-preview-ecg21ogxi-guess-the-score.vercel.app |
| **Type** | Vercel preview (Next.js) |
| **SHA** | 0831844a |
| **Data mode** | WC_BETA |
| **Data source** | WC_FALLBACK_FIXTURES (client-side static) |
| **WC Fixtures** | 8 (5 FINISHED, 3 SCHEDULED including SA vs KOR) |
| **API connection** | NONE — EC2 API not reachable from Vercel edge |
| **Use case** | Link sharing, UI review, non-auth flows only |

## Hostname-Based Access (requires /etc/hosts)

Add to `/etc/hosts` on tester machine:
```
16.28.84.11  staging.pslone.co.za  api.staging.pslone.co.za
```

Then access:
- http://staging.pslone.co.za — web frontend
- http://api.staging.pslone.co.za — API directly
- http://api.staging.pslone.co.za/health — health check

## EC2 Container Inventory

| Container | Image | Port | Network |
|-----------|-------|------|---------|
| psl-one-beta-postgres-1 | postgres:16-alpine | 5432 (internal) | internal |
| psl-one-beta-api-1 | api:current | 4000 (internal) | internal |
| psl-one-beta-web-1 | web:current | 3001 (internal) | internal |
| psl-one-beta-caddy-1 | caddy:2.9.1-alpine | 80, 443 (public) | internal |

## Data State Summary

| Entity | Count | Notes |
|--------|-------|-------|
| WC Fixtures | 104 | 50 FINISHED, 54 SCHEDULED |
| WC Players | 1,200 | Seeded Sprint 38B |
| Clubs | 16 PSL + 32 WC teams | |
| Seasons | 2 | PSL 2025/26 (INACTIVE), WC 2026 (ACTIVE) |
| Open GTS Markets | TBD | Verify via /api/predictions/open |
| PSL Status | INACTIVE | NOT activated |

## Caddy Routing Rules

```
http://16.28.84.11/api/* → api:4000 (strips /api prefix)
http://16.28.84.11/ → web:3001
http://api.staging.pslone.co.za → api:4000
http://staging.pslone.co.za → web:3001
```
