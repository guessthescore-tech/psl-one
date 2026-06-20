# Sprint 4 — Visual Defect Log

**Document type:** Code-audit visual defect log (no live screenshots)  
**Agent:** Agent 3 (Visual Acceptance) / Agent 10 (Accessibility/Responsive)  
**Date:** 2026-06-20  
**Source:** Static code review of `apps/experience/src/`  

Defect IDs are stable. Add new defects at the bottom with incrementing IDs (VD-011, VD-012, ...).

---

## Defect index

| ID | Page(s) affected | Severity | Status |
|----|-----------------|----------|--------|
| VD-001 | All player/team/media pages | HIGH | DEFERRED |
| VD-002 | `/` (homepage) | MEDIUM | DEFERRED |
| VD-003 | All data-driven pages | LOW | ACCEPTED |
| VD-004 | All pages (global) | MEDIUM | OPEN |
| VD-005 | All pages (global) | LOW | RESOLVED |
| VD-006 | `/fantasy/fixtures`, `/fantasy/points`, `/fantasy/rules`, `/fantasy/stats` | HIGH | DEFERRED |
| VD-007 | All pages (global) | MEDIUM | OPEN |
| VD-008 | `/players/[playerId]` | LOW | OPEN |
| VD-009 | `/players/[playerId]/stats` | LOW | OPEN |
| VD-010 | `/fantasy/leagues/create`, `/fantasy/leagues/join` | MEDIUM | OPEN |
| VD-011 | `/fantasy/leagues/[leagueId]` | LOW | OPEN |

---

## Defect details

---

### VD-001

**Page(s) affected:** All player cards, team crests, media thumbnails across every page  
**Description:** Player portrait images and team crest backgrounds use branded SVG gradient placeholder shapes (coloured circles with initials or shirt number) instead of real photography and official club logos. This is the result of the `expImg()` helper returning branded SVG data URIs when no real asset URL is available. Confirmed by test at `experience.spec.ts:1218` which asserts that `expImg` no longer uses picsum.photos (meaning picsum has been replaced, but with SVG placeholders, not real images). Affects the visual quality of every player card, squad pitch, transfer list, leaderboard, and club selector.  
**Severity:** HIGH  
**Status:** DEFERRED — assets tracked in `ASSET-REQUIREMENTS.md`  
**Recommended fix:** Supply real PSL player photography (JPG/WebP, at minimum 400×400px per player) and official club crest SVGs to the asset pipeline. The `expImg()` helper and component are already set up to accept real URLs — the blocker is asset delivery, not code.  
**Grep evidence:** `experience.spec.ts:1218: it('expImg no longer uses picsum.photos', () => {` — confirms picsum removed; SVG fallback in use.

---

### VD-002

**Page(s) affected:** `/` (homepage) — `SponsorSection`, `SponsorMoment` component  
**Description:** The `SponsorSection` on the homepage and the underlying `SponsorMoment` UI component hardcode `sponsorName="DStv"` and `sponsorTagline="Live football, every match, on DStv"` directly in JSX. The `imageKey` is `"dstv-sponsor-wc2026-matchday"`. When the actual contracted sponsor changes, or when the Sponsor Campaign Admin supplies a different creative, these hardcoded values will show incorrect branding. Additionally no real DStv logo image exists in `public/` — the component renders a styled text block as a fallback.  
**Severity:** MEDIUM  
**Status:** DEFERRED — sponsor creative asset and contract TBC  
**Recommended fix:** The `SponsorMoment` component is already prop-driven. Remove the hardcoded defaults from `SponsorSection.tsx` and instead read the active sponsor config from the backend's `GET /media/campaigns?type=SPONSOR` endpoint. Alternatively, gate rendering behind a campaign config flag so the section is hidden until a real sponsor creative is assigned.  
**File:** `apps/experience/src/sections/SponsorSection.tsx:11-13`, `apps/experience/src/components/ui/SponsorMoment.tsx:11-13`

---

### VD-003

**Page(s) affected:** All data-driven pages (17+ routes in DESIGN_REVIEW_DATA mode)  
**Description:** A yellow `DesignReviewBanner` component appears at the top of every data-driven page when `NEXT_PUBLIC_DATA_MODE=DESIGN_REVIEW_DATA`. Example banners: "DESIGN_REVIEW_DATA — WC 2026 mock data active", "DESIGN_REVIEW_DATA — 24 mock players". This is intended developer/QA signalling behaviour, not a user-facing element. It will be absent in production (`LIVE_BETA_DATA` mode).  
**Severity:** LOW  
**Status:** ACCEPTED — by design; not a bug  
**Recommended fix:** No action required. Confirm that `NEXT_PUBLIC_DATA_MODE` is not set to `DESIGN_REVIEW_DATA` on the production Vercel environment.

