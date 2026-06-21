import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PredictionChallengeStatus, AuditEvent, FixtureStatus } from '@prisma/client';
import { PredictionChallengesService } from './prediction-challenges.service';
import type { PrismaService } from '../prisma/prisma.service';

const makePrismaMock = () => ({
  fixture: { findUnique: vi.fn() },
  predictionChallenge: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
  authAuditLog: { create: vi.fn().mockResolvedValue({}) },
});

const FIXTURE_SCHEDULED = {
  id: 'fx-1',
  status: FixtureStatus.SCHEDULED,
  kickoffAt: new Date(Date.now() + 86400000),
  homeTeam: { id: 'ht-1', name: 'Home', shortName: 'HME', slug: 'home' },
  awayTeam: { id: 'at-1', name: 'Away', shortName: 'AWY', slug: 'away' },
};

const FIXTURE_IN_PLAY = { ...FIXTURE_SCHEDULED, status: FixtureStatus.LIVE };

const BASE_CHALLENGE = {
  id: 'ch-1',
  token: 'abc123',
  fixtureId: 'fx-1',
  creatorUserId: 'uid-creator',
  creatorHomeScore: 2,
  creatorAwayScore: 1,
  acceptorUserId: null,
  acceptorHomeScore: null,
  acceptorAwayScore: null,
  status: PredictionChallengeStatus.PENDING,
  expiresAt: new Date(Date.now() + 72 * 3600 * 1000),
  acceptedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  fixture: FIXTURE_SCHEDULED,
};

