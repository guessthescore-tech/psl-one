# Sprint 32 — Sponsor Asset Management

## Overview

Sponsor asset management exposes the existing `MediaAsset` model to sponsors via the portal.
No new model is required — MediaAsset already has a `sponsorId` FK from Sprint 37.

## Model: MediaAsset (relevant fields)

| Field          | Type     | Notes                                       |
|----------------|----------|---------------------------------------------|
| id             | UUID     | Primary key                                 |
| sponsorId      | String?  | FK → sponsors.id (nullable)                 |
| title          | String   | Asset title                                 |
| mediaType      | Enum     | VIDEO, ARTICLE, LIVE_STREAM, SHORT_FORM     |
| url            | String   | CDN URL (no raw blobs in DB)                |
| thumbnailUrl   | String?  | CDN thumbnail URL                           |
| playbackUrl    | String?  | Video playback CDN URL                      |
| archivedAt     | DateTime?| Soft-delete timestamp                       |

## Storage Model

Assets are identified by CDN URL — no binary blobs stored in the database.
File upload and CDN management is out of scope for Sprint 32 (deferred to Sprint 33: Object Storage/CDN).

## API Route

| Method | Path                        | Auth              | Description                         |
|--------|-----------------------------|-------------------|-------------------------------------|
| GET    | /sponsor-portal/assets      | SPONSOR/PSL_ADMIN | List active assets for sponsor      |

## Access Control

- SPONSOR role: sees only assets for their active SponsorMembership-linked sponsor.
- PSL_ADMIN: may pass `?sponsorId=` to inspect any sponsor's assets.
- Cross-sponsor access denied with `CROSS_SPONSOR_ACCESS_DENIED` (403).
- `archivedAt: null` filter ensures soft-deleted assets are excluded.

## Safety Constraints

- No binary storage in this sprint — CDN URL model only.
- No production deployment or real CDN provisioning.
- See Sprint 33 doc for planned object storage architecture.
