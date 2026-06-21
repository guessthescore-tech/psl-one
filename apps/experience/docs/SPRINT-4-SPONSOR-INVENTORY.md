# PSL One Experience — Sponsor Placement Inventory (Sprint 4)

**Scope:** `apps/experience` premium fan experience  
**Revised:** 2026-06-20  
**Governing rule:** Points-only platform — no gambling, no alcohol, no financial products  
**Implemented components:** `SponsorMoment` (ui), `SponsorSection` (sections)

---

## 0. Global Content Restrictions (All Placements)

The following categories are **permanently excluded** from ALL placements:

| Category | Reason |
|---|---|
| Gambling / betting / fixed-odds | PSL One is a points-only platform; gambling adjacency violates platform integrity and POPIA risk profile |
| Alcohol / tobacco / vaping | PSA age-gating is not implemented; blanket exclusion until age verification is in place |
| Financial products (loans, credit, investment, crypto) | Platform serves fan entertainment; financial advertising requires FSP licensing under FAIS |
| Adult content | Prohibited |
| Political advertising | Prohibited |
| Competitor platforms (other fantasy, prediction, or football apps) | Commercial conflict |
| Brands with active PSL code-of-conduct violations | Prohibited |

---

## 1. Placement Catalogue

### SPONSOR-01 — Homepage Hero Banner

| Field | Value |
|---|---|
| **Placement ID** | `SPONSOR-01-HOMEPAGE-HERO` |
| **Location** | `/` — `SponsorSection` (rendered between `VideoRailSection` and `FanValueSection`) |
| **Component** | `SponsorSection` → `SponsorMoment` |
| **Dimensions (mobile)** | Full-width × 128px (h-32) |
| **Dimensions (desktop)** | max-w-4xl × 160px (h-40) |
| **Type** | `hero_banner` |
| **Content restrictions** | See Global; additionally: must be football or entertainment brand; image must not show real money, odds, or gambling iconography |
| **Mandatory disclosures** | "Presented by [SponsorName]" overlay (top-left); "Sponsored" transparency label (top-right); "Points only - No gambling - No real money involvement" sub-caption |
| **Status** | DESIGNED |
| **Current stub value** | DStv — "Live football, every match, on DStv" |
| **Notes** | Existing `SponsorMoment` component is production-ready for this slot. The `href` prop enables click-through with `rel="noopener noreferrer nofollow"`. Background image served via `expImg()` CDN helper. |

---

### SPONSOR-02 — Fixture Rail Injection

| Field | Value |
|---|---|
| **Placement ID** | `SPONSOR-02-FIXTURE-RAIL` |
| **Location** | `/` — `FixtureCarouselSection`; after every 5th fixture card |
| **Component** | STUB — `FixtureRailSponsorCard` (not yet created) |
| **Dimensions (mobile)** | 280px × 160px (card width matches FixtureCard) |
| **Dimensions (desktop)** | 320px × 180px |
| **Type** | `card_injection` |
| **Content restrictions** | See Global; logo + short tagline only; no scrolling text; no animation that could be confused with live score data |
| **Mandatory disclosures** | "Sponsored" label (top-right corner of card) |
| **Status** | STUB |
| **Notes** | Injected as every nth card in the carousel array. Must not replace a fixture card — inserted between. Carousel is horizontal scroll on mobile, so sponsor card must match card dimensions exactly. |

---

### SPONSOR-03 — Prediction Page Brand Corner

| Field | Value |
|---|---|
| **Placement ID** | `SPONSOR-03-PREDICT-BRAND-CORNER` |
| **Location** | `/predict` — below the fixture list, above the footer |
| **Component** | STUB — `PredictSponsorBanner` (not yet created) |
| **Dimensions (mobile)** | Full-width × 80px |
| **Dimensions (desktop)** | max-w-2xl × 80px |
| **Type** | `brand_corner` |
| **Content restrictions** | See Global; brand must be aligned to "fair play" / fan engagement messaging; must not include language resembling betting odds |
| **Mandatory disclosures** | "Sponsored" label; "Points only - No gambling - No real money involvement" must appear within or immediately below the placement |
| **Status** | STUB |
| **Notes** | Prediction page already carries the "Points only" disclaimer in multiple places; sponsor brand here reinforces the non-gambling framing. Ideal category: telco, streaming, sportswear. |

---

### SPONSOR-04 — Fantasy Hub Sponsor Strip

