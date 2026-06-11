import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { SeasonStatus } from '@prisma/client';

const COMPETITION_SELECT = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  format: true,
  teamCount: true,
  hasGroups: true,
  hasKnockouts: true,
  hasHomeAway: true,
  usesNeutralVenues: true,
  pointsForWin: true,
  pointsForDraw: true,
  pointsForLoss: true,
  source: true,
  externalId: true,
  sourceUrl: true,
  _count: { select: { seasons: true, stages: true } },
} as const;

const SEASON_SELECT = {
  id: true,
  competitionId: true,
  name: true,
  slug: true,
  startDate: true,
  endDate: true,
  isActive: true,
  status: true,
  source: true,
  externalId: true,
  sourceUrl: true,
  importedAt: true,
  _count: { select: { fixtures: true } },
} as const;

@Injectable()
export class AdminCompetitionsService {
  constructor(private prisma: PrismaService) {}

  listCompetitions() {
    return this.prisma.competition.findMany({
      select: { ...COMPETITION_SELECT, stages: { select: { id: true, name: true, type: true, order: true }, orderBy: { order: 'asc' } } },
      orderBy: { name: 'asc' },
    });
  }

  async createCompetition(dto: CreateCompetitionDto) {
    const existing = await this.prisma.competition.findUnique({ where: { slug: dto.slug }, select: { id: true } });
    if (existing) throw new ConflictException(`Competition slug '${dto.slug}' is already taken`);
    return this.prisma.competition.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        format: dto.format,
        hasGroups: dto.hasGroups,
        hasKnockouts: dto.hasKnockouts,
        hasHomeAway: dto.hasHomeAway,
        usesNeutralVenues: dto.usesNeutralVenues,
        ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl } : {}),
        ...(dto.teamCount !== undefined ? { teamCount: dto.teamCount } : {}),
        ...(dto.pointsForWin !== undefined ? { pointsForWin: dto.pointsForWin } : {}),
        ...(dto.pointsForDraw !== undefined ? { pointsForDraw: dto.pointsForDraw } : {}),
        ...(dto.pointsForLoss !== undefined ? { pointsForLoss: dto.pointsForLoss } : {}),
        ...(dto.source !== undefined ? { source: dto.source } : {}),
        ...(dto.externalId !== undefined ? { externalId: dto.externalId } : {}),
        ...(dto.sourceUrl !== undefined ? { sourceUrl: dto.sourceUrl } : {}),
      },
      select: COMPETITION_SELECT,
    });
  }

  async updateCompetition(id: string, dto: UpdateCompetitionDto) {
    const comp = await this.prisma.competition.findUnique({ where: { id }, select: { id: true } });
    if (!comp) throw new NotFoundException(`Competition '${id}' not found`);
    return this.prisma.competition.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl } : {}),
        ...(dto.format !== undefined ? { format: dto.format } : {}),
        ...(dto.teamCount !== undefined ? { teamCount: dto.teamCount } : {}),
        ...(dto.hasGroups !== undefined ? { hasGroups: dto.hasGroups } : {}),
        ...(dto.hasKnockouts !== undefined ? { hasKnockouts: dto.hasKnockouts } : {}),
        ...(dto.hasHomeAway !== undefined ? { hasHomeAway: dto.hasHomeAway } : {}),
        ...(dto.usesNeutralVenues !== undefined ? { usesNeutralVenues: dto.usesNeutralVenues } : {}),
        ...(dto.pointsForWin !== undefined ? { pointsForWin: dto.pointsForWin } : {}),
        ...(dto.pointsForDraw !== undefined ? { pointsForDraw: dto.pointsForDraw } : {}),
        ...(dto.pointsForLoss !== undefined ? { pointsForLoss: dto.pointsForLoss } : {}),
        ...(dto.source !== undefined ? { source: dto.source } : {}),
        ...(dto.externalId !== undefined ? { externalId: dto.externalId } : {}),
        ...(dto.sourceUrl !== undefined ? { sourceUrl: dto.sourceUrl } : {}),
      },
      select: COMPETITION_SELECT,
    });
  }

  async listSeasons(competitionId: string) {
    const comp = await this.prisma.competition.findUnique({ where: { id: competitionId }, select: { id: true } });
    if (!comp) throw new NotFoundException(`Competition '${competitionId}' not found`);
    return this.prisma.season.findMany({
      where: { competitionId },
      select: SEASON_SELECT,
      orderBy: { startDate: 'desc' },
    });
  }

  async createSeason(competitionId: string, dto: CreateSeasonDto) {
    const comp = await this.prisma.competition.findUnique({ where: { id: competitionId }, select: { id: true } });
    if (!comp) throw new NotFoundException(`Competition '${competitionId}' not found`);
    const existing = await this.prisma.season.findUnique({ where: { slug: dto.slug }, select: { id: true } });
    if (existing) throw new ConflictException(`Season slug '${dto.slug}' is already taken`);
    return this.prisma.season.create({
      data: {
        competitionId,
        name: dto.name,
        slug: dto.slug,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isActive: false,
        status: dto.status ?? SeasonStatus.UPCOMING,
        ...(dto.source !== undefined ? { source: dto.source } : {}),
        ...(dto.externalId !== undefined ? { externalId: dto.externalId } : {}),
        ...(dto.sourceUrl !== undefined ? { sourceUrl: dto.sourceUrl } : {}),
      },
      select: SEASON_SELECT,
    });
  }

  async updateSeason(id: string, dto: UpdateSeasonDto) {
    const season = await this.prisma.season.findUnique({ where: { id }, select: { id: true } });
    if (!season) throw new NotFoundException(`Season '${id}' not found`);
    return this.prisma.season.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.startDate !== undefined ? { startDate: new Date(dto.startDate) } : {}),
        ...(dto.endDate !== undefined ? { endDate: new Date(dto.endDate) } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.source !== undefined ? { source: dto.source } : {}),
        ...(dto.sourceUrl !== undefined ? { sourceUrl: dto.sourceUrl } : {}),
      },
      select: SEASON_SELECT,
    });
  }

  async activateSeason(id: string) {
    const season = await this.prisma.season.findUnique({
      where: { id },
      select: { id: true, name: true, competitionId: true },
    });
    if (!season) throw new NotFoundException(`Season '${id}' not found`);

    return this.prisma.$transaction(async (tx) => {
      // Deactivate all currently active seasons globally
      await tx.season.updateMany({
        where: { isActive: true },
        data: { isActive: false, status: SeasonStatus.COMPLETED },
      });
      // Activate the target season
      return tx.season.update({
        where: { id },
        data: { isActive: true, status: SeasonStatus.ACTIVE },
        select: SEASON_SELECT,
      });
    });
  }
}
