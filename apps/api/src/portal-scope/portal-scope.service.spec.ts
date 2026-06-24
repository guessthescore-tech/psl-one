import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PortalScopeService } from './portal-scope.service';
import { PrismaService } from '../prisma/prisma.service';

const makePrisma = () => ({
  team: { findUnique: vi.fn() },
  sponsor: { findUnique: vi.fn() },
  clubMembership: { findFirst: vi.fn() },
  sponsorMembership: { findFirst: vi.fn() },
});

const TEAM_1 = { id: 'team-1', name: 'Kaizer Chiefs', slug: 'kaizer-chiefs' };
const SPONSOR_1 = { id: 'sponsor-1', name: 'Absa', slug: 'absa' };

describe('PortalScopeService — resolveClubScope', () => {
  let service: PortalScopeService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(async () => {
    prisma = makePrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortalScopeService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PortalScopeService>(PortalScopeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('PSL_ADMIN explicit teamId → allowed', () => {
    it('returns allowed with teamId when PSL_ADMIN provides explicit teamId', async () => {
      prisma.team.findUnique.mockResolvedValue(TEAM_1);
      const result = await service.resolveClubScope('user-admin', 'PSL_ADMIN', 'team-1');
      expect(result).toMatchObject({ allowed: true, scopeType: 'club', teamId: 'team-1' });
      expect(result.allowed && (result as any).reason).toBe('PSL_ADMIN explicit scope');
    });

    it('queries team.findUnique to validate team exists', async () => {
      prisma.team.findUnique.mockResolvedValue(TEAM_1);
      await service.resolveClubScope('user-admin', 'PSL_ADMIN', 'team-1');
      expect(prisma.team.findUnique).toHaveBeenCalledWith({ where: { id: 'team-1' } });
    });
  });

  describe('PSL_ADMIN without teamId → denied', () => {
    it('returns CLUB_SCOPE_REQUIRED when PSL_ADMIN provides no teamId', async () => {
      const result = await service.resolveClubScope('user-admin', 'PSL_ADMIN');
      expect(result).toMatchObject({
        allowed: false,
        statusCode: 400,
        errorCode: 'CLUB_SCOPE_REQUIRED',
      });
    });

    it('PSL_ADMIN non-existent team → TEAM_NOT_FOUND (404)', async () => {
      prisma.team.findUnique.mockResolvedValue(null);
      const result = await service.resolveClubScope('user-admin', 'PSL_ADMIN', 'bogus-id');
      expect(result).toMatchObject({ allowed: false, statusCode: 404, errorCode: 'TEAM_NOT_FOUND' });
    });
  });

  describe('CLUB_ADMIN with active membership → allowed', () => {
    it('returns allowed with teamId from membership', async () => {
      prisma.clubMembership.findFirst.mockResolvedValue({
        id: 'mem-1',
        userId: 'user-club',
        teamId: 'team-1',
        isActive: true,
        team: TEAM_1,
      });
      const result = await service.resolveClubScope('user-club', 'CLUB_ADMIN');
      expect(result).toMatchObject({ allowed: true, scopeType: 'club', teamId: 'team-1' });
    });

    it('uses DB membership teamId, not requestedTeamId when matching', async () => {
      prisma.clubMembership.findFirst.mockResolvedValue({
        id: 'mem-1',
        userId: 'user-club',
        teamId: 'team-1',
        isActive: true,
        team: TEAM_1,
      });
      const result = await service.resolveClubScope('user-club', 'CLUB_ADMIN', 'team-1');
      expect(result).toMatchObject({ allowed: true, teamId: 'team-1' });
    });
  });

  describe('CLUB_ADMIN wrong teamId → CROSS_CLUB_ACCESS_DENIED', () => {
    it('returns CROSS_CLUB_ACCESS_DENIED when requestedTeamId does not match membership', async () => {
      prisma.clubMembership.findFirst.mockResolvedValue({
        id: 'mem-1',
        userId: 'user-club',
        teamId: 'team-1',
        isActive: true,
        team: TEAM_1,
      });
      const result = await service.resolveClubScope('user-club', 'CLUB_ADMIN', 'other-team-id');
      expect(result).toMatchObject({
        allowed: false,
        statusCode: 403,
        errorCode: 'CROSS_CLUB_ACCESS_DENIED',
      });
    });
  });

  describe('CLUB_ADMIN no membership → API_SCOPE_REQUIRED', () => {
    it('returns API_SCOPE_REQUIRED when no active membership', async () => {
      prisma.clubMembership.findFirst.mockResolvedValue(null);
      const result = await service.resolveClubScope('user-club', 'CLUB_ADMIN');
      expect(result).toMatchObject({
        allowed: false,
        statusCode: 403,
        errorCode: 'API_SCOPE_REQUIRED',
      });
    });

    it('queries DB with userId and isActive: true', async () => {
      prisma.clubMembership.findFirst.mockResolvedValue(null);
      await service.resolveClubScope('user-club', 'CLUB_ADMIN');
      expect(prisma.clubMembership.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-club', isActive: true }),
        }),
      );
    });
  });

  describe('FAN → ROLE_NOT_PERMITTED', () => {
    it('returns ROLE_NOT_PERMITTED for FAN role', async () => {
      const result = await service.resolveClubScope('user-fan', 'FAN');
      expect(result).toMatchObject({ allowed: false, statusCode: 403, errorCode: 'ROLE_NOT_PERMITTED' });
    });
  });

  describe('No userId → UNAUTHENTICATED', () => {
    it('returns UNAUTHENTICATED when userId is empty', async () => {
      const result = await service.resolveClubScope('', 'CLUB_ADMIN');
      expect(result).toMatchObject({ allowed: false, statusCode: 401, errorCode: 'UNAUTHENTICATED' });
    });
  });
});

describe('PortalScopeService — resolveSponsorScope', () => {
  let service: PortalScopeService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(async () => {
    prisma = makePrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortalScopeService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PortalScopeService>(PortalScopeService);
  });

  describe('PSL_ADMIN explicit sponsorId → allowed', () => {
    it('returns allowed when PSL_ADMIN provides explicit sponsorId', async () => {
      prisma.sponsor.findUnique.mockResolvedValue(SPONSOR_1);
      const result = await service.resolveSponsorScope('user-admin', 'PSL_ADMIN', 'sponsor-1');
      expect(result).toMatchObject({ allowed: true, scopeType: 'sponsor', sponsorId: 'sponsor-1' });
    });
  });

  describe('PSL_ADMIN without sponsorId → denied', () => {
    it('returns SPONSOR_SCOPE_REQUIRED when PSL_ADMIN provides no sponsorId', async () => {
      const result = await service.resolveSponsorScope('user-admin', 'PSL_ADMIN');
      expect(result).toMatchObject({
        allowed: false,
        statusCode: 400,
        errorCode: 'SPONSOR_SCOPE_REQUIRED',
      });
    });

    it('PSL_ADMIN non-existent sponsor → SPONSOR_NOT_FOUND (404)', async () => {
      prisma.sponsor.findUnique.mockResolvedValue(null);
      const result = await service.resolveSponsorScope('user-admin', 'PSL_ADMIN', 'bogus-id');
      expect(result).toMatchObject({ allowed: false, statusCode: 404, errorCode: 'SPONSOR_NOT_FOUND' });
    });
  });

  describe('SPONSOR with active membership → allowed', () => {
    it('returns allowed with sponsorId from membership', async () => {
      prisma.sponsorMembership.findFirst.mockResolvedValue({
        id: 'smem-1',
        userId: 'user-sponsor',
        sponsorId: 'sponsor-1',
        isActive: true,
        sponsor: SPONSOR_1,
      });
      const result = await service.resolveSponsorScope('user-sponsor', 'SPONSOR');
      expect(result).toMatchObject({ allowed: true, scopeType: 'sponsor', sponsorId: 'sponsor-1' });
    });
  });

  describe('SPONSOR wrong sponsorId → CROSS_SPONSOR_ACCESS_DENIED', () => {
    it('returns CROSS_SPONSOR_ACCESS_DENIED when requestedSponsorId does not match membership', async () => {
      prisma.sponsorMembership.findFirst.mockResolvedValue({
        id: 'smem-1',
        userId: 'user-sponsor',
        sponsorId: 'sponsor-1',
        isActive: true,
        sponsor: SPONSOR_1,
      });
      const result = await service.resolveSponsorScope('user-sponsor', 'SPONSOR', 'other-sponsor-id');
      expect(result).toMatchObject({
        allowed: false,
        statusCode: 403,
        errorCode: 'CROSS_SPONSOR_ACCESS_DENIED',
      });
    });
  });

  describe('SPONSOR no membership → API_SCOPE_REQUIRED', () => {
    it('returns API_SCOPE_REQUIRED when no active sponsor membership', async () => {
      prisma.sponsorMembership.findFirst.mockResolvedValue(null);
      const result = await service.resolveSponsorScope('user-sponsor', 'SPONSOR');
      expect(result).toMatchObject({
        allowed: false,
        statusCode: 403,
        errorCode: 'API_SCOPE_REQUIRED',
      });
    });

    it('queries DB with userId and isActive: true', async () => {
      prisma.sponsorMembership.findFirst.mockResolvedValue(null);
      await service.resolveSponsorScope('user-sponsor', 'SPONSOR');
      expect(prisma.sponsorMembership.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-sponsor', isActive: true }),
        }),
      );
    });
  });

  describe('FAN → ROLE_NOT_PERMITTED', () => {
    it('returns ROLE_NOT_PERMITTED for FAN role on sponsor portal', async () => {
      const result = await service.resolveSponsorScope('user-fan', 'FAN');
      expect(result).toMatchObject({ allowed: false, statusCode: 403, errorCode: 'ROLE_NOT_PERMITTED' });
    });
  });

  describe('CLUB_ADMIN → ROLE_NOT_PERMITTED on sponsor portal', () => {
    it('returns ROLE_NOT_PERMITTED for CLUB_ADMIN on sponsor portal', async () => {
      const result = await service.resolveSponsorScope('user-club', 'CLUB_ADMIN');
      expect(result).toMatchObject({ allowed: false, statusCode: 403, errorCode: 'ROLE_NOT_PERMITTED' });
    });
  });

  describe('No userId → UNAUTHENTICATED', () => {
    it('returns UNAUTHENTICATED when userId is empty on sponsor scope', async () => {
      const result = await service.resolveSponsorScope('', 'SPONSOR');
      expect(result).toMatchObject({ allowed: false, statusCode: 401, errorCode: 'UNAUTHENTICATED' });
    });
  });
});
