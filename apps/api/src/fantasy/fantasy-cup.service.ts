import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FantasyCupTieStatus } from '@prisma/client';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCupDto } from './dto/create-cup.dto';

@Injectable()
export class FantasyCupService {
  constructor(private readonly prisma: PrismaService) {}

  async createCup(dto: CreateCupDto) {
    const season = await this.prisma.season.findUnique({ where: { id: dto.seasonId } });
    if (!season) throw new NotFoundException('Season not found');

    return this.prisma.fantasyCup.create({
      data: { seasonId: dto.seasonId, name: dto.name },
    });
  }

  async getCup(cupId: string) {
    const cup = await this.prisma.fantasyCup.findUnique({
      where: { id: cupId },
      include: {
        rounds: {
          include: {
            ties: {
              include: {
                homeTeam: { select: { id: true, name: true } },
                awayTeam: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
    if (!cup) throw new NotFoundException('Cup not found');
    return cup;
  }

  async getMyCups(userId: string) {
    const teams = await this.prisma.fantasyTeam.findMany({
      where: { userId },
      select: { id: true },
    });
    const teamIds = teams.map(t => t.id);

    return this.prisma.fantasyCup.findMany({
      where: {
        rounds: {
          some: {
            ties: {
              some: {
                OR: [{ homeTeamId: { in: teamIds } }, { awayTeamId: { in: teamIds } }],
              },
            },
          },
        },
      },
      include: { rounds: { select: { id: true, roundName: true, gameweekId: true } } },
    });
  }

  async generateCupRound(cupId: string, gameweekId: string, roundName: string, teamIds: string[]) {
    const cup = await this.prisma.fantasyCup.findUnique({ where: { id: cupId } });
    if (!cup) throw new NotFoundException('Cup not found');

    const gw = await this.prisma.gameweek.findUnique({ where: { id: gameweekId } });
    if (!gw) throw new NotFoundException('Gameweek not found');

    if (teamIds.length < 2) throw new BadRequestException('Need at least 2 teams');

    const round = await this.prisma.fantasyCupRound.create({
      data: { cupId, gameweekId, roundName },
    });

    const shuffled = [...teamIds].sort(() => Math.random() - 0.5);
    const ties: { roundId: string; homeTeamId: string; awayTeamId: string }[] = [];
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      const homeTeamId = shuffled[i];
      const awayTeamId = shuffled[i + 1];
      if (!homeTeamId || !awayTeamId) continue;
      ties.push({ roundId: round.id, homeTeamId, awayTeamId });
    }

    await this.prisma.fantasyCupTie.createMany({ data: ties });

    return { cupId, roundId: round.id, tiesCreated: ties.length };
  }

  async settleCupRound(cupId: string, gameweekId: string) {
    const round = await this.prisma.fantasyCupRound.findUnique({
      where: { cupId_gameweekId: { cupId, gameweekId } },
      include: {
        ties: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
    });
    if (!round) throw new NotFoundException('Cup round not found');

    let settled = 0;
    for (const tie of round.ties) {
      if (tie.status !== FantasyCupTieStatus.SCHEDULED) continue;

      const homePoints = tie.homeTeam.totalPoints - tie.homeTeam.totalTransferDeductions;
      const awayPoints = tie.awayTeam.totalPoints - tie.awayTeam.totalTransferDeductions;

      let winnerId: string;
      if (homePoints > awayPoints) {
        winnerId = tie.homeTeamId;
      } else if (awayPoints > homePoints) {
        winnerId = tie.awayTeamId;
      } else {
        // Tie-breaker: deterministic virtual coin toss — hash the sorted IDs
        // Lexicographically smaller ID wins if hash bit is 0, otherwise larger wins
        const sorted = [tie.homeTeamId, tie.awayTeamId].sort();
        const hash = createHash('sha256').update(sorted[0]! + ':' + sorted[1]!).digest('hex');
        const bit = parseInt(hash[0]!, 16) & 1;
        winnerId = bit === 0 ? sorted[0]! : sorted[1]!;
      }

      await this.prisma.fantasyCupTie.update({
        where: { id: tie.id },
        data: {
          homePoints,
          awayPoints,
          winnerId,
          status: FantasyCupTieStatus.COMPLETE,
          settledAt: new Date(),
        },
      });
      settled++;
    }

    await this.prisma.fantasyCupRound.update({
      where: { id: round.id },
      data: { settledAt: new Date() },
    });

    return { cupId, gameweekId, roundId: round.id, tiesSettled: settled };
  }
}
