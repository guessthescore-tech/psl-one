import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FanValueSourceType, FanValueType, NotificationType, ActivityFeedType, ActivityVisibility, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FanValueLedgerService } from '../fan-value/fan-value-ledger.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityFeedService } from '../activity-feed/activity-feed.service';

export interface CreateRewardDefinitionDto {
  title: string;
  description?: string;
  rewardType: string;
  sponsorId?: string;
  clubId?: string;
  campaignId?: string;
  pointsAmount?: number;
  displayValue?: string;
  displayCurrency?: string;
  inventoryLimit?: number;
  providerReference?: string;
  expiresAt?: string;
  termsAndConditions?: string;
}

export interface UpdateRewardDefinitionDto extends Partial<CreateRewardDefinitionDto> {
  isActive?: boolean;
}

export interface IssueRewardDto {
  rewardDefinitionId: string;
  fanUserId: string;
  campaignId?: string;
  idempotencyKey?: string;
  expiresAt?: string;
  metadataJson?: Record<string, unknown>;
}

const FAN_SAFE_REWARD_SELECT = {
  id: true,
  rewardDefinitionId: true,
  fanUserId: true,
  campaignId: true,
  status: true,
  issuedAt: true,
  claimedAt: true,
  redeemedAt: true,
  expiresAt: true,
  metadataJson: true,
  createdAt: true,
  updatedAt: true,
} as const;

const FAN_SAFE_DEFINITION_SELECT = {
  id: true,
  title: true,
  description: true,
  rewardType: true,
  sponsorId: true,
  clubId: true,
  campaignId: true,
  pointsAmount: true,
  displayValue: true,
  displayCurrency: true,
  expiresAt: true,
  termsAndConditions: true,
  isActive: true,
} as const;

