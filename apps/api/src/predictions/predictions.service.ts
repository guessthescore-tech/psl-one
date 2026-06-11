import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationPriority, NotificationType, PredictionStatus, ChallengeStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';
import { calculatePoints } from './scoring';
import { FanValueLedgerService } from '../fan-value/fan-value-ledger.service';
import { AchievementsService } from '../achievements/achievements.service';
import { NotificationsService } from '../notifications/notifications.service';

const FIXTURE_SELECT = {
  id: true,
  kickoffAt: true,
  status: true,
  homeScore: true,
  awayScore: true,
  homeTeam: { select: { id: true, name: true, shortName: true, slug: true } },
  awayTeam: { select: { id: true, name: true, shortName: true, slug: true } },
} as const;

const PREDICTION_INCLUDE = {
  fixture: { select: FIXTURE_SELECT },
} as const;

type LockReason = 'GAMEWEEK_DEADLINE' | 'KICKOFF_PASSED' | 'FIXTURE_STARTED' | 'FIXTURE_FINISHED' | 'OPEN';

const LOCKED_RUNNING_STATUSES = ['LIVE', 'HALF_TIME', 'POSTPONED', 'CANCELLED'] as const;

@Injectable()
export class PredictionsService {
  constructor(
    private prisma: PrismaService,
    private readonly fanValueLedgerService: FanValueLedgerService,
    private readonly achievementsService: AchievementsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createPrediction(userId: string, dto: CreatePredictionDto) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: dto.fixtureId },
      select: {
        id: true,
        status: true,
        kickoffAt: true,
        gameweek: { select: { predictionDeadlineAt: true } },
      },
    });
    if (!fixture) throw new NotFoundException(`Fixture '${dto.fixtureId}' not found`);
    this.assertPredictionOpen(fixture);

    try {
      const prediction = await this.prisma.scorePrediction.create({
        data: {
          userId,
          fixtureId: dto.fixtureId,
          predictedHomeScore: dto.predictedHomeScore,
          predictedAwayScore: dto.predictedAwayScore,
        },
        include: PREDICTION_INCLUDE,
      });
      this.achievementsService.safeEvaluate(userId, ['first-prediction']).catch(() => null);
      return prediction;
    } catch (err: unknown) {
      if (this.isPrismaUniqueError(err)) {
        throw new ConflictException('You already have a prediction for this fixture');
      }
      throw err;
    }
  }

  async updatePrediction(userId: string, predictionId: string, dto: UpdatePredictionDto) {
    const prediction = await this.prisma.scorePrediction.findUnique({
      where: { id: predictionId },
      include: {
        fixture: {
          select: {
            id: true,
            status: true,
            kickoffAt: true,
            gameweek: { select: { predictionDeadlineAt: true } },
          },
        },
      },
    });
    if (!prediction) throw new NotFoundException('Prediction not found');
    if (prediction.userId !== userId) throw new ForbiddenException();
    if (prediction.status !== PredictionStatus.PENDING) {
      throw new BadRequestException('Prediction is locked for this fixture');
    }
    this.assertPredictionOpen(prediction.fixture);

    return this.prisma.scorePrediction.update({
      where: { id: predictionId },
      data: {
        ...(dto.predictedHomeScore !== undefined ? { predictedHomeScore: dto.predictedHomeScore } : {}),
        ...(dto.predictedAwayScore !== undefined ? { predictedAwayScore: dto.predictedAwayScore } : {}),
      },
      include: PREDICTION_INCLUDE,
    });
  }

  getMyPredictions(userId: string) {
    return this.prisma.scorePrediction.findMany({
      where: { userId },
      include: PREDICTION_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyPredictionForFixture(userId: string, fixtureId: string) {
    const prediction = await this.prisma.scorePrediction.findUnique({
      where: { userId_fixtureId: { userId, fixtureId } },
      include: PREDICTION_INCLUDE,
    });
    if (!prediction) throw new NotFoundException('No prediction found for this fixture');
    return prediction;
  }

  async getFixtureLockState(fixtureId: string) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      select: {
        id: true,
        status: true,
        kickoffAt: true,
        gameweek: { select: { predictionDeadlineAt: true } },
      },
    });
    if (!fixture) throw new NotFoundException(`Fixture '${fixtureId}' not found`);
    const state = this.computeLockState(fixture);
    return { fixtureId, ...state };
  }

  async lockFixture(fixtureId: string) {
    const exists = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException(`Fixture '${fixtureId}' not found`);

    const alreadyLocked = await this.prisma.scorePrediction.count({
      where: { fixtureId, status: PredictionStatus.LOCKED },
    });

    const result = await this.prisma.scorePrediction.updateMany({
      where: { fixtureId, status: PredictionStatus.PENDING },
      data: { status: PredictionStatus.LOCKED },
    });

    return { fixtureId, predictionsLocked: result.count, skippedAlreadyLocked: alreadyLocked };
  }

  async voidFixture(fixtureId: string) {
    const exists = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException(`Fixture '${fixtureId}' not found`);

    const alreadyTerminal = await this.prisma.scorePrediction.count({
      where: {
        fixtureId,
        status: { in: [PredictionStatus.WON, PredictionStatus.LOST, PredictionStatus.SETTLED, PredictionStatus.VOID] },
      },
    });

    const result = await this.prisma.scorePrediction.updateMany({
      where: { fixtureId, status: { in: [PredictionStatus.PENDING, PredictionStatus.LOCKED] } },
      data: { status: PredictionStatus.VOID },
    });

    return { fixtureId, predictionsVoided: result.count, skippedAlreadySettledOrVoid: alreadyTerminal };
  }

  async settleFixture(fixtureId: string) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      select: { id: true, status: true, homeScore: true, awayScore: true },
    });
    if (!fixture) throw new NotFoundException(`Fixture '${fixtureId}' not found`);
    if (fixture.status !== 'FINISHED') {
      throw new BadRequestException('Fixture must be FINISHED before settling predictions');
    }
    if (fixture.homeScore === null || fixture.awayScore === null) {
      throw new BadRequestException('Fixture result (scores) is not yet recorded');
    }

    // Only process PENDING and LOCKED — settled predictions are skipped (idempotency)
    const predictions = await this.prisma.scorePrediction.findMany({
      where: { fixtureId, status: { in: [PredictionStatus.PENDING, PredictionStatus.LOCKED] } },
    });

    const settledAt = new Date();
    const summary: { predictionId: string; userId: string; points: number }[] = [];

    for (const p of predictions) {
      const points = calculatePoints(
        fixture.homeScore,
        fixture.awayScore,
        p.predictedHomeScore,
        p.predictedAwayScore,
      );
      const status = points > 0 ? PredictionStatus.WON : PredictionStatus.LOST;

      await this.prisma.scorePrediction.update({
        where: { id: p.id },
        data: { pointsAwarded: points, status, settledAt },
      });

      await this.prisma.predictionPointsLedger.create({
        data: {
          userId: p.userId,
          fixtureId,
          predictionId: p.id,
          points,
          reason: `Fixture settlement: ${points} pts`,
        },
      });

      // Post to unified fan value ledger (idempotent)
      await this.fanValueLedgerService.postPredictionSettlement(p.id, p.userId, points, fixtureId).catch(() => null);

      // Achievement hooks: exact score, cumulative prediction points, fan value points
      if (points === 10) {
        this.achievementsService.safeEvaluate(p.userId, ['first-exact-score']).catch(() => null);
      }
      this.achievementsService.safeEvaluate(p.userId, ['prediction-points-25', 'prediction-points-50', 'fan-value-100', 'fan-value-250']).catch(() => null);

      // Notification hook (safe)
      this.notificationsService.createInAppNotification({
        userId: p.userId,
        type: NotificationType.PREDICTION_RESULT,
        title: points > 0 ? `Prediction scored ${points} pts!` : 'Prediction result in',
        body: points > 0 ? `Your prediction earned you ${points} Fan Value points.` : 'Better luck next time!',
        priority: NotificationPriority.NORMAL,
        sourceType: 'PREDICTION',
        sourceId: p.id,
        actionUrl: `/predictions`,
      }).catch(() => null);

      summary.push({ predictionId: p.id, userId: p.userId, points });
    }

    // Settle challenges after all predictions are scored
    const challenges = await this.prisma.peerChallenge.findMany({
      where: { fixtureId, status: ChallengeStatus.ACCEPTED },
    });

    for (const ch of challenges) {
      const [cPred, oPred] = await Promise.all([
        ch.challengerPredictionId
          ? this.prisma.scorePrediction.findUnique({
              where: { id: ch.challengerPredictionId },
              select: { pointsAwarded: true },
            })
          : Promise.resolve(null),
        ch.opponentPredictionId
          ? this.prisma.scorePrediction.findUnique({
              where: { id: ch.opponentPredictionId },
              select: { pointsAwarded: true },
            })
          : Promise.resolve(null),
      ]);

      const cPts = cPred?.pointsAwarded ?? 0;
      const oPts = oPred?.pointsAwarded ?? 0;
      let winnerUserId: string | null = null;
      if (cPts > oPts) winnerUserId = ch.challengerUserId;
      else if (oPts > cPts) winnerUserId = ch.opponentUserId;

      await this.prisma.peerChallenge.update({
        where: { id: ch.id },
        data: {
          status: ChallengeStatus.SETTLED,
          ...(winnerUserId ? { winnerUserId } : {}),
          pointsAwardedChallenger: cPts,
          pointsAwardedOpponent: oPts,
          settledAt,
        },
      });

      // Post challenge points to fan value ledger for both participants (idempotent)
      await Promise.all([
        this.fanValueLedgerService.postPeerChallenge(ch.id, ch.challengerUserId, cPts, 'challenger', fixtureId).catch(() => null),
        this.fanValueLedgerService.postPeerChallenge(ch.id, ch.opponentUserId, oPts, 'opponent', fixtureId).catch(() => null),
      ]);

      // Achievement hooks for challenge winner
      if (winnerUserId) {
        this.achievementsService.safeEvaluate(winnerUserId, ['first-challenge-win']).catch(() => null);
      }

      // Notify both participants of challenge result (safe hook)
      const resultBody = winnerUserId
        ? winnerUserId === ch.challengerUserId
          ? `You won! You scored ${cPts} pts vs ${oPts} pts.`
          : `You won! You scored ${oPts} pts vs ${cPts} pts.`
        : `It's a draw! Both scored ${cPts} pts.`;
      for (const participantId of [ch.challengerUserId, ch.opponentUserId]) {
        this.notificationsService.createInAppNotification({
          userId: participantId,
          type: NotificationType.CHALLENGE_RESULT,
          title: winnerUserId === participantId ? 'You won the challenge!' : winnerUserId ? 'Challenge result in' : 'Challenge drawn!',
          body: resultBody,
          priority: NotificationPriority.NORMAL,
          sourceType: 'CHALLENGE',
          sourceId: ch.id,
          actionUrl: `/predictions`,
        }).catch(() => null);
      }
    }

    return {
      fixtureId,
      predictionsSettled: predictions.length,
      challengesSettled: challenges.length,
      summary,
    };
  }

  async lockGameweekPredictions(gameweekId: string, force = false) {
    const gameweek = await this.prisma.gameweek.findUnique({
      where: { id: gameweekId },
      select: {
        id: true,
        name: true,
        predictionDeadlineAt: true,
        fixtures: { select: { id: true } },
      },
    });
    if (!gameweek) throw new NotFoundException(`Gameweek '${gameweekId}' not found`);

    const now = new Date();
    if (!force && gameweek.predictionDeadlineAt > now) {
      throw new BadRequestException(
        `Prediction deadline for '${gameweek.name}' has not yet passed (${gameweek.predictionDeadlineAt.toISOString()})`,
      );
    }

    const fixtureIds = gameweek.fixtures.map(f => f.id);
    if (!fixtureIds.length) return { gameweekId, gameweekName: gameweek.name, locked: 0 };

    const result = await this.prisma.scorePrediction.updateMany({
      where: { fixtureId: { in: fixtureIds }, status: PredictionStatus.PENDING },
      data: { status: PredictionStatus.LOCKED },
    });

    return { gameweekId, gameweekName: gameweek.name, locked: result.count };
  }

  async settleGameweek(gameweekId: string) {
    const gameweek = await this.prisma.gameweek.findUnique({
      where: { id: gameweekId },
      select: {
        id: true,
        name: true,
        fixtures: {
          select: { id: true, status: true, homeScore: true, awayScore: true },
        },
      },
    });
    if (!gameweek) throw new NotFoundException(`Gameweek '${gameweekId}' not found`);

    const finishedFixtures = gameweek.fixtures.filter(
      f => f.status === 'FINISHED' && f.homeScore !== null && f.awayScore !== null,
    );

    let totalPredictions = 0;
    let totalChallenges = 0;
    const fixtureResults: { fixtureId: string; predictionsSettled: number; challengesSettled: number }[] = [];

    for (const f of finishedFixtures) {
      const r = await this.settleFixture(f.id);
      totalPredictions += r.predictionsSettled;
      totalChallenges += r.challengesSettled;
      fixtureResults.push({ fixtureId: f.id, predictionsSettled: r.predictionsSettled, challengesSettled: r.challengesSettled });
    }

    return {
      gameweekId,
      gameweekName: gameweek.name,
      fixturesSettled: finishedFixtures.length,
      fixturesSkipped: gameweek.fixtures.length - finishedFixtures.length,
      totalPredictionsSettled: totalPredictions,
      totalChallengesSettled: totalChallenges,
      fixtures: fixtureResults,
    };
  }

  async getGameweekPredictions(userId: string, gameweekId: string) {
    const gameweek = await this.prisma.gameweek.findUnique({
      where: { id: gameweekId },
      select: {
        id: true,
        name: true,
        slug: true,
        round: true,
        status: true,
        predictionDeadlineAt: true,
        fixtures: { select: { id: true } },
      },
    });
    if (!gameweek) throw new NotFoundException(`Gameweek '${gameweekId}' not found`);

    const fixtureIds = gameweek.fixtures.map(f => f.id);
    const now = new Date();
    const predictionLocked = gameweek.predictionDeadlineAt <= now;

    const predictions = fixtureIds.length
      ? await this.prisma.scorePrediction.findMany({
          where: { userId, fixtureId: { in: fixtureIds } },
          include: { fixture: { select: FIXTURE_SELECT } },
          orderBy: { fixture: { kickoffAt: 'asc' } },
        })
      : [];

    return {
      gameweek: {
        id: gameweek.id,
        name: gameweek.name,
        slug: gameweek.slug,
        round: gameweek.round,
        status: gameweek.status,
        predictionDeadlineAt: gameweek.predictionDeadlineAt,
        predictionLocked,
      },
      predictions,
      totalFixtures: fixtureIds.length,
    };
  }

  private computeLockState(fixture: {
    id: string;
    status: string;
    kickoffAt: Date;
    gameweek?: { predictionDeadlineAt: Date } | null;
  }): {
    isLocked: boolean;
    lockReason: LockReason;
    fixtureKickoffAt: Date;
    gameweekPredictionDeadlineAt: Date | null;
    deadlineAt: Date;
    serverTime: Date;
  } {
    const gameweekDeadline = fixture.gameweek?.predictionDeadlineAt ?? null;
    const deadlineAt =
      gameweekDeadline && gameweekDeadline < fixture.kickoffAt
        ? gameweekDeadline
        : fixture.kickoffAt;
    const now = new Date();

    let isLocked: boolean;
    let lockReason: LockReason;

    if (fixture.status === 'FINISHED') {
      isLocked = true;
      lockReason = 'FIXTURE_FINISHED';
    } else if ((LOCKED_RUNNING_STATUSES as readonly string[]).includes(fixture.status)) {
      isLocked = true;
      lockReason = 'FIXTURE_STARTED';
    } else if (gameweekDeadline && gameweekDeadline <= now) {
      isLocked = true;
      lockReason = 'GAMEWEEK_DEADLINE';
    } else if (fixture.kickoffAt <= now) {
      isLocked = true;
      lockReason = 'KICKOFF_PASSED';
    } else {
      isLocked = false;
      lockReason = 'OPEN';
    }

    return {
      isLocked,
      lockReason,
      fixtureKickoffAt: fixture.kickoffAt,
      gameweekPredictionDeadlineAt: gameweekDeadline,
      deadlineAt,
      serverTime: now,
    };
  }

  private assertPredictionOpen(fixture: {
    id: string;
    status: string;
    kickoffAt: Date;
    gameweek?: { predictionDeadlineAt: Date } | null;
  }) {
    const { isLocked } = this.computeLockState(fixture);
    if (isLocked) {
      throw new BadRequestException('Prediction is locked for this fixture');
    }
  }

  private isPrismaUniqueError(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    );
  }
}
