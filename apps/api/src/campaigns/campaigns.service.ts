import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CampaignStatus, CampaignActionType, ActionValidationStatus, NotificationType, ActivityFeedType, ActivityVisibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityFeedService } from '../activity-feed/activity-feed.service';

export interface CreateCampaignDto {
  title: string;
  slug: string;
  description?: string;
  sponsorId?: string;
  clubId?: string;
  seasonId?: string;
  fixtureId?: string;
  campaignType?: string;
  startsAt: string;
  endsAt: string;
  audienceScope?: string;
  callToActionLabel?: string;
  callToActionUrl?: string;
  termsAndConditions?: string;
  maxParticipationsPerFan?: number;
  requiresWalletLinked?: boolean;
  requiresContentWatch?: boolean;
  requiresAgeConfirmation?: boolean;
}

export type UpdateCampaignDto = Partial<CreateCampaignDto>;

export interface AddActionDto {
  title: string;
  description?: string;
  actionType: string;
  requiredMediaAssetId?: string;
  pointsAwarded?: number;
  displayOrder?: number;
  isRequired?: boolean;
}

export interface CompleteActionDto {
  idempotencyKey?: string;
  metadataJson?: Record<string, unknown>;
  ageConfirmed?: boolean;
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['PENDING_APPROVAL'],
  PENDING_APPROVAL: ['APPROVED', 'REJECTED'],
  APPROVED: ['PUBLISHED'],
  PUBLISHED: ['PAUSED', 'COMPLETED'],
  PAUSED: ['PUBLISHED', 'COMPLETED'],
  COMPLETED: ['ARCHIVED'],
  REJECTED: [],
  ARCHIVED: [],
};

const MANUAL_REVIEW_ACTION_TYPES: string[] = ['SCAN_QR', 'SHARE_CONTENT'];

