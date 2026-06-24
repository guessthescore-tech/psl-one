# Sprint 33 — Object Storage Architecture

## Overview

PSL One uses a provider-abstracted object storage layer for media assets (images, videos, PDFs).
Binary blobs are never stored in the database. Only the resulting CDN URL is persisted in the
`MediaAsset.url` / `thumbnailUrl` / `playbackUrl` fields.

## Architecture

```
FileUploadService
  └─ ObjectStorageProvider (interface)
       ├─ LocalDiskAdapter  (OBJECT_STORAGE_ADAPTER=local, default)
       └─ S3CompatibleAdapter  (OBJECT_STORAGE_ADAPTER=s3, skeleton — NOT_IMPLEMENTED)
```

## Adapter Selection

The `ObjectStorageModule` reads `OBJECT_STORAGE_ADAPTER` at startup:

| Value    | Adapter                | Status         | When to use           |
|----------|------------------------|----------------|-----------------------|
| `local`  | `LocalDiskAdapter`     | IMPLEMENTED    | Local dev / test      |
| `s3`     | `S3CompatibleAdapter`  | NOT_IMPLEMENTED | Production (skeleton) |

Default: `local`.

## LocalDiskAdapter

- Writes files to `LOCAL_UPLOAD_DIR` (default: `/tmp/psl-uploads`).
- Returns URLs based on `LOCAL_UPLOAD_BASE_URL` (default: `http://localhost:3000/uploads`).
- Key sanitization: non-alphanumeric characters replaced with `_`.
- Safe for dev and test; not for production (no persistence across restarts).

## S3CompatibleAdapter (skeleton)

- Throws `NotImplementedException` for `putObject` and `deleteObject`.
- `getPublicUrl` returns a constructed CDN URL (no I/O).
- Requires `AWS_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` via SSM.
- Never commit real AWS credentials. Use SSM Parameter Store or Secrets Manager.
- See ADR-035 for the full provider boundary decision.

## FileUploadService

- Validates content type against allowlist (JPEG, PNG, WebP, SVG, MP4, PDF).
- Enforces 50 MB maximum file size.
- Generates a timestamped key: `{timestamp}-{sanitized_filename}`.
- Delegates to the injected `ObjectStorageProvider`.

## Safety Constraints

- No AWS deployment in this sprint.
- No real S3 bucket created.
- No production CDN wiring.
- No binary blobs in the database.
- Credentials must never be committed to git.
