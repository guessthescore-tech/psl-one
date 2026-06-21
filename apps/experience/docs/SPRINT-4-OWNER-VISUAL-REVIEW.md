# Sprint 4 — Owner Visual Review Guide

**For:** PSL One Project Owner  
**Document type:** Owner-facing acceptance guide  
**Agent:** Agent 3 (Visual Acceptance) / Agent 10 (Accessibility/Responsive)  
**Date:** 2026-06-20  
**App:** `apps/experience` — PSL One Premium Fan Experience  

---

## 1. How to access the preview

### Vercel preview URL

Once the branch `feature/sprint-4-premium-activation` is deployed to Vercel, the preview URL will be in the format:

```
https://psl-one-experience-git-feature-sprint-4-premium-activation-pslone.vercel.app
```

The exact URL is posted as a comment on the pull request by the Vercel bot after each successful deploy.

### Environment mode

The preview runs in `DESIGN_REVIEW_DATA` mode by default (set via `NEXT_PUBLIC_DATA_MODE=DESIGN_REVIEW_DATA` in Vercel environment variables). This means:

- **Mock data is active** — all fixtures, players, clubs use WC 2026 showcase data, not live PSL API data.
- A **yellow banner** appears at the top of all data-driven pages labelled `DESIGN_REVIEW_DATA`. This is expected and intentional — it is not a bug.
- To see live data behaviour, the environment variable must be changed to `LIVE_BETA_DATA` and pointed at the beta NestJS API.

### Accessing on mobile

Open the Vercel URL on your phone. The layout switches to a mobile bottom-nav pattern (Home, Matches, Fantasy, Predict, Profile) at breakpoints below `md` (768px). Review all core journeys on mobile as well as desktop.

---

## 2. What to look for

### Visual quality checks