---

### VD-004

**Page(s) affected:** All pages (global — link preview / SEO)  
**Description:** The `apps/experience/public/` directory is empty. No `favicon.ico`, `apple-touch-icon.png`, `favicon-32x32.png`, or `og-image.png` exists. When the Vercel preview URL is shared on WhatsApp, Slack, or Twitter, the link preview will show a blank image card and the browser tab will show a generic globe icon. The `layout.tsx` metadata defines `openGraph.title` and `openGraph.description` but no `openGraph.images` array — meaning the OG image fallback is blank.  
**Severity:** MEDIUM  
**Status:** OPEN  
**Recommended fix:** (1) Add `apps/experience/public/favicon.ico` (32×32 or SVG). (2) Add `apps/experience/public/og-image.png` (1200×630px) with PSL One branding. (3) Add `openGraph.images: [{ url: '/og-image.png', width: 1200, height: 630 }]` to the metadata export in `layout.tsx`. Brand art is required from design assets team.  
**File:** `apps/experience/src/app/layout.tsx:22-34`

---

### VD-005

**Page(s) affected:** All pages (global — SEO robots)  
**Description:** Review of `layout.tsx` confirmed that `robots: { index: false, follow: false }` is correctly set when `NEXT_PUBLIC_ENVIRONMENT_LABEL === 'vercel-preview'` OR `NEXT_PUBLIC_DATA_MODE === 'DESIGN_REVIEW_DATA'`. This prevents search engines from indexing the preview deployment. A Vercel `X-Robots-Tag: noindex` header is also applied via `vercel.json` (confirmed by test at `experience.spec.ts:1336`).  
**Severity:** LOW  
**Status:** RESOLVED — noindex is correctly implemented  
**Recommended fix:** No action. Verify that the production environment does NOT set either of these env vars.

---

### VD-006

**Page(s) affected:** `/fantasy/fixtures`, `/fantasy/points`, `/fantasy/rules`, `/fantasy/stats`  
**Description:** All four pages are bare single-line stubs containing only `<p className="text-exp-muted text-body-md">Coming soon</p>`. There are no headings, no loading states, no error states, no design content. Users navigating to these routes from the fantasy league page or league detail page (which contains an inline "Fixture view coming soon" message) will see an unstyled, unbranded placeholder paragraph with no context or navigation out.  
**Severity:** HIGH  
**Status:** DEFERRED — backends not yet built (`MISSING_BACKEND_CONTRACT` for stats/FDR; `DEFERRED_STUB` for points/rules)  
**Recommended fix:** Replace bare "Coming soon" stubs with a minimum viable deferred-state component that includes: the page heading, a brief "we're building this" message, a back/home navigation link, and the app shell (header/nav are already applied via layout). Consider a shared `<ComingSoonPage title="..." description="..." />` component to standardise this pattern across all four stubs.  
**Files:**  
- `apps/experience/src/app/fantasy/fixtures/page.tsx:7`  
- `apps/experience/src/app/fantasy/points/page.tsx:7`  
- `apps/experience/src/app/fantasy/rules/page.tsx:7`  
- `apps/experience/src/app/fantasy/stats/page.tsx:7`

---

### VD-007

**Page(s) affected:** All pages (global — accessibility)  
**Description:** The global layout in `layout.tsx` includes `<main id="main-content">` which is the correct skip-link target anchor. However, no visible (or visually-hidden) "Skip to main content" link is present before the `<AppHeader>` component. Keyboard users and screen-reader users must Tab through the entire header navigation (5 nav items + Sign in + Join free) before reaching page content. This fails WCAG 2.1 Success Criterion 2.4.1 (Bypass Blocks, Level A).  
**Severity:** MEDIUM  
**Status:** OPEN  
**Recommended fix:** Add a skip link as the first focusable element in `RootLayout`, before `<AppHeader>`. Standard pattern:

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-exp-gold focus:text-exp-void focus:px-4 focus:py-2 focus:rounded-card-sm focus:font-bold"
>
  Skip to main content