const FAN_SAFE_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
  sponsorId: true,
  clubId: true,
  seasonId: true,
  fixtureId: true,
  campaignType: true,
  status: true,
  startsAt: true,
  endsAt: true,
  audienceScope: true,
  creativeImageUrl: true,
  creativeVideoUrl: true,
  callToActionLabel: true,
  callToActionUrl: true,
  termsAndConditions: true,
  maxParticipationsPerFan: true,
  requiresWalletLinked: true,
  requiresContentWatch: true,
  requiresAgeConfirmation: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class CampaignsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly activityFeedService: ActivityFeedService,
  ) {}

  private assertTransition(current: string, target: string) {
    const allowed = VALID_TRANSITIONS[current] ?? [];
    if (!allowed.includes(target)) {
      throw new BadRequestException(`Invalid status transition: ${current} → ${target}`);
    }
  }

  private async getCampaignOrThrow(id: string) {
    const campaign = await this.prisma.sponsorCampaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException(`Campaign '${id}' not found`);
    return campaign;
  }

  async adminListCampaigns(filters: { status?: string; sponsorId?: string } = {}) {
    const where: Record<string, unknown> = {};
    if (filters.status) where['status'] = filters.status as CampaignStatus;
    if (filters.sponsorId) where['sponsorId'] = filters.sponsorId;
    return this.prisma.sponsorCampaign.findMany({ where: where as never, orderBy: { createdAt: 'desc' } });
  }

  async adminGetCampaign(id: string) {
    const campaign = await this.prisma.sponsorCampaign.findUnique({
      where: { id },
      include: {
        actions: { orderBy: { displayOrder: 'asc' } },
        _count: { select: { participations: true } },
      },
    });
    if (!campaign) throw new NotFoundException(`Campaign '${id}' not found`);
    return campaign;
  }

  async adminCreateCampaign(dto: CreateCampaignDto, actorUserId?: string) {
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    if (endsAt <= startsAt) {
      throw new BadRequestException('endsAt must be after startsAt');
    }

    const campaign = await this.prisma.sponsorCampaign.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.sponsorId !== undefined ? { sponsorId: dto.sponsorId } : {}),
        ...(dto.clubId !== undefined ? { clubId: dto.clubId } : {}),
        ...(dto.seasonId !== undefined ? { seasonId: dto.seasonId } : {}),
        ...(dto.fixtureId !== undefined ? { fixtureId: dto.fixtureId } : {}),
        ...(dto.campaignType !== undefined ? { campaignType: dto.campaignType as never } : {}),
        status: CampaignStatus.DRAFT,
        startsAt,
        endsAt,
        ...(dto.audienceScope !== undefined ? { audienceScope: dto.audienceScope as never } : {}),
        ...(dto.callToActionLabel !== undefined ? { callToActionLabel: dto.callToActionLabel } : {}),
        ...(dto.callToActionUrl !== undefined ? { callToActionUrl: dto.callToActionUrl } : {}),
        ...(dto.termsAndConditions !== undefined ? { termsAndConditions: dto.termsAndConditions } : {}),
        ...(dto.maxParticipationsPerFan !== undefined ? { maxParticipationsPerFan: dto.maxParticipationsPerFan } : {}),
        ...(dto.requiresWalletLinked !== undefined ? { requiresWalletLinked: dto.requiresWalletLinked } : {}),
        ...(dto.requiresContentWatch !== undefined ? { requiresContentWatch: dto.requiresContentWatch } : {}),
        ...(dto.requiresAgeConfirmation !== undefined ? { requiresAgeConfirmation: dto.requiresAgeConfirmation } : {}),
        ...(actorUserId !== undefined ? { createdByUserId: actorUserId } : {}),
      } as never,
    });

    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        actorRole: 'PSL_ADMIN',
        action: 'CAMPAIGN_CREATED',
        entityType: 'SponsorCampaign',
        entityId: campaign.id,
        route: 'POST /admin/campaigns',
        metadata: { slug: campaign.slug, title: campaign.title },
      },
    });

    return campaign;
  }

  async adminUpdateCampaign(id: string, dto: UpdateCampaignDto, actorUserId?: string) {
    await this.getCampaignOrThrow(id);

    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data['title'] = dto.title;
    if (dto.slug !== undefined) data['slug'] = dto.slug;
    if (dto.description !== undefined) data['description'] = dto.description;
    if (dto.sponsorId !== undefined) data['sponsorId'] = dto.sponsorId;
    if (dto.clubId !== undefined) data['clubId'] = dto.clubId;
    if (dto.seasonId !== undefined) data['seasonId'] = dto.seasonId;
    if (dto.fixtureId !== undefined) data['fixtureId'] = dto.fixtureId;
    if (dto.campaignType !== undefined) data['campaignType'] = dto.campaignType;
    if (dto.startsAt !== undefined) data['startsAt'] = new Date(dto.startsAt);
    if (dto.endsAt !== undefined) data['endsAt'] = new Date(dto.endsAt);
    if (dto.audienceScope !== undefined) data['audienceScope'] = dto.audienceScope;
    if (dto.callToActionLabel !== undefined) data['callToActionLabel'] = dto.callToActionLabel;
    if (dto.callToActionUrl !== undefined) data['callToActionUrl'] = dto.callToActionUrl;
    if (dto.termsAndConditions !== undefined) data['termsAndConditions'] = dto.termsAndConditions;
    if (dto.maxParticipationsPerFan !== undefined) data['maxParticipationsPerFan'] = dto.maxParticipationsPerFan;
    if (dto.requiresWalletLinked !== undefined) data['requiresWalletLinked'] = dto.requiresWalletLinked;
    if (dto.requiresContentWatch !== undefined) data['requiresContentWatch'] = dto.requiresContentWatch;
    if (dto.requiresAgeConfirmation !== undefined) data['requiresAgeConfirmation'] = dto.requiresAgeConfirmation;

    const updated = await this.prisma.sponsorCampaign.update({ where: { id }, data: data as never });

    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        actorRole: 'PSL_ADMIN',
        action: 'CAMPAIGN_UPDATED',
        entityType: 'SponsorCampaign',
        entityId: id,
        route: `PATCH /admin/campaigns/${id}`,
        metadata: { fields: Object.keys(data) },
      },
    });

    return updated;
  }

  async adminAddAction(campaignId: string, dto: AddActionDto, actorUserId?: string) {
    await this.getCampaignOrThrow(campaignId);

    const action = await this.prisma.campaignAction.create({
      data: {
        campaignId,
        title: dto.title,
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        actionType: dto.actionType as CampaignActionType,
        ...(dto.requiredMediaAssetId !== undefined ? { requiredMediaAssetId: dto.requiredMediaAssetId } : {}),
        pointsAwarded: dto.pointsAwarded ?? 0,
        displayOrder: dto.displayOrder ?? 0,
        isRequired: dto.isRequired ?? true,
      },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        actorRole: 'PSL_ADMIN',
        action: 'CAMPAIGN_ACTION_ADDED',
        entityType: 'SponsorCampaign',
        entityId: campaignId,
        route: `POST /admin/campaigns/${campaignId}/actions`,
        metadata: { actionId: action.id, actionType: dto.actionType },
      },
    });

    return action;
  }

  async adminSubmitForApproval(id: string, actorUserId?: string) {
    const campaign = await this.getCampaignOrThrow(id);
    this.assertTransition(campaign.status, 'PENDING_APPROVAL');

    const updated = await this.prisma.sponsorCampaign.update({
      where: { id },
      data: { status: CampaignStatus.PENDING_APPROVAL },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        actorRole: 'PSL_ADMIN',
        action: 'CAMPAIGN_SUBMITTED_FOR_APPROVAL',
        entityType: 'SponsorCampaign',
        entityId: id,
        route: `POST /admin/campaigns/${id}/submit-for-approval`,
        metadata: {},
      },
    });

    return updated;
  }

  async adminApproveCampaign(id: string, actorUserId?: string) {
    const campaign = await this.getCampaignOrThrow(id);
    this.assertTransition(campaign.status, 'APPROVED');

    const now = new Date();
    const updated = await this.prisma.sponsorCampaign.update({
      where: { id },
      data: {
        status: CampaignStatus.APPROVED,
        approvedByUserId: actorUserId ?? null,
        approvedAt: now,
      },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        actorRole: 'PSL_ADMIN',
        action: 'CAMPAIGN_APPROVED',
        entityType: 'SponsorCampaign',
        entityId: id,
        route: `POST /admin/campaigns/${id}/approve`,
        metadata: {},
      },
    });

    return updated;
  }

  async adminRejectCampaign(id: string, reason: string, actorUserId?: string) {
    const campaign = await this.getCampaignOrThrow(id);
    this.assertTransition(campaign.status, 'REJECTED');

    const updated = await this.prisma.sponsorCampaign.update({
      where: { id },
      data: { status: CampaignStatus.REJECTED },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        actorRole: 'PSL_ADMIN',
        action: 'CAMPAIGN_REJECTED',
        entityType: 'SponsorCampaign',
        entityId: id,
        route: `POST /admin/campaigns/${id}/reject`,
        metadata: { reason },
      },
    });

    return updated;
  }

  async adminPublishCampaign(id: string, actorUserId?: string) {
    const campaign = await this.getCampaignOrThrow(id);
    this.assertTransition(campaign.status, 'PUBLISHED');

    const now = new Date();
    if (now >= campaign.endsAt) {
      throw new BadRequestException('Cannot publish campaign: current time is past endsAt');
    }

    const updated = await this.prisma.sponsorCampaign.update({
      where: { id },
      data: { status: CampaignStatus.PUBLISHED, publishedAt: now },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        actorRole: 'PSL_ADMIN',
        action: 'CAMPAIGN_PUBLISHED',
        entityType: 'SponsorCampaign',
        entityId: id,
        route: `POST /admin/campaigns/${id}/publish`,
        metadata: {},
      },
    });

    return updated;
  }

  async adminPauseCampaign(id: string, actorUserId?: string) {
    const campaign = await this.getCampaignOrThrow(id);
    this.assertTransition(campaign.status, 'PAUSED');

    const now = new Date();
    const updated = await this.prisma.sponsorCampaign.update({
      where: { id },
      data: { status: CampaignStatus.PAUSED, pausedAt: now },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        actorRole: 'PSL_ADMIN',
        action: 'CAMPAIGN_PAUSED',
        entityType: 'SponsorCampaign',
        entityId: id,
        route: `POST /admin/campaigns/${id}/pause`,
        metadata: {},
      },
    });

    return updated;
  }

  async adminResumeCampaign(id: string, actorUserId?: string) {
    const campaign = await this.getCampaignOrThrow(id);
    this.assertTransition(campaign.status, 'PUBLISHED');

    const updated = await this.prisma.sponsorCampaign.update({
      where: { id },
      data: { status: CampaignStatus.PUBLISHED },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        actorRole: 'PSL_ADMIN',
        action: 'CAMPAIGN_RESUMED',
        entityType: 'SponsorCampaign',
        entityId: id,
        route: `POST /admin/campaigns/${id}/resume`,
        metadata: {},
      },
    });

    return updated;
  }

  async adminCompleteCampaign(id: string, actorUserId?: string) {
    const campaign = await this.getCampaignOrThrow(id);
    this.assertTransition(campaign.status, 'COMPLETED');

    const now = new Date();
    const updated = await this.prisma.sponsorCampaign.update({
      where: { id },
      data: { status: CampaignStatus.COMPLETED, completedAt: now },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        actorRole: 'PSL_ADMIN',
        action: 'CAMPAIGN_COMPLETED',
        entityType: 'SponsorCampaign',
        entityId: id,
        route: `POST /admin/campaigns/${id}/complete`,
        metadata: {},
      },
    });

    return updated;
  }

  async adminArchiveCampaign(id: string, actorUserId?: string) {
    const campaign = await this.getCampaignOrThrow(id);
    this.assertTransition(campaign.status, 'ARCHIVED');

    const now = new Date();
    const updated = await this.prisma.sponsorCampaign.update({
      where: { id },
      data: { status: CampaignStatus.ARCHIVED, archivedAt: now },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        actorRole: 'PSL_ADMIN',
        action: 'CAMPAIGN_ARCHIVED',
        entityType: 'SponsorCampaign',
        entityId: id,
        route: `POST /admin/campaigns/${id}/archive`,
        metadata: {},
      },
    });

    return updated;
  }

  async listFanCampaigns(filters: { clubId?: string; seasonId?: string } = {}) {
    const now = new Date();
    const where: Record<string, unknown> = {
      status: CampaignStatus.PUBLISHED,
      startsAt: { lte: now },
      endsAt: { gte: now },
    };
    if (filters.clubId) where['clubId'] = filters.clubId;
    if (filters.seasonId) where['seasonId'] = filters.seasonId;

    return this.prisma.sponsorCampaign.findMany({
      where: where as never,
      select: FAN_SAFE_SELECT,
      orderBy: { startsAt: 'desc' },
    });
  }

  async getFanCampaign(slug: string) {
    const campaign = await this.prisma.sponsorCampaign.findFirst({
      where: { slug, status: CampaignStatus.PUBLISHED },
      select: {
        ...FAN_SAFE_SELECT,
        actions: {
          select: {
            id: true,
            title: true,
            description: true,
            actionType: true,
            pointsAwarded: true,
            displayOrder: true,
            isRequired: true,
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
    if (!campaign) throw new NotFoundException(`Campaign '${slug}' not found`);
    return campaign;
  }

  async startParticipation(campaignId: string, fanUserId: string, ageConfirmed?: boolean) {
    const campaign = await this.prisma.sponsorCampaign.findUnique({ where: { id: campaignId } });
    if (!campaign || campaign.status !== CampaignStatus.PUBLISHED) {
      throw new BadRequestException('Campaign is not available for participation');
    }

    const now = new Date();
    if (now < campaign.startsAt || now > campaign.endsAt) {
      throw new BadRequestException('Campaign is not within its active time window');
    }

    if (campaign.requiresAgeConfirmation && ageConfirmed !== true) {
      throw new BadRequestException('Age confirmation is required to participate in this campaign');
    }

    if (campaign.maxParticipationsPerFan) {
      const existingCount = await this.prisma.fanCampaignParticipation.count({
        where: {
          campaignId,
          fanUserId,
          status: { notIn: ['DISQUALIFIED'] as never },
        },
      });
      if (existingCount >= campaign.maxParticipationsPerFan) {
        throw new BadRequestException('Maximum participations per fan exceeded');
      }
    }

    const existing = await this.prisma.fanCampaignParticipation.findUnique({
      where: { campaignId_fanUserId: { campaignId, fanUserId } },
    });
    if (existing) return existing;

    const participation = await this.prisma.fanCampaignParticipation.create({
      data: { campaignId, fanUserId },
    });

    void this.notificationsService.createInAppNotification({
      userId: fanUserId,
      type: NotificationType.CAMPAIGN_STARTED,
      title: 'Campaign joined',
      body: `You have joined: ${campaign.title}`,
      sourceType: 'CampaignParticipation:started',
      sourceId: participation.id,
    }).catch(() => null);

    void this.activityFeedService.createUserActivity(fanUserId, {
      type: ActivityFeedType.CAMPAIGN_STARTED,
      title: 'Campaign joined',
      body: `Joined campaign: ${campaign.title}`,
      visibility: ActivityVisibility.PRIVATE,
      sourceType: 'CampaignParticipation:started',
      sourceId: participation.id,
    }).catch(() => null);

    return participation;
  }

  async completeAction(
    campaignId: string,
    campaignActionId: string,
    fanUserId: string,
    dto: CompleteActionDto,
  ) {
    // Step 1: Resolve participation
    const participation = await this.prisma.fanCampaignParticipation.findUnique({
      where: { campaignId_fanUserId: { campaignId, fanUserId } },
    });
    if (!participation) throw new NotFoundException('Participation not found');

    // Step 2: Validate the action belongs to the campaign
    const action = await this.prisma.campaignAction.findUnique({ where: { id: campaignActionId } });
    if (!action) throw new NotFoundException('Campaign action not found');
    if (action.campaignId !== campaignId) {
      throw new BadRequestException('Action does not belong to this campaign');
    }

    const participationId = participation.id;

    // Step 3: Check idempotency BEFORE terminal-state gate
    if (dto.idempotencyKey) {
      const byKey = await this.prisma.fanCampaignActionCompletion.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (byKey) {
        const currentParticipation = await this.prisma.fanCampaignParticipation.findUnique({
          where: { id: participationId },
        });
        return { completion: byKey, participation: currentParticipation, idempotent: true };
      }
    }

    const byUnique = await this.prisma.fanCampaignActionCompletion.findUnique({
      where: { participationId_campaignActionId: { participationId, campaignActionId } },
    });
    if (byUnique) {
      const currentParticipation = await this.prisma.fanCampaignParticipation.findUnique({
        where: { id: participationId },
      });
      return { completion: byUnique, participation: currentParticipation, idempotent: true };
    }

    // Step 4: Only reject terminal state for truly new mutations
    if (['COMPLETED', 'REWARDED', 'DISQUALIFIED'].includes(participation.status)) {
      throw new BadRequestException(`Participation is in terminal status: ${participation.status}`);
    }

    const validationStatus: ActionValidationStatus = MANUAL_REVIEW_ACTION_TYPES.includes(action.actionType)
      ? ActionValidationStatus.MANUAL_REVIEW
      : ActionValidationStatus.VALID;

    const completion = await this.prisma.fanCampaignActionCompletion.create({
      data: {
        participationId,
        campaignActionId,
        fanUserId,
        validationStatus,
        ...(dto.idempotencyKey !== undefined ? { idempotencyKey: dto.idempotencyKey } : {}),
        ...(dto.metadataJson !== undefined ? { metadataJson: dto.metadataJson as never } : {}),
      },
    });

    const [requiredActions, validCompletions] = await Promise.all([
      this.prisma.campaignAction.findMany({
        where: { campaignId, isRequired: true },
        select: { id: true },
      }),
      this.prisma.fanCampaignActionCompletion.findMany({
        where: {
          participationId,
          validationStatus: ActionValidationStatus.VALID,
          campaignAction: { isRequired: true },
        },
        select: { campaignActionId: true },
      }),
    ]);

    const completedRequiredIds = new Set(validCompletions.map(c => c.campaignActionId));
    const allRequired = requiredActions.length > 0 && requiredActions.every(a => completedRequiredIds.has(a.id));

    if (allRequired) {
      await this.prisma.fanCampaignParticipation.update({
        where: { id: participationId },
        data: { status: 'COMPLETED' as never, completedAt: new Date() },
      });

      void this.notificationsService.createInAppNotification({
        userId: fanUserId,
        type: NotificationType.CAMPAIGN_COMPLETED,
        title: 'Campaign completed',
        body: 'You have completed all required actions for the campaign.',
        sourceType: 'CampaignParticipation:completed',
        sourceId: participationId,
      }).catch(() => null);

      void this.activityFeedService.createUserActivity(fanUserId, {
        type: ActivityFeedType.CAMPAIGN_COMPLETED,
        title: 'Campaign completed',
        body: 'Completed all required campaign actions.',
        visibility: ActivityVisibility.PRIVATE,
        sourceType: 'CampaignParticipation:completed',
        sourceId: participationId,
      }).catch(() => null);
    } else if (participation.status === 'STARTED') {
      await this.prisma.fanCampaignParticipation.update({
        where: { id: participationId },
        data: { status: 'IN_PROGRESS' as never },
      });
    }

    return completion;
  }

  async getProgress(campaignId: string, fanUserId: string) {
    const participation = await this.prisma.fanCampaignParticipation.findUnique({
      where: { campaignId_fanUserId: { campaignId, fanUserId } },
    });
    if (!participation) return null;

    const [totalRequiredActions, completedActions] = await Promise.all([
      this.prisma.campaignAction.count({
        where: { campaignId, isRequired: true },
      }),
      this.prisma.fanCampaignActionCompletion.count({
        where: {
          participationId: participation.id,
          validationStatus: ActionValidationStatus.VALID,
          campaignAction: { isRequired: true },
        },
      }),
    ]);

    const percentage = totalRequiredActions > 0
      ? Math.min(100, Math.round((completedActions / totalRequiredActions) * 100))
      : 0;

    return {
      participationId: participation.id,
      status: participation.status,
      completedActions,
      totalRequiredActions,
      percentage,
    };
  }

  async adminListParticipations(campaignId: string, status?: string) {
    return this.prisma.fanCampaignParticipation.findMany({
      where: {
        campaignId,
        ...(status ? { status: status as never } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