describe('PredictionChallengesService', () => {
  let service: PredictionChallengesService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    service = new PredictionChallengesService(prisma as unknown as PrismaService);
  });

  describe('createChallenge', () => {
    it('creates a challenge with a unique token', async () => {
      (prisma.fixture.findUnique as Mock).mockResolvedValue(FIXTURE_SCHEDULED);
      (prisma.predictionChallenge.create as Mock).mockResolvedValue({ ...BASE_CHALLENGE });

      const result = await service.createChallenge('uid-creator', {
        fixtureId: 'fx-1', homeScore: 2, awayScore: 1,
      });

      expect(result.token).toBeDefined();
      expect(result.status).toBe(PredictionChallengeStatus.PENDING);
      expect(prisma.predictionChallenge.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ token: expect.any(String) }) }),
      );
    });

    it('token is generated with crypto randomness (not guessable)', async () => {
      (prisma.fixture.findUnique as Mock).mockResolvedValue(FIXTURE_SCHEDULED);
      (prisma.predictionChallenge.create as Mock).mockResolvedValue({ ...BASE_CHALLENGE });

      await service.createChallenge('uid-1', { fixtureId: 'fx-1', homeScore: 1, awayScore: 0 });
      await service.createChallenge('uid-1', { fixtureId: 'fx-1', homeScore: 1, awayScore: 0 });
      // Tokens must be different each call (randomness)
      const c1 = (prisma.predictionChallenge.create as Mock).mock.calls[0]![0].data.token as string;
      const c2 = (prisma.predictionChallenge.create as Mock).mock.calls[1]![0].data.token as string;
      expect(c1).not.toBe(c2);
    });

    it('throws NotFoundException when fixture not found', async () => {
      (prisma.fixture.findUnique as Mock).mockResolvedValue(null);
      await expect(service.createChallenge('uid-1', { fixtureId: 'bad', homeScore: 0, awayScore: 0 }))
        .rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when fixture is IN_PLAY', async () => {
      (prisma.fixture.findUnique as Mock).mockResolvedValue(FIXTURE_IN_PLAY);
      await expect(service.createChallenge('uid-1', { fixtureId: 'fx-1', homeScore: 0, awayScore: 0 }))
        .rejects.toThrow(BadRequestException);
    });

    it('records CHALLENGE_TOKEN_CREATED audit event', async () => {
      (prisma.fixture.findUnique as Mock).mockResolvedValue(FIXTURE_SCHEDULED);
      (prisma.predictionChallenge.create as Mock).mockResolvedValue({ ...BASE_CHALLENGE });

      await service.createChallenge('uid-creator', { fixtureId: 'fx-1', homeScore: 2, awayScore: 1 });

      expect(prisma.authAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ event: AuditEvent.CHALLENGE_TOKEN_CREATED, success: true }),
        }),
      );
    });

    it('audit event does not contain scores or fixture details', async () => {
      (prisma.fixture.findUnique as Mock).mockResolvedValue(FIXTURE_SCHEDULED);
      (prisma.predictionChallenge.create as Mock).mockResolvedValue({ ...BASE_CHALLENGE });

      await service.createChallenge('uid-creator', { fixtureId: 'fx-1', homeScore: 2, awayScore: 1 });

      const call = (prisma.authAuditLog.create as Mock).mock.calls[0]?.[0] as { data: Record<string, unknown> };
      expect(JSON.stringify(call.data)).not.toContain('homeScore');
      expect(JSON.stringify(call.data)).not.toContain('money');
    });

    it('no money/odds/stake language in response', async () => {
      (prisma.fixture.findUnique as Mock).mockResolvedValue(FIXTURE_SCHEDULED);
      (prisma.predictionChallenge.create as Mock).mockResolvedValue({ ...BASE_CHALLENGE });

      const result = await service.createChallenge('uid-creator', { fixtureId: 'fx-1', homeScore: 2, awayScore: 1 });
      expect(JSON.stringify(result)).not.toMatch(/\b(money|odds|stake|wager|deposit|bet)\b/i);
    });
  });

  describe('getChallengeByToken', () => {
    it('returns challenge data for valid token', async () => {
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue({ ...BASE_CHALLENGE });

      const result = await service.getChallengeByToken('abc123');
      expect(result.token).toBe('abc123');
      expect(result.status).toBe(PredictionChallengeStatus.PENDING);
    });

    it('throws NotFoundException for unknown token', async () => {
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue(null);
      await expect(service.getChallengeByToken('bad-token')).rejects.toThrow(NotFoundException);
    });

    it('marks expired challenge as EXPIRED', async () => {
      const expired = {
        ...BASE_CHALLENGE,
        status: PredictionChallengeStatus.PENDING,
        expiresAt: new Date(Date.now() - 1000),
      };
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue(expired);
      (prisma.predictionChallenge.update as Mock).mockResolvedValue({ ...expired, status: PredictionChallengeStatus.EXPIRED });

      const result = await service.getChallengeByToken('abc123');
      expect(result.status).toBe(PredictionChallengeStatus.EXPIRED);
      expect(prisma.predictionChallenge.update).toHaveBeenCalled();
    });
  });

  describe('acceptChallenge', () => {
    it('accepts a pending challenge', async () => {
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue({ ...BASE_CHALLENGE });
      const accepted = { ...BASE_CHALLENGE, status: PredictionChallengeStatus.ACCEPTED, acceptorUserId: 'uid-acc', acceptorHomeScore: 1, acceptorAwayScore: 2 };
      (prisma.predictionChallenge.update as Mock).mockResolvedValue(accepted);

      const result = await service.acceptChallenge('uid-acc', 'abc123', { homeScore: 1, awayScore: 2 });
      expect(result.status).toBe(PredictionChallengeStatus.ACCEPTED);
    });

    it('throws ForbiddenException when creator tries to accept own challenge', async () => {
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue({ ...BASE_CHALLENGE });
      await expect(service.acceptChallenge('uid-creator', 'abc123', { homeScore: 1, awayScore: 0 }))
        .rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when challenge is already ACCEPTED', async () => {
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue({
        ...BASE_CHALLENGE,
        status: PredictionChallengeStatus.ACCEPTED,
      });
      await expect(service.acceptChallenge('uid-acc', 'abc123', { homeScore: 1, awayScore: 0 }))
        .rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when challenge is expired', async () => {
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue({
        ...BASE_CHALLENGE,
        expiresAt: new Date(Date.now() - 1000),
      });
      (prisma.predictionChallenge.update as Mock).mockResolvedValue({});
      await expect(service.acceptChallenge('uid-acc', 'abc123', { homeScore: 1, awayScore: 0 }))
        .rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when fixture is locked (IN_PLAY)', async () => {
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue({
        ...BASE_CHALLENGE,
        fixture: FIXTURE_IN_PLAY,
      });
      (prisma.predictionChallenge.update as Mock).mockResolvedValue({});
      await expect(service.acceptChallenge('uid-acc', 'abc123', { homeScore: 1, awayScore: 0 }))
        .rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException for unknown token', async () => {
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue(null);
      await expect(service.acceptChallenge('uid-acc', 'bad', { homeScore: 0, awayScore: 0 }))
        .rejects.toThrow(NotFoundException);
    });

    it('records CHALLENGE_TOKEN_ACCEPTED audit event', async () => {
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue({ ...BASE_CHALLENGE });
      (prisma.predictionChallenge.update as Mock).mockResolvedValue({
        ...BASE_CHALLENGE, status: PredictionChallengeStatus.ACCEPTED,
      });

      await service.acceptChallenge('uid-acc', 'abc123', { homeScore: 1, awayScore: 0 });
      expect(prisma.authAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ event: AuditEvent.CHALLENGE_TOKEN_ACCEPTED }),
        }),
      );
    });
  });

  describe('getChallengeStatus', () => {
    it('returns status for valid token', async () => {
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue({
        id: 'ch-1', status: PredictionChallengeStatus.PENDING,
        expiresAt: new Date(), acceptedAt: null,
        creatorHomeScore: 2, creatorAwayScore: 1,
        acceptorHomeScore: null, acceptorAwayScore: null,
      });
      const result = await service.getChallengeStatus('abc123');
      expect(result.status).toBe(PredictionChallengeStatus.PENDING);
    });

    it('throws NotFoundException for unknown token', async () => {
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue(null);
      await expect(service.getChallengeStatus('bad')).rejects.toThrow(NotFoundException);
    });
  });
});