</a>
```

**File:** `apps/experience/src/app/layout.tsx:36-48`

---

### VD-008

**Page(s) affected:** `/players/[playerId]`  
**Description:** The player profile page contains two CSS placeholder comment blocks in JSX:

```jsx
{/* Price history placeholder */}
{/* Ownership trend placeholder */}
```

These are empty sections with no visual content — the areas render as invisible whitespace gaps in the layout. Users may notice unexplained vertical space between the stats grid and the bottom of the page. These correspond to analytics data (FPL-style price change history and ownership percentage trend) that has no backend contract yet.  
**Severity:** LOW  
**Status:** OPEN  
**Recommended fix:** Either remove the placeholder comment blocks to eliminate the whitespace gap, or replace with a `BLOCKED_BY_BACKEND` deferred-state inline notice (e.g. "Price history coming soon"). Do not leave invisible gap-producing comment placeholders in production JSX.  
**File:** `apps/experience/src/app/players/[playerId]/page.tsx:163-177`

---

### VD-009

**Page(s) affected:** `/players/[playerId]/stats`  
**Description:** The player stats page includes a note `{/* Radar chart placeholder (CSS-based) */}` indicating that the radar/spider chart for player attribute comparison is a CSS visual approximation, not a real SVG/Canvas chart. In DESIGN_REVIEW_DATA mode this may look acceptable for showcase purposes, but the CSS approximation will not accurately represent real player stat ratios and will look visually inconsistent at non-standard stat values.  
**Severity:** LOW  
**Status:** OPEN  
**Recommended fix:** Replace the CSS radar approximation with a real chart library (Chart.js or Recharts — both already in the Next.js dependency tree via the main `apps/web` package). A `<RadarChart>` from Recharts would be lightweight and production-quality. This is a medium-effort implementation task.  
**File:** `apps/experience/src/app/players/[playerId]/stats/page.tsx:99`

---

### VD-010

**Page(s) affected:** `/fantasy/leagues/create`, `/fantasy/leagues/join`  
**Description:** Both pages contain `TODO: error toast` / `TODO: show error` comments in their form submission handlers. If the API call fails (e.g. duplicate league name, invalid join code, network error), the error is silently caught and the form returns to its idle state with no user-visible feedback. Users will be confused — they submit the form, nothing happens, and there is no message explaining why.  
**Severity:** MEDIUM  
**Status:** OPEN  
**Recommended fix:** Implement an inline error message below the form (or a toast notification). Pattern: add an `error` state string, set it in the catch block, and render `{error && <p role="alert" className="text-exp-live text-body-sm">{error}</p>}` below the submit button. The `role="alert"` ensures screen-readers announce the error.  
**Files:**  
- `apps/experience/src/app/fantasy/leagues/create/page.tsx:42`  
- `apps/experience/src/app/fantasy/leagues/join/page.tsx:90`

---

### VD-011

**Page(s) affected:** `/fantasy/leagues/[leagueId]`  
**Description:** The league detail page contains the string "Fixture view coming soon — track rival team selections each gameweek." rendered as visible paragraph text to the user. Unlike the four full-page "Coming soon" stubs (VD-006), this text appears inline within an otherwise complete and functional page, as a section beneath the standings table. Users may interpret this as a broken feature rather than a planned roadmap item.  
**Severity:** LOW  
**Status:** OPEN  
**Recommended fix:** Replace the raw "coming soon" text with a styled deferred-feature chip or banner that is visually consistent with the app's beta-readiness communication. Example: a small `badge` labelled "Beta — coming soon" in `exp-gold/30` background. Alternatively, hide the section entirely until the feature is built.  
**File:** `apps/experience/src/app/fantasy/leagues/[leagueId]/page.tsx:102`

---

## Picsum placeholder audit

**Grep command run:** `grep -rn "picsum\|placeholder.com\|lorempixel" apps/experience/src/ | head -20`

**Result:** Zero occurrences of `picsum.photos`, `placeholder.com`, or `lorempixel` in production source code. All prior picsum usage has been replaced with branded SVG data-URI placeholders via the `expImg()` helper. Confirmed by unit test assertion at `experience.spec.ts:1218`:

```
it('expImg no longer uses picsum.photos', () => {
  expect(dataSrc).not.toContain('picsum.photos');
```

The only references to "picsum" in the codebase are in test assertions that confirm picsum has been removed. The current state uses SVG placeholders — tracked as VD-001.

---

## Predict page stub check

**Verified:** `/predict` (file: `apps/experience/src/app/predict/page.tsx`) is NOT a "Coming soon" stub.

First 5 lines of the file:

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
```

The predict page is a fully implemented `'use client'` component using Framer Motion and multiple React hooks. It includes a score-picker, fixture list, lock states, and social sharing. It is classified as `APPROVED` in the acceptance matrix.

---

*Document owner: Agent 3 (Visual Acceptance) — PSL One Sprint 4*
