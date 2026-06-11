import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CompetitionFormat } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface AssignmentSummary {
  seasonId: string;
  total: number;
  assigned: number;
  unassigned: number;
  byGameweek: { gameweekId: string; gameweekName: string; fixtureCount: number }[];
  byStage: { stageId: string; stageName: string; fixtureCount: number }[];
}

// Maps fixture.round values to competition stage slugs (tournament/hybrid)
const ROUND_TO_STAGE_SLUG: Record<string, string> = {
  GROUP: 'group-stage',
  ROUND_OF_32: 'round-of-32',
  ROUND_OF_16: 'round-of-16',
  QUARTER_FINAL: 'quarter-finals',
  SEMI_FINAL: 'semi-finals',
  THIRD_PLACE: 'third-place-play-off',
  FINAL: 'final',
};

// Maps fixture.round values to gameweek slugs (non-GROUP only — GROUP uses date window)
const ROUND_TO_GAMEWEEK_SLUG: Record<string, string> = {
  ROUND_OF_32: 'round-of-32',
  ROUND_OF_16: 'round-of-16',
  QUARTER_FINAL: 'quarter-finals',
  SEMI_FINAL: 'semi-finals',
  THIRD_PLACE: 'third-place',
  FINAL: 'final',
};

const ASSIGNMENT_INCLUDE = {
  id: true,
  kickoffAt: true,
  status: true,
  round: true,
  assignmentStatus: true,
  assignmentSource: true,
  assignedAt: true,
  gameweekId: true,
  stageId: true,
  homeScore: true,
  awayScore: true,
  homeTeam: { select: { id: true, name: true, shortName: true, slug: true } },
  awayTeam: { select: { id: true, name: true, shortName: true, slug: true } },
  gameweek: { select: { id: true, name: true, slug: true, round: true } },
  stage: { select: { id: true, name: true, slug: true, type: true } },
} as const;

@Injectable()
export class FixtureAssignmentService {
  constructor(private prisma: PrismaService) {}

  async assignFixtureToGameweek(fixtureId: string, gameweekId: string) {
    const fixture = await this.prisma.fixture.findUnique({ where: { id: fixtureId }, select: { id: true } });
    if (!fixture) throw new NotFoundException(`Fixture '${fixtureId}' not found`);

    const gameweek = await this.prisma.gameweek.findUnique({ where: { id: gameweekId }, select: { id: true } });
    if (!gameweek) throw new NotFoundException(`Gameweek '${gameweekId}' not found`);

    return this.prisma.fixture.update({
      where: { id: fixtureId },
      data: {
        gameweekId,
        assignmentStatus: 'MANUALLY_ASSIGNED',
        assignmentSource: 'admin',
        assignedAt: new Date(),
      },
      select: ASSIGNMENT_INCLUDE,
    });
  }

  async assignFixtureToStage(fixtureId: string, stageId: string) {
    const fixture = await this.prisma.fixture.findUnique({ where: { id: fixtureId }, select: { id: true } });
    if (!fixture) throw new NotFoundException(`Fixture '${fixtureId}' not found`);

    const stage = await this.prisma.competitionStage.findUnique({ where: { id: stageId }, select: { id: true } });
    if (!stage) throw new NotFoundException(`Stage '${stageId}' not found`);

    return this.prisma.fixture.update({
      where: { id: fixtureId },
      data: {
        stageId,
        assignmentStatus: 'MANUALLY_ASSIGNED',
        assignmentSource: 'admin',
        assignedAt: new Date(),
      },
      select: ASSIGNMENT_INCLUDE,
    });
  }

  async bulkAssignFixturesToGameweek(fixtureIds: string[], gameweekId: string) {
    if (!fixtureIds.length) throw new BadRequestException('fixtureIds must not be empty');

    const gameweek = await this.prisma.gameweek.findUnique({ where: { id: gameweekId }, select: { id: true, name: true } });
    if (!gameweek) throw new NotFoundException(`Gameweek '${gameweekId}' not found`);

    const result = await this.prisma.fixture.updateMany({
      where: { id: { in: fixtureIds } },
      data: {
        gameweekId,
        assignmentStatus: 'MANUALLY_ASSIGNED',
        assignmentSource: 'admin',
        assignedAt: new Date(),
      },
    });

    return { gameweekId, gameweekName: gameweek.name, updatedCount: result.count };
  }

  async bulkAssignFixturesToStage(fixtureIds: string[], stageId: string) {
    if (!fixtureIds.length) throw new BadRequestException('fixtureIds must not be empty');

    const stage = await this.prisma.competitionStage.findUnique({ where: { id: stageId }, select: { id: true, name: true } });
    if (!stage) throw new NotFoundException(`Stage '${stageId}' not found`);

    const result = await this.prisma.fixture.updateMany({
      where: { id: { in: fixtureIds } },
      data: {
        stageId,
        assignmentStatus: 'MANUALLY_ASSIGNED',
        assignmentSource: 'admin',
        assignedAt: new Date(),
      },
    });

    return { stageId, stageName: stage.name, updatedCount: result.count };
  }

