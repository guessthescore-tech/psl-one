import { Injectable, NotFoundException } from '@nestjs/common';
import { FantasySquadRole, PlayerPosition } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertMatchStatDto } from './dto/upsert-match-stat.dto';

interface ScoreBreakdown {
  playerId: string;
  position: PlayerPosition;
  appearance: number;
  goals: number;
  assists: number;
  cleanSheet: number;
  saves: number;
  cards: number;
  penalties: number;
  bonus: number;
  defensive: number;
  ownGoals: number;
  total: number;
}

export interface FixtureFantasySettleResult {
  fixtureId: string;
  teamsProcessed: number;
  ledgerEntriesCreated: number;
}

@Injectable()
export class FantasyScoringService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertMatchStat(fixtureId: string, dto: UpsertMatchStatDto) {
    const fixture = await this.prisma.fixture.findUnique({ where: { id: fixtureId } });
    if (!fixture) throw new NotFoundException('Fixture not found');

    const player = await this.prisma.player.findUnique({ where: { id: dto.playerId } });
    if (!player) throw new NotFoundException('Player not found');

    return this.prisma.fantasyPlayerMatchStat.upsert({
      where: { playerId_fixtureId: { playerId: dto.playerId, fixtureId } },
      create: {
        playerId: dto.playerId,
        fixtureId,
        ...(dto.minutesPlayed !== undefined ? { minutesPlayed: dto.minutesPlayed } : {}),
        ...(dto.goals !== undefined ? { goals: dto.goals } : {}),
        ...(dto.assists !== undefined ? { assists: dto.assists } : {}),
        ...(dto.ownGoals !== undefined ? { ownGoals: dto.ownGoals } : {}),
        ...(dto.yellowCards !== undefined ? { yellowCards: dto.yellowCards } : {}),
        ...(dto.redCards !== undefined ? { redCards: dto.redCards } : {}),
        ...(dto.penaltiesMissed !== undefined ? { penaltiesMissed: dto.penaltiesMissed } : {}),
        ...(dto.penaltiesSaved !== undefined ? { penaltiesSaved: dto.penaltiesSaved } : {}),
        ...(dto.saves !== undefined ? { saves: dto.saves } : {}),
        ...(dto.cleanSheet !== undefined ? { cleanSheet: dto.cleanSheet } : {}),
        ...(dto.bonusPoints !== undefined ? { bonusPoints: dto.bonusPoints } : {}),
        ...(dto.tacklesWon !== undefined ? { tacklesWon: dto.tacklesWon } : {}),
        ...(dto.interceptions !== undefined ? { interceptions: dto.interceptions } : {}),
        ...(dto.blockedShots !== undefined ? { blockedShots: dto.blockedShots } : {}),
        ...(dto.didNotPlay !== undefined ? { didNotPlay: dto.didNotPlay } : {}),
      },
      update: {
        ...(dto.minutesPlayed !== undefined ? { minutesPlayed: dto.minutesPlayed } : {}),
        ...(dto.goals !== undefined ? { goals: dto.goals } : {}),
        ...(dto.assists !== undefined ? { assists: dto.assists } : {}),
        ...(dto.ownGoals !== undefined ? { ownGoals: dto.ownGoals } : {}),
        ...(dto.yellowCards !== undefined ? { yellowCards: dto.yellowCards } : {}),
        ...(dto.redCards !== undefined ? { redCards: dto.redCards } : {}),
        ...(dto.penaltiesMissed !== undefined ? { penaltiesMissed: dto.penaltiesMissed } : {}),
        ...(dto.penaltiesSaved !== undefined ? { penaltiesSaved: dto.penaltiesSaved } : {}),
        ...(dto.saves !== undefined ? { saves: dto.saves } : {}),
        ...(dto.cleanSheet !== undefined ? { cleanSheet: dto.cleanSheet } : {}),
        ...(dto.bonusPoints !== undefined ? { bonusPoints: dto.bonusPoints } : {}),
        ...(dto.tacklesWon !== undefined ? { tacklesWon: dto.tacklesWon } : {}),
        ...(dto.interceptions !== undefined ? { interceptions: dto.interceptions } : {}),
        ...(dto.blockedShots !== undefined ? { blockedShots: dto.blockedShots } : {}),
        ...(dto.didNotPlay !== undefined ? { didNotPlay: dto.didNotPlay } : {}),
      },
    });
  }

  scoreFromMatchStat(
    stat: {
      minutesPlayed: number;
      goals: number;
      assists: number;
      ownGoals: number;
      yellowCards: number;
      redCards: number;
      penaltiesMissed: number;
      penaltiesSaved: number;
      saves: number;
      cleanSheet: boolean;
      bonusPoints: number;
      tacklesWon: number;
      interceptions: number;
      blockedShots: number;
      didNotPlay: boolean;
    },
    position: PlayerPosition,
    captainMultiplier: 1 | 2 | 3 = 1,
  ): ScoreBreakdown {
    if (stat.didNotPlay) {
      return {
        playerId: '',
        position,
        appearance: 0,
        goals: 0,
        assists: 0,
        cleanSheet: 0,
        saves: 0,
        cards: 0,
        penalties: 0,
        bonus: 0,
        defensive: 0,
        ownGoals: 0,
        total: 0,
      };
    }

    const appearancePoints = stat.minutesPlayed >= 60 ? 2 : stat.minutesPlayed > 0 ? 1 : 0;

    const goalPoints =
      position === PlayerPosition.GOALKEEPER || position === PlayerPosition.DEFENDER
        ? stat.goals * 6
        : position === PlayerPosition.MIDFIELDER
          ? stat.goals * 5
          : stat.goals * 4;

    const assistPoints = stat.assists * 3;

    const cleanSheetPoints =
      stat.cleanSheet && stat.minutesPlayed >= 60
        ? position === PlayerPosition.GOALKEEPER || position === PlayerPosition.DEFENDER
          ? 4
          : position === PlayerPosition.MIDFIELDER
            ? 1
            : 0
        : 0;

    const savePoints = Math.floor(stat.saves / 3);
    const penaltySavePoints = stat.penaltiesSaved * 5;
    const penaltyMissPoints = stat.penaltiesMissed * -2;

    const yellowCardPoints = stat.yellowCards * -1;
    const redCardPoints = stat.redCards * -3;
    const ownGoalPoints = stat.ownGoals * -2;

    const bonusPoints = stat.bonusPoints;

    // Defensive contribution: 1pt per 3 tackles/interceptions/blocked shots combined
    const defensiveContrib = Math.floor((stat.tacklesWon + stat.interceptions + stat.blockedShots) / 3);

    const rawTotal =
      appearancePoints +
      goalPoints +
      assistPoints +
      cleanSheetPoints +
      savePoints +
      penaltySavePoints +
      penaltyMissPoints +
      yellowCardPoints +
      redCardPoints +
      ownGoalPoints +
      bonusPoints +
      defensiveContrib;

    return {
      playerId: '',
      position,
      appearance: appearancePoints,
      goals: goalPoints,
      assists: assistPoints,
      cleanSheet: cleanSheetPoints,
      saves: savePoints + penaltySavePoints,
      cards: yellowCardPoints + redCardPoints,
      penalties: penaltyMissPoints,
      bonus: bonusPoints,
      defensive: defensiveContrib,
      ownGoals: ownGoalPoints,
      total: rawTotal * captainMultiplier,
    };
  }

  async settleFixtureFromStats(fixtureId: string): Promise<FixtureFantasySettleResult> {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: { fantasyMatchStats: true },
    });
    if (!fixture) throw new NotFoundException('Fixture not found');
    if (fixture.status !== 'FINISHED') {
      throw new NotFoundException('Fixture is not finished');
    }

    const stats = fixture.fantasyMatchStats;
    if (stats.length === 0) {
      return { fixtureId, teamsProcessed: 0, ledgerEntriesCreated: 0 };
    }

    // Build a map of playerId -> score
    const playerScores = new Map<string, number>();
    for (const stat of stats) {
      const player = await this.prisma.player.findUnique({
        where: { id: stat.playerId },
        select: { position: true },
      });
      if (!player) continue;
      const breakdown = this.scoreFromMatchStat(stat, player.position, 1);
      playerScores.set(stat.playerId, breakdown.total);
    }

    // Find all fantasy team players who played in this fixture
    const teamPlayers = await this.prisma.fantasyTeamPlayer.findMany({
      where: { playerId: { in: Array.from(playerScores.keys()) } },
      include: { fantasyTeam: true },
    });

    const ledgerData: {
      fantasyTeamId: string;
      playerId: string;
      fixtureId: string;
      points: number;
      reason: string;
      isCaptainBonus: boolean;
    }[] = [];

    const teamMap = new Map<string, typeof teamPlayers[0][]>();
    for (const tp of teamPlayers) {
      if (tp.squadRole !== FantasySquadRole.STARTER) continue;
      const arr = teamMap.get(tp.fantasyTeamId) ?? [];
      arr.push(tp);
      teamMap.set(tp.fantasyTeamId, arr);
    }

    for (const [fantasyTeamId, slots] of teamMap) {
      for (const slot of slots) {
        const baseScore = playerScores.get(slot.playerId) ?? 0;
        const activeChip = await this.prisma.fantasyChip.findFirst({
          where: { fantasyTeamId, status: 'ACTIVE' },
        });

        let captainMult: 1 | 2 | 3 = 1;
        if (slot.isCaptain) {
          captainMult = activeChip?.type === 'TRIPLE_CAPTAIN' ? 3 : 2;
        }

        const finalScore = slot.isCaptain ? baseScore * captainMult : baseScore;

        ledgerData.push({
          fantasyTeamId,
          playerId: slot.playerId,
          fixtureId,
          points: finalScore,
          reason: slot.isCaptain ? `scored_from_stats_captain` : 'scored_from_stats',
          isCaptainBonus: slot.isCaptain && captainMult > 1,
        });
      }
    }

    if (ledgerData.length > 0) {
      await this.prisma.fantasyPointsLedger.createMany({
        data: ledgerData,
        skipDuplicates: true,
      });

      // Update team totals
      const teamTotals = new Map<string, number>();
      for (const entry of ledgerData) {
        teamTotals.set(entry.fantasyTeamId, (teamTotals.get(entry.fantasyTeamId) ?? 0) + entry.points);
      }
      for (const [tid, pts] of teamTotals) {
        await this.prisma.fantasyTeam.update({
          where: { id: tid },
          data: { totalPoints: { increment: pts } },
        });
      }
    }

    return {
      fixtureId,
      teamsProcessed: teamMap.size,
      ledgerEntriesCreated: ledgerData.length,
    };
  }
}
