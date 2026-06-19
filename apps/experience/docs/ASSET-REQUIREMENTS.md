# apps/experience — Asset Requirements
**Last updated:** 2026-06-19 (STORY-FE-PREMIUM-01A)

All `picsum.photos` URLs in this app are placeholders. Every URL has a descriptive seed that communicates the intended subject to the production photography team.

These must all be replaced before any public launch. The `expImg()` function in `src/lib/data.ts:115` must be replaced with a real CDN-backed image utility.

---

## Hero and Background Photography

| Seed | Size | Location | Subject required |
|------|------|----------|-----------------|
| `psl-match-night-stadium-floodlit` | 1440×900 | `MatchweekHeroSection` (background) | Orlando / Cape Town Stadium at night, floodlit pitch, crowd energy visible |
| `wc-2026-fanpark-stadium-lights` | 1440×600 | `FeaturedMatchSection` (background) | Fan park atmosphere, stadium lights, WC 2026 context |

---

## Player Portraits

| Seed | Location | Subject required |
|------|----------|-----------------|
| `wc-player-mbappe-portrait` | `PlayerSpotlightSection`, `FantasyGameweekSection` | Kylian Mbappe — dark studio background, facing forward |
| `wc-player-vinicius-portrait` | `PlayerSpotlightSection` | Vinicius Jr — consistent treatment |
| `wc-player-bellingham-portrait` | `PlayerSpotlightSection` | Jude Bellingham — consistent treatment |
| `wc-player-pedri-portrait` | `PlayerSpotlightSection` | Pedri — consistent treatment |
| `wc-player-dias-portrait` | `PlayerSpotlightSection` | Ruben Dias — consistent treatment |
| `wc-player-hakimi-portrait` | `PlayerSpotlightSection` | Achraf Hakimi — consistent treatment |

**Note:** When PSL data integration begins, all 16 PSL club squad photos will be required using the same consistent dark-studio-background portrait style.

---

## Story / Editorial Photography

| Seed | Location | Subject required |
|------|----------|-----------------|
| `wc-story-france-germany-match` | `EditorialGridSection` (featured) | Match action, France vs Germany, MetLife Stadium |
| `wc-story-spain-england` | `EditorialGridSection` | Match action, Spain vs England |
| `wc-story-morocco-atlas-lions` | `EditorialGridSection` | Morocco team celebration or tactical shot |
| `wc-story-africa-rise` | `EditorialGridSection` | African football context, crowd or team |
| `wc-story-fantasy-mids` | `EditorialGridSection` | Midfielder in action |

---

## Video Thumbnails

| Seed | Location | Subject required |
|------|----------|-----------------|
| `wc-video-mbappe-goals` | `VideoRailSection` | Frame from Mbappe goal celebration |
| `wc-video-spain-england-highlights` | `VideoRailSection` | Spain vs England highlights frame |
| `wc-video-morocco-tactics` | `VideoRailSection` | Morocco defensive shape or tactical graphic |
| `wc-video-saves-md3` | `VideoRailSection` | Goalkeeper save action |
| `wc-video-vinicius-profile` | `VideoRailSection` | Vinicius Jr profile frame |

---

## Sponsor / Partner Assets

| Component | Asset required |
|-----------|---------------|
| `SponsorMoment` (`src/components/ui/SponsorMoment.tsx`) | Real sponsor logo and brand image from confirmed PSL commercial partner. Must include commercial usage rights documentation. |

---

## PSL Production Assets (future)

When PSL data integration begins, the following assets will be required:

| Asset | Notes |
|-------|-------|
| 16 PSL club crests (SVG preferred) | Must have commercial redistribution rights from PSL or clubs |
| 16 club stadium photography | Crowd visible, consistent quality |
| Current squad photos for all 16 clubs | Dark studio background, facing forward |
| Official PSL competition logo | For competition header and editorial use |

**All imagery requires explicit commercial licensing before use in any public-facing deployment.**

---

## Current Safe-to-Use Assets

- `expImg()` with `picsum.photos` — CC0, safe for design review only, never for public launch
- SVG icons from `@phosphor-icons/react` — MIT licence, safe for production
- Google Fonts (`Outfit`, `JetBrains Mono`) — Open Font Licence, safe for production
- Inline CSS gradients and colour values — owned by PSL One

---

## Replacement Process

1. Obtain licensed photography from PSL media team or stock provider
2. Upload to CDN (CloudFront distribution or Vercel image CDN)
3. Replace `expImg(seed, w, h)` calls with `<Image src={cdnUrl} width={w} height={h} alt={altText} />` (Next.js Image)
4. Update `next.config.ts` `domains` array to include CDN hostname
5. Remove `picsum.photos` from `domains`
6. Run `pnpm --filter @psl-one/experience build` to confirm no broken image references
