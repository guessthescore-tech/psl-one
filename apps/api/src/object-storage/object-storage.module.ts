/**
 * ObjectStorageModule — Sprint 33
 *
 * Selects an ObjectStorageProvider adapter based on OBJECT_STORAGE_ADAPTER env var:
 *   'local' (default) → LocalDiskAdapter (dev/test)
 *   's3'             → S3CompatibleAdapter (skeleton; NOT_IMPLEMENTED until AWS creds supplied)
 *
 * No binary blobs are stored in the database. Only the returned CDN URL is persisted.
 * See ADR-035 for provider boundary decision.
 */
import { Module } from '@nestjs/common';
import { LocalDiskAdapter } from './adapters/local-disk.adapter';
import { S3CompatibleAdapter } from './adapters/s3-compatible.adapter';
import { FileUploadService } from './file-upload.service';
import { OBJECT_STORAGE_PROVIDER } from './object-storage.interface';

const adapterProvider = {
  provide: OBJECT_STORAGE_PROVIDER,
  useFactory: (): LocalDiskAdapter | S3CompatibleAdapter => {
    const adapter = process.env['OBJECT_STORAGE_ADAPTER'] ?? 'local';
    if (adapter === 's3') return new S3CompatibleAdapter();
    return new LocalDiskAdapter();
  },
};

@Module({
  providers: [adapterProvider, FileUploadService],
  exports: [FileUploadService],
})
export class ObjectStorageModule {}