@Injectable()
export class CampaignRewardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fanValueLedgerService: FanValueLedgerService,
    private readonly notificationsService: NotificationsService,
    private readonly activityFeedService: ActivityFeedService,
  ) {}

  async adminCreateRewardDefinition(dto: CreateRewardDefinitionDto, actorUserId?: string) {
    const definition = await this.prisma.rewardDefinition.create({
      data: {
        title: dto.title,
        rewardType: dto.rewardType as never,
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.sponsorId !== undefined ? { sponsorId: dto.sponsorId } : {}),
        ...(dto.clubId !== undefined ? { clubId: dto.clubId } : {}),
        ...(dto.campaignId !== undefined ? { campaignId: dto.campaignId } : {}),
        ...(dto.pointsAmount !== undefined ? { pointsAmount: dto.pointsAmount } : {}),
        ...(dto.displayValue !== undefined ? { displayValue: dto.displayValue } : {}),
        ...(dto.displayCurrency !== undefined ? { displayCurrency: dto.displayCurrency } : {}),
        ...(dto.inventoryLimit !== undefined ? { inventoryLimit: dto.inventoryLimit } : {}),
        ...(dto.providerReference !== undefined ? { providerReference: dto.providerReference } : {}),
        ...(dto.expiresAt !== undefined ? { expiresAt: new Date(dto.expiresAt) } : {}),
        ...(dto.termsAndConditions !== undefined ? { termsAndConditions: dto.termsAndConditions } : {}),
      },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        actorRole: 'PSL_ADMIN',
        action: 'REWARD_DEFINITION_CREATED',
        entityType: 'RewardDefinition',
        entityId: definition.id,
        route: '/admin/reward-definitions',
        metadata: Prisma.JsonNull,
        ...(actorUserId !== undefined ? { actorUserId } : {}),
      },
    });

    return definition;
  }

  async adminUpdateRewardDefinition(id: string, dto: UpdateRewardDefinitionDto, actorUserId?: string) {
    const existing = await this.prisma.rewardDefinition.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Reward definition not found');

    const updated = await this.prisma.rewardDefinition.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.rewardType !== undefined ? { rewardType: dto.rewardType as never } : {}),
        ...(dto.sponsorId !== undefined ? { sponsorId: dto.sponsorId } : {}),
        ...(dto.clubId !== undefined ? { clubId: dto.clubId } : {}),
        ...(dto.campaignId !== undefined ? { campaignId: dto.campaignId } : {}),
        ...(dto.pointsAmount !== undefined ? { pointsAmount: dto.pointsAmount } : {}),
        ...(dto.displayValue !== undefined ? { displayValue: dto.displayValue } : {}),
        ...(dto.displayCurrency !== undefined ? { displayCurrency: dto.displayCurrency } : {}),
        ...(dto.inventoryLimit !== undefined ? { inventoryLimit: dto.inventoryLimit } : {}),
        ...(dto.providerReference !== undefined ? { providerReference: dto.providerReference } : {}),
        ...(dto.expiresAt !== undefined ? { expiresAt: new Date(dto.expiresAt) } : {}),
        ...(dto.termsAndConditions !== undefined ? { termsAndConditions: dto.termsAndConditions } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        actorRole: 'PSL_ADMIN',
        action: 'REWARD_DEFINITION_UPDATED',
        entityType: 'RewardDefinition',
        entityId: id,
        route: `/admin/reward-definitions/${id}`,
        metadata: Prisma.JsonNull,
        ...(actorUserId !== undefined ? { actorUserId } : {}),
      },
    });

    return updated;
  }

  async adminListRewardDefinitions(filters: { rewardType?: string; isActive?: boolean; sponsorId?: string } = {}) {
    return this.prisma.rewardDefinition.findMany({
      where: {
        ...(filters.rewardType !== undefined ? { rewardType: filters.rewardType as never } : {}),
        ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
        ...(filters.sponsorId !== undefined ? { sponsorId: filters.sponsorId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async adminListFanRewards(filters: { fanUserId?: string; status?: string; campaignId?: string } = {}) {
    return this.prisma.fanReward.findMany({
      where: {
        ...(filters.fanUserId !== undefined ? { fanUserId: filters.fanUserId } : {}),
        ...(filters.status !== undefined ? { status: filters.status as never } : {}),
        ...(filters.campaignId !== undefined ? { campaignId: filters.campaignId } : {}),
      },
      select: FAN_SAFE_REWARD_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async issueReward(dto: IssueRewardDto) {
    if (dto.idempotencyKey) {
      const existing = await this.prisma.fanReward.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existing) return existing;
    }

    const fanReward = await this.prisma.$transaction(async (tx) => {
      const definition = await tx.rewardDefinition.findUnique({
        where: { id: dto.rewardDefinitionId },
      });
      if (!definition) throw new NotFoundException('Reward definition not found');

      if (definition.inventoryLimit !== null && definition.inventoryIssued >= definition.inventoryLimit) {
        throw new BadRequestException('Reward inventory exhausted');
      }

      const reward = await tx.fanReward.create({
        data: {
          rewardDefinitionId: dto.rewardDefinitionId,
          fanUserId: dto.fanUserId,
          status: 'ISSUED',
          ...(dto.campaignId !== undefined ? { campaignId: dto.campaignId } : {}),
          ...(dto.idempotencyKey !== undefined ? { idempotencyKey: dto.idempotencyKey } : {}),
          ...(dto.expiresAt !== undefined ? { expiresAt: new Date(dto.expiresAt) } : {}),
          ...(dto.metadataJson !== undefined ? { metadataJson: dto.metadataJson as Prisma.InputJsonValue } : {}),
        },
      });

      await tx.rewardDefinition.update({
        where: { id: dto.rewardDefinitionId },
        data: { inventoryIssued: { increment: 1 } },
      });

      return { reward, definition };
    });

    const { reward, definition } = fanReward;

    if ((definition.rewardType as string) === 'FAN_VALUE_POINTS') {
      await this.fanValueLedgerService.postEntry({
        userId: dto.fanUserId,
        sourceType: FanValueSourceType.CAMPAIGN_REWARD,
        sourceId: reward.id,
        idempotencyKey: `campaign-reward:${reward.id}`,
        points: definition.pointsAmount ?? 0,
        valueType: FanValueType.CAMPAIGN_POINTS,
        description: `Campaign reward: ${definition.title}`,
        metadataJson: {
          rewardDefinitionId: definition.id,
          campaignId: dto.campaignId,
          nonFinancial: true,
          noCashValue: true,
          fanValuePointsAreNotMoney: true,
        },
      });
    }

    void this.notificationsService.createInAppNotification({
      userId: dto.fanUserId,
      type: NotificationType.REWARD_ISSUED,
      title: 'Reward issued',
      body: `You have been issued: ${definition.title}`,
      sourceType: 'FanReward',
      sourceId: reward.id,
    }).catch(() => null);

    void this.activityFeedService.createUserActivity(dto.fanUserId, {
      type: ActivityFeedType.REWARD_ISSUED,
      title: 'Reward issued',
      body: `Reward issued: ${definition.title}`,
      visibility: ActivityVisibility.PRIVATE,
      sourceType: 'FanReward',
      sourceId: reward.id,
    }).catch(() => null);

    return reward;
  }

  async claimReward(fanRewardId: string, fanUserId: string) {
    const fanReward = await this.prisma.fanReward.findUnique({ where: { id: fanRewardId } });
    if (!fanReward) throw new NotFoundException('Reward not found');
    if (fanReward.fanUserId !== fanUserId) throw new ForbiddenException('Access denied');
    if (fanReward.status !== 'ISSUED') throw new BadRequestException('Reward is not in ISSUED status');
    if (fanReward.expiresAt && fanReward.expiresAt < new Date()) throw new BadRequestException('Reward has expired');

    return this.prisma.fanReward.update({
      where: { id: fanRewardId },
      data: { status: 'CLAIMED', claimedAt: new Date() },
      select: FAN_SAFE_REWARD_SELECT,
    });
  }

  async sandboxRedeemReward(fanRewardId: string, fanUserId: string) {
    const fanReward = await this.prisma.fanReward.findUnique({
      where: { id: fanRewardId },
      include: { rewardDefinition: { select: { rewardType: true } } },
    });
    if (!fanReward) throw new NotFoundException('Reward not found');
    if (fanReward.fanUserId !== fanUserId) throw new ForbiddenException('Access denied');
    if (fanReward.status !== 'CLAIMED') throw new BadRequestException('Reward is not in CLAIMED status');
    if (fanReward.expiresAt && fanReward.expiresAt < new Date()) throw new BadRequestException('Reward has expired');

    const rewardType = fanReward.rewardDefinition.rewardType as string;

    const updated = await this.prisma.fanReward.update({
      where: { id: fanRewardId },
      data: rewardType === 'WALLET_CREDIT_PENDING_PROVIDER'
        ? { status: 'PROVIDER_PENDING' }
        : { status: 'REDEEMED', redeemedAt: new Date() },
      select: FAN_SAFE_REWARD_SELECT,
    });

    return { ...updated, sandboxOnly: true, noRealValueTransferred: true };
  }

  async fanListRewards(fanUserId: string) {
    return this.prisma.fanReward.findMany({
      where: { fanUserId },
      select: {
        ...FAN_SAFE_REWARD_SELECT,
        rewardDefinition: { select: FAN_SAFE_DEFINITION_SELECT },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async fanGetReward(id: string, fanUserId: string) {
    const reward = await this.prisma.fanReward.findUnique({
      where: { id },
      select: {
        ...FAN_SAFE_REWARD_SELECT,
        rewardDefinition: { select: FAN_SAFE_DEFINITION_SELECT },
      },
    });
    if (!reward) throw new NotFoundException('Reward not found');
    if (reward.fanUserId !== fanUserId) throw new ForbiddenException('Access denied');
    return reward;
  }
}
