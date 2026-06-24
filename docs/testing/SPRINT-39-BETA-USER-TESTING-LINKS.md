# Sprint 39 Beta User Testing Links

**WC_BETA · PSL_INACTIVE · NO_REAL_MONEY**
Date: 2026-06-25 | Branch: feature/sprint-39-beta-testing-trust-security

---

## Environment URLs

| Environment | URL | Status |
|-------------|-----|--------|
| Experience (Vercel, main) | https://psl-one-experience-preview-cxb5urftw-guess-the-score.vercel.app | LIVE (auto-deploy from main) |
| Experience (Vercel, preview) | Assigned on PR merge | PENDING_MERGE |
| API (EC2 beta) | http://16.28.84.11 (via Caddy on port 80) | LIVE |
| API (EC2 subdomain) | http://api.beta.pslone.co.za | LIVE (DNS-dependent) |
| API health | http://16.28.84.11/health | LIVE |

---

## Fan Routes (Public — No Auth Required)

| Route | Description | Expected Status |
|-------|-------------|-----------------|
| / | Homepage | 200 |
| /world-cup | WC 2026 Hub | 200 |
| /world-cup/live | Live scores (public API) | 200 |
| /fixtures | WC fixtures list | 200 |
| /match-centre | Match centre (live scores) | 200 |
| /news | WC News Centre | 200 |
| /videos | Highlights & ScoreBat widget | 200 |
| /guess-the-score | Prediction markets | 200 |
| /fantasy | Fantasy hub | 200 |
| /leaderboards | Fan leaderboards | 200 |
| /trust | Trust & Security Centre | 200 |
| /sign-in | Login | 200 |
| /register | Registration | 200 |
| /about | About | 200 |

---

## Portal Routes (Auth Required)

| Route | Role Required | Description |
|-------|--------------|-------------|
| /admin | PSL_ADMIN | Admin Command Centre |
| /admin/data-provider | PSL_ADMIN | Data provider management |
| /admin/data-provider/world-cup/fixture-status | PSL_ADMIN | WC fixture status |
| /club | CLUB_OFFICIAL | Club portal |
| /sponsor | SPONSOR | Sponsor portal |

---

## Key API Endpoints for Smoke Testing

| Endpoint | Auth | Description |
|----------|------|-------------|
| GET /health | None | API health check |
| GET /football/fixtures?seasonSlug=fifa-world-cup-2026 | None | WC fixtures (public) |
| GET /football/world-cup/scorebat-widget | None | Widget config (public) |
| GET /admin/data-provider/world-cup/fixture-status | PSL_ADMIN | WC fixture DB status |
| GET /admin/data-provider/psl-fixture-readiness | PSL_ADMIN | PSL readiness |
| GET /admin/data-provider/world-cup/gts-status | PSL_ADMIN | GTS market status |
| GET /admin/data-provider/world-cup/media-status | PSL_ADMIN | ScoreBat widget status |
| POST /admin/data-provider/world-cup/fixtures/refresh-status | PSL_ADMIN | Refresh fixture statuses |

---

## Known Beta Blockers

| Blocker | Impact | Notes |
|---------|--------|-------|
| PSL INACTIVE | PSL routes show empty state | Expected; WC is active beta season |
| SOURCE_EMPTY (PSL) | PSL fixture import finds no data | PSL season ~July/August |
| PARSE_PSL_KEY_MISSING | PSL Parse.bot scraper disabled | Owner must configure key |
| SCOREBAT_WIDGET_TOKEN not set | Videos page shows placeholder | Set in EC2 .env to enable widget |
| No refresh token | Users must re-login after 1h | JWT 1h TTL; refresh token is future work |

---

## Login for Testing

Admin token: Contact owner for temporary PSL_ADMIN JWT
Fan account: Register at /register (no email verification required in beta)
