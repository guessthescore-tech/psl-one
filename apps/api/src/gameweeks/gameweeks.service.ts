import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateGameweekStatusDto } from './dto/update-gameweek-status.dto';
import { UpdateGameweekDeadlinesDto } from './dto/update-gameweek-deadlines.dto';

const GAMEWEEK_SELECT = {
  id: true,
  name: true,
  slug: true,
  round: true,
  status: true,
  startsAt: true,
  endsAt: true,
  transferDeadlineAt: true,
  predictionDeadlineAt: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { fixtures: true } },
} as const;

const FIXTURE_SELECT = {
  id: true,
  kickoffAt: true,
  status: true,
  round: true,
  assignmentStatus: true,
  assignmentSource: true,
  assignedAt: true,
  homeScore: true,
  awayScore: true,
  homeTeam: { select: { id: true, name: true, shortName: true } },
  awayTeam: { select: { id: true, name: true, shortName: true } },
  venue: { select: { id: true, name: true, city: true } },
  stage: { select: { id: true, name: true, slug: true, type: true } },
} as const;

@Injectable()
export class GameweeksService {
  constructor(private prisma: PrismaService) {}

  private async getActiveSeason() {
    const season = await this.prisma.season.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    if (!season) throw new NotFoundException('No active season found');
    return season;
  }

  async findAll() {
    const season = await this.getActiveSeason();
    return this.prisma.gameweek.findMany({
      where: { seasonId: season.id },
      select: GAMEWEEK_SELECT,
      orderBy: { round: 'asc' },
    });
  }

  async findActive() {
    const season = await this.getActiveSeason();
    const now = new Date();
    const gw = await this.prisma.gameweek.findFirst({
      where: {
        seasonId: season.id,
        status: { in: ['OPEN', 'LIVE'] },
      },
      orderBy: { round: 'asc' },
      select: GAMEWEEK_SELECT,
    }) ?? await this.prisma.gameweek.findFirst({
      where: { seasonId: season.id, startsAt: { gt: now } },
      orderBy: { round: 'asc' },
      select: GAMEWEEK_SELECT,
    });
    if (!gw) throw new NotFoundException('No active or upcoming gameweek found');
    return gw;
  }

  async findOne(id: string) {
    const gw = await this.prisma.gameweek.findUnique({
      where: { id },
      select: GAMEWEEK_SELECT,
    });
    if (!gw) throw new NotFoundException(`Gameweek '${id}' not found`);
    return gw;
  }

  async findFixtures(id: string) {
    const gw = await this.prisma.gameweek.findUnique({
      where: { id },
      select: { id: true, name: true, fixtures: { select: FIXTURE_SELECT, orderBy: { kickoffAt: 'asc' } } },
    });
    if (!gw) throw new NotFoundException(`Gameweek '${id}' not found`);
    return gw;
  }

  async getLockState(id: string) {
    const gw = await this.prisma.gameweek.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        status: true,
        transferDeadlineAt: true,
        predictionDeadlineAt: true,
      },
    });
    if (!gw) throw new NotFoundException(`Gameweek '${id}' not found`);
    const now = new Date();
    return {
      gameweekId: gw.id,
      name: gw.name,
      status: gw.status,
      transferLocked: gw.transferDeadlineAt <= now,
      predictionLocked: gw.predictionDeadlineAt <= now,
      transferDeadlineAt: gw.transferDeadlineAt,
      predictionDeadlineAt: gw.predictionDeadlineAt,
    };
  }

  async updateStatus(id: string, dto: UpdateGameweekStatusDto) {
    const gw = await this.prisma.gameweek.findUnique({ where: { id }, select: { id: true } });
    if (!gw) throw new NotFoundException(`Gameweek '${id}' not found`);
    return this.prisma.gameweek.update({
      where: { id },
      data: { status: dto.status },
      select: GAMEWEEK_SELECT,
    });
  }

  async updateDeadlines(id: string, dto: UpdateGameweekDeadlinesDto) {
    const gw = await this.prisma.gameweek.findUnique({ where: { id }, select: { id: true } });
    if (!gw) throw new NotFoundException(`Gameweek '${id}' not found`);
    return this.prisma.gameweek.update({
      where: { id },
      data: {
        ...(dto.transferDeadlineAt !== undefined ? { transferDeadlineAt: new Date(dto.transferDeadlineAt) } : {}),
        ...(dto.predictionDeadlineAt !== undefined ? { predictionDeadlineAt: new Date(dto.predictionDeadlineAt) } : {}),
      },
      select: GAMEWEEK_SELECT,
    });
  }
}
