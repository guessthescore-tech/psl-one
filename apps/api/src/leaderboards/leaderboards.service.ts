import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardsService {
  constructor(private prisma: PrismaService) {}

  async getPredictionsLeaderboard() {
    const grouped = await this.prisma.predictionPointsLedger.groupBy({
      by: ['userId'],
      _sum: { points: true },
      _count: { id: true },
      orderBy: { _sum: { points: 'desc' } },
      take: 50,
    });

    if (grouped.length === 0) return [];

    const userIds = grouped.map(g => g.userId);
    const profiles = await this.prisma.fanProfile.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, displayName: true },
    });
    const profileMap = new Map(profiles.map(p => [p.userId, p]));

    return grouped.map((g, idx) => ({
      rank: idx + 1,
      userId: g.userId,
      displayName: profileMap.get(g.userId)?.displayName ?? null,
      totalPoints: g._sum.points ?? 0,
      predictionCount: g._count.id,
    }));
  }
}
