import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MediaService } from './media.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { CacheInvalidationService } from '../api-cache/cache-invalidation.service';

const MEDIA_ASSET = {
  id: 'media-1',
  slug: 'test-video',
  title: 'Test Video',
  visibility: 'PUBLIC',
  rightsStatus: 'CLEAR',
  mediaType: 'VIDEO',
  contentCategory: 'MATCH',
  archivedAt: null,
  publishedAt: null,
  createdAt: new Date('2026-06-01'),
};

const makePrisma = () => ({
  mediaAsset: {
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({
      id: 'media-1',
      slug: 'test',
      visibility: 'DRAFT',
      rightsStatus: 'PENDING_REVIEW',
      mediaType: 'ARTICLE',
      contentCategory: 'OTHER',
    }),
    update: vi.fn().mockResolvedValue({ id: 'media-1' }),
  },
  mediaEngagementEvent: {
    create: vi.fn().mockResolvedValue({ id: 'event-1' }),
  },
  adminAuditLog: { create: vi.fn().mockResolvedValue({ id: 'audit-1' }) },
});

const makeCacheInvalidation = () => ({
  invalidateMedia: vi.fn(),
}) as unknown as CacheInvalidationService;

describe('MediaService', () => {
  let service: MediaService;
  let prisma: ReturnType<typeof makePrisma>;
  let cacheInvalidation: ReturnType<typeof makeCacheInvalidation>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrisma();
    cacheInvalidation = makeCacheInvalidation();
    service = new MediaService(prisma as unknown as PrismaService, cacheInvalidation);
  });

  // ── listPublicMedia ───────────────────────────────────────────────────

  describe('listPublicMedia', () => {
    it('calls findMany with visibility=PUBLIC and rightsStatus=CLEAR', async () => {
      await service.listPublicMedia({});
      expect(prisma.mediaAsset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            visibility: 'PUBLIC',
            rightsStatus: 'CLEAR',
          }),
        }),
      );
    });

    it('excludes archived assets by setting archivedAt: null in where clause', async () => {
      await service.listPublicMedia({});
      expect(prisma.mediaAsset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ archivedAt: null }),
        }),
      );
    });

    it('returns the assets returned by prisma', async () => {
      prisma.mediaAsset.findMany.mockResolvedValue([MEDIA_ASSET]);
      const result = await service.listPublicMedia({});
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('media-1');
    });

    it('applies clubId filter when provided', async () => {
      await service.listPublicMedia({ clubId: 'club-abc' });
      expect(prisma.mediaAsset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ clubId: 'club-abc' }),
        }),
      );
    });

    it('defaults take=20 and skip=0 when no pagination given', async () => {
      await service.listPublicMedia({});
      expect(prisma.mediaAsset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20, skip: 0 }),
      );
    });
  });

  // ── getPublicMediaDetail ──────────────────────────────────────────────

  describe('getPublicMediaDetail', () => {
    it('returns asset when found with PUBLIC + CLEAR', async () => {
      prisma.mediaAsset.findFirst.mockResolvedValue(MEDIA_ASSET);
      const result = await service.getPublicMediaDetail('test-video');
      expect(result.slug).toBe('test-video');
    });

    it('calls findFirst with visibility=PUBLIC, rightsStatus=CLEAR, and archivedAt: null', async () => {
      prisma.mediaAsset.findFirst.mockResolvedValue(MEDIA_ASSET);
      await service.getPublicMediaDetail('test-video');
      expect(prisma.mediaAsset.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            slug: 'test-video',
            visibility: 'PUBLIC',
            rightsStatus: 'CLEAR',
            archivedAt: null,
          }),
        }),
      );
    });

    it('throws NotFoundException when asset is not found', async () => {
      prisma.mediaAsset.findFirst.mockResolvedValue(null);
      await expect(service.getPublicMediaDetail('missing')).rejects.toThrow(NotFoundException);
    });
  });

  // ── adminCreateMedia ──────────────────────────────────────────────────

  describe('adminCreateMedia', () => {
    const createDto = { title: 'New Video', slug: 'new-video', mediaType: 'VIDEO' };

    it('creates the media asset via prisma', async () => {
      await service.adminCreateMedia(createDto, 'admin-1');
      expect(prisma.mediaAsset.create).toHaveBeenCalledOnce();
    });

    it('writes an AdminAuditLog entry with action MEDIA_CREATED', async () => {
      await service.adminCreateMedia(createDto, 'admin-1');
      expect(prisma.adminAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'MEDIA_CREATED', entityType: 'MediaAsset' }),
        }),
      );
    });

    it('invalidates media caches after create', async () => {
      await service.adminCreateMedia(createDto, 'admin-1');
      expect(cacheInvalidation.invalidateMedia).toHaveBeenCalledOnce();
    });

    it('includes mediaRightsNotice in the response', async () => {
      const result = await service.adminCreateMedia(createDto);
      expect(result).toHaveProperty('mediaRightsNotice');
      expect(typeof result.mediaRightsNotice).toBe('string');
    });

    it('sets initial visibility=DRAFT and rightsStatus=PENDING_REVIEW', async () => {
      await service.adminCreateMedia(createDto, 'admin-1');
      expect(prisma.mediaAsset.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            visibility: 'DRAFT',
            rightsStatus: 'PENDING_REVIEW',
          }),
        }),
      );
    });
  });

  // ── adminPublishMedia ─────────────────────────────────────────────────

  describe('adminPublishMedia', () => {
    it('sets visibility=PUBLIC when rightsStatus=CLEAR', async () => {
      prisma.mediaAsset.findUnique.mockResolvedValue({ ...MEDIA_ASSET, rightsStatus: 'CLEAR' });
      prisma.mediaAsset.update.mockResolvedValue({ ...MEDIA_ASSET, visibility: 'PUBLIC' });

      const result = await service.adminPublishMedia('media-1', 'admin-1');
      expect(prisma.mediaAsset.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ visibility: 'PUBLIC' }),
        }),
      );
      expect(result.visibility).toBe('PUBLIC');
    });

    it('writes AdminAuditLog with action MEDIA_PUBLISHED', async () => {
      prisma.mediaAsset.findUnique.mockResolvedValue({ ...MEDIA_ASSET, rightsStatus: 'CLEAR' });
      await service.adminPublishMedia('media-1', 'admin-1');
      expect(prisma.adminAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'MEDIA_PUBLISHED' }),
        }),
      );
    });

    it('invalidates media caches after publish', async () => {
      prisma.mediaAsset.findUnique.mockResolvedValue({ ...MEDIA_ASSET, rightsStatus: 'CLEAR' });
      await service.adminPublishMedia('media-1', 'admin-1');
      expect(cacheInvalidation.invalidateMedia).toHaveBeenCalledOnce();
    });

    it('throws BadRequestException when rightsStatus is not CLEAR', async () => {
      prisma.mediaAsset.findUnique.mockResolvedValue({
        ...MEDIA_ASSET,
        rightsStatus: 'PENDING_REVIEW',
      });
      await expect(service.adminPublishMedia('media-1', 'admin-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── adminArchiveMedia ─────────────────────────────────────────────────

  describe('adminArchiveMedia', () => {
    it('sets visibility=ARCHIVED and archivedAt on update', async () => {
      prisma.mediaAsset.findUnique.mockResolvedValue(MEDIA_ASSET);
      prisma.mediaAsset.update.mockResolvedValue({
        ...MEDIA_ASSET,
        visibility: 'ARCHIVED',
        archivedAt: new Date(),
      });

      await service.adminArchiveMedia('media-1', 'admin-1');
      expect(prisma.mediaAsset.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            visibility: 'ARCHIVED',
            archivedAt: expect.any(Date),
          }),
        }),
      );
    });

    it('writes AdminAuditLog with action MEDIA_ARCHIVED', async () => {
      prisma.mediaAsset.findUnique.mockResolvedValue(MEDIA_ASSET);
      await service.adminArchiveMedia('media-1', 'admin-1');
      expect(prisma.adminAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'MEDIA_ARCHIVED' }),
        }),
      );
    });

    it('invalidates media caches after archive', async () => {
      prisma.mediaAsset.findUnique.mockResolvedValue(MEDIA_ASSET);
      await service.adminArchiveMedia('media-1', 'admin-1');
      expect(cacheInvalidation.invalidateMedia).toHaveBeenCalledOnce();
    });
  });

  // ── recordView ────────────────────────────────────────────────────────

  describe('recordView', () => {
    it('creates a MediaEngagementEvent with eventType=VIEW', async () => {
      await service.recordView('media-1', 'fan-1');
      expect(prisma.mediaEngagementEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ eventType: 'VIEW', mediaAssetId: 'media-1', fanUserId: 'fan-1' }),
        }),
      );
    });

    it('returns { recorded: true } on success', async () => {
      const result = await service.recordView('media-1', 'fan-1');
      expect(result).toEqual({ recorded: true });
    });

    it('returns { recorded: false } silently on P2002 duplicate idempotency key', async () => {
      const err = new Error('Unique constraint failed on the fields: (`idempotencyKey`)');
      prisma.mediaEngagementEvent.create.mockRejectedValue(err);
      const result = await service.recordView('media-1', 'fan-1', 'idem-key-abc');
      expect(result).toEqual({ recorded: false });
    });

    it('re-throws non-idempotency errors', async () => {
      const err = new Error('DB connection failed');
      prisma.mediaEngagementEvent.create.mockRejectedValue(err);
      await expect(service.recordView('media-1', 'fan-1', 'idem-key')).rejects.toThrow(
        'DB connection failed',
      );
    });
  });

  // ── recordCompletion ──────────────────────────────────────────────────

  describe('recordCompletion', () => {
    it('creates a MediaEngagementEvent with eventType=COMPLETE', async () => {
      await service.recordCompletion('media-1', 'fan-1');
      expect(prisma.mediaEngagementEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ eventType: 'COMPLETE' }),
        }),
      );
    });

    it('returns { recorded: true } on success', async () => {
      const result = await service.recordCompletion('media-1', 'fan-1');
      expect(result).toEqual({ recorded: true });
    });
  });

  // ── security: fan methods filter to PUBLIC + CLEAR ─────────────────────

  describe('security: fan-facing methods enforce PUBLIC+CLEAR filter', () => {
    it('listPublicMedia always includes visibility: PUBLIC in where clause', async () => {
      await service.listPublicMedia({ clubId: 'club-1', mediaType: 'VIDEO' });
      const call = prisma.mediaAsset.findMany.mock.calls[0]![0] as { where: Record<string, unknown> };
      expect(call.where.visibility).toBe('PUBLIC');
      expect(call.where.rightsStatus).toBe('CLEAR');
    });

    it('getPublicMediaDetail always includes visibility: PUBLIC in where clause', async () => {
      prisma.mediaAsset.findFirst.mockResolvedValue(MEDIA_ASSET);
      await service.getPublicMediaDetail('test-video');
      const call = prisma.mediaAsset.findFirst.mock.calls[0]![0] as { where: Record<string, unknown> };
      expect(call.where.visibility).toBe('PUBLIC');
      expect(call.where.rightsStatus).toBe('CLEAR');
    });
  });
});