  async autoAssignFixturesForSeason(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: {
        competition: {
          include: { stages: { orderBy: { order: 'asc' } } },
        },
      },
    });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const fixtures = await this.prisma.fixture.findMany({
      where: { seasonId },
      select: { id: true, round: true, kickoffAt: true, gameweekId: true, stageId: true },
    });

    const gameweeks = await this.prisma.gameweek.findMany({
      where: { seasonId },
      orderBy: { round: 'asc' },
    });

    const stages = season.competition.stages;
    const format = season.competition.format;
    const isLeague = format === CompetitionFormat.LEAGUE || format === CompetitionFormat.CUP;

    const now = new Date();
    let assignedCount = 0;
    let skippedCount = 0;

    for (const fixture of fixtures) {
      const round = fixture.round ?? '';
      let gameweekId: string | undefined;
      let stageId: string | undefined;

      // Already fully assigned — just stamp status
      if (fixture.gameweekId && fixture.stageId) {
        await this.prisma.fixture.update({
          where: { id: fixture.id },
          data: { assignmentStatus: 'AUTO_ASSIGNED', assignmentSource: 'auto', assignedAt: now },
        });
        assignedCount++;
        continue;
      }

      if (isLeague) {
        // For league: match round (numeric string) to gameweek round number
        if (round) {
          const roundNum = parseInt(round, 10);
          if (!isNaN(roundNum)) {
            const gw = gameweeks.find(g => g.round === roundNum);
            if (gw) gameweekId = gw.id;
          }
          if (!gameweekId) {
            // Fallback: find gameweek by kickoff date window
            const gw = gameweeks.find(
              g => fixture.kickoffAt >= g.startsAt && fixture.kickoffAt <= g.endsAt,
            );
            if (gw) gameweekId = gw.id;
          }
        }
        // League competitions typically don't use stages
      } else {
        // Tournament / Hybrid
        if (round) {
          // Stage lookup
          const stageSlug = ROUND_TO_STAGE_SLUG[round];
          if (stageSlug) {
            const stage = stages.find(s => s.slug === stageSlug);
            if (stage) stageId = stage.id;
          }

          // Gameweek lookup
          if (round === 'GROUP') {
            // Find gameweek by kickoff date window (handles matchday 1/2/3)
            const gw =
              gameweeks.find(
                g => fixture.kickoffAt >= g.startsAt && fixture.kickoffAt <= g.endsAt,
              ) ??
              // Fallback: last gameweek that started before kickoff
              [...gameweeks]
                .filter(g => g.slug.startsWith('group') && g.startsAt <= fixture.kickoffAt)
                .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime())[0];
            if (gw) gameweekId = gw.id;
          } else {
            const gwSlug = ROUND_TO_GAMEWEEK_SLUG[round];
            if (gwSlug) {
              const gw = gameweeks.find(g => g.slug === gwSlug);
              if (gw) gameweekId = gw.id;
            }
          }
        }
      }

      // Apply existing assignments too
      const finalGameweekId = gameweekId ?? fixture.gameweekId ?? undefined;
      const finalStageId = stageId ?? fixture.stageId ?? undefined;

      if (finalGameweekId || finalStageId) {
        const updateData: Record<string, unknown> = {
          assignmentStatus: 'AUTO_ASSIGNED',
          assignmentSource: 'auto',
          assignedAt: now,
        };
        if (finalGameweekId) updateData['gameweekId'] = finalGameweekId;
        if (finalStageId) updateData['stageId'] = finalStageId;

        await this.prisma.fixture.update({ where: { id: fixture.id }, data: updateData });
        assignedCount++;
      } else {
        skippedCount++;
      }
    }

    return {
      seasonId,
      total: fixtures.length,
      assigned: assignedCount,
      skipped: skippedCount,
    };
  }

  async getUnassignedFixtures(seasonId: string) {
    if (seasonId) {
      const season = await this.prisma.season.findUnique({ where: { id: seasonId }, select: { id: true } });
      if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);
    }

    return this.prisma.fixture.findMany({
      where: {
        ...(seasonId ? { seasonId } : {}),
        OR: [{ gameweekId: null }, { assignmentStatus: 'UNASSIGNED' }],
      },
      select: ASSIGNMENT_INCLUDE,
      orderBy: { kickoffAt: 'asc' },
    });
  }

  async getAssignmentSummary(seasonId: string): Promise<AssignmentSummary> {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId }, select: { id: true } });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const [total, unassignedCount, gameweekGroups, stageGroups] = await Promise.all([
      this.prisma.fixture.count({ where: { seasonId } }),
      this.prisma.fixture.count({
        where: { seasonId, OR: [{ gameweekId: null }, { assignmentStatus: 'UNASSIGNED' }] },
      }),
      this.prisma.fixture.groupBy({
        by: ['gameweekId'],
        where: { seasonId, gameweekId: { not: null } },
        _count: { id: true },
      }),
      this.prisma.fixture.groupBy({
        by: ['stageId'],
        where: { seasonId, stageId: { not: null } },
        _count: { id: true },
      }),
    ]);

    // Resolve gameweek names
    const gameweekIds = gameweekGroups.map(g => g.gameweekId!);
    const gameweeks = gameweekIds.length
      ? await this.prisma.gameweek.findMany({
          where: { id: { in: gameweekIds } },
          select: { id: true, name: true },
        })
      : [];

    const gwNameMap = new Map(gameweeks.map(g => [g.id, g.name]));

    // Resolve stage names
    const stageIds = stageGroups.map(g => g.stageId!);
    const stagess = stageIds.length
      ? await this.prisma.competitionStage.findMany({
          where: { id: { in: stageIds } },
          select: { id: true, name: true },
        })
      : [];

    const stageNameMap = new Map(stagess.map(s => [s.id, s.name]));

    return {
      seasonId,
      total,
      assigned: total - unassignedCount,
      unassigned: unassignedCount,
      byGameweek: gameweekGroups.map(g => ({
        gameweekId: g.gameweekId!,
        gameweekName: gwNameMap.get(g.gameweekId!) ?? 'Unknown',
        fixtureCount: g._count.id,
      })),
      byStage: stageGroups.map(g => ({
        stageId: g.stageId!,
        stageName: stageNameMap.get(g.stageId!) ?? 'Unknown',
        fixtureCount: g._count.id,
      })),
    };
  }
}
