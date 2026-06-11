import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { ClubContentStatus, FixtureStatus, ShopProductStatus } from '@prisma/client';
import { ClubExperienceService } from './club-experience.service';
import type { PrismaService } from '../prisma/prisma.service';

const mockTeam = (overrides = {}) => ({
  id: 'team-1',
  name: 'Mamelodi Sundowns',
  slug: 'mamelodi-sundowns',
  shortName: 'Sundowns',
  logoUrl: null,
  primaryColour: null,
  secondaryColour: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  clubProfile: null,
  experienceStatus: null,
  ...overrides,
});

const mockFixture = (overrides = {}) => ({
  id: 'fix-1',
  homeTeamId: 'team-1',
  awayTeamId: 'team-2',
  status: FixtureStatus.SCHEDULED,
  kickoffAt: new Date(),
  homeScore: null,
  awayScore: null,
  venueId: null,
  gameweekId: null,
  homeTeam: { name: 'Mamelodi Sundowns', slug: 'mamelodi-sundowns', shortName: 'Sundowns', logoUrl: null },
  awayTeam: { name: 'Kaizer Chiefs', slug: 'kaizer-chiefs', shortName: 'Chiefs', logoUrl: null },
  venue: null,
  gameweek: null,
  ...overrides,
});

const mockProduct = (overrides = {}) => ({
  id: 'prod-1',
  teamId: 'team-1',
  name: 'Home Kit 2025',
  slug: 'home-kit-2025',
  description: null,
  category: 'KIT',
  status: ShopProductStatus.PUBLISHED,
  featured: false,
  priceZar: 1200,
  imageUrl: null,
  externalProductId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makePrismaMock = () => ({
  season: {
    findUnique: vi.fn().mockResolvedValue(null),
  },
  team: {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
  },
  fixture: {
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
    count: vi.fn().mockResolvedValue(0),
  },
  player: {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
  },
  clubProfile: {
    findUnique: vi.fn().mockResolvedValue(null),
  },
  clubShopProduct: {
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(null),
  },
});

describe('ClubExperienceService', () => {
  let service: ClubExperienceService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new ClubExperienceService(prisma as unknown as PrismaService);
  });

  // ── getClubs ────────────────────────────────────────────────────────────────

  describe('getClubs', () => {
    it('returns all teams when no season slug provided', async () => {
      prisma.team.findMany.mockResolvedValue([mockTeam()]);
      const result = await service.getClubs();
      expect(prisma.team.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('returns teams filtered by season', async () => {
      const team = mockTeam();
      prisma.season.findUnique.mockResolvedValue({
        id: 'season-1',
        slug: 'psl-premiership-upcoming',
        name: 'PSL 2025/26',
        seasonTeams: [
          { team, status: 'ACTIVE', source: 'MANUAL' },
        ],
      });
      const result = await service.getClubs('psl-premiership-upcoming');
      expect(result).toHaveLength(1);
      expect((result[0] as Record<string, unknown>)['participationStatus']).toBe('ACTIVE');
    });

    it('throws NotFoundException when season not found', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getClubs('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getClubBySlug ──────────────────────────────────────────────────────────

  describe('getClubBySlug', () => {
    it('returns team for known slug', async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam());
      const result = await service.getClubBySlug('mamelodi-sundowns');
      expect(result.id).toBe('team-1');
    });

    it('throws NotFoundException for unknown slug', async () => {
      prisma.team.findUnique.mockResolvedValue(null);
      await expect(service.getClubBySlug('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getClubOverview ────────────────────────────────────────────────────────

  describe('getClubOverview', () => {
    it('returns overview with fixtures', async () => {
      prisma.team.findUnique.mockResolvedValue({
        ...mockTeam(),
        players: [],
        contentItems: [],
      });
      prisma.fixture.findFirst.mockResolvedValueOnce(mockFixture()).mockResolvedValueOnce(null);
      const result = await service.getClubOverview('mamelodi-sundowns');
      expect(result).toBeDefined();
      expect((result as Record<string, unknown>)['nextFixture']).toBeDefined();
    });

    it('throws when club not found', async () => {
      prisma.team.findUnique.mockResolvedValue(null);
      await expect(service.getClubOverview('bad-slug')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getClubFixtures ────────────────────────────────────────────────────────

  describe('getClubFixtures', () => {
    it('returns fixtures for club', async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam());
      prisma.fixture.findMany.mockResolvedValue([mockFixture()]);
      const result = await service.getClubFixtures('mamelodi-sundowns');
      expect(result).toHaveLength(1);
    });

    it('throws when club not found', async () => {
      prisma.team.findUnique.mockResolvedValue(null);
      await expect(service.getClubFixtures('bad')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getClubResults ─────────────────────────────────────────────────────────

  describe('getClubResults', () => {
    it('returns finished fixtures', async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam());
      prisma.fixture.findMany.mockResolvedValue([mockFixture({ status: FixtureStatus.FINISHED })]);
      const result = await service.getClubResults('mamelodi-sundowns');
      expect(result).toHaveLength(1);
    });
  });

  // ── getClubSquad ───────────────────────────────────────────────────────────

  describe('getClubSquad', () => {
    it('returns grouped squad', async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam());
      prisma.player.findMany.mockResolvedValue([
        { id: 'p1', name: 'Keeper', position: 'GOALKEEPER', number: 1, nationality: 'ZA', dateOfBirth: null, prices: [] },
      ]);
      const result = await service.getClubSquad('mamelodi-sundowns');
      expect((result as Record<string, unknown>)['grouped']).toBeDefined();
    });
  });

  // ── getClubStats ───────────────────────────────────────────────────────────

  describe('getClubStats', () => {
    it('returns stats object', async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam());
      prisma.fixture.count.mockResolvedValue(10);
      prisma.player.count.mockResolvedValue(25);
      const result = await service.getClubStats('mamelodi-sundowns');
      expect((result as Record<string, unknown>)['matchesPlayed']).toBe(10);
    });
  });

  // ── getClubStadium ─────────────────────────────────────────────────────────

  describe('getClubStadium', () => {
    it('returns no-venue message when no fixture with venue', async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam());
      prisma.fixture.findFirst.mockResolvedValue(null);
      const result = await service.getClubStadium('mamelodi-sundowns');
      expect((result as Record<string, unknown>)['venue']).toBeNull();
      expect((result as Record<string, unknown>)['note']).toBeDefined();
    });
  });

  // ── getClubTickets ─────────────────────────────────────────────────────────

  describe('getClubTickets', () => {
    it('returns MVP stub with commerce note', async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam());
      prisma.clubProfile.findUnique.mockResolvedValue(null);
      const result = await service.getClubTickets('mamelodi-sundowns');
      expect((result as Record<string, unknown>)['status']).toBe('NOT_ENABLED');
      expect((result as Record<string, unknown>)['checkoutEnabled' in result ? 'checkoutEnabled' : 'commerceNote']).toBeDefined();
    });
  });

  // ── getClubShop ────────────────────────────────────────────────────────────

  describe('getClubShop', () => {
    it('returns shop with catalogue-only status', async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam());
      prisma.clubShopProduct.findMany.mockResolvedValue([mockProduct()]);
      const result = await service.getClubShop('mamelodi-sundowns');
      expect((result as Record<string, unknown>)['checkoutEnabled']).toBe(false);
      expect((result as Record<string, unknown>)['commerceStatus']).toBe('CATALOGUE_ONLY');
    });
  });

  // ── getClubShopProduct ─────────────────────────────────────────────────────

  describe('getClubShopProduct', () => {
    it('returns product with commerce note', async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam());
      prisma.clubShopProduct.findUnique.mockResolvedValue(mockProduct());
      const result = await service.getClubShopProduct('mamelodi-sundowns', 'home-kit-2025');
      expect((result as Record<string, unknown>)['checkoutEnabled']).toBe(false);
    });

    it('throws when product not found', async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam());
      prisma.clubShopProduct.findUnique.mockResolvedValue(null);
      await expect(service.getClubShopProduct('mamelodi-sundowns', 'bad-slug')).rejects.toThrow(NotFoundException);
    });
  });
});
