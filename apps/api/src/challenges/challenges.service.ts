import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChallengeStatus, NotificationPriority, NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AchievementsService } from '../achievements/achievements.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityFeedService } from '../activity-feed/activity-feed.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';

const FIXTURE_SELECT = {
  id: true,
  kickoffAt: true,
  status: true,
  homeTeam: { select: { id: true, name: true, shortName: true, slug: true } },
  awayTeam: { select: { id: true, name: true, shortName: true, slug: true } },
} as const;

const PREDICTION_SELECT = {
  id: true,
  predictedHomeScore: true,
  predictedAwayScore: true,
  pointsAwarded: true,
  status: true,
} as const;

const CHALLENGE_INCLUDE = {
  fixture: { select: FIXTURE_SELECT },
  challengerPrediction: { select: PREDICTION_SELECT },
  opponentPrediction: { select: PREDICTION_SELECT },
} as const;

@Injectable()
export class ChallengesService {
  constructor(
    private prisma: PrismaService,
    private readonly achievementsService: AchievementsService,
    private readonly notificationsService: NotificationsService,
    private readonly activityFeedService: ActivityFeedService,
  ) {}

  async createChallenge(challengerUserId: string, dto: CreateChallengeDto) {
    if (!dto.opponentEmail) throw new BadRequestException('opponentEmail is required');

    const opponent = await this.prisma.user.findUnique({
      where: { email: dto.opponentEmail },
      select: { id: true, email: true },
    });
    if (!opponent) throw new NotFoundException(`No user found with email '${dto.opponentEmail}'`);
    if (opponent.id === challengerUserId) {
      throw new BadRequestException('You cannot challenge yourself');
    }

    const fixture = await this.prisma.fixture.findUnique({
      where: { id: dto.fixtureId },
      select: { id: true, status: true, kickoffAt: true },
    });
    if (!fixture) throw new NotFoundException(`Fixture '${dto.fixtureId}' not found`);
    this.assertFixtureOpen(fixture);

    // Auto-link challenger's existing prediction if present
    const challengerPrediction = await this.prisma.scorePrediction.findUnique({
      where: { userId_fixtureId: { userId: challengerUserId, fixtureId: dto.fixtureId } },
      select: { id: true },
    });

    const challenge = await this.prisma.peerChallenge.create({
      data: {
        fixtureId: dto.fixtureId,
        challengerUserId,
        opponentUserId: opponent.id,
        ...(challengerPrediction ? { challengerPredictionId: challengerPrediction.id } : {}),
      },
      include: CHALLENGE_INCLUDE,
    });

    this.achievementsService.safeEvaluate(challengerUserId, ['first-peer-challenge']).catch(() => null);

    // Notify opponent of challenge invite (safe hook)
    this.notificationsService.createInAppNotification({
      userId: opponent.id,
      type: NotificationType.CHALLENGE_INVITE,
      title: 'You have a new challenge!',
      body: `You have been challenged on an upcoming fixture.`,
      priority: NotificationPriority.NORMAL,
      sourceType: 'CHALLENGE',
      sourceId: challenge.id,
      actionUrl: `/predictions`,
    }).catch(() => null);

    // Activity feed for challenger (safe)
    this.activityFeedService.createChallengeActivity(challengerUserId, { id: challenge.id }, 'CREATED').catch(() => null);

    return challenge;
  }

  getMyChallenge(userId: string) {
    return this.prisma.peerChallenge.findMany({
      where: {
        OR: [{ challengerUserId: userId }, { opponentUserId: userId }],
      },
      include: CHALLENGE_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getChallenge(userId: string, challengeId: string) {
    const challenge = await this.prisma.peerChallenge.findUnique({
      where: { id: challengeId },
      include: CHALLENGE_INCLUDE,
    });
    if (!challenge) throw new NotFoundException('Challenge not found');
    if (challenge.challengerUserId !== userId && challenge.opponentUserId !== userId) {
      throw new ForbiddenException();
    }
    return challenge;
  }

  async acceptChallenge(userId: string, challengeId: string) {
    const challenge = await this.prisma.peerChallenge.findUnique({
      where: { id: challengeId },
    });
    if (!challenge) throw new NotFoundException('Challenge not found');
    if (challenge.opponentUserId !== userId) throw new ForbiddenException();
    if (challenge.status !== ChallengeStatus.PENDING) {
      throw new BadRequestException('Challenge is not pending');
    }

    const fixture = await this.prisma.fixture.findUnique({
      where: { id: challenge.fixtureId },
      select: { id: true, status: true, kickoffAt: true },
    });
    if (!fixture) throw new NotFoundException('Fixture not found');
    this.assertFixtureOpen(fixture);

    const prediction = await this.prisma.scorePrediction.findUnique({
      where: { userId_fixtureId: { userId, fixtureId: challenge.fixtureId } },
      select: { id: true },
    });
    if (!prediction) {
      throw new BadRequestException(
        'You must submit a prediction for this fixture before accepting the challenge',
      );
    }

    return this.prisma.peerChallenge.update({
      where: { id: challengeId },
      data: {
        status: ChallengeStatus.ACCEPTED,
        opponentPredictionId: prediction.id,
        acceptedAt: new Date(),
      },
      include: CHALLENGE_INCLUDE,
    });
  }

  async declineChallenge(userId: string, challengeId: string) {
    const challenge = await this.prisma.peerChallenge.findUnique({
      where: { id: challengeId },
    });
    if (!challenge) throw new NotFoundException('Challenge not found');
    if (challenge.opponentUserId !== userId) throw new ForbiddenException();
    if (challenge.status !== ChallengeStatus.PENDING) {
      throw new BadRequestException('Challenge is not pending');
    }

    return this.prisma.peerChallenge.update({
      where: { id: challengeId },
      data: { status: ChallengeStatus.DECLINED },
      include: CHALLENGE_INCLUDE,
    });
  }

  async cancelChallenge(userId: string, challengeId: string) {
    const challenge = await this.prisma.peerChallenge.findUnique({
      where: { id: challengeId },
    });
    if (!challenge) throw new NotFoundException('Challenge not found');
    if (challenge.challengerUserId !== userId) throw new ForbiddenException();
    if (challenge.status !== ChallengeStatus.PENDING) {
      throw new BadRequestException('Only pending challenges can be cancelled');
    }

    return this.prisma.peerChallenge.update({
      where: { id: challengeId },
      data: { status: ChallengeStatus.CANCELLED },
      include: CHALLENGE_INCLUDE,
    });
  }

  private assertFixtureOpen(fixture: { status: string; kickoffAt: Date }) {
    if (fixture.status !== 'SCHEDULED') {
      throw new BadRequestException('Fixture is no longer open for challenges');
    }
    if (fixture.kickoffAt <= new Date()) {
      throw new BadRequestException('Kickoff has passed — challenges are closed');
    }
  }
}
