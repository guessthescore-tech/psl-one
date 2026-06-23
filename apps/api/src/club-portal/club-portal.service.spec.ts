import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ClubPortalService } from './club-portal.service';
import { PrismaService } from '../prisma/prisma.service';

const makePrisma = () => ({
  team: { findFirst: vi.fn() },
  player: { findMany: vi.fn(), count: vi.fn() },
  fixture: { findMany: vi.fn(), count: vi.fn() },
  clubContentItem: { findMany: vi.fn(), count: vi.fn(), create: vi.fn() },
  sponsorCampaign: { findMany: vi.fn() },
  sponsor: { findMany: vi.fn() },
});

describe('ClubPortalService', () => {
  let service: ClubPortalService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(async () => {
    prisma = makePrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClubPortalService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ClubPortalService>(ClubPortalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getClubOverview', () => {
    it('returns scopeStatus when no clubId', async () => {
      const result = await service.getClubOverview(undefined);
      expect(result).toMatchObject({ scopeStatus: 'API_SCOPE_PENDING' });
    });

    it('returns team, playerCount, recentFixtures when clubId provided', async () => {
      prisma.team.findFirst.mockResolvedValue({ id: 'club-1', name: 'Test FC' });
      prisma.player.count.mockResolvedValue(25);
      prisma.fixture.findMany.mockResolvedValue([]);

      const result = await service.getClubOverview('club-1');
      expect(result).toMatchObject({ playerCount: 25, recentFixtures: [] });
    });
  });

  describe('getClubProfile', () => {
    it('returns scopeStatus when no clubId', async () => {
      const result = await service.getClubProfile(undefined);
      expect(result).toMatchObject({ scopeStatus: 'API_SCOPE_PENDING' });
    });

    it('returns team with clubProfile when clubId provided', async () => {
      const mockTeam = { id: 'club-1', name: 'Test FC', clubProfile: { founded: 1990 } };
      prisma.team.findFirst.mockResolvedValue(mockTeam);

      const result = await service.getClubProfile('club-1');
      expect(result).toEqual(mockTeam);
      expect(prisma.team.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'club-1' } }),
      );
    });
  });

  describe('getClubSquad', () => {
    it('returns scopeStatus when no clubId', async () => {
      const result = await service.getClubSquad(undefined);
      expect(result).toMatchObject({ scopeStatus: 'API_SCOPE_PENDING' });
    });

    it('returns players array when clubId provided', async () => {
      const mockPlayers = [{ id: 'p1', name: 'Player One', teamId: 'club-1' }];
      prisma.player.findMany.mockResolvedValue(mockPlayers);

      const result = await service.getClubSquad('club-1');
      expect(result).toEqual(mockPlayers);
    });
  });

  describe('getClubFixtures', () => {
    it('returns scopeStatus when no clubId', async () => {
      const result = await service.getClubFixtures(undefined);
      expect(result).toMatchObject({ scopeStatus: 'API_SCOPE_PENDING' });
    });

    it('returns fixtures when clubId provided', async () => {
      const mockFixtures = [{ id: 'f1', homeTeamId: 'club-1', status: 'SCHEDULED' }];
      prisma.fixture.findMany.mockResolvedValue(mockFixtures);

      const result = await service.getClubFixtures('club-1');
      expect(result).toEqual(mockFixtures);
    });
  });

  describe('getClubFans', () => {
    it('returns placeholder with fan-club pending note', () => {
      const result = service.getClubFans(undefined);
      expect(result).toMatchObject({ fanCount: 0, fans: [] });
      expect(result.note).toMatch(/Sprint 28/);
    });
  });

  describe('getClubAnalytics', () => {
    it('returns scopeStatus when no clubId', async () => {
      const result = await service.getClubAnalytics(undefined);
      expect(result).toMatchObject({ scopeStatus: 'API_SCOPE_PENDING' });
    });

    it('returns counts when clubId provided', async () => {
      prisma.player.count.mockResolvedValue(20);
      prisma.fixture.count.mockResolvedValue(15);
      prisma.clubContentItem.count.mockResolvedValue(5);

      const result = await service.getClubAnalytics('club-1');
      expect(result).toEqual({ playerCount: 20, fixtureCount: 15, contentCount: 5 });
    });
  });

  describe('getClubCampaigns', () => {
    it('returns scopeStatus when no clubId', async () => {
      const result = await service.getClubCampaigns(undefined);
      expect(result).toMatchObject({ scopeStatus: 'API_SCOPE_PENDING' });
    });

    it('returns campaigns when clubId provided', async () => {
      const mockCampaigns = [{ id: 'c1', clubId: 'club-1', title: 'Campaign A' }];
      prisma.sponsorCampaign.findMany.mockResolvedValue(mockCampaigns);

      const result = await service.getClubCampaigns('club-1');
      expect(result).toEqual(mockCampaigns);
    });
  });

  describe('getClubSponsors', () => {
    it('returns scopeStatus when no clubId', async () => {
      const result = await service.getClubSponsors(undefined);
      expect(result).toMatchObject({ scopeStatus: 'API_SCOPE_PENDING' });
    });

    it('returns empty array when no campaign sponsors', async () => {
      prisma.sponsorCampaign.findMany.mockResolvedValue([]);

      const result = await service.getClubSponsors('club-1');
      expect(result).toEqual([]);
    });
  });

  describe('getClubContent', () => {
    it('returns scopeStatus when no clubId', async () => {
      const result = await service.getClubContent(undefined);
      expect(result).toMatchObject({ scopeStatus: 'API_SCOPE_PENDING' });
    });

    it('returns content items when clubId provided', async () => {
      const mockContent = [{ id: 'ct1', teamId: 'club-1', title: 'News Item', status: 'DRAFT' }];
      prisma.clubContentItem.findMany.mockResolvedValue(mockContent);

      const result = await service.getClubContent('club-1');
      expect(result).toEqual(mockContent);
    });
  });

  describe('submitContent', () => {
    it('returns scopeStatus when no clubId', async () => {
      const dto = { title: 'Test', contentType: 'news' };
      const result = await service.submitContent(dto, undefined, 'user-1');
      expect(result).toMatchObject({ scopeStatus: 'API_SCOPE_PENDING' });
    });

    it('creates content item with DRAFT status', async () => {
      const dto = { title: 'Test Article', contentType: 'article', body: 'Some text' };
      const created = { id: 'ct-new', teamId: 'club-1', title: 'Test Article', status: 'DRAFT' };
      prisma.clubContentItem.create.mockResolvedValue(created);

      const result = await service.submitContent(dto, 'club-1', 'user-1');
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

      await service.submitContent(dto, 'club-1', 'user-1');
      const firstCall = prisma.clubContentItem.create.mock.calls[0];
      const callArgs = firstCall![0] as { data: { status: string } };
      expect(callArgs.data.status).toBe('DRAFT');
      expect(callArgs.data.status).not.toBe('PUBLISHED');
    });
  });
});
