import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { ObjectStorageProvider, PutObjectResult } from '../object-storage.interface';

const DEFAULT_UPLOAD_DIR = process.env['LOCAL_UPLOAD_DIR'] ?? '/tmp/psl-uploads';
const LOCAL_BASE_URL = process.env['LOCAL_UPLOAD_BASE_URL'] ?? 'http://localhost:3000/uploads';

@Injectable()
export class LocalDiskAdapter implements ObjectStorageProvider {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(uploadDir = DEFAULT_UPLOAD_DIR, baseUrl = LOCAL_BASE_URL) {
    this.uploadDir = uploadDir;
    this.baseUrl = baseUrl;
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async putObject(key: string, data: Buffer, _contentType: string): Promise<PutObjectResult> {
    const safeName = key.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = join(this.uploadDir, safeName);
    writeFileSync(filePath, data);
    return {
      url: `${this.baseUrl}/${safeName}`,
      key: safeName,
      sizeBytes: data.length,
    };
  }

  getPublicUrl(key: string): string {
    const safeName = key.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${this.baseUrl}/${safeName}`;
  }

  async deleteObject(key: string): Promise<void> {
    const safeName = key.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = join(this.uploadDir, safeName);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }
}
