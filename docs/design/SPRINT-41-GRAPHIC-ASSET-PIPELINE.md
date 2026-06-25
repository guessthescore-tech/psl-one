# Sprint 41 — Graphic Asset Pipeline

## Overview

PSL One needs a systematic approach to generating, storing, and swapping visual assets across the fan experience. This document defines the pipeline from concept → generation → storage → delivery → swap.

---

## Asset Categories

| Category | Format | Generation | Storage | Update frequency |
|----------|--------|-----------|---------|-----------------|
| Hero banners | WebP/SVG | AI-generated or Figma | S3/CDN | Weekly or matchday |
| Matchday banners | WebP | AI-generated | S3/CDN | Per fixture |
| Club placeholder crests | SVG (inline) | Programmatic (code) | In-component | When licensed assets available |
| Player card backgrounds | WebP gradient | AI-generated or code | S3/CDN | Per season |
| Sponsor campaign banners | WebP/SVG | Sponsor-provided | S3/CDN | Per campaign |
| News hero images | WebP | Editorial team / AI | S3/CDN | Per article |
| Video thumbnails | WebP/JPEG | Provider API | External URL | Auto |

---

## Current Beta Approach

For beta, all assets use one of:
1. **Programmatic gradients** — CSS `linear-gradient` using team/brand colours. Zero cost, zero bandwidth.
2. **Initials/abbreviations** — Text on coloured background. Club crests, player silhouettes.
3. **External video thumbnails** — ScoreBat embeds or YouTube thumbnails (provider-provided).

This is correct for beta — do not use copyrighted or unlicensed visual assets.

---

## Production Asset Pipeline

### Step 1: Asset specification

Each asset class has a specification:
```
Type: hero_banner
Dimensions: 1440×600 (web), 800×400 (mobile)
Format: WebP (90% quality) + fallback JPEG
Safe zone: Centre 60% width (text overlay area)
Text area: Bottom-left gradient fade
```

### Step 2: Generation

| Method | Use case | Tool |
|--------|----------|------|
| AI image generation | Hero banners, matchday atmosphere | See prompt library |
| Figma design | Player cards, sponsor campaign templates | Figma |
| Programmatic SVG | Club crests (until licensed) | React/inline SVG |
| Provider assets | Sponsor logos, player photos (licensed) | S3 upload |

### Step 3: Optimisation

All raster assets should be:
- WebP primary format
- JPEG fallback (for legacy browsers)
- Multiple sizes: 400w, 800w, 1200w, 1600w
- Lazy loaded via `next/image`
- Stored in S3 with CloudFront CDN

### Step 4: Storage

Target S3 path structure:
```
s3://psl-one-assets/
  banners/
    hero/
      wc-2026-hero-v1.webp
    matchday/
      2026-07-01-rsa-vs-mor.webp
  players/
    silhouettes/
      gk-silhouette-v1.webp
  clubs/
    crests/           (empty until licensed)
    placeholders/     (SVG programmatic crests)
  sponsors/
    campaigns/
      <sponsor-name>/
        <campaign-name>-banner.webp
  news/
    heroes/
      <article-slug>-hero.webp
```

### Step 5: Delivery

Use `next/image` for all images:
```tsx
import Image from 'next/image';

<Image
  src="https://assets.pslone.co.za/banners/hero/wc-2026-hero-v1.webp"
  alt="World Cup 2026 — South Africa's journey"
  width={1440}
  height={600}
  priority={isHero}
  className="object-cover"
/>
```

Update `apps/experience/next.config.ts` when CDN domain is ready:
```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'assets.pslone.co.za' },
  ],
}
```

### Step 6: CMS integration (future)

Long-term: assets should be managed via a lightweight CMS (Contentful, Sanity, or the existing `Media` model in the API) so non-technical staff can swap banners without a code deploy.

The `Media` model already exists in the API schema. Wire it to S3 presigned upload URLs.

---

## Asset Licensing Registry

All assets used in production must be registered:

| Asset | Source | License | Expiry | Cleared by |
|-------|--------|---------|--------|-----------|
| _(no assets registered yet)_ | — | — | — | — |

PSL One must NOT use:
- PSL logo without a signed licensing agreement
- Club badges/crests without club permission
- Player photographs without a media rights license
- Stock photography of identifiable individuals without model release
- Copyrighted artworks, fonts (non-commercial), or music

---

## Weekly Asset Refresh Cadence

| Asset | Frequency | Trigger |
|-------|-----------|---------|
| Hero banner | Weekly | Monday morning |
| Matchday banner | Per fixture | 24h before kickoff |
| News hero | Per article | On publish |
| Campaign banner | Per campaign | Campaign start |
| Player card bg | Per season | Season start |

The `GRAPHIC-DESIGN-AGENT-BRIEF.md` document contains prompts for AI-assisted generation of these assets.
