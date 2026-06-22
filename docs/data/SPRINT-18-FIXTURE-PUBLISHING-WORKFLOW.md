# Sprint 18 — Fixture Publishing Workflow

## Overview

Fixtures imported from Parse PSL are written to the database with `isPublished = false` by default. The Fixture Publishing Workflow allows admins to review imported fixtures and bulk-publish them, making them visible to fans.

**Critical distinction:** Publishing fixtures is completely separate from PSL season activation. Publishing sets the `isPublished` flag on individual `Fixture` records. It does NOT touch `Season.isActive`. The PSL season remains inactive until an owner explicitly triggers activation via the Season Switching admin action.

All gameplay is points-only. No real-money functionality exists.

---

## Architecture

### API Layer

**Module:** `FixtureImportModule` (extended in Sprint 18)

**New service:** `FixturePublicationService` (`apps/api/src/fixture-import/fixture-publication.service.ts`)

**New controller:** `FixturePublicationController` (`apps/api/src/fixture-import/fixture-publication.controller.ts`)

**Routes:**

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/admin/fixtures/imported` | JWT + ADMIN | List imported fixtures with filters |
| POST | `/admin/fixtures/publish` | JWT + ADMIN | Bulk publish or unpublish fixtures |

---

## GET /admin/fixtures/imported

Returns a paginated list of fixtures with provenance metadata.

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `providerSource` | string (optional) | Filter by provider source (e.g. `parse-psl`) |
| `isPublished` | boolean (optional) | Filter by publication status |
| `seasonId` | string (optional) | Filter by season ID |
| `limit` | number (optional, default 50) | Page size |
| `offset` | number (optional, default 0) | Page offset |

**Response shape:**

```json
{
  "fixtures": [
    {
      "id": "clu...",
      "seasonId": "clu...",
      "homeTeamName": "Kaizer Chiefs",
      "awayTeamName": "Orlando Pirates",
      "kickoffAt": "2026-08-02T15:00:00.000Z",
      "status": "SCHEDULED",
      "isPublished": false,
      "providerSource": "parse-psl",
      "providerFixtureId": "ext-123",
      "externalId": "ext-123",
      "sourceUrl": "https://api.parse.bot/fixtures/...",
      "importedAt": "2026-06-22T10:00:00.000Z",
      "lastSyncedAt": "2026-06-22T10:00:00.000Z"
    }
  ],
  "total": 240
}
```

---

## POST /admin/fixtures/publish

Bulk publish or unpublish a list of fixtures.

**Request body:**

```json
{
  "fixtureIds": ["clu...", "clu..."],
  "publish": true,
  "confirmPublication": true
}
```

**Guard requirements:**
- `confirmPublication` must be `true` — will throw 400 if absent or false
- `fixtureIds` must be non-empty — will throw 400 if empty

**Idempotency:**
- Fixtures already in the target state are skipped (counted in `skipped`)
- Unknown fixture IDs produce a warning but do not cause an error

**Response shape:**

```json
{
  "requested": 10,
  "changed": 8,
  "skipped": 2,
  "published": 8,
  "unpublished": 0,
  "errors": [],
  "warnings": []
}
```

---

## Audit Log

Two audit events are written for each successful publish operation:

1. `FIXTURE_PUBLICATION_ATTEMPTED` — written before the DB mutation
2. `FIXTURE_PUBLICATION_COMPLETED` — written after the DB mutation with result counts

Audit log failure is wrapped in try/catch and never blocks the publication operation.

---

## Frontend

**Page:** `/admin/fixtures/imported`

**File:** `apps/experience/src/app/admin/fixtures/imported/page.tsx`

Features:
- Filter by provider source and publication status
- Paginated fixture table with bulk checkbox selection
- Select-all toggle
- Publish / Unpublish radio toggle
- `confirmPublication` checkbox (required to enable submit)
- Result banner with changed/skipped/published/unpublished counts
- Yellow warning banner: "Publishing is SEPARATE from PSL activation"
- Blue info banner: "Source may be empty until psl.co.za publishes 2026/27 fixtures (~July/August 2026)"

---

## Security

- Controller uses `@Roles('ADMIN')` — only admin JWT holders can access these routes
- The Parse PSL provider key (`PARSE_API_KEY`) is never referenced in this service, controller, or frontend
- `NEXT_PUBLIC_PARSE_API_KEY` is explicitly forbidden across the entire codebase

---

## Source-Empty Behaviour

If Parse PSL has not yet published 2026/27 fixtures (expected ~July/August 2026), the list endpoint returns an empty array. The admin page shows an informational banner rather than an error.

---

## Related Documents

- [SPRINT-18-PSL-ACTIVATION-PREFLIGHT.md](./SPRINT-18-PSL-ACTIVATION-PREFLIGHT.md)
- [SPRINT-18-FIXTURE-PUBLICATION-AUDIT.md](./SPRINT-18-FIXTURE-PUBLICATION-AUDIT.md)
- [SPRINT-18-ADMIN-SMOKE-RUNBOOK.md](./SPRINT-18-ADMIN-SMOKE-RUNBOOK.md)
