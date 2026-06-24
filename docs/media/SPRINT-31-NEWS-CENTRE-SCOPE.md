# Sprint 31 — News Centre Scope

**Status:** IMPLEMENTED | PSL INACTIVE | BETA ONLY
**Date:** 2026-06-24

## Overview

The News Centre provides editorial content management for PSL One. Articles are stored as
`MediaAsset` records with `mediaType = ARTICLE`, leveraging the existing MediaModule
with no new database migration required.

## Data Model

**Model:** `MediaAsset` (existing, migration 37)
**Type filter:** `mediaType = ARTICLE`

Key fields for news articles:
| Field | Purpose |
|-------|---------|
| `title` | Article headline |
| `slug` | URL-safe identifier (`/news/:slug`) |
| `description` | Summary/standfirst |
| `contentCategory` | CLUB_NEWS, MATCH_HIGHLIGHTS, INTERVIEW, etc. |
| `thumbnailUrl` | Hero image URL (CDN-served, not DB blob) |
| `visibility` | DRAFT → INTERNAL → PUBLIC → ARCHIVED |
| `rightsStatus` | PENDING_REVIEW → CLEAR (required for publication) |
| `isFeatured` | Pins to top of news feed |
| `publishedAt` | Publication timestamp (set on `POST /admin/media/:id/publish`) |
| `createdByUserId` | Author tracking |

## API Routes

### Fan (public)
| Route | Method | Description |
|-------|--------|-------------|
| `/fan/news` | GET | List published articles (mediaType=ARTICLE) |
| `/fan/news/:slug` | GET | Article detail |
| `/fan/media` | GET | Generic media listing (accepts mediaType filter) |
| `/fan/clubs/:clubId/media` | GET | Club-specific articles |

### Admin (PSL_ADMIN only)
| Route | Method | Description |
|-------|--------|-------------|
| `/admin/news` | GET | List all articles (admin view) |
| `/admin/media` | POST | Create article (body: mediaType=ARTICLE) |
| `/admin/media/:id` | GET | Article detail |
| `/admin/media/:id` | PATCH | Update article |
| `/admin/media/:id/publish` | POST | Publish (requires CLEAR rights) |
| `/admin/media/:id/archive` | POST | Archive article |

## Editorial Workflow

```
DRAFT → (editorial review) → INTERNAL → (rights cleared) → PUBLIC → (lifecycle) → ARCHIVED
```

See `SPRINT-31-EDITORIAL-WORKFLOW.md` for full editorial process.

## Experience Pages

| Route | Description |
|-------|-------------|
| `/news` | News listing with featured/latest sections, category filter |
| `/news/[slug]` | Article detail with hero image, body, related articles |
| `/admin/news` | Admin news management (list, create, publish, archive) |

## Content Rules

- No copyrighted images without rights clearance
- All images served via CDN URL (thumbnailUrl field) — not stored in DB as blobs
- rightsStatus must be CLEAR before `POST /admin/media/:id/publish` succeeds
- PSL INACTIVE: WC2026 content only during beta

## Missing for Production

- [ ] Rich text body field (currently description only — needs editorial CMS integration)
- [ ] Image upload (currently URL-only — see Sprint 33 Object Storage)
- [ ] Author profile model (currently userId reference only)
- [ ] Related articles algorithm
- [ ] SEO meta (title/description fields exist but no sitemap generation)
- [ ] RSS feed endpoint

---

*PSL INACTIVE | WALLET SANDBOX | BETA ONLY*
