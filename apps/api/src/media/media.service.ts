import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MediaType,
  MediaContentCategory,
  MediaVisibility,
  MediaRightsStatus,
  MediaEngagementEventType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CacheInvalidationService } from '../api-cache/cache-invalidation.service';

export interface CreateMediaDto {
  title: string;
  slug: string;
  description?: string;
  mediaType: string;
  contentCategory?: string;
  clubId?: string;
  thumbnailUrl?: string;
  playbackUrl?: string;
  durationSeconds?: number;
}

export interface UpdateMediaDto {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  playbackUrl?: string;
  rightsStatus?: string;
  isFeatured?: boolean;
  isLowDataAvailable?: boolean;
}

export interface ListPublicMediaFilters {
  clubId?: string;
  mediaType?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface AdminListMediaFilters {
  visibility?: string;
  mediaType?: string;
}

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheInvalidationService: CacheInvalidationService,
  ) {}

  async listPublicMedia(filters: ListPublicMediaFilters) {
    const where: Prisma.MediaAssetWhereInput = {
      visibility: MediaVisibility.PUBLIC,
      rightsStatus: MediaRightsStatus.CLEAR,
      archivedAt: null,
    };

    if (filters.clubId) where.clubId = filters.clubId;
    if (filters.mediaType) where.mediaType = filters.mediaType as MediaType;
    if (filters.category) where.contentCategory = filters.category as MediaContentCategory;

    return this.prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit ?? 20,
      skip: filters.offset ?? 0,
    });
  }

  async getPublicMediaDetail(slug: string) {
    const asset = await this.prisma.mediaAsset.findFirst({
      where: {
        slug,
        visibility: MediaVisibility.PUBLIC,
        rightsStatus: MediaRightsStatus.CLEAR,
        archivedAt: null,
      },
    });

    if (!asset) throw new NotFoundException(`Media asset not found: ${slug}`);
    return {
      ...asset,
      safetyNote:
        'Media availability does not imply that PSL One owns streaming rights. Public availability requires an approved rights status.',
    };
  }

  async listClubMedia(clubId: string) {
    return this.prisma.mediaAsset.findMany({
      where: {
        clubId,
        visibility: MediaVisibility.PUBLIC,
        rightsStatus: MediaRightsStatus.CLEAR,
        archivedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async adminListMedia(filters: AdminListMediaFilters) {
    const where: Prisma.MediaAssetWhereInput = {};

    if (filters.visibility) where.visibility = filters.visibility as MediaVisibility;
    if (filters.mediaType) where.mediaType = filters.mediaType as MediaType;

    return this.prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async adminGetMedia(id: string) {
    const asset = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException(`Media asset not found: ${id}`);
    return asset;
  }

  async adminCreateMedia(dto: CreateMediaDto, actorUserId?: string) {
    const asset = await this.prisma.mediaAsset.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        mediaType: dto.mediaType as MediaType,
        ...(dto.contentCategory !== undefined ? { contentCategory: dto.contentCategory as MediaContentCategory } : {}),
        ...(dto.clubId !== undefined ? { clubId: dto.clubId } : {}),
        ...(dto.thumbnailUrl !== undefined ? { thumbnailUrl: dto.thumbnailUrl } : {}),
        ...(dto.playbackUrl !== undefined ? { playbackUrl: dto.playbackUrl } : {}),
        ...(dto.durationSeconds !== undefined ? { durationSeconds: dto.durationSeconds } : {}),
        visibility: MediaVisibility.DRAFT,
        rightsStatus: MediaRightsStatus.PENDING_REVIEW,
        ...(actorUserId !== undefined ? { createdByUserId: actorUserId } : {}),
      },
    });

    await this.writeAuditLog('MEDIA_CREATED', 'MediaAsset', asset.id, actorUserId);
    this.cacheInvalidationService.invalidateMedia();

    return {
      ...asset,
      mediaRightsNotice:
        'Media availability does not imply that PSL One owns streaming rights. Public availability requires an approved rights status.',
    };
  }

  async adminUpdateMedia(id: string, dto: UpdateMediaDto, actorUserId?: string) {
    await this.adminGetMedia(id);

    const data: Prisma.MediaAssetUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.thumbnailUrl !== undefined) data.thumbnailUrl = dto.thumbnailUrl;
    if (dto.playbackUrl !== undefined) data.playbackUrl = dto.playbackUrl;
    if (dto.rightsStatus !== undefined) data.rightsStatus = dto.rightsStatus as MediaRightsStatus;
    if (dto.isFeatured !== undefined) data.isFeatured = dto.isFeatured;
    if (dto.isLowDataAvailable !== undefined) data.isLowDataAvailable = dto.isLowDataAvailable;

    const updated = await this.prisma.mediaAsset.update({ where: { id }, data });

    await this.writeAuditLog('MEDIA_UPDATED', 'MediaAsset', id, actorUserId);
    this.cacheInvalidationService.invalidateMedia();
    return updated;
  }

  async adminPublishMedia(id: string, actorUserId?: string) {
    const asset = await this.adminGetMedia(id);

    if (asset.rightsStatus !== MediaRightsStatus.CLEAR) {
      throw new BadRequestException(
        'Media cannot be published without CLEAR rights status',
      );
    }

    const updated = await this.prisma.mediaAsset.update({
      where: { id },
      data: {
        visibility: MediaVisibility.PUBLIC,
        publishedAt: new Date(),
      },
    });

    await this.writeAuditLog('MEDIA_PUBLISHED', 'MediaAsset', id, actorUserId);
    this.cacheInvalidationService.invalidateMedia();
    return updated;
  }

  async adminArchiveMedia(id: string, actorUserId?: string) {
    await this.adminGetMedia(id);

    const updated = await this.prisma.mediaAsset.update({
      where: { id },
      data: {
        visibility: MediaVisibility.ARCHIVED,
        archivedAt: new Date(),
      },
    });

    await this.writeAuditLog('MEDIA_ARCHIVED', 'MediaAsset', id, actorUserId);
    this.cacheInvalidationService.invalidateMedia();
    return updated;
  }

  async recordView(mediaAssetId: string, fanUserId: string, idempotencyKey?: string) {
    return this.recordEngagementEvent(mediaAssetId, fanUserId, MediaEngagementEventType.VIEW, idempotencyKey);
  }

  async recordCompletion(mediaAssetId: string, fanUserId: string, idempotencyKey?: string) {
    return this.recordEngagementEvent(mediaAssetId, fanUserId, MediaEngagementEventType.COMPLETE, idempotencyKey);
  }

  private async recordEngagementEvent(
    mediaAssetId: string,
    fanUserId: string,
    eventType: MediaEngagementEventType,
    idempotencyKey?: string,
  ) {
    try {
      await this.prisma.mediaEngagementEvent.create({
        data: {
          mediaAssetId,
          fanUserId,
          eventType,
          ...(idempotencyKey !== undefined ? { idempotencyKey } : {}),
        },
      });
      return { recorded: true };
    } catch (err: unknown) {
      if (
        idempotencyKey &&
        err instanceof Error &&
        err.message.includes('Unique constraint')
      ) {
        return { recorded: false };
      }
      throw err;
    }
  }

  private async writeAuditLog(
    action: string,
    entityType: string,
    entityId: string,
    actorUserId?: string,
  ) {
    await this.prisma.adminAuditLog.create({
      data: {
        actorRole: 'PSL_ADMIN',
        action,
        entityType,
        entityId,
        route: `/admin/media`,
        metadata: Prisma.JsonNull,
        ...(actorUserId !== undefined ? { actorUserId } : {}),
      },
    });
  }
}
