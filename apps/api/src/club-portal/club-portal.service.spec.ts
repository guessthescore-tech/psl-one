import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { ClubPortalService } from './club-portal.service';
import { PrismaService } from '../prisma/prisma.service';
import { PortalScopeService } from '../portal-scope/portal-scope.service';

const makePrisma = () => ({
  team: { findFirst: vi.fn() },
  player: { findMany: vi.fn(), count: vi.fn() },
  fixture: { findMany: vi.fn(), count: vi.fn() },
  clubContentItem: { findMany: vi.fn(), count: vi.fn(), create: vi.fn() },
  sponsorCampaign: { findMany: vi.fn() },
  sponsor: { findMany: vi.fn() },
});

const makeScope = () => ({
  resolveClubScope: vi.fn(),
  resolveSponsorScope: vi.fn(),
});

const ALLOWED_CLUB = {
  allowed: true as const,
  scopeType: 'club' as const,
  teamId: 'club-1',
  reason: 'CLUB_ADMIN active membership',
};

describe('ClubPortalService (Sprint 28 — DB-backed scoping)', () => {
  let service: ClubPortalService;
  let prisma: ReturnType<typeof makePrisma>;
  let scope: ReturnType<typeof makeScope>;

  beforeEach(async () => {
    prisma = makePrisma();
    scope = makeScope();
    scope.resolveClubScope.mockResolvedValue(ALLOWED_CLUB);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClubPortalService,
        { provide: PrismaService, useValue: prisma },
        { provide: PortalScopeService, useValue: scope },
      ],
    }).compile();

    service = module.get<ClubPortalService>(ClubPortalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getClubOverview', () => {
    it('calls resolveClubScope with userId, role, teamId', async () => {
      prisma.team.findFirst.mockResolvedValue({ id: 'club-1', name: 'Test FC' });
      prisma.player.count.mockResolvedValue(25);
      prisma.fixture.findMany.mockResolvedValue([]);

      await service.getClubOverview('user-1', 'CLUB_ADMIN', 'club-1');
      expect(scope.resolveClubScope).toHaveBeenCalledWith('user-1', 'CLUB_ADMIN', 'club-1');
    });

    it('returns team, playerCount, recentFixtures when allowed', async () => {
      prisma.team.findFirst.mockResolvedValue({ id: 'club-1', name: 'Test FC' });
      prisma.player.count.mockResolvedValue(25);
      prisma.fixture.findMany.mockResolvedValue([]);

      const result = await service.getClubOverview('user-1', 'CLUB_ADMIN');
      expect(result).toMatchObject({ playerCount: 25, recentFixtures: [] });
    });

    it('throws ForbiddenException when resolveClubScope denies (403)', async () => {
      scope.resolveClubScope.mockResolvedValue({
        allowed: false,
        reason: 'Cross-club access denied',
        statusCode: 403,
        errorCode: 'CROSS_CLUB_ACCESS_DENIED',
      });

      await expect(service.getClubOverview('user-1', 'CLUB_ADMIN', 'wrong-club')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws BadRequestException when resolveClubScope denies (400)', async () => {
      scope.resolveClubScope.mockResolvedValue({
        allowed: false,
        reason: 'PSL_ADMIN must provide teamId',
        statusCode: 400,
        errorCode: 'CLUB_SCOPE_REQUIRED',
      });

      await expect(service.getClubOverview('user-admin', 'PSL_ADMIN')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getClubProfile', () => {
    it('returns team with clubProfile when allowed', async () => {
      const mockTeam = { id: 'club-1', name: 'Test FC', clubProfile: { founded: 1990 } };
      prisma.team.findFirst.mockResolvedValue(mockTeam);

      const result = await service.getClubProfile('user-1', 'CLUB_ADMIN');
      expect(result).toEqual(mockTeam);
    });

    it('throws ForbiddenException when CLUB_ADMIN denied for wrong club', async () => {
      scope.resolveClubScope.mockResolvedValue({
        allowed: false,
        reason: 'Cross-club access denied',
        statusCode: 403,
        errorCode: 'CROSS_CLUB_ACCESS_DENIED',
      });

      await expect(service.getClubProfile('user-1', 'CLUB_ADMIN', 'other-club')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getClubSquad', () => {
    it('returns players array when allowed', async () => {
      const mockPlayers = [{ id: 'p1', name: 'Player One', teamId: 'club-1' }];
      prisma.player.findMany.mockResolvedValue(mockPlayers);

      const result = await service.getClubSquad('user-1', 'CLUB_ADMIN');
      expect(result).toEqual(mockPlayers);
    });
  });

  describe('getClubFixtures', () => {
    it('returns fixtures when allowed', async () => {
      const mockFixtures = [{ id: 'f1', homeTeamId: 'club-1', status: 'SCHEDULED' }];
      prisma.fixture.findMany.mockResolvedValue(mockFixtures);

      const result = await service.getClubFixtures('user-1', 'CLUB_ADMIN');
      expect(result).toEqual(mockFixtures);
    });
  });

  describe('getClubFans', () => {
    it('returns placeholder with note', () => {
      const result = service.getClubFans(undefined);
      expect(result).toMatchObject({ fanCount: 0, fans: [] });
      expect(result.note).toBeTruthy();
    });
  });

  describe('getClubAnalytics', () => {
    it('returns counts when allowed', async () => {
      prisma.player.count.mockResolvedValue(20);
      prisma.fixture.count.mockResolvedValue(15);
      prisma.clubContentItem.count.mockResolvedValue(5);

      const result = await service.getClubAnalytics('user-1', 'CLUB_ADMIN');
      expect(result).toEqual({ playerCount: 20, fixtureCount: 15, contentCount: 5 });
    });
  });

  describe('getClubCampaigns', () => {
    it('returns campaigns when allowed', async () => {
      const mockCampaigns = [{ id: 'c1', clubId: 'club-1', title: 'Campaign A' }];
      prisma.sponsorCampaign.findMany.mockResolvedValue(mockCampaigns);

      const result = await service.getClubCampaigns('user-1', 'CLUB_ADMIN');
      expect(result).toEqual(mockCampaigns);
    });
  });

  describe('getClubSponsors', () => {
    it('returns empty array when no campaign sponsors', async () => {
      prisma.sponsorCampaign.findMany.mockResolvedValue([]);

      const result = await service.getClubSponsors('user-1', 'CLUB_ADMIN');
      expect(result).toEqual([]);
    });
  });

  describe('getClubContent', () => {
    it('returns content items when allowed', async () => {
      const mockContent = [{ id: 'ct1', teamId: 'club-1', title: 'News Item', status: 'DRAFT' }];
      prisma.clubContentItem.findMany.mockResolvedValue(mockContent);

      const result = await service.getClubContent('user-1', 'CLUB_ADMIN');
      expect(result).toEqual(mockContent);
    });
  });

  describe('submitContent', () => {
    it('creates content item with DRAFT status', async () => {
      const dto = { title: 'Test Article', contentType: 'article', body: 'Some text' };
      const created = { id: 'ct-new', teamId: 'club-1', title: 'Test Article', status: 'DRAFT' };
      prisma.clubContentItem.create.mockResolvedValue(created);

      const result = await service.submitContent(dto, 'user-1', 'CLUB_ADMIN');
      expect(result).toEqual(created);
      expect(prisma.clubContentItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'DRAFT', teamId: 'club-1' }),
        }),
      );
    });

    it('does not create content with PUBLISHED status', async () => {
      const dto = { title: 'Test', contentType: 'news' };
      prisma.clubContentItem.create.mockResolvedValue({ status: 'DRAFT' });

      await service.submitContent(dto, 'user-1', 'CLUB_ADMIN');
      const firstCall = prisma.clubContentItem.create.mock.calls[0];
      const callArgs = firstCall![0] as { data: { status: string } };
      expect(callArgs.data.status).toBe('DRAFT');
      expect(callArgs.data.status).not.toBe('PUBLISHED');
    });

    it('throws ForbiddenException for cross-club access on content submission', async () => {
      scope.resolveClubScope.mockResolvedValue({
        allowed: false,
        reason: 'Cross-club access denied',
        statusCode: 403,
        errorCode: 'CROSS_CLUB_ACCESS_DENIED',
      });

      const dto = { title: 'Test', contentType: 'news' };
      await expect(service.submitContent(dto, 'user-1', 'CLUB_ADMIN', 'wrong-club')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('PSL_ADMIN explicit scope', () => {
    it('PSL_ADMIN with explicit teamId returns club data', async () => {
      scope.resolveClubScope.mockResolvedValue({
        allowed: true as const,
        scopeType: 'club' as const,
        teamId: 'team-explicit',
        reason: 'PSL_ADMIN explicit scope',
      });
      prisma.team.findFirst.mockResolvedValue({ id: 'team-explicit', name: 'Test FC' });
      prisma.player.count.mockResolvedValue(11);
      prisma.fixture.findMany.mockResolvedValue([]);

      const result = await service.getClubOverview('admin-user', 'PSL_ADMIN', 'team-explicit');
      expect(result).toMatchObject({ playerCount: 11 });
    });
  });
});
