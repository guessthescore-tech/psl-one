export interface PutObjectResult {
  url: string;
  key: string;
  sizeBytes: number;
}

export interface ObjectStorageProvider {
  /**
   * Store an object and return its public URL.
   * No binary blobs are stored in the database — only the returned URL is persisted.
   */
  putObject(key: string, data: Buffer, contentType: string): Promise<PutObjectResult>;

  /**
   * Return the public URL for a stored object without re-uploading.
   */
  getPublicUrl(key: string): string;

  /**
   * Remove an object from storage.
   */
  deleteObject(key: string): Promise<void>;
}

export const OBJECT_STORAGE_PROVIDER = Symbol('OBJECT_STORAGE_PROVIDER');
