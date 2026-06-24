# Sprint 31 — Video Centre Scope

**Status:** IMPLEMENTED | PSL INACTIVE | BETA ONLY
**Date:** 2026-06-24

## Overview

The Video Centre provides VOD (Video on Demand) management for PSL One. Videos are stored as
`MediaAsset` records with `mediaType = VIDEO`, `LIVE_STREAM`, or `SHORT_FORM`, leveraging
the existing MediaModule with no new database migration required.

## Supported Video Types

| MediaType | Use Case |
|-----------|----------|
| `VIDEO` | Standard VOD content (match highlights, documentaries) |
| `LIVE_STREAM` | Live broadcast (requires live streaming provider) |
| `SHORT_FORM` | Social-style clips (< 60 seconds) |
| `AUDIO` | Podcast/audio content |

## Data Model

**Model:** `MediaAsset` (existing)
**Type filter:** `mediaType IN ('VIDEO', 'LIVE_STREAM', 'SHORT_FORM')`

Key fields for video content:
| Field | Purpose |
|-------|---------|
| `title` | Video title |
| `slug` | URL identifier (`/video-centre/:slug`) |
| `description` | Video summary |
| `thumbnailUrl` | Thumbnail URL (CDN-served) |
| `playbackUrl` | CDN/VOD playback URL (provider-specific) |
| `durationSeconds` | Video duration in seconds |
| `streamStartAt` | For live streams: scheduled start time |
| `streamEndAt` | For live streams: end time |
| `rightsStatus` | PENDING_REVIEW → CLEAR (required for publication) |
| `isLowDataAvailable` | Enables low-data mode for mobile users |
| `sponsorId` | Links to sponsor for branded content |

## API Routes

### Fan (public)
| Route | Method | Description |
|-------|--------|-------------|
| `/fan/videos` | GET | List published videos |
| `/fan/videos/:slug` | GET | Video detail (includes playbackUrl) |
| `/fan/media/:id/view` | POST | Track view event (auth required) |
| `/fan/media/:id/complete` | POST | Track completion event (auth required) |

### Admin
| Route | Method | Description |
|-------|--------|-------------|
| `/admin/videos` | GET | List all videos (admin) |
| `/admin/media` | POST | Upload video metadata (body: mediaType=VIDEO) |
| `/admin/media/:id` | PATCH | Update video metadata/rights |
| `/admin/media/:id/publish` | POST | Publish video (requires CLEAR rights) |
| `/admin/media/:id/archive` | POST | Archive video |

## Experience Pages

| Route | Description |
|-------|-------------|
| `/video-centre` | Video listing with featured and category grid |
| `/video-centre/[slug]` | Video player page with meta and rights notice |
| `/admin/videos` | Admin video management (list, rights status, publish) |

## Video Storage Architecture

- **No raw video blobs in DB** — database stores metadata and URLs only
- `playbackUrl` references external CDN/VOD provider URL
- `thumbnailUrl` references CDN thumbnail
- Sprint 33 (Object Storage) will define the full storage/CDN architecture

## Engagement Tracking

`MediaEngagementEvent` model tracks:
- `VIEW` events via `POST /fan/media/:id/view`
- `COMPLETE` events via `POST /fan/media/:id/complete`
- `SHARE` events (future)
- `LIKE` events (future)

Used for editorial analytics and sponsor engagement metrics.

## Missing for Production

- [ ] VOD provider integration (AWS MediaConvert, Mux, Cloudflare Stream — ADR needed)
- [ ] Live streaming provider integration
- [ ] Video transcoding pipeline
- [ ] Adaptive bitrate streaming (HLS)
- [ ] Low-data mode transcoding
- [ ] Sponsor placement tracking in video
- [ ] Closed captions / accessibility

## Rights Rules

- All video requires `rightsStatus = CLEAR` before publication
- Broadcast rights are separate from replay rights
- Match highlights require PSL/FIFA rights agreement
- Training content: club must provide rights clearance
- Third-party footage: explicit licence required

---

*PSL INACTIVE | WALLET SANDBOX | BETA ONLY*
