import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { AccountOnboardingService } from './account-onboarding.service';
import type { PrismaService } from '../prisma/prisma.service';

const makePrismaMock = () => ({
  user: { findUnique: vi.fn() },
  fanProfile: { findUnique: vi.fn() },
  scorePrediction: { count: vi.fn() },
  predictionChallenge: { count: vi.fn() },
});

describe('AccountOnboardingService', () => {
  let service: AccountOnboardingService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    service = new AccountOnboardingService(prisma as unknown as PrismaService);
  });

  it('returns all steps false for brand new user', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue({ id: 'uid-1', isActive: true });
    (prisma.fanProfile.findUnique as Mock).mockResolvedValue(null);
    (prisma.scorePrediction.count as Mock).mockResolvedValue(0);
    (prisma.predictionChallenge.count as Mock).mockResolvedValue(0);

    const result = await service.getOnboardingStatus('uid-1');
    expect(result.steps.profileCreated).toBe(false);
    expect(result.steps.favouriteTeamSet).toBe(false);
    expect(result.steps.firstPredictionMade).toBe(false);
    expect(result.steps.firstChallengeCreated).toBe(false);
    expect(result.isComplete).toBe(false);
    expect(result.completedSteps).toBe(0);
  });

  it('marks favouriteTeamSet when preferredTeamId is set', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue({ id: 'uid-1', isActive: true });
    (prisma.fanProfile.findUnique as Mock).mockResolvedValue({ displayName: 'Fan', preferredTeamId: 'team-1' });
    (prisma.scorePrediction.count as Mock).mockResolvedValue(0);
    (prisma.predictionChallenge.count as Mock).mockResolvedValue(0);

    const result = await service.getOnboardingStatus('uid-1');
    expect(result.steps.favouriteTeamSet).toBe(true);
    expect(result.steps.profileCreated).toBe(true);
  });

  it('marks firstPredictionMade when prediction count > 0', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue({ id: 'uid-1', isActive: true });
    (prisma.fanProfile.findUnique as Mock).mockResolvedValue({ displayName: null, preferredTeamId: null });
    (prisma.scorePrediction.count as Mock).mockResolvedValue(3);
    (prisma.predictionChallenge.count as Mock).mockResolvedValue(0);

    const result = await service.getOnboardingStatus('uid-1');
    expect(result.steps.firstPredictionMade).toBe(true);
  });

  it('marks firstChallengeCreated when challenge count > 0', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue({ id: 'uid-1', isActive: true });
    (prisma.fanProfile.findUnique as Mock).mockResolvedValue({ displayName: null, preferredTeamId: null });
    (prisma.scorePrediction.count as Mock).mockResolvedValue(0);
    (prisma.predictionChallenge.count as Mock).mockResolvedValue(1);

    const result = await service.getOnboardingStatus('uid-1');
    expect(result.steps.firstChallengeCreated).toBe(true);
  });

  it('isComplete is true when all steps done', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue({ id: 'uid-1', isActive: true });
    (prisma.fanProfile.findUnique as Mock).mockResolvedValue({ displayName: 'Fan', preferredTeamId: 'team-1' });
    (prisma.scorePrediction.count as Mock).mockResolvedValue(1);
    (prisma.predictionChallenge.count as Mock).mockResolvedValue(1);

    const result = await service.getOnboardingStatus('uid-1');
    expect(result.isComplete).toBe(true);
    expect(result.completedSteps).toBe(4);
  });

  it('throws UnauthorizedException for inactive user', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue({ id: 'uid-1', isActive: false });
    await expect(service.getOnboardingStatus('uid-1')).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException for unknown user', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue(null);
    await expect(service.getOnboardingStatus('uid-1')).rejects.toThrow(UnauthorizedException);
  });
});
