# Sprint 41 — Beta Link Pack

Generated: 2026-06-25 | Sprint: 41

---

## Primary Beta URL

```
http://16.28.84.11
```

Real EC2 instance — real DB — all 13 fan routes return 200 — 17/17 smoke PASS.

---

## Target Beta URL (pending DNS)

```
https://beta.pslone.co.za
https://api.beta.pslone.co.za
```

DNS A record pointing `beta.pslone.co.za → 16.28.84.11` is the only blocker.
See `docs/domain/SPRINT-41-DNS-CHECKLIST.md` for owner action steps.

---

## API URL

```
http://16.28.84.11/api
```

After DNS:
```
https://api.beta.pslone.co.za
```

---

## Vercel Preview (Secondary — Demo Data Only)

```
https://psl-one-experience-preview-ecg21ogxi-guess-the-score.vercel.app
```

Uses static WC fallback data. Not connected to EC2 API. Use for UI review only.

---

## Fan Routes

| Route | URL | Data |
|-------|-----|------|
| Home | http://16.28.84.11/ | EC2 API |
| Fixtures | http://16.28.84.11/fixtures | EC2 API |
| Match Centre | http://16.28.84.11/match-centre | EC2 API |
| World Cup Hub | http://16.28.84.11/world-cup | EC2 API |
| World Cup Live | http://16.28.84.11/world-cup/live | EC2 API |
| Guess the Score | http://16.28.84.11/guess-the-score | EC2 API |
| Predict | http://16.28.84.11/predict | EC2 API |
| Fantasy | http://16.28.84.11/fantasy | EC2 API |
| Leaderboards | http://16.28.84.11/leaderboards | EC2 API |
| News | http://16.28.84.11/news | Editorial |
| Videos | http://16.28.84.11/videos | ScoreBat |
| Shop | http://16.28.84.11/shop | Catalogue |
| Trust | http://16.28.84.11/trust | Static |
| **Sign Up (NEW)** | http://16.28.84.11/sign-up | EC2 API |
| **Verify Email (NEW)** | http://16.28.84.11/verify-email?token=... | EC2 API |

---

## Admin Routes (PSL_ADMIN JWT required)

| Route | URL |
|-------|-----|
| Admin Dashboard | http://16.28.84.11/admin |
| Fixture Management | http://16.28.84.11/admin/fixtures |
| Player Pool | http://16.28.84.11/admin/fantasy/player-pool |
| Data Provider | http://16.28.84.11/admin/data-provider |
| Season Management | http://16.28.84.11/admin/seasons |

---

## API Endpoints (Sprint 41 additions)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | Public | Register; triggers verification email |
| `/api/auth/email/verify/request` | POST | FAN JWT | Resend verification email |
| `/api/auth/email/verify` | POST | Public | Confirm token, set emailVerified=true |
| `/api/auth/me` | GET | FAN JWT | Now includes `isVerified` field |
| `/api/auth/login` | POST | Public | Now returns `emailVerified` in user object |

---

## Sprint 41 Status Summary

| Feature | Status |
|---------|--------|
| Domain routing plan | DONE — docs/domain/ |
| DNS checklist | DONE — owner action required |
| Railway assessment | DONE — CONDITIONAL_GO for preview/CI only |
| Email verification backend | IMPLEMENTED |
| Email verification frontend (/sign-up, /verify-email) | IMPLEMENTED |
| Design system components | IMPLEMENTED |
| Brand & UI design docs | DONE |
| Graphic asset pipeline | DONE |
| Player card system | DONE |
| Club crest guidelines | DONE |
| Banner rotation guidelines | DONE |
| Graphic design agent brief | DONE |
| Image generation prompt library | DONE |

---

## Known Gaps

| Gap | Severity | Owner action |
|-----|----------|-------------|
| DNS not configured | HIGH | Add A records: beta.pslone.co.za → 16.28.84.11 |
| Port 443 not open on EC2 | HIGH | Security group: add HTTPS inbound |
| Caddy not configured for named domain | HIGH | Update Caddyfile, restart Caddy |
| Email provider = NullEmailProvider | MEDIUM | Wire SES or Resend before fan invites |
| WC fixture refresh stale | MEDIUM | SSM admin JWT → POST refresh endpoint |
| Club crests unlicensed | LOW | Beta placeholders in use (correct) |
| Vercel not connected to EC2 API | LOW | Add INTERNAL_API_URL to Vercel env |

---

## What Testers Can Do Now

- Browse all WC 2026 fixtures and results
- Sign up for a new account (`/sign-up`)
- Log in and view account (`/account`)
- Submit GTS predictions on open markets
- Browse fantasy player pool
- View leaderboards
- Club portal (CLUB_ADMIN token required)
- Sponsor portal (SPONSOR token required)
- Admin dashboard (PSL_ADMIN token required)

---

## Test User Credentials

See `docs/testing/SPRINT-40-BETA-TEST-USERS.md` for the full matrix.

Quick reference:
- FAN: guessthescore2@gmail.com
- PSL_ADMIN: guessthescore2+admin@gmail.com
- CLUB_ADMIN: guessthescore2+club@gmail.com
- SPONSOR: guessthescore2+sponsor@gmail.com
