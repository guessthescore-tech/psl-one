import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AuditEvent, FixtureStatus, PredictionChallengeStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// Points configuration
const POINTS = {
  EXACT_SCORE: 10,
  CORRECT_OUTCOME: 5,
  INCORRECT: 0,
} as const;

function getOutcome(home: number, away: number): 'HOME' | 'DRAW' | 'AWAY' {
  if (home > away) return 'HOME';
  if (home < away) return 'AWAY';
  return 'DRAW';
}

function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number,
): number {
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return POINTS.EXACT_SCORE;
  }
  if (getOutcome(predictedHome, predictedAway) === getOutcome(actualHome, actualAway)) {
    return POINTS.CORRECT_OUTCOME;
  }
  return POINTS.INCORRECT;
}

@Injectable()
export class ChallengeSettlementService {
  private readonly logger = new Logger(ChallengeSettlementService.name);

  constructor(private prisma: PrismaService) {}

  async settle(token: string): Promise<{
    status: string;
    creatorPoints: number;
    acceptorPoints: number;
    winnerUserId: string | null;
    settlementReason: string;
  }> {
    const challenge = await this.prisma.predictionChallenge.findUnique({
      where: { token },
      include: {
        fixture: {
          select: {
            id: true,
            status: true,
            homeScore: true,
            awayScore: true,
          },
        },
      },
    });

    if (!challenge) throw new NotFoundException('Challenge not found');

    // Idempotent: already settled
    if (challenge.status === PredictionChallengeStatus.SETTLED) {
      return {
        status: 'SETTLED',
        creatorPoints: challenge.creatorPoints ?? 0,
        acceptorPoints: challenge.acceptorPoints ?? 0,
        winnerUserId: challenge.winnerUserId,
        settlementReason: challenge.settlementReason ?? 'Already settled',
      };
    }

    if (challenge.status !== PredictionChallengeStatus.ACCEPTED) {
      throw new BadRequestException(
        `Challenge must be ACCEPTED before settlement. Current status: ${challenge.status}`,
      );
    }

    if (challenge.fixture.status !== FixtureStatus.FINISHED) {
      throw new BadRequestException(
        `Fixture must be FINISHED before settlement. Current status: ${challenge.fixture.status}`,
      );
    }

    const actualHome = challenge.fixture.homeScore ?? 0;
    const actualAway = challenge.fixture.awayScore ?? 0;

    const creatorPoints = calculatePoints(
      challenge.creatorHomeScore,
      challenge.creatorAwayScore,
      actualHome,
      actualAway,
    );

    const acceptorPoints = calculatePoints(
      challenge.acceptorHomeScore ?? 0,
      challenge.acceptorAwayScore ?? 0,
      actualHome,
      actualAway,
    );

    let winnerUserId: string | null = null;
    let settlementReason: string;

    if (creatorPoints > acceptorPoints) {
      winnerUserId = challenge.creatorUserId;
      settlementReason = `Creator wins: ${creatorPoints} pts vs ${acceptorPoints} pts`;
    } else if (acceptorPoints > creatorPoints) {
      winnerUserId = challenge.acceptorUserId ?? null;
      settlementReason = `Acceptor wins: ${acceptorPoints} pts vs ${creatorPoints} pts`;
    } else {
      winnerUserId = null;
      settlementReason = `Draw: both scored ${creatorPoints} pts`;
    }

    await this.prisma.predictionChallenge.update({
      where: { token },
      data: {
        status: PredictionChallengeStatus.SETTLED,
        settledAt: new Date(),
        creatorPoints,
        acceptorPoints,
        winnerUserId,
        settlementReason,
      },
    });

    await this.writeAuditLog(challenge.creatorUserId, AuditEvent.CHALLENGE_SETTLED);
    if (challenge.acceptorUserId) {
      await this.writeAuditLog(challenge.acceptorUserId, AuditEvent.CHALLENGE_SETTLED);
    }

    return { status: 'SETTLED', creatorPoints, acceptorPoints, winnerUserId, settlementReason };
  }

  async getResult(token: string) {
    const challenge = await this.prisma.predictionChallenge.findUnique({
      where: { token },
      select: {
        id: true,
        status: true,
        creatorHomeScore: true,
        creatorAwayScore: true,
        acceptorHomeScore: true,
        acceptorAwayScore: true,
        creatorPoints: true,
        acceptorPoints: true,
        winnerUserId: true,
        settlementReason: true,
        settledAt: true,
        fixture: {
          select: {
            id: true,
            status: true,
            homeScore: true,
            awayScore: true,
            homeTeam: { select: { id: true, name: true, shortName: true, slug: true } },
            awayTeam: { select: { id: true, name: true, shortName: true, slug: true } },
          },
        },
      },
    });

    if (!challenge) throw new NotFoundException('Challenge not found');

    return {
      id: challenge.id,
      status: challenge.status,
      creatorHomeScore: challenge.creatorHomeScore,
      creatorAwayScore: challenge.creatorAwayScore,
      acceptorHomeScore: challenge.acceptorHomeScore,
      acceptorAwayScore: challenge.acceptorAwayScore,
      creatorPoints: challenge.creatorPoints,
      acceptorPoints: challenge.acceptorPoints,
      winnerUserId: challenge.winnerUserId,
      settlementReason: challenge.settlementReason,
      settledAt: challenge.settledAt,
      fixture: challenge.fixture,
    };
  }

  async settleAllAcceptedForFixture(fixtureId: string): Promise<{
    settled: number;
    skipped: number;
    errors: number;
  }> {
    // Find all ACCEPTED challenges for this fixture
    const challenges = await this.prisma.predictionChallenge.findMany({
      where: {
        fixtureId,
        status: PredictionChallengeStatus.ACCEPTED,
      },
      select: { token: true },
    });

    let settled = 0;
    let skipped = 0;
    let errors = 0;

    for (const { token } of challenges) {
      try {
        const result = await this.settle(token);
        if (result.status === 'SETTLED') settled++;
        else skipped++;
      } catch (err: unknown) {
        // One challenge failure must not block others
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn({ action: 'settlement.challenge.skipped', reason: msg });
        errors++;
      }
    }

    this.logger.log({ action: 'settlement.fixture.completed', fixtureId, settled, skipped, errors });

    return { settled, skipped, errors };
  }

  private async writeAuditLog(userId: string, event: AuditEvent) {
    try {
      await this.prisma.authAuditLog.create({ data: { userId, event, success: true } });
    } catch {
      // Audit failure must not break primary flow.
    }
  }
}
