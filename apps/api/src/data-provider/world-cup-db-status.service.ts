import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * World Cup 2026 DB status service — read-only, no writes.
 *
 * Provides counts of seeded WC data (players, prices, fixtures, prediction
 * markets) so admins can verify the seed ran correctly.
 *
 * Points-only context: All WC fantasy and GTS data is points-based.
 * No cash value. No wagering. No PSL activation.
 */
@Injectable()
export class WorldCupDbStatusService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns player pool counts for WC2026:
   * - Total WC2026 players (excluding TBD team)
   * - Count by position
   * - Players with a fantasy price in the WC season
   */
  async getPlayerPoolStatus() {
    const wcSeason = await this.findWcSeason();

    const totalWcPlayers = await this.prisma.player.count({
      where: { source: 'fifa-wc2026', team: { NOT: { slug: 'tbd' } } },
    });

    const byPosition = await this.prisma.player.groupBy({
      by: ['position'],
      where: { source: 'fifa-wc2026', team: { NOT: { slug: 'tbd' } } },
      _count: { id: true },
    });

    const priceCount = wcSeason
      ? await this.prisma.fantasyPlayerPrice.count({
          where: { seasonId: wcSeason.id, player: { source: 'fifa-wc2026', team: { NOT: { slug: 'tbd' } } } },
        })
      : 0;

    const teamCount = await this.prisma.team.count({
      where: { source: 'fifa-wc2026', NOT: { slug: 'tbd' } },
    });

    return {
      competition: 'WC2026' as const,
      season: wcSeason ? { id: wcSeason.id, name: wcSeason.name, isActive: wcSeason.isActive } : null,
      playerPool: {
        totalPlayers: totalWcPlayers,
        teamCount,
        byPosition: Object.fromEntries(byPosition.map(p => [p.position, p._count.id])),
        playersWithPrice: priceCount,
        priceSeeded: priceCount > 0,
        priceNote: 'Fantasy points only — no cash value, no real-money wallet',
      },
      safety: {
        noRealMoney: true as const,
        noPslActivation: true as const,
        pointsOnlyContext: true as const,
        noWrites: true as const,
      },
    };
  }

  /**
   * Returns fixture and prediction market counts for WC2026:
   * - Total WC2026 fixtures
   * - Published fixtures
   * - Open prediction markets
   */
  async getFixtureStatus() {
    const wcSeason = await this.findWcSeason();
    if (!wcSeason) {
      return {
        competition: 'WC2026' as const,
        season: null,
        fixtures: { total: 0, published: 0, byRound: {} },
        predictionMarkets: { total: 0, open: 0, locked: 0, settled: 0 },
        safety: {
          noRealMoney: true as const,
          noPslActivation: true as const,
          pointsOnlyContext: true as const,
          noWrites: true as const,
        },
      };
    }

    const totalFixtures = await this.prisma.fixture.count({
      where: { seasonId: wcSeason.id },
    });

    const publishedFixtures = await this.prisma.fixture.count({
      where: { seasonId: wcSeason.id, isPublished: true },
    });

    const byRoundRaw = await this.prisma.fixture.groupBy({
      by: ['round'],
      where: { seasonId: wcSeason.id },
      _count: { id: true },
    });
    const byRound = Object.fromEntries(
      byRoundRaw.filter(r => r.round).map(r => [r.round!, r._count.id]),
    );

    const totalMarkets = await this.prisma.fixturePredictionMarket.count({
      where: { fixture: { seasonId: wcSeason.id } },
    });

    const openMarkets = await this.prisma.fixturePredictionMarket.count({
      where: { fixture: { seasonId: wcSeason.id }, status: 'OPEN' },
    });

    const lockedMarkets = await this.prisma.fixturePredictionMarket.count({
      where: { fixture: { seasonId: wcSeason.id }, status: 'LOCKED' },
    });

    const settledMarkets = await this.prisma.fixturePredictionMarket.count({
      where: { fixture: { seasonId: wcSeason.id }, status: 'SETTLED' },
    });

    return {
      competition: 'WC2026' as const,
      season: { id: wcSeason.id, name: wcSeason.name, isActive: wcSeason.isActive },
      fixtures: { total: totalFixtures, published: publishedFixtures, byRound },
      predictionMarkets: {
        total: totalMarkets,
        open: openMarkets,
        locked: lockedMarkets,
        settled: settledMarkets,
        note: 'Points-based GTS prediction markets — no wagering, no cash value',
      },
      safety: {
        noRealMoney: true as const,
        noPslActivation: true as const,
        pointsOnlyContext: true as const,
        noWrites: true as const,
      },
    };
  }

  private async findWcSeason() {
    return this.prisma.season.findFirst({
      where: {
        competition: { name: { contains: 'World Cup', mode: 'insensitive' } },
        isActive: true,
      },
      select: { id: true, name: true, isActive: true },
    });
  }
}