| Field | Value |
|---|---|
| **Placement ID** | `SPONSOR-04-FANTASY-HUB` |
| **Location** | `/fantasy` — rendered inside `HasTeamState` below the captain highlight block |
| **Component** | STUB — `FantasySponsorStrip` (not yet created) |
| **Dimensions (mobile)** | Full-width × 64px |
| **Dimensions (desktop)** | max-w-lg × 64px |
| **Type** | `fixture_rail` (horizontal strip) |
| **Content restrictions** | See Global; fantasy sponsor should be aligned with stats/data/fan engagement; no brand that could be associated with real-money gaming |
| **Mandatory disclosures** | "Sponsored" label; "Points only — no real money" reminder must appear in the same viewport section |
| **Status** | STUB |
| **Notes** | This placement is inside the authenticated fantasy flow. Consent check is needed if any user-context is passed to the ad delivery layer. Default: context-free (only `page_slug` sent). |

---

### SPONSOR-05 — Match Centre Header Sponsor

| Field | Value |
|---|---|
| **Placement ID** | `SPONSOR-05-MATCH-CENTRE-HEADER` |
| **Location** | `/matches/[fixtureId]` — inside `MatchHeader` component, below the competition label |
| **Component** | STUB — prop injection on `MatchHeader` (`sponsorName`, `sponsorLogoKey`) |
| **Dimensions (mobile)** | 120px × 32px (logo strip only) |
| **Dimensions (desktop)** | 160px × 40px |
| **Type** | `brand_corner` |
| **Content restrictions** | See Global; must be football-contextually appropriate; TV broadcast, streaming, or kit sponsors preferred |
| **Mandatory disclosures** | "Presented by" prefix before logo |
| **Status** | STUB |
| **Notes** | Match header is rendered on the live match page — high-traffic. The integration should be prop-driven with fallback to no sponsor if no active deal. Component must remain functional without the sponsor prop. |

---

### SPONSOR-06 — Leaderboard / Season Stats Sponsor

| Field | Value |
|---|---|
| **Placement ID** | `SPONSOR-06-LEADERBOARD` |
| **Location** | `/stats/season`, `/stats/standings` — above `SeasonLeaderboard` and `StandingsTable` |
| **Component** | STUB — `LeaderboardSponsorBadge` (not yet created) |
| **Dimensions (mobile)** | Full-width × 48px (tight badge format) |
| **Dimensions (desktop)** | Full-width × 56px |
| **Type** | `brand_corner` |
| **Content restrictions** | See Global; ideal for data, analytics, or technology brands; no financial services |
| **Mandatory disclosures** | "Sponsored by [Brand]" text only; no image required at this size |
| **Status** | STUB |
| **Notes** | Leaderboard pages are typically high-engagement repeat visits. Badge format avoids disrupting the stats UI. |

---

### SPONSOR-07 — Rewards / Fan Value Area Sponsor

| Field | Value |
|---|---|
| **Placement ID** | `SPONSOR-07-REWARDS` |
| **Location** | `/account` — within `FanValueSection` or adjacent to rewards/points display |
| **Component** | STUB — `RewardsSponsorBadge` (not yet created) |
| **Dimensions (mobile)** | Full-width × 72px |
| **Dimensions (desktop)** | max-w-lg × 72px |
| **Type** | `brand_corner` |
| **Content restrictions** | See Global; rewards sponsor must not imply real-money redemption; ideal: retail, food, entertainment |
| **Mandatory disclosures** | "Points only — no cash value" disclaimer must be visible in same section |
| **Status** | STUB |
| **Notes** | The rewards area is inside authenticated routes. Sponsor data passed to ad layer must be context-free. No user financial data exposed. |

---

### SPONSOR-08 — Club Pages Brand Moment

| Field | Value |
|---|---|
| **Placement ID** | `SPONSOR-08-CLUB-IDENTITY` |
| **Location** | `/` — `ClubIdentitySection`; or future `/clubs/[clubId]` page |
| **Component** | STUB — prop on `ClubIdentitySection` or dedicated `ClubSponsorBadge` |
| **Dimensions (mobile)** | Full-width × 96px |
| **Dimensions (desktop)** | max-w-4xl × 112px |
| **Type** | `hero_banner` |
| **Content restrictions** | See Global; club sponsors must not conflict with existing PSL club kit deals; any club-specific sponsor must be cleared with PSL commercial team |
| **Mandatory disclosures** | "Club Partner" label; "Points only platform" sub-caption |
| **Status** | STUB |
| **Notes** | High brand sensitivity — club associations carry real football commercial value. Must go through PSL commercial approval before any brand is placed here. |

---

### SPONSOR-09 — Media / Video Rail Sponsor

