import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GameweekStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type LockReason =
  | 'OPEN'
  | 'TRANSFER_DEADLINE'
  | 'GAMEWEEK_LOCKED'
  | 'GAMEWEEK_LIVE'
  | 'GAMEWEEK_COMPLETED';

export interface FantasyDeadlineInfo {
  gameweekId: string;
  gameweekName: string;
  transferDeadlineAt: Date;
  isLocked: boolean;
  lockReason: LockReason;
  serverTime: Date;
  firstFixtureKickoffAt: Date | null;
}

@Injectable()
export class FantasyDeadlineService {
  constructor(private readonly prisma: PrismaService) {}

  async getDeadline(seasonId: string): Promise<FantasyDeadlineInfo> {
    const now = new Date();
    const gw = await this.prisma.gameweek.findFirst({
      where: {
        seasonId,
        status: { in: [GameweekStatus.UPCOMING, GameweekStatus.OPEN, GameweekStatus.LOCKED, GameweekStatus.LIVE] },
      },
      orderBy: { round: 'asc' },
      include: {
        fixtures: { orderBy: { kickoffAt: 'asc' }, take: 1 },
      },
    });
    if (!gw) throw new NotFoundException('No active gameweek found for season');
    return this.buildDeadlineInfo(gw, now);
  }

  async getGameweekDeadline(gameweekId: string): Promise<FantasyDeadlineInfo> {
    const now = new Date();
    const gw = await this.prisma.gameweek.findUnique({
      where: { id: gameweekId },
      include: {
        fixtures: { orderBy: { kickoffAt: 'asc' }, take: 1 },
      },
    });
    if (!gw) throw new NotFoundException('Gameweek not found');
    return this.buildDeadlineInfo(gw, now);
  }

  async isFantasyLocked(gameweekId: string): Promise<boolean> {
    const info = await this.getGameweekDeadline(gameweekId);
    return info.isLocked;
  }

  async assertFantasyOpen(seasonId: string): Promise<void> {
    const now = new Date();
    const gw = await this.prisma.gameweek.findFirst({
      where: {
        seasonId,
        status: { in: [GameweekStatus.UPCOMING, GameweekStatus.OPEN] },
      },
      select: { transferDeadlineAt: true },
      orderBy: { round: 'asc' },
    });
    if (!gw || gw.transferDeadlineAt <= now) {
      throw new BadRequestException('Fantasy changes are locked for this Gameweek');
    }
  }

  async recalculateDeadline(gameweekId: string): Promise<FantasyDeadlineInfo> {
    const gw = await this.prisma.gameweek.findUnique({
      where: { id: gameweekId },
      include: {
        fixtures: { orderBy: { kickoffAt: 'asc' }, take: 1 },
      },
    });
    if (!gw) throw new NotFoundException('Gameweek not found');

    const firstFixture = gw.fixtures[0];
    if (!firstFixture) throw new BadRequestException('No fixtures in gameweek');

    const now = new Date();
    const currentDeadline = gw.transferDeadlineAt;
    const timeToCurrent = currentDeadline.getTime() - now.getTime();
    if (timeToCurrent > 0 && timeToCurrent <= 24 * 60 * 60 * 1000) {
      throw new BadRequestException('Cannot recalculate deadline within 24 hours of current deadline');
    }

    const rulesConfig = await this.prisma.fantasyRulesConfig.findUnique({ where: { seasonId: gw.seasonId } });
    const offsetMinutes = rulesConfig?.deadlineOffsetMinutes ?? 90;
    const derivedDeadline = new Date(firstFixture.kickoffAt.getTime() - offsetMinutes * 60 * 1000);

    const updated = await this.prisma.gameweek.update({
      where: { id: gameweekId },
      data: { transferDeadlineAt: derivedDeadline },
      include: {
        fixtures: { orderBy: { kickoffAt: 'asc' }, take: 1 },
      },
    });

    return this.buildDeadlineInfo(updated, new Date());
  }

  private buildDeadlineInfo(
    gw: { id: string; name: string; transferDeadlineAt: Date; status: GameweekStatus; fixtures: { kickoffAt: Date }[] },
    now: Date,
  ): FantasyDeadlineInfo {
    let isLocked = false;
    let lockReason: LockReason = 'OPEN';

    if (gw.status === GameweekStatus.COMPLETED) {
      isLocked = true;
      lockReason = 'GAMEWEEK_COMPLETED';
    } else if (gw.status === GameweekStatus.LIVE) {
      isLocked = true;
      lockReason = 'GAMEWEEK_LIVE';
    } else if (gw.status === GameweekStatus.LOCKED) {
      isLocked = true;
      lockReason = 'GAMEWEEK_LOCKED';
    } else if (gw.transferDeadlineAt <= now) {
      isLocked = true;
      lockReason = 'TRANSFER_DEADLINE';
    }

    return {
      gameweekId: gw.id,
      gameweekName: gw.name,
      transferDeadlineAt: gw.transferDeadlineAt,
      isLocked,
      lockReason,
      serverTime: now,
      firstFixtureKickoffAt: gw.fixtures[0]?.kickoffAt ?? null,
    };
  }
}
