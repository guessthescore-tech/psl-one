# ADR-035 — Object Storage Provider Boundary

**Status:** Accepted  
**Date:** 2026-06-24  
**Sprint:** Sprint 33

## Context

PSL One stores media assets (club images, sponsor logos, match highlights, editorial images).
Binary blobs must not live in the PostgreSQL database. The platform needs a clean interface
that works in local development without AWS credentials and can later be swapped to S3/CloudFront
for production.

## Decision

We introduce an `ObjectStorageProvider` interface with two implementations:

1. **LocalDiskAdapter** — writes to the local filesystem (`/tmp/psl-uploads`). Used for dev/test.
2. **S3CompatibleAdapter** — skeleton that throws `NotImplementedException`. Activated via
   `OBJECT_STORAGE_ADAPTER=s3` env var. Requires real AWS credentials (never committed to git).

The `ObjectStorageModule` selects the adapter at startup based on the env var.
Binary blobs never enter the database — only the resulting URL string is persisted.

## Consequences

### Positive

- Zero-friction local development (no AWS account needed).
- Clean adapter boundary: swapping to S3 requires implementing one adapter, not touching service code.
- Enforced 50 MB file size limit and allowlisted content types at the `FileUploadService` layer.
- Future-ready for pre-signed URL pattern (client uploads directly to S3).

### Negative

- `S3CompatibleAdapter` is a skeleton — any attempt to use it in staging/production will fail visibly
  (`NotImplementedException`) until real SDK integration is completed.
- Local upload files don't survive process restarts (acceptable for dev/test).

## Rejected Alternatives

### A — Store binary blobs in PostgreSQL (BYTEA)

**Rejected.** Kills database performance at scale. Violates existing `MediaAsset` design (URL-only).
Impossible to serve via CDN without additional middleware.

### B — Direct S3 SDK with no abstraction layer

**Rejected.** Couples every service that handles media to AWS SDK. Makes local dev require real AWS
credentials. No interface for testing without network.

### C — Upload to third-party CDN directly from frontend

**Rejected.** Exposes storage credentials to the browser. Bypasses RBAC and audit logging.
Violates "no business logic in frontend" project rule.

## Implementation Notes

- Module: `apps/api/src/object-storage/object-storage.module.ts`
- Interface: `ObjectStorageProvider` in `object-storage.interface.ts`
- Adapters: `adapters/local-disk.adapter.ts`, `adapters/s3-compatible.adapter.ts`
- Service: `FileUploadService` in `file-upload.service.ts`
- Next step: implement `S3CompatibleAdapter` with AWS SDK v3 when staging CDN is provisioned.

## Related

- ADR-029: Free-plan beta staging profile (existing infrastructure context)
- Sprint 33 docs: `docs/storage/` directory
- `MediaAsset` model: URL-only design (no blobs since Sprint 31)