| Area | What to check |
|------|--------------|
| Typography | Headings use the Outfit display scale (display-2xl down to display-sm). Body text is readable at 15–17px. No orphaned words on small screens. |
| Colour system | Dark surfaces use `exp-void` (#060d19) and `exp-navy` (#0d1b2e). Gold accents are `exp-gold` (#e6aa00). Green accents are `exp-green` (#00843d). Live match red is `exp-live` (#ef4444). |
| Spacing & layout | Cards have 14px radius (`rounded-card`). Content max-width is 7xl (1280px) centred. Consistent padding (px-4 mobile, px-6 tablet, px-8 desktop). |
| Motion | Page transitions and card entries use Framer Motion. Animations respect `prefers-reduced-motion` — enable this in your OS settings to verify stills are readable. |
| Dark/light contrast | The app is intentionally dark-first. White editorial sections appear on the homepage and stats pages. Check these feel premium, not washed out. |
| Loading states | Navigate to a data page then reload. A shimmer skeleton should appear briefly before content loads. |
| Error states | Disconnect from WiFi and navigate to a live data page. An error UI with a "Try again" button should appear. |
| Empty states | On fantasy pages before a team is created, an onboarding prompt should appear rather than a blank page. |

### Interaction checks

- All buttons and links have a minimum tap target of 44×44px.
- Focus rings are visible (gold outline) when navigating by keyboard — press Tab through the header and nav.
- The mobile bottom nav highlights the active tab with a gold dot indicator.
- The `DesignReviewBanner` (yellow bar) can be dismissed if applicable but re-appears on page reload in DESIGN_REVIEW_DATA mode.

### Responsive breakpoints to review

| Breakpoint | Width | Notes |
|-----------|-------|-------|
| Mobile S | 375px | iPhone SE baseline |
| Mobile L | 390px | iPhone 15 baseline |
| Tablet | 768px | MobileBottomNav disappears; desktop header nav appears |
| Desktop | 1280px | Full 7xl max-width |
| Wide | 1440px | Should not break; content stays centred |

---

## 3. How to fill in the acceptance matrix

Open `apps/experience/docs/SPRINT-4-SCREEN-ACCEPTANCE-MATRIX.md`.

For each route you review, update the **Classification** column with one of the five statuses below. Add a comment in the **Notes** column describing what you observed.

Use the **defect ID** format `VD-XXX` when referencing an item from `SPRINT-4-VISUAL-DEFECT-LOG.md`.

If you need to flag a new defect not already in the log, add it to the defect log first (incrementing the ID), then reference it in the matrix.

**Target:** At least the Priority 1 routes (homepage, fantasy team, match centre, predict) must reach APPROVED or APPROVED_WITH_CORRECTIONS before the PR can merge.

---

## 4. Classification definitions

| Classification | Meaning |
|---------------|---------|
| `APPROVED` | Page is visually and functionally complete to MVP standard. Ready to merge. |
| `APPROVED_WITH_CORRECTIONS` | Page is functionally complete but has minor visual issues. Corrections noted; can merge with follow-up ticket. |
| `REQUIRES_REDESIGN` | Page has significant visual or UX problems that block the intended user journey. Must be fixed before merge. |
| `BLOCKED_BY_BACKEND` | Frontend design is complete but the page cannot be fully evaluated because a required backend endpoint is not yet built or wired. |
| `BLOCKED_BY_ASSETS` | Page layout is correct but final brand assets (logos, crests, photography, ad creatives) are missing. Currently using SVG placeholder colours or generic images. Cannot be marked APPROVED until assets are supplied. |

---

## 5. Known issues — do not raise as new defects

The following are known, tracked, and accepted for the current sprint. They are documented in `SPRINT-4-VISUAL-DEFECT-LOG.md`.

### VD-001 — Picsum / SVG placeholder images

Player portraits and team crest backgrounds use branded SVG gradient placeholders (coloured circles/initials) instead of real photography and official club logos. This affects every player card, team crest, and media thumbnail in `DESIGN_REVIEW_DATA` mode. Real assets are tracked in `ASSET-REQUIREMENTS.md` and will replace placeholders before production launch.

**This is expected in DESIGN_REVIEW_DATA mode. It is not a visual bug.**

### VD-002 — DStv sponsor hardcoded in SponsorSection

The homepage `SponsorSection` and the `SponsorMoment` UI component default to `sponsorName="DStv"` with a hardcoded tagline. The actual sponsor creative must be supplied via the Sponsor Campaign Admin before going live. The component correctly reads from the campaign system in `LIVE_BETA_DATA` mode.

### VD-003 — DesignReviewBanner on all data pages

A yellow banner reading `DESIGN_REVIEW_DATA — [context]` appears at the top of every data-driven page in DESIGN_REVIEW_DATA mode. This is a deliberate developer/QA signal, not a user-facing element. It will be absent in production.

### VD-004 — No favicon or og:image assets in /public

The `apps/experience/public/` directory is currently empty. No `favicon.ico`, `apple-touch-icon.png`, or `og-image.png` file has been added. When sharing the Vercel URL, the link preview will show a blank image. Requires brand assets.

### VD-005 — noindex robots applied conditionally

`layout.tsx` correctly sets `robots: { index: false, follow: false }` when `NEXT_PUBLIC_ENVIRONMENT_LABEL === 'vercel-preview'` or `NEXT_PUBLIC_DATA_MODE === 'DESIGN_REVIEW_DATA'`. This is correct behaviour. Verify production environment variables do not set these flags.

### VD-006 — "Coming soon" stubs on four fantasy sub-pages

The following pages are intentional stubs with a "Coming soon" message:

- `/fantasy/fixtures` — fixture calendar not yet built
- `/fantasy/points` — points history wiring deferred
- `/fantasy/rules` — rules page deferred to static content pass
- `/fantasy/stats` — missing backend contract

These are `BLOCKED_BY_BACKEND` or `DEFERRED_STUB` and are tracked on the sprint backlog.

### VD-007 — Missing skip-navigation link

The global layout does not include a keyboard skip-link (`Skip to main content`) before the AppHeader. The `<main id="main-content">` anchor exists, but no visible skip link points to it. This is a WCAG 2.1 AA issue and is tracked for the accessibility sprint.

---

## 6. Review process

1. Open the Vercel preview URL on both desktop and a real mobile device.
2. Walk each priority route listed in Section 2 of the acceptance matrix.
3. Update the **Classification** column in `SPRINT-4-SCREEN-ACCEPTANCE-MATRIX.md`.
4. For new defects, add a row to `SPRINT-4-VISUAL-DEFECT-LOG.md` (format: VD-NNN).
5. Ping the lead engineer with the completed matrix. Routes marked REQUIRES_REDESIGN will block merge.

---

*Document owner: Agent 3 (Visual Acceptance) — PSL One Sprint 4*