| Field | Value |
|---|---|
| **Placement ID** | `SPONSOR-09-MEDIA-RAIL` |
| **Location** | `/media` — above `VideoRailSection`; `/media/[slug]` — below video player |
| **Component** | STUB — `VideoSponsorLabel` (pre-roll text only; no video pre-roll required) |
| **Dimensions (mobile)** | Full-width × 40px (text strip) |
| **Dimensions (desktop)** | Full-width × 40px |
| **Type** | `brand_corner` |
| **Content restrictions** | See Global; media/video sponsors ideal for streaming services, electronics, telco; no overlay on video frame itself |
| **Mandatory disclosures** | "Brought to you by [Brand]" |
| **Status** | STUB |
| **Notes** | Pre-roll video advertising is out of scope for Sprint 4. Text-strip only for now. No autoplay audio. |

---

### SPONSOR-10 — Campaign Card Sponsor

| Field | Value |
|---|---|
| **Placement ID** | `SPONSOR-10-CAMPAIGN-CARD` |
| **Location** | `/` — `GuessTheScoreSection` campaign card area |
| **Component** | STUB — prop on `GameEntryCard` (`sponsorName`, `sponsorLogoKey`) |
| **Dimensions (mobile)** | Card-width (full-width mobile) × 32px logo area within card header |
| **Dimensions (desktop)** | Card-width × 40px |
| **Type** | `card_injection` |
| **Content restrictions** | See Global; campaign sponsor must reinforce fan-gaming (not gambling) narrative |
| **Mandatory disclosures** | "Sponsored" in card corner; "Points only - no real money" in card footer (already present) |
| **Status** | STUB |
| **Notes** | `GameEntryCard` is used for the Guess the Score entry point on the homepage. Sponsor branding here links to the prediction product, which already carries mandatory disclaimers. |

---

### SPONSOR-11 — Scan / QR Page Sponsor

| Field | Value |
|---|---|
| **Placement ID** | `SPONSOR-11-SCAN` |
| **Location** | `/scan` — below `BadgeScannerShell`, above instructions |
| **Component** | STUB — `EventSponsorBadge` (not yet created) |
| **Dimensions (mobile)** | Full-width × 80px |
| **Dimensions (desktop)** | max-w-lg × 80px |
| **Type** | `brand_corner` |
| **Content restrictions** | See Global; event/venue sponsors only; must be PSL-approved stadium or event partner |
| **Mandatory disclosures** | "Event Partner" label |
| **Status** | STUB |
| **Notes** | Scan page is NFC/QR badge scanning for in-stadium fan points. Sponsor here is specifically for live event integrations — not web-only placements. |

---

### SPONSOR-12 — Account Rewards Area Sponsor

| Field | Value |
|---|---|
| **Placement ID** | `SPONSOR-12-ACCOUNT-REWARDS` |
| **Location** | `/account` — dedicated rewards tab or `FanValueSection` |
| **Component** | STUB — `AccountRewardsSponsor` (not yet created) |
| **Dimensions (mobile)** | Full-width × 96px |
| **Dimensions (desktop)** | max-w-lg × 112px |
| **Type** | `hero_banner` |
| **Content restrictions** | See Global; rewards partner must offer tangible non-financial fan benefit (e.g. streaming access, merchandise, ticketing) |
| **Mandatory disclosures** | "Rewards Partner"; "Fan points — no cash value" |
| **Status** | STUB |
| **Notes** | If PSL One introduces real-world rewards redemption in future, this placement's content policy must be reviewed alongside the rewards legal framework. |

---

## 2. Summary Status Table

| Placement ID | Type | Status | Component Exists |
|---|---|---|---|
| SPONSOR-01-HOMEPAGE-HERO | hero_banner | DESIGNED | YES — `SponsorMoment`, `SponsorSection` |
| SPONSOR-02-FIXTURE-RAIL | card_injection | STUB | NO |
| SPONSOR-03-PREDICT-BRAND-CORNER | brand_corner | STUB | NO |
| SPONSOR-04-FANTASY-HUB | fixture_rail | STUB | NO |
| SPONSOR-05-MATCH-CENTRE-HEADER | brand_corner | STUB | NO |
| SPONSOR-06-LEADERBOARD | brand_corner | STUB | NO |
| SPONSOR-07-REWARDS | brand_corner | STUB | NO |
| SPONSOR-08-CLUB-IDENTITY | hero_banner | STUB | NO |
| SPONSOR-09-MEDIA-RAIL | brand_corner | STUB | NO |
| SPONSOR-10-CAMPAIGN-CARD | card_injection | STUB | NO |
| SPONSOR-11-SCAN | brand_corner | STUB | NO |
| SPONSOR-12-ACCOUNT-REWARDS | hero_banner | STUB | NO |

**1 of 12 placements are designed and componentised. 11 are stubs requiring implementation.**
