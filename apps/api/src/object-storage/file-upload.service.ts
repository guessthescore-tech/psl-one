import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { ObjectStorageProvider, OBJECT_STORAGE_PROVIDER, PutObjectResult } from './object-storage.interface';

const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'application/pdf',
]);

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

@Injectable()
export class FileUploadService {
  constructor(
    @Inject(OBJECT_STORAGE_PROVIDER)
    private readonly storage: ObjectStorageProvider,
  ) {}

  async uploadFile(
    fileName: string,
    data: Buffer,
    contentType: string,
  ): Promise<PutObjectResult> {
    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      throw new BadRequestException(`Unsupported content type: ${contentType}`);
    }
    if (data.length > MAX_SIZE_BYTES) {
      throw new BadRequestException(`File exceeds maximum size of ${MAX_SIZE_BYTES} bytes`);
    }

    const timestamp = Date.now();
    const ext = fileName.split('.').pop() ?? 'bin';
    const key = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    return this.storage.putObject(key, data, contentType);
  }

  getPublicUrl(key: string): string {
    return this.storage.getPublicUrl(key);
  }

  async deleteFile(key: string): Promise<void> {
    return this.storage.deleteObject(key);
  }

  getAllowedTypes(): string[] {
    return [...ALLOWED_CONTENT_TYPES];
  }

  getMaxSizeBytes(): number {
    return MAX_SIZE_BYTES;
  }
}
