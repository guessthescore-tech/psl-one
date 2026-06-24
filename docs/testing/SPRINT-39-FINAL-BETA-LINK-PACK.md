# Sprint 39 Final Beta Link Pack

**WC_BETA · PSL_INACTIVE · NO_REAL_MONEY · CONDITIONAL_GO**
Date: 2026-06-25

---

## Primary URLs

| Label | URL |
|-------|-----|
| Fan Beta (Vercel) | https://psl-one-experience-preview-cxb5urftw-guess-the-score.vercel.app |
| API Health | http://16.28.84.11/health |
| API Base | http://16.28.84.11 |

---

## Fan Portal URLs

| URL | Description |
|-----|-------------|
| /base/ | Homepage |
| /base/world-cup | World Cup 2026 Hub |
| /base/world-cup/live | Live scores & highlights |
| /base/fixtures | All WC fixtures |
| /base/match-centre | Live match centre |
| /base/news | WC News Centre |
| /base/videos | Highlights & ScoreBat widget |
| /base/guess-the-score | Prediction markets |
| /base/fantasy | Fantasy hub |
| /base/leaderboards | Leaderboards |
| /base/players | Player stats |
| /base/trust | Trust & Security Centre (NEW Sprint 39) |

Note: Replace `/base/` with the actual Vercel preview URL above.

---

## Admin Portal URL

`/admin` — requires PSL_ADMIN JWT. Contact owner for token.

---

## Club Portal URL

`/club` — requires CLUB_OFFICIAL JWT for a registered club.

---

## Sponsor Portal URL

`/sponsor` — requires SPONSOR JWT for a registered sponsor.

---

## Login Instructions

1. Navigate to `/sign-in`
2. Register at `/register` (no email verification in beta)
3. Use email/password from registration
4. Token valid for 1 hour

**Admin access:** Owner must issue a PSL_ADMIN JWT via the temporary admin provisioning runbook.

---

## Known Beta Blockers

1. **PSL INACTIVE** — All PSL-specific features show empty/disabled state
2. **SOURCE_EMPTY** — PSL fixture import returns no data (season starts ~Jul/Aug 2026)
3. **SCOREBAT_WIDGET_TOKEN** — Must be set on EC2 to enable video widget
4. **No refresh token** — Re-login required after 1 hour
5. **No email in beta** — Password reset emails go to console log only

---

## What Works in Beta

- World Cup 2026 full fixture list (104 matches, 50 FINISHED / 54 SCHEDULED)
- 54 OPEN GTS prediction markets
- 1,200 WC fantasy player prices
- All 8 fan portal pages operational
- Admin dashboard with all 27 routes
- Club + sponsor portals with RBAC isolation
- Trust & Security Centre at /trust
