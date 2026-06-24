import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotImplementedException } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { OBJECT_STORAGE_PROVIDER, ObjectStorageProvider, PutObjectResult } from './object-storage.interface';
import { LocalDiskAdapter } from './adapters/local-disk.adapter';
import { S3CompatibleAdapter } from './adapters/s3-compatible.adapter';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import * as os from 'os';

// ── FileUploadService unit tests ──────────────────────────────────────────────

describe('FileUploadService', () => {
  let service: FileUploadService;
  let mockProvider: ObjectStorageProvider;

  const mockResult: PutObjectResult = { url: 'http://localhost:3000/uploads/test.jpg', key: 'test.jpg', sizeBytes: 100 };

  beforeEach(async () => {
    mockProvider = {
      putObject: vi.fn().mockResolvedValue(mockResult),
      getPublicUrl: vi.fn().mockReturnValue('http://localhost:3000/uploads/test.jpg'),
      deleteObject: vi.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      providers: [
        FileUploadService,
        { provide: OBJECT_STORAGE_PROVIDER, useValue: mockProvider },
      ],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('uploads a valid JPEG file', async () => {
    const buf = Buffer.from('fake-image-data');
    const result = await service.uploadFile('photo.jpg', buf, 'image/jpeg');
    expect(result).toMatchObject({ url: expect.any(String) });
    expect(mockProvider.putObject).toHaveBeenCalledOnce();
  });

  it('uploads a valid PNG file', async () => {
    const buf = Buffer.from('fake-png');
    const result = await service.uploadFile('logo.png', buf, 'image/png');
    expect(result.url).toBeTruthy();
  });

  it('rejects unsupported content type', async () => {
    const buf = Buffer.from('data');
    await expect(service.uploadFile('file.exe', buf, 'application/octet-stream')).rejects.toThrow(
      BadRequestException,
    );
    expect(mockProvider.putObject).not.toHaveBeenCalled();
  });

  it('rejects files exceeding 50 MB', async () => {
    const bigBuf = Buffer.alloc(51 * 1024 * 1024);
    await expect(service.uploadFile('big.mp4', bigBuf, 'video/mp4')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('delegates getPublicUrl to provider', () => {
    const url = service.getPublicUrl('my-key.jpg');
    expect(url).toBe('http://localhost:3000/uploads/test.jpg');
    expect(mockProvider.getPublicUrl).toHaveBeenCalledWith('my-key.jpg');
  });

  it('delegates deleteFile to provider', async () => {
    await service.deleteFile('my-key.jpg');
    expect(mockProvider.deleteObject).toHaveBeenCalledWith('my-key.jpg');
  });

  it('returns list of allowed content types', () => {
    const types = service.getAllowedTypes();
    expect(types).toContain('image/jpeg');
    expect(types).toContain('image/png');
    expect(types).toContain('video/mp4');
  });

  it('returns max size of 50 MB', () => {
    expect(service.getMaxSizeBytes()).toBe(50 * 1024 * 1024);
  });
});

// ── LocalDiskAdapter unit tests ───────────────────────────────────────────────

describe('LocalDiskAdapter', () => {
  let adapter: LocalDiskAdapter;
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(os.tmpdir(), `psl-test-${Date.now()}`);
    mkdirSync(tmpDir, { recursive: true });
    adapter = new LocalDiskAdapter(tmpDir, 'http://localhost:3000/uploads');
  });

  afterEach(() => {
    // cleanup: not strictly required — OS cleans /tmp
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('putObject writes file and returns url', async () => {
    const buf = Buffer.from('hello world');
    const result = await adapter.putObject('test-file.txt', buf, 'text/plain');
    expect(result.url).toContain('test-file.txt');
    expect(result.sizeBytes).toBe(buf.length);
    expect(existsSync(join(tmpDir, 'test-file.txt'))).toBe(true);
  });

  it('putObject sanitizes special characters in key', async () => {
    const buf = Buffer.from('data');
    const result = await adapter.putObject('my file/with spaces.jpg', buf, 'image/jpeg');
    expect(result.key).not.toContain('/');
    expect(result.key).not.toContain(' ');
  });

  it('getPublicUrl returns url without writing', () => {
    const url = adapter.getPublicUrl('my-image.jpg');
    expect(url).toMatch(/my-image\.jpg/);
    expect(url).toMatch(/^http/);
  });

  it('deleteObject removes an existing file', async () => {
    const buf = Buffer.from('deletable');
    await adapter.putObject('to-delete.txt', buf, 'text/plain');
    const path = join(tmpDir, 'to-delete.txt');
    expect(existsSync(path)).toBe(true);
    await adapter.deleteObject('to-delete.txt');
    expect(existsSync(path)).toBe(false);
  });

  it('deleteObject is no-op if file does not exist', async () => {
    await expect(adapter.deleteObject('nonexistent.txt')).resolves.toBeUndefined();
  });
});

// ── S3CompatibleAdapter unit tests ───────────────────────────────────────────

describe('S3CompatibleAdapter (skeleton)', () => {
  let adapter: S3CompatibleAdapter;

  beforeEach(() => {
    adapter = new S3CompatibleAdapter();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('putObject throws NotImplementedException', async () => {
    await expect(
      adapter.putObject('key.jpg', Buffer.from('data'), 'image/jpeg'),
    ).rejects.toThrow(NotImplementedException);
  });

  it('deleteObject throws NotImplementedException', async () => {
    await expect(adapter.deleteObject('key.jpg')).rejects.toThrow(NotImplementedException);
  });

  it('getPublicUrl returns a URL string (CDN base)', () => {
    const url = adapter.getPublicUrl('test-image.jpg');
    expect(url).toContain('test-image.jpg');
    expect(typeof url).toBe('string');
  });
});
