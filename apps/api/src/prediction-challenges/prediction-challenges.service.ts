import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditEvent, PredictionChallengeStatus, FixtureStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePredictionChallengeDto } from './dto/create-prediction-challenge.dto';
import { AcceptPredictionChallengeDto } from './dto/accept-prediction-challenge.dto';

const CHALLENGE_EXPIRY_HOURS = 72;

function generateToken(): string {
  return randomBytes(24).toString('base64url');
}

const FIXTURE_SELECT = {
  id: true,
  kickoffAt: true,
  status: true,
  homeTeam: { select: { id: true, name: true, shortName: true, slug: true } },
  awayTeam: { select: { id: true, name: true, shortName: true, slug: true } },
} as const;

function isFixtureLocked(status: FixtureStatus): boolean {
  return status === FixtureStatus.LIVE || status === FixtureStatus.HALF_TIME || status === FixtureStatus.FINISHED;
}

@Injectable()
export class PredictionChallengesService {
  constructor(private prisma: PrismaService) {}

  async createChallenge(userId: string, dto: CreatePredictionChallengeDto, userAgent?: string) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: dto.fixtureId },
      select: { id: true, status: true, kickoffAt: true },
    });
    if (!fixture) throw new NotFoundException('Fixture not found');
    if (isFixtureLocked(fixture.status)) {
      throw new BadRequestException('Cannot create a challenge for a fixture that has started or finished');
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + CHALLENGE_EXPIRY_HOURS * 60 * 60 * 1000);

    const challenge = await this.prisma.predictionChallenge.create({
      data: {
        token,
        fixtureId: dto.fixtureId,
        creatorUserId: userId,
        creatorHomeScore: dto.homeScore,
        creatorAwayScore: dto.awayScore,
        expiresAt,
      },
      include: { fixture: { select: FIXTURE_SELECT } },
    });

    await this.writeAuditLog(userId, AuditEvent.CHALLENGE_TOKEN_CREATED, true, userAgent);

    return {
      id: challenge.id,
      token: challenge.token,
      status: challenge.status,
      creatorHomeScore: challenge.creatorHomeScore,
      creatorAwayScore: challenge.creatorAwayScore,
      expiresAt: challenge.expiresAt,
      fixture: challenge.fixture,
    };
  }

  async getChallengeByToken(token: string) {
    const challenge = await this.prisma.predictionChallenge.findUnique({
      where: { token },
      include: { fixture: { select: FIXTURE_SELECT } },
    });
    if (!challenge) throw new NotFoundException('Challenge not found');

    const isExpired = challenge.expiresAt < new Date() && challenge.status === PredictionChallengeStatus.PENDING;
    if (isExpired) {
      await this.prisma.predictionChallenge.update({
        where: { id: challenge.id },
        data: { status: PredictionChallengeStatus.EXPIRED },
      });
      return { ...challenge, status: PredictionChallengeStatus.EXPIRED };
    }

    return {
      id: challenge.id,
      token: challenge.token,
      status: challenge.status,
      creatorHomeScore: challenge.creatorHomeScore,
      creatorAwayScore: challenge.creatorAwayScore,
      acceptorHomeScore: challenge.acceptorHomeScore,
      acceptorAwayScore: challenge.acceptorAwayScore,
      expiresAt: challenge.expiresAt,
      acceptedAt: challenge.acceptedAt,
      fixture: challenge.fixture,
    };
  }

  async acceptChallenge(userId: string, token: string, dto: AcceptPredictionChallengeDto, userAgent?: string) {
    const challenge = await this.prisma.predictionChallenge.findUnique({
      where: { token },
      include: { fixture: { select: FIXTURE_SELECT } },
    });
    if (!challenge) throw new NotFoundException('Challenge not found');

    if (challenge.creatorUserId === userId) {
      throw new ForbiddenException('You cannot accept your own challenge');
    }
    if (challenge.status !== PredictionChallengeStatus.PENDING) {
      throw new BadRequestException(`Challenge is ${challenge.status.toLowerCase()} and cannot be accepted`);
    }
    if (challenge.expiresAt < new Date()) {
      await this.prisma.predictionChallenge.update({
        where: { id: challenge.id },
        data: { status: PredictionChallengeStatus.EXPIRED },
      });
      throw new BadRequestException('Challenge has expired');
    }
    if (isFixtureLocked(challenge.fixture.status)) {
      await this.prisma.predictionChallenge.update({
        where: { id: challenge.id },
        data: { status: PredictionChallengeStatus.LOCKED },
      });
      throw new BadRequestException('Fixture has already started or finished');
    }

    const updated = await this.prisma.predictionChallenge.update({
      where: { id: challenge.id },
      data: {
        acceptorUserId: userId,
        acceptorHomeScore: dto.homeScore,
        acceptorAwayScore: dto.awayScore,
        status: PredictionChallengeStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
      include: { fixture: { select: FIXTURE_SELECT } },
    });

    await this.writeAuditLog(userId, AuditEvent.CHALLENGE_TOKEN_ACCEPTED, true, userAgent);

    return {
      id: updated.id,
      token: updated.token,
      status: updated.status,
      creatorHomeScore: updated.creatorHomeScore,
      creatorAwayScore: updated.creatorAwayScore,
      acceptorHomeScore: updated.acceptorHomeScore,
      acceptorAwayScore: updated.acceptorAwayScore,
      acceptedAt: updated.acceptedAt,
      fixture: updated.fixture,
    };
  }

  async getChallengeStatus(token: string) {
    const challenge = await this.prisma.predictionChallenge.findUnique({
      where: { token },
      select: {
        id: true,
        status: true,
        expiresAt: true,
        acceptedAt: true,
        creatorHomeScore: true,
        creatorAwayScore: true,
        acceptorHomeScore: true,
        acceptorAwayScore: true,
      },
    });
    if (!challenge) throw new NotFoundException('Challenge not found');
    return challenge;
  }

  async getMyCreatedChallenges(userId: string) {
    const challenges = await this.prisma.predictionChallenge.findMany({
      where: { creatorUserId: userId },
      include: { fixture: { select: FIXTURE_SELECT } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return challenges.map(c => ({
      id: c.id,
      token: c.token,
      status: c.status,
      creatorHomeScore: c.creatorHomeScore,
      creatorAwayScore: c.creatorAwayScore,
      expiresAt: c.expiresAt,
      fixture: c.fixture,
    }));
  }

  private async writeAuditLog(userId: string, event: AuditEvent, success: boolean, userAgent?: string) {
    try {
      await this.prisma.authAuditLog.create({ data: { userId, event, success, userAgent: userAgent ?? null } });
    } catch {
      // Audit failure must not break primary flow.
    }
  }
}
