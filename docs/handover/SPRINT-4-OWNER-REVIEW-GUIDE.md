# Sprint 4 — Owner Review Guide

**Date:** 2026-06-20  
**Branch:** `feature/sprint-4-premium-activation`

This guide tells you exactly what to do to review Sprint 4 and decide whether to approve.

---

## Step 1 — Deploy the Preview (15 minutes)

The Vercel configuration is ready. You just need to link and deploy.

```bash
# 1. Install Vercel CLI (skip if already installed)
npm install -g vercel

# 2. Login with your account
vercel login

# 3. Link the experience project
cd ~/Projects/psl-one/apps/experience
vercel link
# When prompted:
# - Create new project: yes
# - Project name: psl-one-experience
# - Root directory: . (current — apps/experience)

# 4. Deploy
vercel
```

**Expected output:** A URL like `https://psl-one-experience-xxxx.vercel.app`

For the full guide: `apps/experience/docs/SPRINT-4-DEPLOY-GUIDE.md`

---

## Step 2 — Run Locally (Alternative, No Vercel Needed)

```bash
cd ~/Projects/psl-one
pnpm --filter @psl-one/experience dev
# Opens on http://localhost:3002
```

This uses `DESIGN_REVIEW_DATA` mode with WC 2026 mock data.

---

## Step 3 — Review the New Features

### Predict / Guess the Score

Go to: `/predict`

What to check:
- [ ] Fixture cards show for WC 2026 matches
- [ ] Score steppers work (+ / − buttons)
- [ ] "Lock in prediction" submits and shows confirmation
- [ ] Post-submission: Share button visible
- [ ] Share sheet opens with WhatsApp, Copy link options
- [ ] "Challenge a fan" link is visible
- [ ] Challenge page `/predict/challenge?fixture=wc-f2` opens
- [ ] Challenge creates a link
- [ ] Accept page `/predict/challenge/accept?fixture=wc-f2&h=2&a=1` opens
- [ ] "Points only - no real money" is clearly visible throughout

### Account / Notifications

Go to: `/account/notifications`

What to check:
- [ ] Toggle switches work on/off
- [ ] Page shows notification preference categories
- [ ] Toggle changes are saved (in design review: immediate confirmation)

### Account Navigation

Go to: `/account`

What to check:
- [ ] "Notifications" is now in the account nav list

---

## Step 4 — Visual Review

Open the screen acceptance matrix:
```
apps/experience/docs/SPRINT-4-SCREEN-ACCEPTANCE-MATRIX.md
```

For each page you visit, note:
- APPROVED: looks good, ship it
- APPROVED_WITH_CORRECTIONS: minor issues, list them
- REQUIRES_REDESIGN: major rework needed

Known asset gaps (not defects — just reality):
- Team crests are colored shapes with initials (real logos needed)
- Player images are design placeholders (real photos needed)
- DStv sponsor section is hardcoded (real sponsor config needed)

---

## Step 5 — Review the Provider Recommendation

Open:
```
docs/data/SPRINT-4-PROVIDER-RECOMMENDATION.md
docs/data/SPRINT-4-PROVIDER-LICENSING-GATE.md
```

Decision needed: Approve starting a Sportmonks trial to verify PSL coverage.

---

## Step 6 — Decide on Missing Backend Contracts

Open:
```
apps/experience/docs/SPRINT-4-MISSING-CONTRACTS.md
```

Two HIGH priority items need Sprint 5 implementation:
1. Password change endpoint (`POST /auth/password/change`)
2. Account deletion request (POPIA compliance)

---

## Step 7 — Approve the PR

When satisfied:
1. Push the branch: `git push origin feature/sprint-4-premium-activation`
2. Create PR: `gh pr create --title "feat(sprint-4): premium experience activation" --base main`
3. Merge when CI is green and visual review passes

---

## What Has NOT Changed

- PSL season: INACTIVE ✓
- World Cup 2026: ACTIVE ✓
- Wallet: Sandbox-only ✓
- AWS beta: Unchanged ✓
- STORY-40: Reserved ✓
- Security gates: Unchanged ✓
