# Sprint 33 — CDN Strategy

## Overview

All media assets are served via CDN. The PSL One platform stores only CDN URLs in the
database — no binary blobs, no raw S3 direct links exposed to clients.

## CDN Layers

| Layer             | Provider (planned)       | Status          | Notes                           |
|-------------------|--------------------------|-----------------|---------------------------------|
| Image CDN         | CloudFront + S3          | NOT_DEPLOYED    | Sprint 33 skeleton only         |
| Video CDN         | CloudFront + MediaConvert| NOT_DEPLOYED    | Transcoding pipeline TBD        |
| Static assets     | Vercel Edge Network      | ACTIVE          | Frontend JS/CSS via Vercel      |

## URL Schema

```
Production:  https://cdn.psl.co.za/{asset-key}
Staging:     https://cdn-staging.psl.co.za/{asset-key}
Local dev:   http://localhost:3000/uploads/{asset-key}
```

## CloudFront Configuration (planned)

- Origin: S3 bucket in `af-south-1` (Cape Town region).
- Cache policy: image assets 1 year, video assets 30 days, pdfs 7 days.
- HTTPS enforced: redirect HTTP → HTTPS.
- Geo-restriction: none (WC audience is global).
- Signed URLs for premium/rights-restricted video content.

## Rights-Restricted Content

For VOD content with broadcast rights:
- Signed CloudFront URLs with time-limited access tokens.
- Rights metadata stored in `MediaAsset.rightsStatus` and `licenceExpiresAt`.
- Expiry enforcement at CDN edge via signed URL TTL.

## Image Optimisation

- WebP conversion at upload time (planned Sprint 34+).
- Responsive image variants: 320px, 768px, 1200px, 1920px.
- Lazy loading enforced by the frontend Next.js `<Image>` component.

## Safety Constraints

- No CloudFront distribution created in this sprint.
- No S3 bucket created in this sprint (see S3-INFRA-02 for existing beta bucket).
- `S3CompatibleAdapter.putObject` throws `NotImplementedException` until explicitly activated.
- CDN base URL is configurable via `CDN_BASE_URL` env var (never hardcoded).
