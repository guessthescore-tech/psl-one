# PSL One Experience — Sponsor Safe-Zone Rules (Sprint 4)

**Scope:** `apps/experience` premium fan experience  
**Revised:** 2026-06-20  
**Governing law:** POPIA (Protection of Personal Information Act, South Africa), Consumer Protection Act 68 of 2008  
**Platform classification:** Fan engagement / entertainment. NOT a gambling platform. NOT a financial services platform.

---

## 1. Zone Classification

### 1.1 Always-Available Placements

These placements may carry approved sponsor content at any time without additional editorial review, provided the brand has been approved by the PSL commercial team and the content passes the automated content gate (Section 3).

| Placement ID | Location | Condition |
|---|---|---|
| `SPONSOR-01-HOMEPAGE-HERO` | Homepage hero | Brand pre-approved; image reviewed; "Presented by" label present |
| `SPONSOR-06-LEADERBOARD` | Stats / standings | Text-badge format; no image; brand pre-approved |
| `SPONSOR-09-MEDIA-RAIL` | Media hub text strip | Text only; "Brought to you by" prefix; brand pre-approved |

Rationale: These are low-interactivity, text-or-image placements with fixed formats that make content moderation predictable.

---

### 1.2 Placements Requiring Content Moderation

These placements require human review of creative assets before go-live:

| Placement ID | Location | Review trigger |
|---|---|---|
| `SPONSOR-02-FIXTURE-RAIL` | Fixture carousel card | Any new creative asset; any new brand onboarding |
| `SPONSOR-03-PREDICT-BRAND-CORNER` | Prediction page | Any new creative; must pass "no-gambling-language" check |
| `SPONSOR-04-FANTASY-HUB` | Fantasy hub strip | Any new creative; must not imply real-money gaming |
| `SPONSOR-05-MATCH-CENTRE-HEADER` | Match centre logo strip | Broadcast/kit sponsor conflicts must be checked with PSL |
| `SPONSOR-07-REWARDS` | Account rewards area | Non-cash-value claim must be legally reviewed |
| `SPONSOR-08-CLUB-IDENTITY` | Club identity section | PSL commercial + legal must approve any club-linked sponsor |
| `SPONSOR-10-CAMPAIGN-CARD` | GuessTheScore campaign card | Must pass gambling-language check; prediction framing must be preserved |
| `SPONSOR-11-SCAN` | QR/NFC scan page | Event partner only; physical event contract must exist |
| `SPONSOR-12-ACCOUNT-REWARDS` | Account rewards banner | Rewards partnership agreement required; legal review of "no cash value" claim |

Review turnaround: minimum 3 business days for new brands; 1 business day for creative refreshes from approved brands.

---

### 1.3 Permanently Excluded Categories

The following are **permanently excluded from all placements** and cannot be overridden by commercial agreements:

| Category | Specific examples | Override possible |
|---|---|---|
| Gambling / betting | Sports books, fixed-odds betting, casino, lottery, poker | NO |
| Alcohol | Beer, wine, spirits, ciders | NO (until age-gate is implemented) |
| Tobacco / vaping / nicotine | Cigarettes, e-cigarettes, nicotine pouches | NO |
| Financial products | Loans, credit cards, investment products, insurance, crypto | NO |
| Adult content | Any NSFW imagery or services | NO |
| Political advertising | Parties, candidates, referenda | NO |
| Competitor fan-gaming platforms | Other fantasy football apps, prediction apps | NO |
| Brands under PSL commercial sanctions | Any brand on the PSL prohibited list | NO |

---

## 2. POPIA Compliance Notes for Sponsor Data Collection

### 2.1 Consent Hierarchy

| Data type | Basis | Action required |
|---|---|---|
| Page slug sent to ad delivery (e.g. `page: 'predict'`) | Legitimate interest — necessary for contextual ad serving | No additional consent needed |
| Session ID sent to sponsor analytics | Legitimate interest — anonymous session, not linked to identity | No additional consent needed |
| User ID or profile data sent to third-party sponsor | Requires explicit consent under POPIA s.11(1)(a) | Must show POPIA-compliant consent banner; user must actively opt in |
| Retargeting pixels from sponsors | Requires explicit consent | BLOCKED until consent infrastructure is implemented |
| Behavioural profiling by sponsor | Requires explicit consent | NOT PERMITTED in current Sprint 4 build |

### 2.2 Data Minimisation Rules for Sponsor Integrations

Any sponsor integration (ad tag, tracking pixel, SDK) must:

1. Receive only `page_slug`, `competition`, `data_mode` — never user identifiers
2. Be loaded asynchronously and never block the critical rendering path
3. Have a PSL DPA (Data Processing Agreement) on file before going live
4. Not set cookies with a lifetime exceeding 30 days without explicit consent
5. Not share data with sub-processors not listed in the DPA

### 2.3 Right to Erasure (POPIA s.24)

If a user requests data erasure, PSL One must:
- Notify any sponsor whose integration received that user's data (if consent was granted)
- Provide sponsor integration list in the privacy policy (`/privacy`)
- Complete erasure request within 30 days

### 2.4 Children and Minors

PSL One does not implement age verification in Sprint 4. Until age-gating is live:
- All alcohol and gambling categories remain permanently excluded (see Section 1.3)
- No sponsor integration may use age-targeting signals
- No "collect data from under-18s" clause may exist in any DPA

---

## 3. Attribution Requirements

### 3.1 Mandatory Labels

Every sponsored placement must carry one of these labels, visible without scrolling:

