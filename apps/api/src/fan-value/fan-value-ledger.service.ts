import { Injectable, NotFoundException } from '@nestjs/common';
import { FanValueSourceType, FanValueType, FanValueStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface PostEntryDto {
  userId: string;
  sourceType: FanValueSourceType;
  sourceId: string;
  idempotencyKey?: string;
  seasonId?: string;
  gameweekId?: string;
  gameweekScoreId?: string;
  fantasyTeamId?: string;
  predictionId?: string;
  challengeId?: string;
  achievementId?: string;
  fixtureId?: string;
  points: number;
  valueType?: FanValueType;
  description?: string;
  metadataJson?: object;
}

export interface LedgerFilters {
  valueType?: FanValueType;
  sourceType?: FanValueSourceType;
  seasonId?: string;
  gameweekId?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
  includeVoided?: boolean;
}

export interface AdminSummaryFilters {
  valueType?: FanValueType;
  sourceType?: FanValueSourceType;
  seasonId?: string;
  gameweekId?: string;
  fromDate?: Date;
  toDate?: Date;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class FanValueLedgerService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Core posting ─────────────────────────────────────────────────────────

  async postEntry(dto: PostEntryDto) {
    const idempotencyKey = dto.idempotencyKey ?? `${dto.sourceType}:${dto.sourceId}`;

    const data = {
      userId: dto.userId,
      sourceType: dto.sourceType,
      sourceId: dto.sourceId,
      points: dto.points,
      valueType: dto.valueType ?? FanValueType.FANTASY_POINTS,
      status: FanValueStatus.POSTED,
      idempotencyKey,
      ...(dto.seasonId !== undefined ? { seasonId: dto.seasonId } : {}),
      ...(dto.gameweekId !== undefined ? { gameweekId: dto.gameweekId } : {}),
      ...(dto.gameweekScoreId !== undefined ? { gameweekScoreId: dto.gameweekScoreId } : {}),
      ...(dto.fantasyTeamId !== undefined ? { fantasyTeamId: dto.fantasyTeamId } : {}),
      ...(dto.predictionId !== undefined ? { predictionId: dto.predictionId } : {}),
      ...(dto.challengeId !== undefined ? { challengeId: dto.challengeId } : {}),
      ...(dto.achievementId !== undefined ? { achievementId: dto.achievementId } : {}),
      ...(dto.fixtureId !== undefined ? { fixtureId: dto.fixtureId } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.metadataJson !== undefined ? { metadataJson: dto.metadataJson } : {}),
    };

    return this.prisma.fanValueLedger.upsert({
      where: { idempotencyKey },
      create: data,
      update: { points: dto.points, ...(dto.description !== undefined ? { description: dto.description } : {}) },
    });
  }

  async postFantasyGameweekScore(
    scoreId: string,
    userId: string,
    netPoints: number,
    grossPoints: number,
    transferCost: number,
    seasonId: string,
    gameweekId: string,
    fantasyTeamId: string,
  ) {
    return this.postEntry({
      userId,
      sourceType: FanValueSourceType.FANTASY_GAMEWEEK_SCORE,
      sourceId: scoreId,
      idempotencyKey: `FANTASY_GAMEWEEK_SCORE:${scoreId}`,
      seasonId,
      gameweekId,
      gameweekScoreId: scoreId,
      fantasyTeamId,
      points: netPoints,
      valueType: FanValueType.FANTASY_POINTS,
      description: `Gameweek score: ${netPoints} pts (gross ${grossPoints} - deductions ${transferCost})`,
    });
  }

  async postPredictionSettlement(
    predictionId: string,
    userId: string,
    points: number,
    fixtureId: string,
    seasonId?: string,
  ) {
    return this.postEntry({
      userId,
      sourceType: FanValueSourceType.PREDICTION_SETTLEMENT,
      sourceId: predictionId,
      idempotencyKey: `PREDICTION_SETTLEMENT:${predictionId}`,
      predictionId,
      fixtureId,
      ...(seasonId ? { seasonId } : {}),
      points,
      valueType: FanValueType.PREDICTION_POINTS,
      description: `Prediction settlement: ${points} pts`,
    });
  }

  async postPeerChallenge(
    challengeId: string,
    userId: string,
    points: number,
    role: 'challenger' | 'opponent',
    fixtureId?: string,
  ) {
    return this.postEntry({
      userId,
      sourceType: FanValueSourceType.PEER_CHALLENGE,
      sourceId: challengeId,
      idempotencyKey: `PEER_CHALLENGE:${challengeId}:${role}:${userId}`,
      challengeId,
      ...(fixtureId ? { fixtureId } : {}),
      points,
      valueType: FanValueType.CHALLENGE_POINTS,
      description: `Peer challenge result (${role}): ${points} pts`,
    });
  }

  async postAchievementAward(
    achievementId: string,
    userId: string,
    points: number,
    description?: string,
  ) {
    return this.postEntry({
      userId,
      sourceType: FanValueSourceType.ACHIEVEMENT,
      sourceId: achievementId,
      idempotencyKey: `ACHIEVEMENT:${achievementId}:${userId}`,
      achievementId,
      points,
      valueType: FanValueType.ACHIEVEMENT_POINTS,
      description: description ?? `Achievement awarded: ${points} pts`,
    });
  }

  async postSponsorEngagementReadyEvent(dto: {
    userId: string;
    points: number;
    description?: string;
    metadataJson?: object;
    idempotencyKey: string;
  }) {
    return this.postEntry({
      userId: dto.userId,
      sourceType: FanValueSourceType.SPONSOR_ENGAGEMENT_READY,
      sourceId: dto.idempotencyKey,
      idempotencyKey: dto.idempotencyKey,
      points: dto.points,
      valueType: FanValueType.LOYALTY_POINTS,
      ...(dto.description ? { description: dto.description } : {}),
      ...(dto.metadataJson ? { metadataJson: dto.metadataJson } : {}),
    });
  }

  // ── Fan read methods ─────────────────────────────────────────────────────

  async getFanValueSummary(userId: string) {
    const [totalResult, byTypeRows, recentEntries] = await Promise.all([
      this.prisma.fanValueLedger.aggregate({
        where: { userId, status: FanValueStatus.POSTED },
        _sum: { points: true },
        _count: { id: true },
      }),
      this.getFanValueByType(userId),
      this.prisma.fanValueLedger.findMany({
        where: { userId, status: FanValueStatus.POSTED },
        orderBy: { occurredAt: 'desc' },
        take: 5,
        select: { id: true, sourceType: true, valueType: true, points: true, description: true, occurredAt: true, status: true },
      }),
    ]);

    return {
      userId,
      totalPoints: totalResult._sum.points ?? 0,
      totalEntries: totalResult._count.id,
      byType: Object.fromEntries(byTypeRows.map(r => [r.valueType, r.totalPoints])) as Record<string, number>,
      recentEntries: recentEntries ?? [],
      nonFinancialDisclaimer: 'Fan Value is non-financial and has no cash value.',
    };
  }

  async getFanLedgerEntries(userId: string, filters: LedgerFilters = {}) {
    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;
    const where: Record<string, unknown> = { userId };
    if (!filters.includeVoided) where['status'] = FanValueStatus.POSTED;
    if (filters.valueType) where['valueType'] = filters.valueType;
    if (filters.sourceType) where['sourceType'] = filters.sourceType;
    if (filters.seasonId) where['seasonId'] = filters.seasonId;
    if (filters.gameweekId) where['gameweekId'] = filters.gameweekId;
    if (filters.fromDate || filters.toDate) {
      where['occurredAt'] = {
        ...(filters.fromDate ? { gte: filters.fromDate } : {}),
        ...(filters.toDate ? { lte: filters.toDate } : {}),
      };
    }

    const [entries, total] = await Promise.all([
      this.prisma.fanValueLedger.findMany({
        where,
        orderBy: { occurredAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          sourceType: true,
          sourceId: true,
          points: true,
          valueType: true,
          status: true,
          description: true,
          seasonId: true,
          gameweekId: true,
          occurredAt: true,
          createdAt: true,
        },
      }),
      this.prisma.fanValueLedger.count({ where }),
    ]);

    return { entries, total, limit, offset };
  }

  async getFanValueByType(userId: string) {
    const rows = await this.prisma.fanValueLedger.groupBy({
      by: ['valueType'],
      where: { userId, status: FanValueStatus.POSTED },
      _sum: { points: true },
      _count: { id: true },
    });

    return rows.map(r => ({
      valueType: r.valueType,
      totalPoints: r._sum.points ?? 0,
      entryCount: r._count.id,
    }));
  }

  async getFanValueBySource(userId: string) {
    const rows = await this.prisma.fanValueLedger.groupBy({
      by: ['sourceType'],
      where: { userId, status: FanValueStatus.POSTED },
      _sum: { points: true },
      _count: { id: true },
    });

    return rows.map(r => ({
      sourceType: r.sourceType,
      totalPoints: r._sum.points ?? 0,
      entryCount: r._count.id,
    }));
  }

  async getSeasonFanValue(userId: string, seasonId: string) {
    const result = await this.prisma.fanValueLedger.aggregate({
      where: { userId, seasonId, status: FanValueStatus.POSTED },
      _sum: { points: true },
      _count: { id: true },
    });

    const byType = await this.prisma.fanValueLedger.groupBy({
      by: ['valueType'],
      where: { userId, seasonId, status: FanValueStatus.POSTED },
      _sum: { points: true },
    });

    return {
      userId,
      seasonId,
      totalPoints: result._sum.points ?? 0,
      entryCount: result._count.id,
      byType: byType.map(r => ({ valueType: r.valueType, totalPoints: r._sum.points ?? 0 })),
    };
  }

  async getGameweekFanValue(userId: string, gameweekId: string) {
    const result = await this.prisma.fanValueLedger.aggregate({
      where: { userId, gameweekId, status: FanValueStatus.POSTED },
      _sum: { points: true },
      _count: { id: true },
    });

    const entries = await this.prisma.fanValueLedger.findMany({
      where: { userId, gameweekId, status: FanValueStatus.POSTED },
      select: {
        id: true, sourceType: true, points: true, valueType: true, description: true, occurredAt: true,
      },
      orderBy: { occurredAt: 'desc' },
    });

    return {
      userId,
      gameweekId,
      totalPoints: result._sum.points ?? 0,
      entryCount: result._count.id,
      entries,
    };
  }

  // ── Admin methods ────────────────────────────────────────────────────────

  async getAdminPlatformSummary(filters: AdminSummaryFilters = {}) {
    const where: Record<string, unknown> = { status: FanValueStatus.POSTED };
    if (filters.valueType) where['valueType'] = filters.valueType;
    if (filters.sourceType) where['sourceType'] = filters.sourceType;
    if (filters.seasonId) where['seasonId'] = filters.seasonId;
    if (filters.gameweekId) where['gameweekId'] = filters.gameweekId;
    if (filters.fromDate || filters.toDate) {
      where['occurredAt'] = {
        ...(filters.fromDate ? { gte: filters.fromDate } : {}),
        ...(filters.toDate ? { lte: filters.toDate } : {}),
      };
    }

    const [totalResult, byTypeRows, bySourceRows, recentEntries, totalUsers] = await Promise.all([
      this.prisma.fanValueLedger.aggregate({ where, _sum: { points: true }, _count: { id: true } }),
      this.prisma.fanValueLedger.groupBy({
        by: ['valueType'], where, _sum: { points: true }, _count: { id: true },
      }),
      this.prisma.fanValueLedger.groupBy({
        by: ['sourceType'], where, _sum: { points: true }, _count: { id: true },
      }),
      this.prisma.fanValueLedger.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, userId: true, sourceType: true, valueType: true, points: true, description: true, occurredAt: true, status: true },
      }),
      this.prisma.fanValueLedger.groupBy({ by: ['userId'], where, _count: { id: true } }).then(r => r.length),
    ]);

    return {
      totalPoints: totalResult._sum.points ?? 0,
      totalEntries: totalResult._count.id,
      totalUsers,
      byType: Object.fromEntries(byTypeRows.map(r => [r.valueType, r._sum.points ?? 0])) as Record<string, number>,
      bySource: Object.fromEntries(bySourceRows.map(r => [r.sourceType, r._sum.points ?? 0])) as Record<string, number>,
      recentEntries: recentEntries ?? [],
      nonFinancialDisclaimer: 'Fan Value is non-financial and has no cash value.',
    };
  }

  async getAdminUserLedger(userId: string, filters: LedgerFilters = {}) {
    return this.getFanLedgerEntries(userId, { ...filters, includeVoided: true });
  }

  async voidEntry(entryId: string, reason: string) {
    const entry = await this.prisma.fanValueLedger.findUnique({ where: { id: entryId } });
    if (!entry) throw new NotFoundException('Ledger entry not found');
    if (entry.status === FanValueStatus.VOIDED) return entry; // idempotent

    return this.prisma.fanValueLedger.update({
      where: { id: entryId },
      data: { status: FanValueStatus.VOIDED, description: `[VOIDED: ${reason}]${entry.description ? ' ' + entry.description : ''}` },
    });
  }

  async adminPostEntry(dto: PostEntryDto & { idempotencyKey: string }) {
    return this.postEntry({ ...dto, sourceType: FanValueSourceType.ADMIN_ADJUSTMENT, valueType: dto.valueType ?? FanValueType.LOYALTY_POINTS });
  }
}
