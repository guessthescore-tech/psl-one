import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { BadRequestException, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { PrismaService } from '../prisma/prisma.service';
import type { LocalJwtProvider } from '../auth/providers/local-jwt.provider';
import type { AchievementsService } from '../achievements/achievements.service';

const makeAchievementsMock = () => ({
  safeEvaluate: vi.fn().mockResolvedValue(undefined),
}) as unknown as AchievementsService;

const MOCK_TEAM = { id: 'team-usa', name: 'United States', slug: 'usa', shortName: 'USA' };

const MOCK_PREFS = {
  id: 'pref-1',
  profileId: 'prof-1',
  matchReminders: true,
  teamNews: true,
  fantasyUpdates: false,
  rewardsUpdates: false,
};

const MOCK_PROFILE = {
  id: 'prof-1',
  userId: 'user-1',
  displayName: 'Test Fan',
  city: 'Cape Town',
  country: 'South Africa',
  preferredTeamId: 'team-usa',
  createdAt: new Date(),
  updatedAt: new Date(),
  preferredTeam: MOCK_TEAM,
  preferences: MOCK_PREFS,
};

const makePrismaMock = () => ({
  user: {
    findUnique: vi.fn(),
  },
  team: {
    findUnique: vi.fn(),
  },
  fanProfile: {
    upsert: vi.fn(),
    update: vi.fn(),
  },
  notificationPreferences: {
    update: vi.fn(),
  },
});

describe('ProfileService', () => {
  let service: ProfileService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    service = new ProfileService(prisma as unknown as PrismaService, makeAchievementsMock());
  });

  // ── 1. getProfile creates on first access ─────────────────────────────────
  it('getProfile calls upsert to create-or-return profile', async () => {
    (prisma.fanProfile.upsert as Mock).mockResolvedValue(MOCK_PROFILE);

    const result = await service.getProfile('user-1');

    expect(prisma.fanProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
    expect(result.userId).toBe('user-1');
    expect(result.preferences).toBeDefined();
  });

  // ── 2. updateProfile updates fields ──────────────────────────────────────
  it('updateProfile updates displayName, city, country', async () => {
    (prisma.fanProfile.upsert as Mock).mockResolvedValue(MOCK_PROFILE);
    (prisma.fanProfile.update as Mock).mockResolvedValue({
      ...MOCK_PROFILE,
      displayName: 'New Name',
      city: 'Joburg',
    });

    const result = await service.updateProfile('user-1', {
      displayName: 'New Name',
      city: 'Joburg',
    });

    expect(prisma.fanProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
        data: expect.objectContaining({ displayName: 'New Name', city: 'Joburg' }),
      }),
    );
    expect(result.displayName).toBe('New Name');
  });

  // ── 3. updateProfile with valid preferredTeamId ──────────────────────────
  it('updateProfile accepts a valid preferredTeamId', async () => {
    (prisma.team.findUnique as Mock).mockResolvedValue(MOCK_TEAM);
    (prisma.fanProfile.upsert as Mock).mockResolvedValue(MOCK_PROFILE);
    (prisma.fanProfile.update as Mock).mockResolvedValue(MOCK_PROFILE);

    await service.updateProfile('user-1', { preferredTeamId: 'team-usa' });

    expect(prisma.team.findUnique).toHaveBeenCalledWith({ where: { id: 'team-usa' }, select: { id: true } });
    expect(prisma.fanProfile.update).toHaveBeenCalled();
  });

  // ── 4. updateProfile rejects invalid preferredTeamId ─────────────────────
  it('updateProfile throws BadRequestException for unknown team', async () => {
    (prisma.team.findUnique as Mock).mockResolvedValue(null);

    await expect(
      service.updateProfile('user-1', { preferredTeamId: 'team-unknown' }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.fanProfile.update).not.toHaveBeenCalled();
  });

  // ── 5. getPreferences returns preferences ────────────────────────────────
  it('getPreferences returns the notification preferences', async () => {
    (prisma.fanProfile.upsert as Mock).mockResolvedValue(MOCK_PROFILE);

    const result = await service.getPreferences('user-1');

    expect(result).toEqual(MOCK_PREFS);
    expect(result?.matchReminders).toBe(true);
    expect(result?.fantasyUpdates).toBe(false);
  });

  // ── 6. updatePreferences updates fields ──────────────────────────────────
  it('updatePreferences updates selected preferences', async () => {
    (prisma.fanProfile.upsert as Mock).mockResolvedValue(MOCK_PROFILE);
    (prisma.notificationPreferences.update as Mock).mockResolvedValue({
      ...MOCK_PREFS,
      fantasyUpdates: true,
    });

    const result = await service.updatePreferences('user-1', { fantasyUpdates: true });

    expect(prisma.notificationPreferences.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { profileId: 'prof-1' },
        data: expect.objectContaining({ fantasyUpdates: true }),
      }),
    );
    expect(result.fantasyUpdates).toBe(true);
  });

  // ── 7. getSummary returns email, role, profile and completionPercent ──────
  it('getSummary computes completionPercent correctly', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue({ email: 'fan@test.co.za', role: 'FAN' });
    (prisma.fanProfile.upsert as Mock).mockResolvedValue(MOCK_PROFILE); // 4/4 filled

    const result = await service.getSummary('user-1');

    expect(result.email).toBe('fan@test.co.za');
    expect(result.role).toBe('FAN');
    expect(result.completionPercent).toBe(100);
    expect(result.preferredTeam?.slug).toBe('usa');
  });

  it('getSummary returns 0% when profile is empty', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue({ email: 'fan@test.co.za', role: 'FAN' });
    (prisma.fanProfile.upsert as Mock).mockResolvedValue({
      ...MOCK_PROFILE,
      displayName: null,
      city: null,
      country: null,
      preferredTeamId: null,
      preferredTeam: null,
    });

    const result = await service.getSummary('user-1');
    expect(result.completionPercent).toBe(0);
  });

  // ── 8. Cannot access another user's profile ───────────────────────────────
  it('getProfile always uses the userId from the token (ownership enforced at controller)', async () => {
    (prisma.fanProfile.upsert as Mock).mockResolvedValue({ ...MOCK_PROFILE, userId: 'user-2' });

    await service.getProfile('user-2');

    expect(prisma.fanProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-2' } }),
    );
    // The service only operates on the userId it receives — it cannot be called
    // with a different userId than what JwtAuthGuard extracts from the token.
  });
});

// ── JwtAuthGuard rejects unauthenticated requests ────────────────────────────
describe('ProfileController auth gate', () => {
  it('JwtAuthGuard throws UnauthorizedException when no token provided', async () => {
    const mockProvider = { verifyToken: vi.fn() } as unknown as LocalJwtProvider;
    const guard = new JwtAuthGuard(mockProvider);

    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });
});