| Placement type | Required label | Font size minimum | Color contrast minimum |
|---|---|---|---|
| Hero banner | "Presented by [Brand]" + "Sponsored" corner tag | 10px / 0.625rem | 3:1 against background |
| Card injection | "Sponsored" corner tag | 10px / 0.625rem | 3:1 against background |
| Brand corner / strip | "Sponsored by [Brand]" | 10px / 0.625rem | 3:1 against background |
| Campaign card | "Sponsored" corner tag | 10px / 0.625rem | 3:1 against background |
| Event partner | "Event Partner: [Brand]" | 10px / 0.625rem | 3:1 against background |

The existing `SponsorMoment` component satisfies this requirement with:
- "Presented by" text (line 26 in `SponsorMoment.tsx`)
- "Sponsored" corner label (`text-white/40`, line 32 — NOTE: opacity may fail 3:1 contrast; review against dark backgrounds)

### 3.2 Click-Through Attribution

- All sponsored links must use `rel="noopener noreferrer nofollow"`
- Click-through URLs must not contain user PII in query parameters
- UTM parameters permitted: `utm_source=psl_one&utm_medium=sponsor&utm_campaign=[placement_id]`

---

## 4. "Points Only — No Real Money" Disclaimer Placement Rules

This disclaimer is **mandatory** wherever prediction, fantasy, or gaming features appear alongside sponsorship. It must appear:

### 4.1 Required Positions

| Context | Required position | Implementation |
|---|---|---|
| Any prediction page (`/predict/*`) | Below every sponsor placement; within submit button area | Already in `FixturePredictionCard` and `ShareSheet` |
| Any challenge page (`/predict/challenge/*`) | In the "How challenges work" card footer | Already in `ChallengePageInner` |
| Fantasy hub (`/fantasy`) | In `HasTeamState` footer; in `UnauthenticatedState` description | Already in `FantasyLandingPage` |
| Fantasy team page | Below squad action bar | PLANNED |
| `SponsorMoment` component | As `<p>` sub-caption below the banner | Already implemented in `SponsorMoment.tsx` line 47 / 57 |
| Any `SPONSOR-03-PREDICT-BRAND-CORNER` | Immediately below or within the sponsor unit | PLANNED |
| Any `SPONSOR-04-FANTASY-HUB` | Immediately below the sponsor strip | PLANNED |

### 4.2 Exact Wording

The canonical disclaimer wording for PSL One is:

> **Points only - No gambling - No real money involvement**

Short form (for tight spaces, ≥ 280px width):

> **Points only · no real money**

Ultra-short (badge/icon contexts only, always paired with full form nearby):

> **Points only**

### 4.3 Visual Requirements

- Font: matches body-sm / label-xs tokens (`text-exp-muted` or `text-white/30` on dark backgrounds)
- Must not be hidden behind scroll on initial viewport load when on the same screen as a sponsor
- Must not have opacity below 0.25 (currently `text-white/30` = 0.30 — acceptable minimum)

---

## 5. Mobile Minimum Size Requirements

All sponsor placements on mobile must meet these minimums:

| Requirement | Value | WCAG basis |
|---|---|---|
| Minimum banner height | 48px | Touch target accessibility |
| Minimum touch target for sponsor CTA button | 44px × 44px | WCAG 2.5.5 (Level AA) |
| Minimum logo width | 80px | Legibility |
| Minimum logo height | 24px | Legibility |
| Minimum text size for sponsor name | 14px / 0.875rem | WCAG 1.4.4 |
| Minimum text size for "Sponsored" label | 10px / 0.625rem | Disclosure legibility (legal minimum) |
| Minimum contrast ratio for sponsor name | 4.5:1 | WCAG 1.4.3 (normal text) |
| Minimum contrast ratio for "Sponsored" label | 3:1 | WCAG 1.4.3 (large text exception for disclosure) |

---

## 6. Touch Target Rules for Sponsor Buttons

All interactive sponsor elements (click-through buttons, CTA links) must:

1. Have a minimum touch target of **44px × 44px** (enforced in existing `SponsorMoment` via `min-h-[44px]` — inherited from parent anchor)
2. Have a visible focus state: `focus-visible:ring-2 focus-visible:ring-exp-gold` (consistent with platform design tokens)
3. Not use `pointer-events: none` on child elements that receive the click
4. Open external links in a new tab with `target="_blank" rel="noopener noreferrer nofollow"`
5. Include `aria-label` that describes the destination, not just "Click here" — e.g. `aria-label="DStv - Live football on DStv (opens in new tab)"`

The existing `SponsorMoment` anchor satisfies rules 1–5 (see `SponsorMoment.tsx` lines 38–47).

---

## 7. Gap Analysis — What Is Missing for Full Compliance

| Gap | Severity | Required action |
|---|---|---|
| "Sponsored" label at `text-white/40` opacity may not meet 3:1 contrast on mid-tone backgrounds | Medium | Audit `SponsorMoment` against all background tokens; raise opacity or darken label |
| 11 of 12 sponsor placements are stubs with no component implementation | High | Sprint 4 implementation task for each stub |
| No consent banner for sponsor tracking pixels | High | Must be implemented before any third-party sponsor tag is loaded |
| No DPA template for sponsor data agreements | High | Legal work required before first paid sponsor goes live |
| No automated content moderation gate | Medium | Manual review process sufficient for beta; automate in Sprint 5 |
| `SponsorSection` is hardcoded to DStv — no CMS-driven sponsor config | Low | Create sponsor config model in API layer; `SponsorMoment` props are already dynamic |
| Retargeting pixels from sponsors are not gated behind consent | Critical | Blocked: do not implement any pixel until consent infrastructure is live |
