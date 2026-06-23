# Sprint 26 — Club Portal UAT

**Date:** 2026-06-23
**Sprint:** 26 (Controlled User Testing)
**Overall Status:** CONDITIONAL_PASS (pending CLUB_ADMIN staging smoke)

PSL: INACTIVE | Wallet: SANDBOX | No league activation controls | No fixture import controls

---

## Important Notes

- **CLUB_ADMIN role not yet provisioned on staging (PENDING_TOKEN).** All results below are
  based on local/preview visual review. Staging RBAC smoke requires CLUB_ADMIN JWT (GAP-26-03).
- Club portal API contracts are frontend-only — 14 API endpoints are API_PENDING (GAP-26-01).
  Pages render with mock/static data until backend implementation is complete.

---

## Validation Checklist

| Check                                              | Result         | Notes                                      |
|----------------------------------------------------|----------------|--------------------------------------------|
| No league activation controls visible              | PASS           | Club portal has no PSL activate UI         |
| No fixture import controls visible                 | PASS           | Club portal has no fixture import UI       |
| Fan engagement cards present                       | PASS           | Fan/supporter engagement cards shown       |
| Campaign placeholders visible                      | PASS           | Campaign cards shown with placeholder data |
| No admin JWT tokens exposed                        | PASS           | No tokens in frontend source               |
| No provider keys exposed                           | PASS           | API keys are backend-only                  |
| Non-financial language only                        | PASS           | No cash payout or betting language         |
| CLUB_ADMIN staging smoke                           | PENDING_TOKEN  | JWT not yet provisioned (GAP-26-03)        |

---

## Route Matrix

| Route               | Expected Behaviour                                  | Status         | Notes                               |
|---------------------|------------------------------------------------------|----------------|-------------------------------------|
| `/club`             | Root; redirect to overview or show club dashboard    | PASS           | Shell renders                       |
| `/club/overview`    | Club overview with key metrics and quick links       | PASS           | Renders with mock data              |
| `/club/profile`     | Club profile info (name, badge, colours, stadium)    | PASS           | 16 clubs in DB                      |
| `/club/squad`       | Current squad list with player cards                 | PASS           | 96 provisional players seeded       |
| `/club/players`     | Player detail and stats view                         | PASS           | Player data present                 |
| `/club/fixtures`    | Upcoming club fixtures (SOURCE_EMPTY for PSL)        | PASS           | SOURCE_EMPTY expected               |
| `/club/results`     | Recent club results                                  | PASS           | No PSL results yet                  |
| `/club/fans`        | Fan metrics and engagement overview                  | API_PENDING    | Backend not yet implemented         |
| `/club/supporters`  | Supporter segments and loyalty data                  | API_PENDING    | Backend not yet implemented         |
| `/club/content`     | Club media content management                        | API_PENDING    | Backend not yet implemented         |
| `/club/campaigns`   | Campaign performance for this club                   | API_PENDING    | Backend not yet implemented         |
| `/club/sponsors`    | Club sponsor relationships                           | API_PENDING    | Backend not yet implemented         |
| `/club/analytics`   | Club analytics dashboard                             | API_PENDING    | Backend not yet implemented         |
| `/club/settings`    | Club settings and configuration                      | PASS           | Settings UI renders                 |

**Total routes:** 14

---

## Key Safety Verifications

### No League Activation Controls
- Club portal has no PSL season activation UI. Only PSL_ADMIN can activate via `/admin/competitions`.
- No fixture import controls visible in club portal.

### Fan Engagement Cards
- Club overview shows fan engagement metrics cards.
- Cards render with placeholder data pending backend API contract implementation.

### Campaign Placeholders
- Campaign page shows cards for active and upcoming campaigns.
- Campaign data is static/mock until `CampaignModule` endpoints are wired to club portal API.

### Non-Financial Language
- No cash payout language.
- No betting, odds, or wager references.
- Sponsor rewards visible in club context are NON_FINANCIAL only.

---

## Overall Status: CONDITIONAL_PASS

**Conditions for full PASS:**
1. CLUB_ADMIN JWT provisioned on staging (OWNER_GATE — GAP-26-03)
2. Club portal API contracts backed by backend endpoints (Sprint 27 — GAP-26-01)
3. RBAC staging smoke completed for CLUB_ADMIN persona

**No blocker issues found. Club portal is safe for controlled review.**
