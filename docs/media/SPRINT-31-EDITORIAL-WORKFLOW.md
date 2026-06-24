# Sprint 31 — Editorial Workflow

**Status:** DESIGNED | PSL INACTIVE | BETA ONLY
**Date:** 2026-06-24

## Editorial States

```
DRAFT ─────────────► INTERNAL ────────────► PUBLIC ────────────► ARCHIVED
  │                      │                     │
  │ Admin creates         │ Rights cleared       │ Admin archives
  │ PSL_ADMIN only        │ (CLEAR status)       │ or lifecycle end
  └──────────────────────┴─────────────────────┘
```

**MediaVisibility enum values:**
- `DRAFT` — not visible to anyone except creator/admin
- `INTERNAL` — visible to staff, not public
- `PUBLIC` — visible to all fans
- `PREMIUM` — visible to premium/logged-in fans only
- `ARCHIVED` — removed from public listing, retained in DB

**MediaRightsStatus enum values:**
- `PENDING_REVIEW` — default on creation
- `CLEAR` — rights confirmed (required for publication)
- `BLOCKED` — cannot be published
- `EXPIRED` — licence expired, unpublished automatically

## Content Creation Flow

### 1. Create article (PSL_ADMIN)
```
POST /admin/media
{
  "title": "Match Report: Brazil vs Germany",
  "slug": "match-report-brazil-germany-2026-06-20",
  "description": "Brazil delivered a stunning performance...",
  "mediaType": "ARTICLE",
  "contentCategory": "MATCH_HIGHLIGHTS",
  "thumbnailUrl": "https://cdn.pslone.co.za/images/bra-ger-hero.jpg"
}
```
Response includes `mediaRightsNotice` confirming rights review required.

### 2. Update content
```
PATCH /admin/media/:id
{
  "description": "Updated summary text",
  "thumbnailUrl": "https://cdn.pslone.co.za/images/bra-ger-hero-v2.jpg",
  "rightsStatus": "CLEAR"
}
```

### 3. Publish (requires CLEAR rights status)
```
POST /admin/media/:id/publish
```
Sets `visibility = PUBLIC`, `publishedAt = now()`.
Returns 400 BAD_REQUEST if rightsStatus !== CLEAR.

### 4. Archive
```
POST /admin/media/:id/archive
```
Sets `archivedAt = now()`. Article no longer appears in fan listing.

## Category Guide

| Category | Use When |
|----------|----------|
| MATCH_HIGHLIGHTS | Post-match reporting |
| INTERVIEW | Player/coach quotes |
| TRAINING | Behind-the-scenes content |
| PRESS_CONFERENCE | Pre/post match press |
| DOCUMENTARY | Long-form editorial |
| CLUB_NEWS | Club announcements |
| SPONSOR_BRANDED | Sponsored content (requires sponsor tagging) |
| FAN_CONTENT | Fan-generated articles (moderation required) |

## Rights Clearance Checklist

Before setting `rightsStatus = CLEAR`:
- [ ] All images are owned by PSL One or licensed
- [ ] Sponsor logos cleared with SponsorCampaign link
- [ ] Video footage rights confirmed (broadcast rights)
- [ ] Player image rights confirmed (POPIA-safe)
- [ ] No copyrighted third-party content

## Admin Page

URL: `/admin/news`
Actions available:
- View all articles (DRAFT/PUBLISHED/ARCHIVED)
- Create new article (links to `POST /admin/media`)
- Edit article (links to `PATCH /admin/media/:id`)
- Publish article (links to `POST /admin/media/:id/publish`)
- Archive article (links to `POST /admin/media/:id/archive`)

## Future Enhancements (Post-Beta)

- Rich text editor (TipTap/Slate integration)
- Draft preview link
- Scheduled publication
- Multi-author collaboration
- Approval workflow (editor → content head → PSL_ADMIN)
- CMS integration (Contentful/Sanity/Strapi as headless option)

---

*PSL INACTIVE | WALLET SANDBOX | BETA ONLY*
