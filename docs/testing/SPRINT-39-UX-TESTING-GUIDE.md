# Sprint 39 UX Testing Guide

**WC_BETA · PSL_INACTIVE · NO_REAL_MONEY**
For beta testers only. Not for public distribution.

---

## Getting Started

**Base URL:** https://psl-one-experience-preview-cxb5urftw-guess-the-score.vercel.app

### Creating an Account
1. Navigate to `/register`
2. Enter email, password (min 8 chars, must include uppercase, number, special char)
3. Enter date of birth
4. Accept terms
5. You are now logged in as a FAN

---

## Testing Checklist by Feature

### 1. Homepage (/)
- [ ] Page loads with WC 2026 banner
- [ ] Fixtures section shows upcoming matches
- [ ] Navigation bar visible on desktop
- [ ] Mobile bottom navigation visible on mobile
- [ ] Beta banner shows "PSL INACTIVE"

### 2. World Cup Hub (/world-cup)
- [ ] WC fixture list loads
- [ ] Fixtures show team names, kickoff time in SAST
- [ ] FINISHED matches show scores (e.g. 4-3 Portugal vs Morocco)
- [ ] SCHEDULED matches show countdown/time

### 3. Live Scores (/world-cup/live)
- [ ] Page loads without requiring login (public)
- [ ] Fixtures fetched from /football/fixtures?seasonSlug=fifa-world-cup-2026
- [ ] No admin endpoint calls (auth-free)
- [ ] ScoreBat widget section: shows placeholder if SCOREBAT_WIDGET_TOKEN not set

### 4. Fixtures (/fixtures)
- [ ] All 104 WC fixtures visible (or up to latest count)
- [ ] Grouped by round/group stage
- [ ] Kickoff times shown in SAST timezone
- [ ] Click a fixture to see match detail

### 5. Match Centre (/match-centre)
- [ ] Shows WC fixtures from correct endpoint
- [ ] "Today" section if any fixtures today
- [ ] "Upcoming" section for future matches

### 6. News (/news)
- [ ] WC News Centre page (not redirect to /media)
- [ ] Featured story card prominent
- [ ] Remaining stories in 2-col grid
- [ ] 3 video cards with thumbnail area
- [ ] Quick links to /fixtures, /guess-the-score, /videos

### 7. Videos (/videos)
- [ ] Page loads
- [ ] If SCOREBAT_WIDGET_TOKEN set: iframe widget renders
- [ ] If not set: "Highlights Coming Soon" placeholder
- [ ] "More Videos" section with 3 placeholder cards

### 8. Guess the Score (/guess-the-score)
- [ ] Prediction markets listed
- [ ] Markets are WC 2026 fixtures
- [ ] Can submit prediction (as logged-in FAN)
- [ ] Points-only (no cash/monetary value shown)

### 9. Trust Centre (/trust) — NEW Sprint 39
- [ ] Page loads at /trust
- [ ] SOC2 NOT CERTIFIED warning shown (amber banner)
- [ ] Security controls grid shows 8 cards
- [ ] "IMPLEMENTED" badges in emerald
- [ ] "IN_PROGRESS" badge for SOC2 in amber
- [ ] Data & Privacy section with POPIA commitments
- [ ] Security contact email shown

### 10. Sign In (/sign-in)
- [ ] Email + password form
- [ ] Incorrect credentials show error
- [ ] Correct credentials redirect to home
- [ ] "Register" link visible

---

## Testing the Admin Portal (PSL_ADMIN Role Required)

**Note:** Admin JWT required. Contact owner for temporary token.

1. Obtain PSL_ADMIN JWT from owner
2. Use browser DevTools → Application → Local Storage → set `access_token` to JWT
   OR use the sign-in page if admin credentials are provisioned

### Admin Routes to Test
- [ ] /admin — dashboard with stats
- [ ] /admin/data-provider — provider health status
- [ ] /admin/data-provider/world-cup/fixture-status — WC fixture counts
- [ ] /admin/data-provider/world-cup/gts-status — GTS market counts (Sprint 39)
- [ ] /admin/data-provider/world-cup/media-status — ScoreBat status (Sprint 39)

---

## What NOT to Test

- Do NOT try to activate the PSL season (admin only, requires 13-check preflight)
- Do NOT submit real money or payment details (sandbox only)
- Do NOT share your JWT token publicly
- Do NOT post provider API keys in any feedback

---

## Reporting Issues

Report bugs at: https://github.com/guessthescore-tech/psl-one/issues
Or email: security@pslone.co.za for security issues
