import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GameweekDeadlineService {
  constructor(private prisma: PrismaService) {}

  async isGameweekOpen(gameweekId: string): Promise<boolean> {
    const gw = await this.prisma.gameweek.findUnique({
      where: { id: gameweekId },
      select: { status: true },
    });
    if (!gw) throw new NotFoundException(`Gameweek '${gameweekId}' not found`);
    return gw.status === 'OPEN';
  }

  async isTransferLocked(gameweekId: string): Promise<boolean> {
    const gw = await this.prisma.gameweek.findUnique({
      where: { id: gameweekId },
      select: { transferDeadlineAt: true },
    });
    if (!gw) throw new NotFoundException(`Gameweek '${gameweekId}' not found`);
    return gw.transferDeadlineAt <= new Date();
  }

  async isPredictionLocked(gameweekId: string): Promise<boolean> {
    const gw = await this.prisma.gameweek.findUnique({
      where: { id: gameweekId },
      select: { predictionDeadlineAt: true },
    });
    if (!gw) throw new NotFoundException(`Gameweek '${gameweekId}' not found`);
    return gw.predictionDeadlineAt <= new Date();
  }

  async isFixtureLocked(fixtureId: string): Promise<boolean> {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      select: {
        kickoffAt: true,
        gameweek: { select: { predictionDeadlineAt: true } },
      },
    });
    if (!fixture) throw new NotFoundException(`Fixture '${fixtureId}' not found`);
    const now = new Date();
    if (fixture.kickoffAt <= now) return true;
    if (fixture.gameweek && fixture.gameweek.predictionDeadlineAt <= now) return true;
    return false;
  }

  async getCurrentGameweek(activeSeasonId: string) {
    const now = new Date();
    return this.prisma.gameweek.findFirst({
      where: {
        seasonId: activeSeasonId,
        status: { in: ['OPEN', 'LIVE'] },
      },
      orderBy: { round: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        round: true,
        status: true,
        transferDeadlineAt: true,
        predictionDeadlineAt: true,
        startsAt: true,
        endsAt: true,
        _count: { select: { fixtures: true } },
      },
    }) ?? this.prisma.gameweek.findFirst({
      where: {
        seasonId: activeSeasonId,
        startsAt: { gt: now },
      },
      orderBy: { round: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        round: true,
        status: true,
        transferDeadlineAt: true,
        predictionDeadlineAt: true,
        startsAt: true,
        endsAt: true,
        _count: { select: { fixtures: true } },
      },
    });
  }
}
