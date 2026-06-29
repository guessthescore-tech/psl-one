import { Injectable, Logger } from '@nestjs/common';
import { CampaignStatus, CampaignTriggerType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CampaignTriggerService {
  private readonly logger = new Logger(CampaignTriggerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async fireLineupConfirmed(fixtureId: string): Promise<void> {
    await this._fire(fixtureId, CampaignTriggerType.LINEUP_CONFIRMED);
  }

  async fireMatchStarted(fixtureId: string): Promise<void> {
    await this._fire(fixtureId, CampaignTriggerType.MATCH_STARTED);
  }

  async fireGoalScored(fixtureId: string, sourceEventId: string): Promise<void> {
    await this._fire(fixtureId, CampaignTriggerType.GOAL_SCORED, sourceEventId);
  }

  async fireHalfTime(fixtureId: string): Promise<void> {
    await this._fire(fixtureId, CampaignTriggerType.HALF_TIME);
  }

  async fireFullTime(fixtureId: string): Promise<void> {
    await this._fire(fixtureId, CampaignTriggerType.FULL_TIME);
  }

  async firePlayerOfMatchVoteOpen(fixtureId: string): Promise<void> {
    await this._fire(fixtureId, CampaignTriggerType.PLAYER_OF_MATCH_VOTE_OPEN);
  }

  async fireCleanSheetCompleted(fixtureId: string): Promise<void> {
    await this._fire(fixtureId, CampaignTriggerType.CLEAN_SHEET_COMPLETED);
  }

  async fireFantasyMilestone(campaignId: string, idempotencyKey: string, metadata: Record<string, unknown>): Promise<void> {
    const now = new Date();
    const campaign = await this.prisma.sponsorCampaign.findUnique({
      where: { id: campaignId },
      select: { id: true, status: true, startsAt: true, endsAt: true },
    });
    if (!campaign || campaign.status !== CampaignStatus.PUBLISHED) return;
    if (campaign.startsAt > now || campaign.endsAt < now) return;
    await this._upsertTrigger(campaignId, undefined, CampaignTriggerType.FANTASY_MILESTONE, idempotencyKey, undefined, now, metadata);
  }

  async firePredictionResultAvailable(fixtureId: string): Promise<void> {
    await this._fire(fixtureId, CampaignTriggerType.PREDICTION_RESULT_AVAILABLE);
  }

  // Fire trigger for all active fixture-scoped campaigns matching this fixture and within time window
  private async _fire(
    fixtureId: string,
    triggerType: CampaignTriggerType,
    sourceEventId?: string,
  ): Promise<void> {
    const now = new Date();
    const campaigns = await this.prisma.sponsorCampaign.findMany({
      where: {
        status: CampaignStatus.PUBLISHED,
        fixtureId,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      select: { id: true },
    });

    for (const campaign of campaigns) {
      const key = `${campaign.id}:${fixtureId}:${triggerType}${sourceEventId ? `:${sourceEventId}` : ''}`;
      await this._upsertTrigger(campaign.id, fixtureId, triggerType, key, sourceEventId, now);
    }
  }

  private async _upsertTrigger(
    campaignId: string,
    fixtureId: string | undefined,
    triggerType: CampaignTriggerType,
    idempotencyKey: string,
    sourceEventId: string | undefined,
    triggeredAt: Date,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.prisma.campaignTriggerEvent.upsert({
        where: { idempotencyKey },
        create: {
          campaignId,
          fixtureId: fixtureId ?? null,
          triggerType,
          idempotencyKey,
          sourceEventId: sourceEventId ?? null,
          triggeredAt,
          metadataJson: (metadata ?? Prisma.DbNull) as Prisma.InputJsonValue,
        },
        update: {},
      });
    } catch (err) {
      // Failure isolation: never propagate — campaign triggers must not break match ingestion
      this.logger.error({
        action: 'campaign_trigger.fire_failed',
        triggerType,
        campaignId,
        fixtureId: fixtureId ?? 'n/a',
        error: err instanceof Error ? err.message : String(err),
      }, err instanceof Error ? err.stack : undefined);
    }
  }
}
