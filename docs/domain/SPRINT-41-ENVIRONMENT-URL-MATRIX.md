# Sprint 41 — Environment URL Matrix

| Environment | Web URL | API URL | DB | TLS | Status |
|-------------|---------|---------|-----|-----|--------|
| **Beta (EC2 — real data)** | `http://16.28.84.11` | `http://16.28.84.11/api` | EC2 Postgres | No | LIVE |
| **Beta (named domain)** | `https://beta.pslone.co.za` | `https://api.beta.pslone.co.za` | EC2 Postgres | Yes | DNS PENDING |
| **Vercel preview** | `https://psl-one-experience-preview-ecg21ogxi-guess-the-score.vercel.app` | None (static fallback) | None | Yes | LIVE (demo only) |
| **Local dev** | `http://localhost:3001` | `http://localhost:4000` | Local Postgres | No | Dev only |
| **Railway (proposed)** | TBD | TBD | Railway Postgres | Yes | NOT DEPLOYED |
| **Production** | `https://www.pslone.co.za` | `https://api.pslone.co.za` | Managed Postgres | Yes | NOT PLANNED |

---

## Beta Environment Capabilities

| Capability | EC2 IP | Named Domain | Vercel Preview |
|------------|--------|--------------|----------------|
| Real DB | YES | YES | NO |
| WC fixtures (104) | YES | YES | NO |
| Fan registration | YES | YES | NO |
| Fantasy team | YES | YES | NO |
| Admin portal | YES | YES | NO |
| Club portal | YES | YES | NO |
| Sponsor portal | YES | YES | NO |
| HTTPS | NO | YES | YES |
| Shareable URL | Difficult | YES | YES (demo only) |
| Email verify links work | NO (no HTTPS) | YES | NO |

---

## API Route Prefixes

All environments follow the same API structure. Caddy strips the `/api` prefix before forwarding to the API container.

| Route | Example |
|-------|---------|
| Health | `GET /api/health` |
| Auth | `POST /api/auth/login`, `POST /api/auth/register` |
| Email verify | `POST /api/auth/email/verify/request`, `POST /api/auth/email/verify` |
| WC Fixtures | `GET /api/football/fixtures?seasonSlug=fifa-world-cup-2026` |
| Predictions | `GET /api/predictions/fixtures` |
| Fantasy | `GET /api/fantasy/player-pool` |
| Admin | `GET /api/admin/...` (PSL_ADMIN JWT required) |
| Club Portal | `GET /api/club-portal/...` (CLUB_ADMIN JWT required) |
| Sponsor Portal | `GET /api/sponsor-portal/...` (SPONSOR JWT required) |

---

## Frontend Route Map

| Route | Description | Auth |
|-------|-------------|------|
| `/` | Home / hero | Public |
| `/fixtures` | WC fixture list | Public |
| `/match-centre` | Match detail hub | Public |
| `/world-cup` | WC tournament hub | Public |
| `/world-cup/live` | Live WC tracker | Public |
| `/guess-the-score` | GTS hub | Public |
| `/predict` | Prediction flow | FAN JWT preferred |
| `/fantasy` | Fantasy hub | Public |
| `/fantasy/team` | My fantasy team | FAN JWT |
| `/leaderboards` | Points leaderboards | Public |
| `/news` | News centre | Public |
| `/videos` | Video centre | Public |
| `/shop` | Catalogue shop | Public |
| `/trust` | Trust & security | Public |
| `/sign-up` | Fan registration | Public (unauthenticated) |
| `/verify-email` | Email verification | Token in URL |
| `/account` | Fan account | FAN JWT |
| `/account/security` | Security settings | FAN JWT |
| `/admin` | Admin dashboard | PSL_ADMIN JWT |
| `/club` | Club portal | CLUB_ADMIN JWT |
| `/sponsor` | Sponsor portal | SPONSOR JWT |
