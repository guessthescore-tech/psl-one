/**
 * S3CompatibleAdapter — Sprint 33 skeleton
 *
 * NOT deployed. NOT connected to real AWS. Placeholder for production CDN path.
 * All methods throw NotImplementedException until AWS credentials + bucket are configured.
 *
 * To activate: set OBJECT_STORAGE_ADAPTER=s3 and supply AWS_BUCKET, AWS_REGION,
 * AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY via SSM / Secrets Manager (never .env).
 *
 * See ADR-035 for the full provider boundary decision.
 */
import { Injectable, NotImplementedException } from '@nestjs/common';
import { ObjectStorageProvider, PutObjectResult } from '../object-storage.interface';

@Injectable()
export class S3CompatibleAdapter implements ObjectStorageProvider {
  private readonly bucket: string;
  private readonly region: string;
  private readonly cdnBaseUrl: string;

  constructor() {
    this.bucket = process.env['AWS_BUCKET'] ?? '';
    this.region = process.env['AWS_REGION'] ?? 'af-south-1';
    this.cdnBaseUrl =
      process.env['CDN_BASE_URL'] ??
      `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
  }

  async putObject(_key: string, _data: Buffer, _contentType: string): Promise<PutObjectResult> {
    throw new NotImplementedException(
      'S3CompatibleAdapter.putObject: not yet implemented. Set OBJECT_STORAGE_ADAPTER=local for dev. See ADR-035.',
    );
  }

  getPublicUrl(key: string): string {
    return `${this.cdnBaseUrl}/${key}`;
  }

  async deleteObject(_key: string): Promise<void> {
    throw new NotImplementedException(
      'S3CompatibleAdapter.deleteObject: not yet implemented. Set OBJECT_STORAGE_ADAPTER=local for dev. See ADR-035.',
    );
  }
}
