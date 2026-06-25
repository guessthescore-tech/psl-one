# Sprint 41 — Banner Rotation Guidelines

## Banner Types

### 1. Hero Banner (Homepage)
- Placement: Above the fold, full-width
- Dimensions: 1440×600 desktop / 800×500 mobile
- Update frequency: Weekly or for major events
- Content: Tournament hero, season launch, major match promo
- CTA: "Watch now", "Predict now", "Build your team"

### 2. Matchday Banner
- Placement: Homepage hero on matchday; match centre header
- Dimensions: 1440×400
- Update frequency: Per fixture (24h before kickoff; replaced with result on completion)
- Content: Two clubs, kickoff time, competition, score overlay post-match
- Components: `MatchdayBanner` (programmatic, uses club colours — no assets needed)

### 3. Section Banner
- Placement: Within content sections (Fantasy, GTS, Leaderboard)
- Dimensions: Full-width section, max 480px height
- Content: Feature promo ("Join 10,000 fans predicting WC matches")
- Update frequency: Per sprint

### 4. Sponsor Campaign Banner
- Placement: Non-intrusive positions (below fixtures, between content sections)
- Dimensions: 728×90 leaderboard / 300×250 rectangle / 320×50 mobile
- Content: Sponsor message + non-financial CTA
- Constraints: No gambling language; no cash prizes; MUST label as "Sponsored"
- Components: `SponsorBanner`

### 5. Club Portal Banner
- Placement: Club portal header
- Dimensions: 1200×300
- Content: Club colours + club name + "Your Club Portal"
- Generated programmatically from club data — no assets required

---

## Banner Content Policy

| Allowed | Not allowed |
|---------|------------|
| Match previews | Betting odds |
| Score predictions (points-only) | Cash prize promotions |
| Fantasy league stats | Real-money offers |
| Club/player highlights | Copyrighted images (unlicensed) |
| Sponsor brand messages | Gambling/wagering language |
| Tournament context | PSL logo (unlicensed) |
| Non-financial rewards | Misleading claims |

---

## Rotation Logic

### Current (Beta — Static)
Banners are hardcoded in components. No rotation system in beta.

### Future (CMS-driven)
1. Admin creates `MediaBanner` record via API (`POST /admin/media/banners`)
2. Banner assigned a placement, active period, and priority
3. Frontend queries `GET /media/banners?placement=hero` with caching
4. Banner swaps on next page load / scheduled refetch

The `Media` and `SponsorCampaign` models already exist in the API schema.

---

## Weekly Refresh Cadence (Beta)

Even in beta, aim to refresh hero banners weekly to signal the product is alive:

| Day | Action |
|-----|--------|
| Monday | Update homepage hero banner |
| Matchday | Switch to matchday banner (automated via `MatchdayBanner` component) |
| Post-match | Switch back to tournament hero |
| Mid-week | Optional: feature highlight banner (Fantasy, GTS) |

In the beta period, update banners by editing the hardcoded content in `PslOneHero` or the homepage `page.tsx`. In production, this will be CMS-driven.

---

## Technical Implementation

### Programmatic banners (current)
`PslOneHero`, `MatchdayBanner`, `SponsorBanner` — all render from props, no external images required in beta.

### Image-based banners (production)
```tsx
import Image from 'next/image';

<div className="relative w-full h-[600px]">
  <Image
    src={banner.imageUrl}
    alt={banner.altText}
    fill
    className="object-cover"
    priority
  />
  <div className="absolute inset-0 bg-gradient-to-t from-exp-void/80 to-transparent" />
  <div className="absolute bottom-8 left-8 right-8">
    {/* Text overlay */}
  </div>
</div>
```

### Performance
- Hero banners should use `priority` prop (above fold, LCP element)
- Non-hero banners: `loading="lazy"`
- Use `sizes` prop to serve correct resolution per viewport
- WebP with JPEG fallback via `next/image` automatic format negotiation
