import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ChallengeListingStatus,
  ChallengeListingVisibility,
  ChallengeMatchStatus,
  ChallengeScoringStatus,
  ChallengeMode,
  InvitationStatus,
  NotificationPriority,
  NotificationType,
  PredictionMarketStatus,
  SocialPredictionEntryType,
  ActivityFeedType,
  ActivityVisibility,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityFeedService } from '../activity-feed/activity-feed.service';
import { AdjustAllocationDto } from './dto/adjust-allocation.dto';
import { AcceptListingDto } from './dto/accept-listing.dto';
import { CreateListingDto } from './dto/create-listing.dto';
import { CreateMarketConfigDto } from './dto/create-market-config.dto';
import { GenerateFixtureMarketsDto } from './dto/generate-fixture-markets.dto';
import { GrantAllocationDto } from './dto/grant-allocation.dto';
import { SettleMarketDto } from './dto/settle-market.dto';
import { VoidMarketDto } from './dto/void-market.dto';

const SAFETY_NOTE =
  'PSL One social prediction challenges use system-issued gameplay points only. Gameplay points cannot be purchased, transferred, withdrawn or exchanged for money. Challenge results affect platform scoring and leaderboard positions only.';

const FAN_VALUE_SEPARATION_NOTE =
  'Fan Value is a separate non-financial loyalty score and is not used to fund prediction challenges.';

// Valid selections per market type
const VALID_SELECTIONS: Record<string, string[]> = {
  MATCH_RESULT: ['HOME', 'DRAW', 'AWAY'],
  BOTH_TEAMS_TO_SCORE: ['YES', 'NO'],
  FIRST_GOALSCORER: ['HOME_PLAYER', 'AWAY_PLAYER', 'NO_GOAL'],
  TOTAL_GOALS_OVER_UNDER: ['OVER', 'UNDER'],
  HALF_TIME_RESULT: ['HOME', 'DRAW', 'AWAY'],
  CORRECT_SCORE: ['HOME', 'DRAW', 'AWAY'],
  ANYTIME_GOALSCORER: ['HOME_PLAYER', 'AWAY_PLAYER'],
  PLAYER_TO_BE_BOOKED: ['YES', 'NO'],
};

// Opposing selections for each valid selection
const OPPOSING_SELECTION: Record<string, string> = {
  HOME: 'AWAY_OR_DRAW',
  AWAY: 'HOME_OR_DRAW',
  DRAW: 'HOME_OR_AWAY',
  YES: 'NO',
  NO: 'YES',
  OVER: 'UNDER',
  UNDER: 'OVER',
  HOME_PLAYER: 'AWAY_PLAYER',
  AWAY_PLAYER: 'HOME_PLAYER',
  NO_GOAL: 'HOME_OR_AWAY_PLAYER',
  HOME_OR_DRAW: 'AWAY',
  AWAY_OR_DRAW: 'HOME',
  HOME_OR_AWAY: 'DRAW',
  HOME_OR_AWAY_PLAYER: 'NO_GOAL',
};

