# Sprint 33 — File Upload API Design

## Current State (Sprint 33)

The `FileUploadService` and `ObjectStorageModule` are implemented but not yet wired to
HTTP routes. Sprint 34+ will expose upload endpoints when the S3CompatibleAdapter is activated.

## Planned Upload Flow

```
POST /admin/media/upload
  Content-Type: multipart/form-data
  Authorization: Bearer <PSL_ADMIN_JWT>

  → FileUploadService.uploadFile(fileName, buffer, contentType)
  → ObjectStorageProvider.putObject(key, buffer, contentType)
  → Returns { url: "https://cdn.psl.co.za/..." }

POST /admin/media  (existing)
  { title, url: "<from upload>", mediaType, ... }
```

## Allowed Content Types

| Type               | Extension | Max Size |
|--------------------|-----------|----------|
| `image/jpeg`       | .jpg      | 50 MB    |
| `image/png`        | .png      | 50 MB    |
| `image/webp`       | .webp     | 50 MB    |
| `image/svg+xml`    | .svg      | 50 MB    |
| `video/mp4`        | .mp4      | 50 MB    |
| `application/pdf`  | .pdf      | 50 MB    |

## Key Generation

```
{unix_timestamp_ms}-{sanitized_filename}
Example: 1750000000000-club-banner_png
```

## No Blobs in DB

The database stores only the resulting URL string.
Binary data flows: Client → API → Storage → CDN URL → DB.

## Pre-Signed URL Pattern (future, S3)

For large files, the preferred pattern is:
1. Client requests a pre-signed upload URL from the API.
2. Client uploads directly to S3 (bypassing the API for the binary payload).
3. Client notifies the API of the completed upload.
4. API creates the MediaAsset record with the CDN URL.

This pattern is not yet implemented — Sprint 33 provides the foundation.

## RBAC

- Upload requires `PSL_ADMIN` role minimum.
- Club portal uploads will require `CLUB_ADMIN` role (scoped to club).
- Sponsor portal uploads will require `SPONSOR` role (scoped to sponsor).
- Fans cannot upload files directly (no fan upload route).
