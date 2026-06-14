import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FanValueStatus } from '@prisma/client';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string | null;
  totalPoints: number;
}

export interface LeaderboardResult {
  leaderboardType: string;
  seasonId: string | null;
  seasonName: string | null;
  seasonSlug: string | null;
  scope: 'SEASON' | 'ALL_TIME';
  pointsOnly: boolean;
  nonFinancial: boolean;
  entries: LeaderboardEntry[];
  limit: number;
}

@Injectable()
export class LeaderboardsService {
  constructor(private prisma: PrismaService) {}

  // ── Season resolution ────────────────────────────────────────────────────

  async resolveSeasonFromSlug(seasonSlug: string) {
    return this.prisma.season.findFirst({
      where: { slug: seasonSlug },
      select: { id: true, name: true, slug: true, isActive: true },
    });
  }

  async getActiveSeason() {
    return this.prisma.season.findFirst({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, isActive: true },
    });
  }

  async getLeaderboardSeasons() {
    const seasons = await this.prisma.season.findMany({
      select: { id: true, name: true, slug: true, status: true, isActive: true, startDate: true },
      orderBy: { startDate: 'desc' },
    });
    return seasons.map((s) => ({
      ...s,
      leaderboardUrl: `/leaderboards/overall?seasonSlug=${s.slug}`,
    }));
  }

  // ── Profile helper ───────────────────────────────────────────────────────

  private async enrichWithProfiles(
    rows: Array<{ userId: string; totalPoints: number; [k: string]: unknown }>,
  ): Promise<LeaderboardEntry[]> {
    if (rows.length === 0) return [];
    const userIds = rows.map((r) => r.userId);
    const profiles = await this.prisma.fanProfile.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, displayName: true },
    });
    const profileMap = new Map(profiles.map((p) => [p.userId, p.displayName]));
    return rows.map((r, idx) => ({
      rank: idx + 1,
      userId: r.userId,
      displayName: profileMap.get(r.userId) ?? null,
      totalPoints: r.totalPoints,
    }));
  }

  // ── Fan Value leaderboard ────────────────────────────────────────────────

  async getFanValueLeaderboard(seasonId: string | null, limit = 50): Promise<LeaderboardResult> {
    const season = seasonId
      ? await this.prisma.season.findUnique({ where: { id: seasonId }, select: { id: true, name: true, slug: true } })
      : await this.getActiveSeason();

    const effectiveSeasonId = season?.id ?? null;
    const where = effectiveSeasonId
      ? { seasonId: effectiveSeasonId, status: FanValueStatus.POSTED }
      : { status: FanValueStatus.POSTED };

    const grouped = await this.prisma.fanValueLedger.groupBy({
      by: ['userId'],
      where,
      _sum: { points: true },
      _count: { id: true },
      orderBy: { _sum: { points: 'desc' } },
      take: limit,
    });

    const rows = grouped.map((g) => ({ userId: g.userId, totalPoints: g._sum.points ?? 0 }));
    const entries = await this.enrichWithProfiles(rows);

    return {
      leaderboardType: 'FAN_VALUE',
      seasonId: season?.id ?? null,
      seasonName: season?.name ?? null,
      seasonSlug: season?.slug ?? null,
      scope: effectiveSeasonId ? 'SEASON' : 'ALL_TIME',
      pointsOnly: true,
      nonFinancial: true,
      entries,
      limit,
    };
  }

  // ── Fantasy leaderboard ──────────────────────────────────────────────────

  async getFantasyLeaderboard(seasonId: string | null, limit = 50): Promise<LeaderboardResult> {
    const season = seasonId
      ? await this.prisma.season.findUnique({ where: { id: seasonId }, select: { id: true, name: true, slug: true } })
      : await this.getActiveSeason();

    const effectiveSeasonId = season?.id ?? null;
    const where = effectiveSeasonId ? { seasonId: effectiveSeasonId } : {};

    const grouped = await this.prisma.fantasyGameweekScore.groupBy({
      by: ['userId'],
      where,
      _sum: { netPoints: true },
      _count: { id: true },
      orderBy: { _sum: { netPoints: 'desc' } },
      take: limit,
    });

    const rows = grouped.map((g) => ({ userId: g.userId, totalPoints: g._sum.netPoints ?? 0 }));
    const entries = await this.enrichWithProfiles(rows);

    return {
      leaderboardType: 'FANTASY',
      seasonId: season?.id ?? null,
      seasonName: season?.name ?? null,
      seasonSlug: season?.slug ?? null,
      scope: effectiveSeasonId ? 'SEASON' : 'ALL_TIME',
      pointsOnly: true,
      nonFinancial: true,
      entries,
      limit,
    };
  }

  // ── Predictions leaderboard ──────────────────────────────────────────────

  async getPredictionsLeaderboard(seasonId: string | null = null, limit = 50): Promise<LeaderboardResult> {
    const season = seasonId
      ? await this.prisma.season.findUnique({ where: { id: seasonId }, select: { id: true, name: true, slug: true } })
      : await this.getActiveSeason();

    const effectiveSeasonId = season?.id ?? null;

    let rows: Array<{ userId: string; totalPoints: number }>;

    if (effectiveSeasonId) {
      // groupBy does not support cross-relation where; use parameterised raw SQL instead
      // to avoid loading the full ledger into Node memory.
      const rawRows = await this.prisma.$queryRaw<Array<{ user_id: string; total_points: bigint }>>`
        SELECT ppl.user_id, SUM(ppl.points) AS total_points
        FROM prediction_points_ledger ppl
        INNER JOIN fixtures f ON f.id = ppl.fixture_id
        WHERE f.season_id = ${effectiveSeasonId}
        GROUP BY ppl.user_id
        ORDER BY total_points DESC, ppl.user_id ASC
        LIMIT ${limit}
      `;
      rows = rawRows.map(r => ({ userId: r.user_id, totalPoints: Number(r.total_points) }));
    } else {
      const grouped = await this.prisma.predictionPointsLedger.groupBy({
        by: ['userId'],
        _sum: { points: true },
        _count: { id: true },
        orderBy: { _sum: { points: 'desc' } },
        take: limit,
      });
      rows = grouped.map((g) => ({ userId: g.userId, totalPoints: g._sum.points ?? 0 }));
    }

    const entries = await this.enrichWithProfiles(rows);

    return {
      leaderboardType: 'PREDICTIONS',
      seasonId: season?.id ?? null,
      seasonName: season?.name ?? null,
      seasonSlug: season?.slug ?? null,
      scope: effectiveSeasonId ? 'SEASON' : 'ALL_TIME',
      pointsOnly: true,
      nonFinancial: true,
      entries,
      limit,
    };
  }

  // ── Achievements leaderboard (global — achievements are cross-season) ───

  async getAchievementsLeaderboard(limit = 50): Promise<LeaderboardResult> {
    const grouped = await this.prisma.fanAchievement.groupBy({
      by: ['userId'],
      where: { status: 'UNLOCKED' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    const rows = grouped.map((g) => ({ userId: g.userId, totalPoints: g._count.id }));
    const entries = await this.enrichWithProfiles(rows);

    return {
      leaderboardType: 'ACHIEVEMENTS',
      seasonId: null,
      seasonName: null,
      seasonSlug: null,
      scope: 'ALL_TIME',
      pointsOnly: true,
      nonFinancial: true,
      entries,
      limit,
    };
  }

  // ── Overall leaderboard (Fan Value only — avoids double-counting) ────────

  async getOverallLeaderboard(seasonId: string | null, limit = 50): Promise<LeaderboardResult> {
    const result = await this.getFanValueLeaderboard(seasonId, limit);
    return { ...result, leaderboardType: 'OVERALL' };
  }

  // ── Overview (top-5 snapshot per type) ───────────────────────────────────

  async getLeaderboardOverview(seasonId: string | null) {
    const [fanValue, fantasy, predictions, achievements] = await Promise.all([
      this.getFanValueLeaderboard(seasonId, 5),
      this.getFantasyLeaderboard(seasonId, 5),
      this.getPredictionsLeaderboard(seasonId, 5),
      this.getAchievementsLeaderboard(5),
    ]);

    return {
      seasonId: fanValue.seasonId,
      seasonName: fanValue.seasonName,
      seasonSlug: fanValue.seasonSlug,
      scope: fanValue.scope,
      pointsOnly: true,
      nonFinancial: true,
      leaderboards: { fanValue, fantasy, predictions, achievements },
      note: 'Overall leaderboard uses Fan Value ledger to avoid double-counting across engagement sources.',
    };
  }
}