@Injectable()
export class SocialPredictionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly activityFeedService: ActivityFeedService,
  ) {}

  // ── Admin: Market Config ──────────────────────────────────────────────────

  async adminCreateMarketConfig(userId: string, dto: CreateMarketConfigDto) {
    const existing = await this.prisma.predictionMarketConfig.findUnique({
      where: { seasonId_marketType: { seasonId: dto.seasonId, marketType: dto.marketType } },
    });
    if (existing) throw new BadRequestException(`Market config for ${dto.marketType} already exists in this season`);

    return this.prisma.predictionMarketConfig.create({
      data: {
        marketType: dto.marketType,
        label: dto.label,
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        baseOpportunity: dto.baseOpportunity ?? 100,
        allowedMultipliersJson: dto.allowedMultipliers as Prisma.InputJsonValue,
        minCommitmentPct: dto.minCommitmentPct ?? 10,
        maxCommitmentPct: dto.maxCommitmentPct ?? 100,
        pointsReturnRate: dto.pointsReturnRate ?? 1.0,
        seasonId: dto.seasonId,
        createdByUserId: userId,
      },
    });
  }

  async adminListMarketConfigs(seasonId: string) {
    return this.prisma.predictionMarketConfig.findMany({
      where: { seasonId },
      orderBy: { marketType: 'asc' },
    });
  }

  async adminToggleMarketConfig(id: string, isEnabled: boolean) {
    const config = await this.prisma.predictionMarketConfig.findUnique({ where: { id } });
    if (!config) throw new NotFoundException(`Market config not found: ${id}`);
    return this.prisma.predictionMarketConfig.update({ where: { id }, data: { isEnabled } });
  }

  // ── Admin: Fixture Markets ────────────────────────────────────────────────

  async adminGenerateFixtureMarkets(userId: string, fixtureId: string, dto: GenerateFixtureMarketsDto) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homeTeam: { select: { id: true, shortName: true, name: true } },
        awayTeam: { select: { id: true, shortName: true, name: true } },
        season: { select: { id: true } },
      },
    });
    if (!fixture) throw new NotFoundException(`Fixture not found: ${fixtureId}`);

    const configs = await this.prisma.predictionMarketConfig.findMany({
      where: { seasonId: fixture.seasonId, isEnabled: true },
    });

    let generated = 0;
    for (const config of configs) {
      const alreadyExists = await this.prisma.fixturePredictionMarket.findUnique({
        where: { fixtureId_marketType: { fixtureId, marketType: config.marketType } },
      });
      if (alreadyExists) continue;

      const locksAt = dto.locksAtKickoff !== false ? fixture.kickoffAt : undefined;

      await this.prisma.fixturePredictionMarket.create({
        data: {
          fixtureId,
          marketConfigId: config.id,
          marketType: config.marketType,
          status: PredictionMarketStatus.DRAFT,
          homeSelectionLabel: fixture.homeTeam.shortName,
          drawSelectionLabel: 'Draw',
          awaySelectionLabel: fixture.awayTeam.shortName,
          baseOpportunity: config.baseOpportunity,
          pointsReturnRate: config.pointsReturnRate,
          allowedMultipliersJson: config.allowedMultipliersJson as Prisma.InputJsonValue,
          ...(locksAt !== undefined ? { locksAt } : {}),
        },
      });
      generated++;
    }

    return { fixtureId, generated, total: configs.length };
  }

  async adminListFixtureMarkets(fixtureId: string) {
    return this.prisma.fixturePredictionMarket.findMany({
      where: { fixtureId },
      include: { marketConfig: true },
      orderBy: { marketType: 'asc' },
    });
  }

  async adminOpenMarket(marketId: string) {
    const market = await this.prisma.fixturePredictionMarket.findUnique({ where: { id: marketId } });
    if (!market) throw new NotFoundException(`Market not found: ${marketId}`);
    if (market.status !== PredictionMarketStatus.DRAFT)
      throw new BadRequestException(`Market must be DRAFT to open. Current: ${market.status}`);
    return this.prisma.fixturePredictionMarket.update({
      where: { id: marketId },
      data: { status: PredictionMarketStatus.OPEN },
    });
  }

  async adminLockMarket(marketId: string) {
    const market = await this.prisma.fixturePredictionMarket.findUnique({ where: { id: marketId } });
    if (!market) throw new NotFoundException(`Market not found: ${marketId}`);
    if (market.status !== PredictionMarketStatus.OPEN)
      throw new BadRequestException(`Market must be OPEN to lock. Current: ${market.status}`);
    return this.prisma.fixturePredictionMarket.update({
      where: { id: marketId },
      data: { status: PredictionMarketStatus.LOCKED, lockedAt: new Date() },
    });
  }

  async adminSettleMarket(marketId: string, dto: SettleMarketDto) {
    const market = await this.prisma.fixturePredictionMarket.findUnique({ where: { id: marketId } });
    if (!market) throw new NotFoundException(`Market not found: ${marketId}`);
    if (market.status !== PredictionMarketStatus.LOCKED)
      throw new BadRequestException(`Market must be LOCKED to settle. Current: ${market.status}`);

    await this.prisma.fixturePredictionMarket.update({
      where: { id: marketId },
      data: {
        status: PredictionMarketStatus.SETTLED,
        settledOutcome: dto.settledOutcome,
        settledAt: new Date(),
      },
    });

    await this._settleMarketMatches(marketId, dto.settledOutcome);

    return this.prisma.fixturePredictionMarket.findUnique({ where: { id: marketId } });
  }

  async adminVoidMarket(marketId: string, dto: VoidMarketDto) {
    const market = await this.prisma.fixturePredictionMarket.findUnique({ where: { id: marketId } });
    if (!market) throw new NotFoundException(`Market not found: ${marketId}`);
    if (market.status === PredictionMarketStatus.SETTLED)
      throw new BadRequestException('Cannot void a settled market');

    await this.prisma.fixturePredictionMarket.update({
      where: { id: marketId },
      data: { status: PredictionMarketStatus.VOID, voidedAt: new Date(), voidReason: dto.reason },
    });

    await this._voidMarketMatches(marketId, dto.reason);

    return this.prisma.fixturePredictionMarket.findUnique({ where: { id: marketId } });
  }

  // ── Admin: Allocations ────────────────────────────────────────────────────

  async adminGrantAllocation(userId: string, dto: GrantAllocationDto) {
    const fans = await this.prisma.user.findMany({
      where: { role: 'FAN', isActive: true },
      select: { id: true },
    });

    const total = dto.totalAllocation ?? 500;
    const data = fans.map(fan => ({
      fanUserId: fan.id,
      gameweekId: dto.gameweekId,
      seasonId: dto.seasonId,
      totalAllocation: total,
      usedAllocation: 0,
      remainingAllocation: total,
      maxConcurrentChallenges: dto.maxConcurrentChallenges ?? 10,
      maxCommitmentPctPerPrediction: dto.maxCommitmentPctPerPrediction ?? 50,
      maxConfidenceMultiplier: dto.maxConfidenceMultiplier ?? 2.0,
    }));

    let granted = 0;
    for (const entry of data) {
      await this.prisma.gameweekPointsAllocation.upsert({
        where: { fanUserId_gameweekId: { fanUserId: entry.fanUserId, gameweekId: entry.gameweekId } },
        create: entry,
        update: { totalAllocation: entry.totalAllocation, remainingAllocation: entry.totalAllocation },
      });
      granted++;
    }

    return { granted, gameweekId: dto.gameweekId };
  }

  async adminAdjustAllocation(adminUserId: string, fanUserId: string, gameweekId: string, dto: AdjustAllocationDto) {
    const existing = await this.prisma.gameweekPointsAllocation.findUnique({
      where: { fanUserId_gameweekId: { fanUserId, gameweekId } },
    });
    const usedAllocation = existing?.usedAllocation ?? 0;
    const remaining = Math.max(0, dto.totalAllocation - usedAllocation);

    return this.prisma.gameweekPointsAllocation.upsert({
      where: { fanUserId_gameweekId: { fanUserId, gameweekId } },
      create: {
        fanUserId,
        gameweekId,
        seasonId: existing?.seasonId ?? '',
        totalAllocation: dto.totalAllocation,
        usedAllocation: 0,
        remainingAllocation: dto.totalAllocation,
        isAdminAdjusted: true,
        adjustedByUserId: adminUserId,
        adjustmentReason: dto.reason,
      },
      update: {
        totalAllocation: dto.totalAllocation,
        remainingAllocation: remaining,
        isAdminAdjusted: true,
        adjustedByUserId: adminUserId,
        adjustmentReason: dto.reason,
      },
    });
  }

  async adminListAllListings(filters: { fixtureMarketId?: string; status?: ChallengeListingStatus; fanUserId?: string }) {
    return this.prisma.challengeListing.findMany({
      where: {
        ...(filters.fixtureMarketId ? { fixtureMarketId: filters.fixtureMarketId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.fanUserId ? { fanUserId: filters.fanUserId } : {}),
      },
      include: {
        fanUser: { select: { id: true, email: true } },
        fixtureMarket: { select: { id: true, marketType: true, status: true } },
        score: true,
        supportingMatches: true,
        opposingMatches: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async adminGetListing(id: string) {
    const listing = await this.prisma.challengeListing.findUnique({
      where: { id },
      include: {
        fanUser: { select: { id: true, email: true } },
        fixtureMarket: { include: { marketConfig: true } },
        supportingMatches: { include: { opposingListing: { include: { fanUser: { select: { id: true, email: true } } } } } },
        opposingMatches: { include: { supportingListing: { include: { fanUser: { select: { id: true, email: true } } } } } },
        score: true,
        ledgerEntries: true,
      },
    });
    if (!listing) throw new NotFoundException(`Listing not found: ${id}`);
    return listing;
  }

  async adminVoidMatch(matchId: string, reason: string) {
    const match = await this.prisma.challengeMatch.findUnique({
      where: { id: matchId },
      include: {
        supportingListing: { select: { fanUserId: true, gameweekId: true, seasonId: true } },
        opposingListing: { select: { fanUserId: true, gameweekId: true, seasonId: true } },
      },
    });
    if (!match) throw new NotFoundException(`Match not found: ${matchId}`);
    if (match.status !== ChallengeMatchStatus.PENDING_SETTLEMENT)
      throw new BadRequestException(`Match cannot be voided in status: ${match.status}`);

    await this.prisma.challengeMatch.update({
      where: { id: matchId },
      data: { status: ChallengeMatchStatus.VOID, scoringStatus: ChallengeScoringStatus.VOID, voidedAt: new Date(), correctionNotes: reason },
    });

    // VOID_RESTORED entries for both sides
    await this.prisma.socialPredictionPointsEntry.createMany({
      data: [
        {
          fanUserId: match.supportingListing.fanUserId,
          matchId,
          gameweekId: match.supportingListing.gameweekId,
          seasonId: match.supportingListing.seasonId,
          entryType: SocialPredictionEntryType.VOID_RESTORED,
          points: match.matchedPoints,
          idempotencyKey: `void-restored-supporter-${matchId}`,
          metadataJson: { reason, matchId },
        },
        {
          fanUserId: match.opposingListing.fanUserId,
          matchId,
          gameweekId: match.opposingListing.gameweekId,
          seasonId: match.opposingListing.seasonId,
          entryType: SocialPredictionEntryType.VOID_RESTORED,
          points: match.matchedPoints,
          idempotencyKey: `void-restored-opposer-${matchId}`,
          metadataJson: { reason, matchId },
        },
      ],
      skipDuplicates: true,
    });

    return { matchId, status: 'VOID', reason };
  }

  async adminGetComplianceStatus() {
    const config = await this.prisma.complianceDomainConfig.findUnique({
      where: { domainKey: 'POINTS_BASED_SOCIAL_PREDICTION_COMPLIANCE' },
    });

    return {
      domainKey: 'POINTS_BASED_SOCIAL_PREDICTION_COMPLIANCE',
      status: config?.status ?? 'INTERNAL_REVIEW_REQUIRED',
      displayName: 'Points-Based Social Prediction Compliance',
      statusNotes: config?.statusNotes ?? 'Public terms review in progress. No paid entry, no cash payout, no user-to-user financial transfer.',
      reviewedAt: config?.reviewedAt ?? null,
      nextReviewDue: config?.nextReviewDue ?? null,
      classificationNotes: [
        'This product must NOT be classified as betting.',
        'No paid entry — gameplay points are system-issued.',
        'No points purchase — points cannot be bought.',
        'No user-to-user financial transfer — PSL One scores each fan independently.',
        'No cash payout — points affect leaderboard position only.',
        'No cash equivalence — points have no monetary value.',
        'No negative monetary balance — no debt can be created.',
        'No wallet funding — wallet is separate and not used for this product.',
        'Minors and age-appropriate participation rules must be reviewed before public launch.',
        'Sponsor promotional competitions using prize-linked results require separate review.',
      ],
      safetyStatement: SAFETY_NOTE,
      fanValueSeparation: FAN_VALUE_SEPARATION_NOTE,
    };
  }

  // ── Fan: Allocation ───────────────────────────────────────────────────────

  async fanGetAllocation(fanUserId: string, gameweekId: string) {
    const allocation = await this.prisma.gameweekPointsAllocation.findUnique({
      where: { fanUserId_gameweekId: { fanUserId, gameweekId } },
      include: { gameweek: { select: { id: true, name: true, slug: true } } },
    });
    return {
      allocation,
      safetyNote: SAFETY_NOTE,
      fanValueSeparation: FAN_VALUE_SEPARATION_NOTE,
    };
  }

  // ── Fan: Marketplace ──────────────────────────────────────────────────────

  async fanGetMarketplace(fixtureId: string) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true, slug: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, slug: true } },
      },
    });
    if (!fixture) throw new NotFoundException(`Fixture not found: ${fixtureId}`);

    const markets = await this.prisma.fixturePredictionMarket.findMany({
      where: { fixtureId, status: PredictionMarketStatus.OPEN },
      include: {
        _count: { select: { listings: { where: { status: { in: [ChallengeListingStatus.OPEN, ChallengeListingStatus.PARTIALLY_MATCHED] } } } } },
      },
      orderBy: { marketType: 'asc' },
    });

    return {
      fixture: {
        id: fixture.id,
        kickoffAt: fixture.kickoffAt,
        status: fixture.status,
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
      },
      markets: markets.map(m => ({
        id: m.id,
        marketType: m.marketType,
        homeSelectionLabel: m.homeSelectionLabel,
        drawSelectionLabel: m.drawSelectionLabel,
        awaySelectionLabel: m.awaySelectionLabel,
        baseOpportunity: m.baseOpportunity,
        pointsReturnRate: m.pointsReturnRate,
        allowedMultipliers: m.allowedMultipliersJson as number[],
        locksAt: m.locksAt,
        openListingsCount: m._count.listings,
      })),
      safetyNote: SAFETY_NOTE,
      fanValueSeparation: FAN_VALUE_SEPARATION_NOTE,
    };
  }

  async fanGetFixtureMarket(marketId: string) {
    const market = await this.prisma.fixturePredictionMarket.findUnique({
      where: { id: marketId },
      include: {
        fixture: {
          include: {
            homeTeam: { select: { id: true, name: true, shortName: true } },
            awayTeam: { select: { id: true, name: true, shortName: true } },
          },
        },
        marketConfig: true,
      },
    });
    if (!market) throw new NotFoundException(`Market not found: ${marketId}`);
    return { market, safetyNote: SAFETY_NOTE };
  }

  async fanGetMarketplaceListings(fixtureMarketId: string, fanUserId: string) {
    const listings = await this.prisma.challengeListing.findMany({
      where: {
        fixtureMarketId,
        status: { in: [ChallengeListingStatus.OPEN, ChallengeListingStatus.PARTIALLY_MATCHED] },
        visibility: ChallengeListingVisibility.PUBLIC,
        fanUserId: { not: fanUserId },
      },
      select: {
        id: true,
        supportingSelection: true,
        opposingSelection: true,
        availablePoints: true,
        committedPoints: true,
        pointsReturnRate: true,
        confidenceMultiplier: true,
        potentialPointsAward: true,
        maximumPointsExposure: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    return { listings, safetyNote: SAFETY_NOTE };
  }

  // ── Fan: Create Listing ───────────────────────────────────────────────────

  async fanCreateListing(fanUserId: string, dto: CreateListingDto) {
    // Idempotency check
    const existing = await this.prisma.challengeListing.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
    });
    if (existing) return { listing: existing, safetyNote: SAFETY_NOTE, idempotent: true };

    // Get market
    const market = await this.prisma.fixturePredictionMarket.findUnique({
      where: { id: dto.fixtureMarketId },
      include: { marketConfig: true },
    });
    if (!market) throw new NotFoundException(`Prediction market not found: ${dto.fixtureMarketId}`);
    if (market.status !== PredictionMarketStatus.OPEN)
      throw new BadRequestException(`Market is not open. Current status: ${market.status}`);

    // Validate supporting selection
    const validSelections = VALID_SELECTIONS[market.marketType] ?? [];
    if (!validSelections.includes(dto.supportingSelection))
      throw new BadRequestException(
        `Invalid selection '${dto.supportingSelection}' for ${market.marketType}. Valid: ${validSelections.join(', ')}`,
      );
    const opposingSelection = OPPOSING_SELECTION[dto.supportingSelection] ?? 'OTHER';

    // Get allocation
    const allocation = await this.prisma.gameweekPointsAllocation.findUnique({
      where: { fanUserId_gameweekId: { fanUserId, gameweekId: dto.gameweekId } },
    });
    if (!allocation) throw new BadRequestException('No points allocation found for this gameweek. Contact admin to grant allocation.');
    if (allocation.remainingAllocation < market.baseOpportunity)
      throw new BadRequestException(`Insufficient points allocation. Remaining: ${allocation.remainingAllocation}`);

    // Validate commitment pct
    const minPct = market.marketConfig.minCommitmentPct;
    const maxPct = Math.min(market.marketConfig.maxCommitmentPct, allocation.maxCommitmentPctPerPrediction);
    if (dto.pointsCommitmentPct < minPct || dto.pointsCommitmentPct > maxPct)
      throw new BadRequestException(`Points commitment must be ${minPct}–${maxPct}%. Got: ${dto.pointsCommitmentPct}%`);

    // Validate confidence multiplier
    const allowed = market.allowedMultipliersJson as number[];
    if (!allowed.includes(dto.confidenceMultiplier))
      throw new BadRequestException(`Confidence multiplier ${dto.confidenceMultiplier} not allowed. Allowed: ${allowed.join(', ')}`);
    if (dto.confidenceMultiplier > allocation.maxConfidenceMultiplier)
      throw new BadRequestException(`Confidence multiplier ${dto.confidenceMultiplier} exceeds your max ${allocation.maxConfidenceMultiplier}`);

    // Calculate points
    const committedPoints = Math.floor(market.baseOpportunity * dto.pointsCommitmentPct / 100);
    const potentialPointsAward = Math.floor(committedPoints * market.pointsReturnRate * dto.confidenceMultiplier);
    const maximumPointsExposure = committedPoints;

    // Validate active concurrent challenges
    const activeChallenges = await this.prisma.challengeListing.count({
      where: {
        fanUserId,
        status: { in: [ChallengeListingStatus.OPEN, ChallengeListingStatus.PARTIALLY_MATCHED] },
        gameweekId: dto.gameweekId,
      },
    });
    if (activeChallenges >= allocation.maxConcurrentChallenges)
      throw new BadRequestException(`Maximum concurrent challenges reached: ${allocation.maxConcurrentChallenges}`);

    // Deduct from allocation
    await this.prisma.gameweekPointsAllocation.update({
      where: { fanUserId_gameweekId: { fanUserId, gameweekId: dto.gameweekId } },
      data: {
        usedAllocation: { increment: committedPoints },
        remainingAllocation: { decrement: committedPoints },
      },
    });

    // Create listing + score + commitment ledger entry in one transaction
    const listing = await this.prisma.$transaction(async tx => {
      const l = await tx.challengeListing.create({
        data: {
          fanUserId,
          fixtureMarketId: dto.fixtureMarketId,
          gameweekId: dto.gameweekId,
          seasonId: dto.seasonId,
          supportingSelection: dto.supportingSelection,
          opposingSelection,
          baseOpportunity: market.baseOpportunity,
          pointsCommitmentPct: dto.pointsCommitmentPct,
          committedPoints,
          pointsReturnRate: market.pointsReturnRate,
          confidenceMultiplier: dto.confidenceMultiplier,
          potentialPointsAward,
          maximumPointsExposure,
          availablePoints: committedPoints,
          matchedPoints: 0,
          status: ChallengeListingStatus.OPEN,
          visibility: dto.visibility ?? ChallengeListingVisibility.PUBLIC,
          ...(dto.leagueId !== undefined ? { leagueId: dto.leagueId } : {}),
          publishedAt: new Date(),
          ...(dto.expiresAt !== undefined ? { expiresAt: new Date(dto.expiresAt) } : {}),
          idempotencyKey: dto.idempotencyKey,
        },
      });

      await tx.challengeScore.create({
        data: {
          listingId: l.id,
          fanUserId,
          totalCommitted: committedPoints,
          scoringStatus: ChallengeScoringStatus.AWAITING_LOCK,
        },
      });

      await tx.socialPredictionPointsEntry.create({
        data: {
          fanUserId,
          listingId: l.id,
          gameweekId: dto.gameweekId,
          seasonId: dto.seasonId,
          entryType: SocialPredictionEntryType.COMMITMENT_RECORDED,
          points: committedPoints,
          idempotencyKey: `commitment-${l.id}`,
          metadataJson: {
            marketType: market.marketType,
            supportingSelection: dto.supportingSelection,
            safetyNote: 'Points Commitment is gameplay points only — not money, not wallet balance.',
          },
        },
      });

      return l;
    });

    // Fire-and-forget notifications
    void this.notificationsService.createInAppNotification({
      userId: fanUserId,
      type: NotificationType.CAMPAIGN_STARTED,
      title: 'Challenge Listing created',
      body: `Your prediction challenge is live in the marketplace. Points Commitment: ${committedPoints} pts.`,
      priority: NotificationPriority.NORMAL,
      sourceType: 'ChallengeListing:created',
      sourceId: listing.id,
    }).catch(() => null);

    void this.activityFeedService.createUserActivity(fanUserId, {
      type: ActivityFeedType.CAMPAIGN_STARTED,
      title: 'Challenge Listing created',
      body: `Prediction challenge created. Potential Points Award: ${potentialPointsAward} pts.`,
      visibility: ActivityVisibility.PUBLIC,
      sourceType: 'ChallengeListing:created',
      sourceId: listing.id,
    }).catch(() => null);

    // Auto-match the new listing
    await this._matchListing(listing);

    const updated = await this.prisma.challengeListing.findUnique({ where: { id: listing.id }, include: { score: true } });
    return { listing: updated, safetyNote: SAFETY_NOTE };
  }

  // ── Fan: Withdraw Listing ─────────────────────────────────────────────────

  async fanWithdrawListing(fanUserId: string, listingId: string) {
    const listing = await this.prisma.challengeListing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException(`Listing not found: ${listingId}`);
    if (listing.fanUserId !== fanUserId) throw new ForbiddenException('Not your listing');
    if (listing.status === ChallengeListingStatus.FULLY_MATCHED)
      throw new BadRequestException('Cannot withdraw a fully matched listing');
    if (listing.status !== ChallengeListingStatus.OPEN && listing.status !== ChallengeListingStatus.PARTIALLY_MATCHED)
      throw new BadRequestException(`Cannot withdraw listing in status: ${listing.status}`);

    // Refund unmatched points to allocation
    const unmatched = listing.availablePoints;
    if (unmatched > 0) {
      await this.prisma.gameweekPointsAllocation.update({
        where: { fanUserId_gameweekId: { fanUserId, gameweekId: listing.gameweekId } },
        data: {
          usedAllocation: { decrement: unmatched },
          remainingAllocation: { increment: unmatched },
        },
      });
    }

    return this.prisma.challengeListing.update({
      where: { id: listingId },
      data: { status: ChallengeListingStatus.WITHDRAWN, withdrawnAt: new Date(), availablePoints: 0 },
    });
  }

  // ── Fan: Accept Listing ───────────────────────────────────────────────────

  async fanAcceptListing(fanUserId: string, listingId: string, dto: AcceptListingDto) {
    // Idempotency
    const existingMatch = await this.prisma.challengeMatch.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
    });
    if (existingMatch) return { match: existingMatch, safetyNote: SAFETY_NOTE, idempotent: true };

    const listing = await this.prisma.challengeListing.findUnique({
      where: { id: listingId },
      include: { fixtureMarket: true },
    });
    if (!listing) throw new NotFoundException(`Listing not found: ${listingId}`);
    if (listing.fanUserId === fanUserId) throw new BadRequestException('You cannot accept your own listing');
    if (listing.status !== ChallengeListingStatus.OPEN && listing.status !== ChallengeListingStatus.PARTIALLY_MATCHED)
      throw new BadRequestException(`Listing is not available. Status: ${listing.status}`);
    if (listing.fixtureMarket.status !== PredictionMarketStatus.OPEN)
      throw new BadRequestException(`Market is no longer open. Status: ${listing.fixtureMarket.status}`);

    const accepterAllocation = await this.prisma.gameweekPointsAllocation.findUnique({
      where: { fanUserId_gameweekId: { fanUserId, gameweekId: listing.gameweekId } },
    });
    if (!accepterAllocation) throw new BadRequestException('No points allocation found for this gameweek');

    const pointsToAccept = dto.pointsToAccept ?? listing.availablePoints;
    if (pointsToAccept <= 0) throw new BadRequestException('Points to accept must be positive');
    if (pointsToAccept > listing.availablePoints)
      throw new BadRequestException(`Cannot accept more than available: ${listing.availablePoints}`);
    if (accepterAllocation.remainingAllocation < pointsToAccept)
      throw new BadRequestException(`Insufficient allocation. Remaining: ${accepterAllocation.remainingAllocation}`);

    const supporterAward = Math.floor(pointsToAccept * listing.pointsReturnRate * listing.confidenceMultiplier);
    const opposerAward = Math.floor(pointsToAccept * listing.pointsReturnRate);

    const match = await this.prisma.$transaction(async tx => {
      // Atomic conditional decrement: if another acceptor raced us, count === 0 and we throw
      const listingUpdate = await tx.challengeListing.updateMany({
        where: {
          id: listingId,
          status: { in: [ChallengeListingStatus.OPEN, ChallengeListingStatus.PARTIALLY_MATCHED] },
          availablePoints: { gte: pointsToAccept },
        },
        data: {
          matchedPoints: { increment: pointsToAccept },
          availablePoints: { decrement: pointsToAccept },
          // Status is recomputed by a follow-up update keyed on the new availablePoints value
        },
      });
      if (listingUpdate.count !== 1)
        throw new ConflictException('Listing capacity changed — refresh and retry');

      // Recompute status after atomic decrement
      const afterListing = await tx.challengeListing.findUnique({ where: { id: listingId }, select: { availablePoints: true } });
      const newStatus = (afterListing?.availablePoints ?? 0) <= 0
        ? ChallengeListingStatus.FULLY_MATCHED
        : ChallengeListingStatus.PARTIALLY_MATCHED;
      await tx.challengeListing.update({ where: { id: listingId }, data: { status: newStatus } });

      // Atomic conditional decrement on accepter allocation
      const allocUpdate = await tx.gameweekPointsAllocation.updateMany({
        where: {
          fanUserId,
          gameweekId: listing.gameweekId,
          remainingAllocation: { gte: pointsToAccept },
        },
        data: {
          usedAllocation: { increment: pointsToAccept },
          remainingAllocation: { decrement: pointsToAccept },
        },
      });
      if (allocUpdate.count !== 1)
        throw new ConflictException('Points allocation changed — refresh and retry');

      const m = await tx.challengeMatch.create({
        data: {
          supportingListingId: listingId,
          opposingListingId: listingId,
          matchedPoints: pointsToAccept,
          supporterPotentialAward: supporterAward,
          opposerPotentialAward: opposerAward,
          status: ChallengeMatchStatus.PENDING_SETTLEMENT,
          scoringStatus: ChallengeScoringStatus.AWAITING_LOCK,
          idempotencyKey: dto.idempotencyKey,
        },
      });

      await tx.socialPredictionPointsEntry.create({
        data: {
          fanUserId,
          listingId,
          matchId: m.id,
          gameweekId: listing.gameweekId,
          seasonId: listing.seasonId,
          entryType: SocialPredictionEntryType.COMMITMENT_RECORDED,
          points: pointsToAccept,
          idempotencyKey: `commitment-opposer-${m.id}`,
          metadataJson: { role: 'OPPOSER', listingId, safetyNote: 'Points Commitment — gameplay points only, not money.' },
        },
      });

      return m;
    });

    // Notify original listing owner
    void this.notificationsService.createInAppNotification({
      userId: listing.fanUserId,
      type: NotificationType.CAMPAIGN_STARTED,
      title: 'Challenge accepted',
      body: `Your prediction challenge has been accepted. ${pointsToAccept} points matched.`,
      priority: NotificationPriority.NORMAL,
      sourceType: 'ChallengeMatch:created',
      sourceId: match.id,
    }).catch(() => null);

    return { match, safetyNote: SAFETY_NOTE };
  }

  // ── Fan: My Listings ──────────────────────────────────────────────────────

  async fanGetMyListings(fanUserId: string) {
    const listings = await this.prisma.challengeListing.findMany({
      where: { fanUserId },
      include: {
        fixtureMarket: { select: { id: true, marketType: true, status: true, fixture: { select: { id: true, kickoffAt: true, homeTeam: { select: { shortName: true } }, awayTeam: { select: { shortName: true } } } } } },
        score: true,
        _count: { select: { supportingMatches: true, opposingMatches: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { listings, safetyNote: SAFETY_NOTE };
  }

  async fanGetListing(fanUserId: string, listingId: string) {
    const listing = await this.prisma.challengeListing.findUnique({
      where: { id: listingId },
      include: {
        fixtureMarket: { include: { fixture: { include: { homeTeam: true, awayTeam: true } }, marketConfig: true } },
        score: true,
        supportingMatches: true,
        ledgerEntries: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!listing) throw new NotFoundException(`Listing not found: ${listingId}`);
    if (listing.fanUserId !== fanUserId) throw new ForbiddenException('Not your listing');
    return { listing, safetyNote: SAFETY_NOTE };
  }

  // ── Fan: Leaderboard & Ledger ─────────────────────────────────────────────

  async fanGetLeaderboard(seasonId: string, gameweekId?: string) {
    const entries = await this.prisma.socialPredictionPointsEntry.groupBy({
      by: ['fanUserId'],
      where: {
        entryType: SocialPredictionEntryType.POINTS_AWARDED,
        seasonId,
        ...(gameweekId ? { gameweekId } : {}),
      },
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
      take: 50,
    });

    const userIds = entries.map(e => e.fanUserId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, fanProfile: { select: { displayName: true } } },
    });
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    const ranked = entries.map((e, i) => ({
      rank: i + 1,
      fanUserId: e.fanUserId,
      displayName: userMap[e.fanUserId]?.fanProfile?.displayName ?? 'Fan',
      pointsAwarded: e._sum.points ?? 0,
    }));

    return {
      scope: gameweekId ? 'GAMEWEEK' : 'SEASON',
      seasonId,
      gameweekId: gameweekId ?? null,
      leaderboard: ranked,
      safetyNote: SAFETY_NOTE,
    };
  }

  async fanGetMyLedger(fanUserId: string, seasonId?: string) {
    const entries = await this.prisma.socialPredictionPointsEntry.findMany({
      where: { fanUserId, ...(seasonId ? { seasonId } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return { entries, safetyNote: SAFETY_NOTE };
  }

  // ── Private: Matching Engine ──────────────────────────────────────────────

  private async _matchListing(listing: { id: string; fixtureMarketId: string; fanUserId: string; supportingSelection: string; opposingSelection: string; availablePoints: number; gameweekId: string; seasonId: string; pointsReturnRate: number; confidenceMultiplier: number }) {
    // Find compatible PUBLIC OPEN/PARTIALLY_MATCHED listings where their supportingSelection == our opposingSelection
    const compatibles = await this.prisma.challengeListing.findMany({
      where: {
        fixtureMarketId: listing.fixtureMarketId,
        fanUserId: { not: listing.fanUserId },
        supportingSelection: listing.opposingSelection,
        status: { in: [ChallengeListingStatus.OPEN, ChallengeListingStatus.PARTIALLY_MATCHED] },
        visibility: ChallengeListingVisibility.PUBLIC,
      },
      orderBy: { createdAt: 'asc' },
    });

    let remaining = listing.availablePoints;
    for (const compatible of compatibles) {
      if (remaining <= 0) break;
      const toMatch = Math.min(remaining, compatible.availablePoints);
      if (toMatch <= 0) continue;

      const matchId = randomUUID();
      const newRemaining = remaining - toMatch;
      await this.prisma.$transaction(async tx => {
        await tx.challengeMatch.create({
          data: {
            id: matchId,
            supportingListingId: listing.id,
            opposingListingId: compatible.id,
            matchedPoints: toMatch,
            supporterPotentialAward: Math.floor(toMatch * listing.pointsReturnRate * listing.confidenceMultiplier),
            opposerPotentialAward: Math.floor(toMatch * compatible.pointsReturnRate * compatible.confidenceMultiplier),
            status: ChallengeMatchStatus.PENDING_SETTLEMENT,
            scoringStatus: ChallengeScoringStatus.AWAITING_LOCK,
            idempotencyKey: `auto-match-${listing.id}-${compatible.id}-${matchId}`,
          },
        });

        // Use decrement so each iteration applies correctly even when multiple matches occur
        await tx.challengeListing.update({
          where: { id: listing.id },
          data: {
            matchedPoints: { increment: toMatch },
            availablePoints: { decrement: toMatch },
            status: newRemaining <= 0 ? ChallengeListingStatus.FULLY_MATCHED : ChallengeListingStatus.PARTIALLY_MATCHED,
          },
        });

        const compatibleNew = compatible.availablePoints - toMatch;
        await tx.challengeListing.update({
          where: { id: compatible.id },
          data: {
            matchedPoints: { increment: toMatch },
            availablePoints: compatibleNew >= 0 ? compatibleNew : 0,
            status: compatibleNew <= 0 ? ChallengeListingStatus.FULLY_MATCHED : ChallengeListingStatus.PARTIALLY_MATCHED,
          },
        });
      });

      remaining = newRemaining;
    }
  }

  // ── Private: Settle Market ────────────────────────────────────────────────

  private async _settleMarketMatches(marketId: string, settledOutcome: string) {
    const listings = await this.prisma.challengeListing.findMany({
      where: { fixtureMarketId: marketId },
      select: { id: true, fanUserId: true, supportingSelection: true, gameweekId: true, seasonId: true },
    });

    for (const listing of listings) {
      const matches = await this.prisma.challengeMatch.findMany({
        where: {
          supportingListingId: listing.id,
          status: ChallengeMatchStatus.PENDING_SETTLEMENT,
        },
        include: {
          opposingListing: { select: { fanUserId: true, gameweekId: true, seasonId: true, supportingSelection: true } },
        },
      });

      for (const match of matches) {
        const supporterWins = listing.supportingSelection === settledOutcome
          || settledOutcome.startsWith(listing.supportingSelection);

        // For explicitly accepted matches, supportingListingId === opposingListingId.
        // The actual accepter is tracked via COMMITMENT_RECORDED ledger entry (role: OPPOSER).
        const isDirectAccept = match.supportingListingId === match.opposingListingId;
        let opposerFanUserId = match.opposingListing.fanUserId;
        let opposerGameweekId = match.opposingListing.gameweekId;
        let opposerSeasonId = match.opposingListing.seasonId;

        if (isDirectAccept) {
          const accepterEntry = await this.prisma.socialPredictionPointsEntry.findFirst({
            where: {
              matchId: match.id,
              entryType: SocialPredictionEntryType.COMMITMENT_RECORDED,
              fanUserId: { not: listing.fanUserId },
            },
          });
          if (accepterEntry) {
            opposerFanUserId = accepterEntry.fanUserId;
            opposerGameweekId = accepterEntry.gameweekId ?? listing.gameweekId;
            opposerSeasonId = accepterEntry.seasonId ?? listing.seasonId;
          }
        }

        await this.prisma.$transaction(async tx => {
          await tx.challengeMatch.update({
            where: { id: match.id },
            data: {
              status: ChallengeMatchStatus.SETTLED,
              scoringStatus: ChallengeScoringStatus.SETTLED,
              settledAt: new Date(),
              supporterPointsAwarded: supporterWins ? match.supporterPotentialAward : 0,
              opposerPointsAwarded: supporterWins ? 0 : match.opposerPotentialAward,
            },
          });

          // Points ledger entries
          if (supporterWins) {
            await tx.socialPredictionPointsEntry.createMany({
              data: [
                {
                  fanUserId: listing.fanUserId,
                  listingId: listing.id,
                  matchId: match.id,
                  gameweekId: listing.gameweekId,
                  seasonId: listing.seasonId,
                  entryType: SocialPredictionEntryType.POINTS_AWARDED,
                  points: match.supporterPotentialAward,
                  idempotencyKey: `awarded-supporter-${match.id}`,
                  metadataJson: { outcome: settledOutcome, selection: listing.supportingSelection },
                },
                {
                  fanUserId: opposerFanUserId,
                  listingId: match.opposingListingId,
                  matchId: match.id,
                  gameweekId: opposerGameweekId,
                  seasonId: opposerSeasonId,
                  entryType: SocialPredictionEntryType.POINTS_FORGONE,
                  points: match.matchedPoints,
                  idempotencyKey: `forgone-opposer-${match.id}`,
                  metadataJson: { outcome: settledOutcome, selection: match.opposingListing.supportingSelection },
                },
              ],
              skipDuplicates: true,
            });
          } else {
            await tx.socialPredictionPointsEntry.createMany({
              data: [
                {
                  fanUserId: listing.fanUserId,
                  listingId: listing.id,
                  matchId: match.id,
                  gameweekId: listing.gameweekId,
                  seasonId: listing.seasonId,
                  entryType: SocialPredictionEntryType.POINTS_FORGONE,
                  points: match.matchedPoints,
                  idempotencyKey: `forgone-supporter-${match.id}`,
                  metadataJson: { outcome: settledOutcome },
                },
                {
                  fanUserId: opposerFanUserId,
                  listingId: match.opposingListingId,
                  matchId: match.id,
                  gameweekId: opposerGameweekId,
                  seasonId: opposerSeasonId,
                  entryType: SocialPredictionEntryType.POINTS_AWARDED,
                  points: match.opposerPotentialAward,
                  idempotencyKey: `awarded-opposer-${match.id}`,
                  metadataJson: { outcome: settledOutcome },
                },
              ],
              skipDuplicates: true,
            });
          }

          // Update ChallengeScore
          await tx.challengeScore.updateMany({
            where: { listingId: listing.id },
            data: {
              scoringStatus: ChallengeScoringStatus.SETTLED,
              settledAt: new Date(),
              totalAwarded: { increment: supporterWins ? match.supporterPotentialAward : 0 },
              totalForgone: { increment: supporterWins ? 0 : match.matchedPoints },
            },
          });
        });

        // Notify both sides
        void this.notificationsService.createInAppNotification({
          userId: listing.fanUserId,
          type: supporterWins ? NotificationType.CAMPAIGN_COMPLETED : NotificationType.CAMPAIGN_STARTED,
          title: supporterWins ? 'Challenge won — Points Awarded!' : 'Challenge settled — Points Forgone',
          body: supporterWins
            ? `Points Awarded: ${match.supporterPotentialAward}. Your selection was correct.`
            : `Points Forgone: ${match.matchedPoints}. Better luck next match.`,
          priority: NotificationPriority.NORMAL,
          sourceType: 'ChallengeMatch:settled',
          sourceId: match.id,
        }).catch(() => null);
      }
    }
  }

  // ── Private: Void Market ──────────────────────────────────────────────────

  private async _voidMarketMatches(marketId: string, reason: string) {
    const listings = await this.prisma.challengeListing.findMany({
      where: { fixtureMarketId: marketId },
      select: { id: true, fanUserId: true, gameweekId: true, seasonId: true },
    });

    for (const listing of listings) {
      const matches = await this.prisma.challengeMatch.findMany({
        where: { supportingListingId: listing.id, status: ChallengeMatchStatus.PENDING_SETTLEMENT },
        include: { opposingListing: { select: { fanUserId: true, gameweekId: true, seasonId: true } } },
      });

      for (const match of matches) {
        // For explicitly accepted matches, find the actual accepter via COMMITMENT_RECORDED ledger
        const isDirectAccept = match.supportingListingId === match.opposingListingId;
        let opposerFanUserId = match.opposingListing.fanUserId;
        let opposerGameweekId = match.opposingListing.gameweekId;
        let opposerSeasonId = match.opposingListing.seasonId;

        if (isDirectAccept) {
          const accepterEntry = await this.prisma.socialPredictionPointsEntry.findFirst({
            where: {
              matchId: match.id,
              entryType: SocialPredictionEntryType.COMMITMENT_RECORDED,
              fanUserId: { not: listing.fanUserId },
            },
          });
          if (accepterEntry) {
            opposerFanUserId = accepterEntry.fanUserId;
            opposerGameweekId = accepterEntry.gameweekId ?? listing.gameweekId;
            opposerSeasonId = accepterEntry.seasonId ?? listing.seasonId;
          }
        }

        await this.prisma.challengeMatch.update({
          where: { id: match.id },
          data: { status: ChallengeMatchStatus.VOID, scoringStatus: ChallengeScoringStatus.VOID, voidedAt: new Date(), correctionNotes: reason },
        });

        await this.prisma.socialPredictionPointsEntry.createMany({
          data: [
            {
              fanUserId: listing.fanUserId,
              listingId: listing.id,
              matchId: match.id,
              gameweekId: listing.gameweekId,
              seasonId: listing.seasonId,
              entryType: SocialPredictionEntryType.VOID_RESTORED,
              points: match.matchedPoints,
              idempotencyKey: `void-restored-support-${match.id}`,
              metadataJson: { reason },
            },
            {
              fanUserId: opposerFanUserId,
              listingId: match.opposingListingId,
              matchId: match.id,
              gameweekId: opposerGameweekId,
              seasonId: opposerSeasonId,
              entryType: SocialPredictionEntryType.VOID_RESTORED,
              points: match.matchedPoints,
              idempotencyKey: `void-restored-oppose-${match.id}`,
              metadataJson: { reason },
            },
          ],
          skipDuplicates: true,
        });
      }
    }
  }

  // ── Direct Friend Challenges ────────────────────────────────────────────────

  async fanCreateDirectChallenge(
    fanUserId: string,
    listingId: string,
    challengedUserId: string,
  ): Promise<{ listingId: string; invitationStatus: InvitationStatus }> {
    const listing = await this.prisma.challengeListing.findUnique({
      where: { id: listingId },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.fanUserId !== fanUserId)
      throw new ForbiddenException('You do not own this listing');
    if (listing.status !== ChallengeListingStatus.OPEN)
      throw new BadRequestException('Listing is no longer open');
    if (listing.challengedUserId)
      throw new BadRequestException('This listing already has a direct challenge target');

    const challenged = await this.prisma.user.findUnique({ where: { id: challengedUserId } });
    if (!challenged) throw new NotFoundException('Challenged user not found');
    if (challengedUserId === fanUserId)
      throw new BadRequestException('Cannot challenge yourself');

    const updated = await this.prisma.challengeListing.update({
      where: { id: listingId },
      data: {
        challengedUserId,
        challengeMode: ChallengeMode.DIRECT_USER,
        invitationStatus: InvitationStatus.PENDING,
        visibility: ChallengeListingVisibility.PRIVATE,
      },
    });

    void this.notificationsService.createInAppNotification({
      userId: challengedUserId,
      type: NotificationType.CHALLENGE_INVITE,
      title: 'You have a direct prediction challenge!',
      body: SAFETY_NOTE,
      sourceType: 'challenge_listing',
      sourceId: listingId,
      priority: NotificationPriority.NORMAL,
    }).catch(() => null);

    return { listingId: updated.id, invitationStatus: InvitationStatus.PENDING };
  }

  async fanAcceptDirectChallenge(fanUserId: string, listingId: string): Promise<{ matchId: string }> {
    const idempotencyKey = `direct-accept:${listingId}:${fanUserId}`;

    return this.prisma.$transaction(async (tx) => {
      // Idempotency: return existing match if already accepted
      const existing = await tx.challengeMatch.findFirst({ where: { idempotencyKey } });
      if (existing) return { matchId: existing.id };

      // Load and validate listing within transaction
      const listing = await tx.challengeListing.findUnique({
        where: { id: listingId },
        include: { fixtureMarket: true },
      });
      if (!listing) throw new NotFoundException('Challenge not found');
      if (listing.challengedUserId !== fanUserId)
        throw new ForbiddenException('This challenge is not addressed to you');
      if (listing.invitationStatus !== InvitationStatus.PENDING)
        throw new BadRequestException('Challenge is no longer pending');
      if (listing.status !== ChallengeListingStatus.OPEN)
        throw new BadRequestException('Challenge listing is no longer open');
      if (listing.fixtureMarket.status === PredictionMarketStatus.LOCKED)
        throw new BadRequestException('Market is locked — challenge cannot be accepted');
      if (listing.availablePoints <= 0)
        throw new BadRequestException('No points available on this listing');

      const pointsToAccept = listing.availablePoints;
      const required = Math.ceil(pointsToAccept / listing.pointsReturnRate);

      // Conditionally decrement listing capacity and mark accepted — atomic guard
      const listingUpdate = await tx.challengeListing.updateMany({
        where: {
          id: listingId,
          status: ChallengeListingStatus.OPEN,
          invitationStatus: InvitationStatus.PENDING,
          availablePoints: { gte: pointsToAccept },
        },
        data: {
          matchedPoints: { increment: pointsToAccept },
          availablePoints: { decrement: pointsToAccept },
          status: ChallengeListingStatus.FULLY_MATCHED,
          invitationStatus: InvitationStatus.ACCEPTED,
        },
      });
      if (listingUpdate.count !== 1)
        throw new ConflictException('Listing capacity changed — refresh and retry');

      // Conditionally decrement accepter allocation
      const allocationUpdate = await tx.gameweekPointsAllocation.updateMany({
        where: {
          fanUserId,
          gameweekId: listing.gameweekId,
          remainingAllocation: { gte: required },
        },
        data: {
          usedAllocation: { increment: required },
          remainingAllocation: { decrement: required },
        },
      });
      if (allocationUpdate.count !== 1)
        throw new ConflictException('Points allocation changed — refresh and retry');

      // Create the match record
      const match = await tx.challengeMatch.create({
        data: {
          supportingListingId: listingId,
          opposingListingId: listingId,
          matchedPoints: pointsToAccept,
          supporterPotentialAward: pointsToAccept,
          opposerPotentialAward: required,
          status: ChallengeMatchStatus.PENDING_SETTLEMENT,
          idempotencyKey,
        },
      });

      // Immutable commitment ledger entries (role stored in metadata — not a schema field)
      await tx.socialPredictionPointsEntry.createMany({
        data: [
          {
            fanUserId: listing.fanUserId,
            listingId,
            matchId: match.id,
            gameweekId: listing.gameweekId,
            seasonId: listing.seasonId,
            entryType: SocialPredictionEntryType.COMMITMENT_RECORDED,
            points: -listing.committedPoints,
            idempotencyKey: `commit-support:${idempotencyKey}`,
            metadataJson: { role: 'SUPPORTER', selection: listing.supportingSelection },
          },
          {
            fanUserId,
            listingId,
            matchId: match.id,
            gameweekId: listing.gameweekId,
            seasonId: listing.seasonId,
            entryType: SocialPredictionEntryType.COMMITMENT_RECORDED,
            points: -required,
            idempotencyKey: `commit-oppose:${idempotencyKey}`,
            metadataJson: { role: 'OPPOSER', selection: listing.opposingSelection },
          },
        ],
        skipDuplicates: true,
      });

      return { matchId: match.id };
    });
  }

  async fanDeclineDirectChallenge(fanUserId: string, listingId: string): Promise<void> {
    const listing = await this.prisma.challengeListing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Challenge not found');
    if (listing.challengedUserId !== fanUserId)
      throw new ForbiddenException('This challenge is not addressed to you');
    if (listing.invitationStatus !== InvitationStatus.PENDING)
      throw new BadRequestException('Challenge is not pending');

    // DECLINED: keep immutable history — do not republish as public marketplace listing
    await this.prisma.challengeListing.update({
      where: { id: listingId },
      data: {
        invitationStatus: InvitationStatus.DECLINED,
      },
    });
  }

  async fanWithdrawDirectChallenge(fanUserId: string, listingId: string): Promise<void> {
    const listing = await this.prisma.challengeListing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Challenge not found');
    if (listing.fanUserId !== fanUserId)
      throw new ForbiddenException('You do not own this listing');
    if (listing.invitationStatus !== InvitationStatus.PENDING)
      throw new BadRequestException('Challenge is not in a withdrawable state');

    // WITHDRAWN: keep immutable history — do not republish automatically
    await this.prisma.challengeListing.update({
      where: { id: listingId },
      data: {
        invitationStatus: InvitationStatus.WITHDRAWN,
      },
    });
  }

  async fanGetIncomingChallenges(fanUserId: string): Promise<object[]> {
    return this.prisma.challengeListing.findMany({
      where: { challengedUserId: fanUserId, invitationStatus: InvitationStatus.PENDING },
      include: {
        fanUser: { select: { id: true, fanProfile: { select: { displayName: true } } } },
        fixtureMarket: { include: { fixture: { select: { id: true, kickoffAt: true, homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async fanGetOutgoingChallenges(fanUserId: string): Promise<object[]> {
    return this.prisma.challengeListing.findMany({
      where: { fanUserId, challengeMode: ChallengeMode.DIRECT_USER },
      include: {
        challengedUser: { select: { id: true, fanProfile: { select: { displayName: true } } } },
        fixtureMarket: { include: { fixture: { select: { id: true, kickoffAt: true, homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async fanGetChallengeShareLink(fanUserId: string, listingId: string): Promise<{ shareLink: string; safetyNote: string }> {
    const listing = await this.prisma.challengeListing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.fanUserId !== fanUserId)
      throw new ForbiddenException('You do not own this listing');

    return {
      shareLink: `/social-predictions/marketplace?challenge=${listingId}`,
      safetyNote: SAFETY_NOTE,
    };
  }

}
