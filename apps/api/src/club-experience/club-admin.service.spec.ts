import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SeasonTeamSource, SeasonTeamStatus, SquadRegistrationStatus } from '@prisma/client';
import { ClubAdminService } from './club-admin.service';
import type { PrismaService } from '../prisma/prisma.service';

const mockTeam = (overrides = {}) => ({
  id: 'team-1',
  name: 'Mamelodi Sundowns',
  slug: 'mamelodi-sundowns',
  shortName: 'Sundowns',
  logoUrl: null,
  ...overrides,
});

const mockSeason = (overrides = {}) => ({
  id: 'season-1',
  slug: 'psl-premiership-upcoming',
  name: 'PSL 2025/26',
  ...overrides,
});

const mockSeasonTeam = (overrides = {}) => ({
  seasonId: 'season-1',
  teamId: 'team-1',
  status: SeasonTeamStatus.ACTIVE,
  source: SeasonTeamSource.MANUAL,
  team: mockTeam(),
  ...overrides,
});

const mockPlayer = (overrides = {}) => ({
  id: 'player-1',
  name: 'Themba Zwane',
  position: 'MIDFIELDER',
  number: 10,
  nationality: 'ZA',
  teamId: 'team-1',
  dateOfBirth: null,
  ...overrides,
});

const mockRegistration = (overrides = {}) => ({
  id: 'reg-1',
  seasonId: 'season-1',
  teamId: 'team-1',
  playerId: 'player-1',
  status: SquadRegistrationStatus.PROVISIONAL,
  shirtNumber: null,
  source: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const mockFixture = (overrides = {}) => ({
  id: 'fix-1',
  homeTeamId: null,
  awayTeamId: null,
  venueId: null,
  gameweekId: null,
  status: 'SCHEDULED',
  kickoffAt: new Date(),
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
  seasonTeam: {
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(mockSeasonTeam()),
    update: vi.fn().mockResolvedValue(mockSeasonTeam()),
    delete: vi.fn().mockResolvedValue(mockSeasonTeam()),
  },
  player: {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue(mockPlayer()),
    count: vi.fn().mockResolvedValue(0),
  },
  seasonSquadRegistration: {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue(mockRegistration()),
    update: vi.fn().mockResolvedValue(mockRegistration()),
    updateMany: vi.fn().mockResolvedValue({ count: 1 }),
  },
  fixture: {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue(mockFixture()),
    count: vi.fn().mockResolvedValue(0),
  },
  venue: {
    findUnique: vi.fn().mockResolvedValue(null),
  },
  gameweek: {
    findUnique: vi.fn().mockResolvedValue(null),
  },
  clubExperienceStatus: {
    findUnique: vi.fn().mockResolvedValue(null),
    upsert: vi.fn().mockResolvedValue({ teamId: 'team-1', overallReadiness: 'NOT_READY' }),
  },
  clubProfile: {
    findUnique: vi.fn().mockResolvedValue(null),
  },
  clubShopProduct: {
    findMany: vi.fn().mockResolvedValue([]),
  },
  contentItems: {
    findMany: vi.fn().mockResolvedValue([]),
  },
  $transaction: vi.fn().mockImplementation((ops) => {
    if (Array.isArray(ops)) return Promise.all(ops);
    return ops(makePrismaMock());
  }),
});

describe('ClubAdminService', () => {
  let service: ClubAdminService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new ClubAdminService(prisma as unknown as PrismaService);
  });

  // ── getSeasonTeams ─────────────────────────────────────────────────────────

  describe('getSeasonTeams', () => {
    it('returns teams for season', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason());
      prisma.seasonTeam.findMany.mockResolvedValue([mockSeasonTeam()]);
      const result = await service.getSeasonTeams('season-1');
      expect(result).toHaveLength(1);
    });

    it('throws when season not found', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getSeasonTeams('bad')).rejects.toThrow(NotFoundException);
    });
  });

  // ── addTeamToSeason ────────────────────────────────────────────────────────

  describe('addTeamToSeason', () => {
    it('creates season team record', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason());
      prisma.team.findUnique.mockResolvedValue(mockTeam());
      prisma.seasonTeam.findUnique.mockResolvedValue(null);
      const result = await service.addTeamToSeason('season-1', { teamId: 'team-1' });
      expect(prisma.seasonTeam.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('throws if team already in season', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason());
      prisma.team.findUnique.mockResolvedValue(mockTeam());
      prisma.seasonTeam.findUnique.mockResolvedValue(mockSeasonTeam());
      await expect(service.addTeamToSeason('season-1', { teamId: 'team-1' })).rejects.toThrow(BadRequestException);
    });

    it('throws when season not found', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.addTeamToSeason('bad', { teamId: 'team-1' })).rejects.toThrow(NotFoundException);
    });
  });

  // ── updateSeasonTeamStatus ─────────────────────────────────────────────────

  describe('updateSeasonTeamStatus', () => {
    it('updates status', async () => {
      prisma.seasonTeam.findUnique.mockResolvedValue(mockSeasonTeam());
      prisma.seasonTeam.update.mockResolvedValue(mockSeasonTeam({ status: SeasonTeamStatus.ACTIVE }));
      const result = await service.updateSeasonTeamStatus('season-1', 'team-1', { status: SeasonTeamStatus.ACTIVE });
      expect(prisma.seasonTeam.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('throws when not found', async () => {
      prisma.seasonTeam.findUnique.mockResolvedValue(null);
      await expect(service.updateSeasonTeamStatus('s', 't', {})).rejects.toThrow(NotFoundException);
    });
  });

  // ── removeTeamFromSeason ───────────────────────────────────────────────────

  describe('removeTeamFromSeason', () => {
    it('deletes record', async () => {
      prisma.seasonTeam.findUnique.mockResolvedValue(mockSeasonTeam());
      const result = await service.removeTeamFromSeason('season-1', 'team-1');
      expect(prisma.seasonTeam.delete).toHaveBeenCalled();
      expect((result as Record<string, unknown>)['removed']).toBe(true);
    });

    it('throws when not found', async () => {
      prisma.seasonTeam.findUnique.mockResolvedValue(null);
      await expect(service.removeTeamFromSeason('s', 't')).rejects.toThrow(NotFoundException);
    });
  });

  // ── validateSeasonParticipation ────────────────────────────────────────────

  describe('validateSeasonParticipation', () => {
    it('reports not ready when fewer than 16 active', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason());
      prisma.seasonTeam.findMany.mockResolvedValue([mockSeasonTeam({ status: SeasonTeamStatus.PROVISIONAL })]);
      const result = await service.validateSeasonParticipation('season-1');
      expect((result as Record<string, unknown>)['readiness']).toBe('NOT_READY');
    });

    it('throws when season not found', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.validateSeasonParticipation('bad')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getClubPlayers ─────────────────────────────────────────────────────────

  describe('getClubPlayers', () => {
    it('returns players for team', async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam());
      prisma.player.findMany.mockResolvedValue([mockPlayer()]);
      const result = await service.getClubPlayers('team-1');
      expect(result).toHaveLength(1);
    });

    it('throws when team not found', async () => {
      prisma.team.findUnique.mockResolvedValue(null);
      await expect(service.getClubPlayers('bad')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getUnassignedPlayers ───────────────────────────────────────────────────

  describe('getUnassignedPlayers', () => {
    it('returns players with no team', async () => {
      prisma.player.findMany.mockResolvedValue([mockPlayer({ teamId: null })]);
      const result = await service.getUnassignedPlayers();
      expect(result).toHaveLength(1);
    });
  });

  // ── assignPlayerToClub ─────────────────────────────────────────────────────

  describe('assignPlayerToClub', () => {
    it('creates registration and updates player teamId', async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam());
      prisma.season.findUnique.mockResolvedValue(mockSeason());
      prisma.player.findUnique.mockResolvedValue(mockPlayer({ teamId: null }));
      prisma.seasonSquadRegistration.findUnique.mockResolvedValue(null);
      prisma.$transaction.mockResolvedValue([mockRegistration(), mockPlayer()]);
      const result = await service.assignPlayerToClub('team-1', 'season-1', { playerId: 'player-1' });
      expect(result).toBeDefined();
    });

    it('throws if player already registered', async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam());
      prisma.season.findUnique.mockResolvedValue(mockSeason());
      prisma.player.findUnique.mockResolvedValue(mockPlayer());
      prisma.seasonSquadRegistration.findUnique.mockResolvedValue(mockRegistration());
      await expect(service.assignPlayerToClub('team-1', 'season-1', { playerId: 'player-1' })).rejects.toThrow(BadRequestException);
    });
  });

  // ── removePlayerFromClub ───────────────────────────────────────────────────

  describe('removePlayerFromClub', () => {
    it('marks registration as removed', async () => {
      prisma.seasonSquadRegistration.findUnique.mockResolvedValue(mockRegistration());
      prisma.seasonSquadRegistration.update.mockResolvedValue(mockRegistration({ status: SquadRegistrationStatus.REMOVED }));
      const result = await service.removePlayerFromClub('team-1', 'season-1', 'player-1');
      expect((result as Record<string, unknown>)['removed']).toBe(true);
    });

    it('throws when registration not found', async () => {
      prisma.seasonSquadRegistration.findUnique.mockResolvedValue(null);
      await expect(service.removePlayerFromClub('team-1', 'season-1', 'player-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ── validateSquadCompleteness ──────────────────────────────────────────────

  describe('validateSquadCompleteness', () => {
    it('reports not ready for empty squad', async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam());
      prisma.seasonSquadRegistration.findMany.mockResolvedValue([]);
      const result = await service.validateSquadCompleteness('team-1', 'season-1');
      expect((result as Record<string, unknown>)['readiness']).toBe('NOT_READY');
      expect(((result as Record<string, unknown>)['issues'] as string[]).length).toBeGreaterThan(0);
    });
  });

  // ── getUnassignedFixtures ──────────────────────────────────────────────────

  describe('getUnassignedFixtures', () => {
    it('returns fixtures missing team/gameweek', async () => {
      prisma.fixture.findMany.mockResolvedValue([mockFixture()]);
      const result = await service.getUnassignedFixtures();
      expect(result).toHaveLength(1);
    });
  });

  // ── assignFixtureTeams ─────────────────────────────────────────────────────

  describe('assignFixtureTeams', () => {
    it('updates home and away teams', async () => {
      prisma.fixture.findUnique.mockResolvedValue(mockFixture());
      prisma.fixture.update.mockResolvedValue(mockFixture({ homeTeamId: 'team-1', awayTeamId: 'team-2' }));
      const result = await service.assignFixtureTeams('fix-1', { homeTeamId: 'team-1', awayTeamId: 'team-2' });
      expect(prisma.fixture.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('throws when fixture not found', async () => {
      prisma.fixture.findUnique.mockResolvedValue(null);
      await expect(service.assignFixtureTeams('bad', {})).rejects.toThrow(NotFoundException);
    });
  });

  // ── assignFixtureVenue ─────────────────────────────────────────────────────

  describe('assignFixtureVenue', () => {
    it('updates venue', async () => {
      prisma.fixture.findUnique.mockResolvedValue(mockFixture());
      prisma.venue.findUnique.mockResolvedValue({ id: 'venue-1', name: 'FNB Stadium', city: 'Johannesburg' });
      prisma.fixture.update.mockResolvedValue(mockFixture({ venueId: 'venue-1' }));
      const result = await service.assignFixtureVenue('fix-1', { venueId: 'venue-1' });
      expect(result).toBeDefined();
    });

    it('throws when venue not found', async () => {
      prisma.fixture.findUnique.mockResolvedValue(mockFixture());
      prisma.venue.findUnique.mockResolvedValue(null);
      await expect(service.assignFixtureVenue('fix-1', { venueId: 'bad' })).rejects.toThrow(NotFoundException);
    });
  });

  // ── assignFixtureGameweek ──────────────────────────────────────────────────

  describe('assignFixtureGameweek', () => {
    it('updates gameweek', async () => {
      prisma.fixture.findUnique.mockResolvedValue(mockFixture());
      prisma.gameweek.findUnique.mockResolvedValue({ id: 'gw-1', name: 'GW1' });
      prisma.fixture.update.mockResolvedValue(mockFixture({ gameweekId: 'gw-1' }));
      const result = await service.assignFixtureGameweek('fix-1', { gameweekId: 'gw-1' });
      expect(result).toBeDefined();
    });

    it('throws when gameweek not found', async () => {
      prisma.fixture.findUnique.mockResolvedValue(mockFixture());
      prisma.gameweek.findUnique.mockResolvedValue(null);
      await expect(service.assignFixtureGameweek('fix-1', { gameweekId: 'bad' })).rejects.toThrow(NotFoundException);
    });
  });

  // ── updateFixtureAssignmentStatus ─────────────────────────────────────────

  describe('updateFixtureAssignmentStatus', () => {
    it('rejects invalid status', async () => {
      prisma.fixture.findUnique.mockResolvedValue(mockFixture());
      await expect(service.updateFixtureAssignmentStatus('fix-1', { assignmentStatus: 'INVALID' })).rejects.toThrow(BadRequestException);
    });

    it('updates to valid status', async () => {
      prisma.fixture.findUnique.mockResolvedValue(mockFixture());
      prisma.fixture.update.mockResolvedValue(mockFixture({ status: 'FINISHED' }));
      const result = await service.updateFixtureAssignmentStatus('fix-1', { assignmentStatus: 'FINISHED' });
      expect(result).toBeDefined();
    });
  });

  // ── validateFixtureReadiness ───────────────────────────────────────────────

  describe('validateFixtureReadiness', () => {
    it('reports not ready when no fixtures', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason());
      prisma.fixture.findMany.mockResolvedValue([]);
      const result = await service.validateFixtureReadiness('season-1');
      expect((result as Record<string, unknown>)['readiness']).toBe('NOT_READY');
    });

    it('reports ready when all assigned', async () => {
      prisma.season.findUnique.mockResolvedValue(mockSeason());
      prisma.fixture.findMany.mockResolvedValue([
        mockFixture({ homeTeamId: 't1', awayTeamId: 't2', venueId: 'v1', gameweekId: 'gw1' }),
      ]);
      const result = await service.validateFixtureReadiness('season-1');
      expect((result as Record<string, unknown>)['readiness']).toBe('READY');
    });
  });

  // ── getClubReadiness ───────────────────────────────────────────────────────

  describe('getClubReadiness', () => {
    it('returns summary', async () => {
      prisma.team.findMany = vi.fn().mockResolvedValue([{ ...mockTeam(), experienceStatus: null, clubProfile: null, _count: { players: 0, contentItems: 0, shopProducts: 0 } }]) as typeof prisma.team.findMany;
      const result = await service.getClubReadiness();
      expect((result as Record<string, unknown>)['totalClubs']).toBe(1);
    });
  });

  // ── getAdminClubList ───────────────────────────────────────────────────────

  describe('getAdminClubList', () => {
    it('returns list', async () => {
      prisma.team.findMany = vi.fn().mockResolvedValue([{ ...mockTeam(), clubProfile: null, experienceStatus: null, _count: { players: 0 } }]) as typeof prisma.team.findMany;
      const result = await service.getAdminClubList();
      expect(result).toBeDefined();
    });
  });

  // ── getAdminClubDetail ─────────────────────────────────────────────────────

  describe('getAdminClubDetail', () => {
    it('returns club detail', async () => {
      prisma.team.findUnique.mockResolvedValue(mockTeam());
      const result = await service.getAdminClubDetail('team-1');
      expect(result).toBeDefined();
    });

    it('throws when not found', async () => {
      prisma.team.findUnique.mockResolvedValue(null);
      await expect(service.getAdminClubDetail('bad')).rejects.toThrow(NotFoundException);
    });
  });

  // ── validateClubDataQuality ────────────────────────────────────────────────

  describe('validateClubDataQuality', () => {
    it('reports issues when profile missing', async () => {
      prisma.team.findUnique.mockResolvedValue({
        ...mockTeam(),
        clubProfile: null,
        players: [],
        contentItems: [],
        shopProducts: [],
      });
      const result = await service.validateClubDataQuality('team-1');
      expect(((result as Record<string, unknown>)['issues'] as string[]).length).toBeGreaterThan(0);
      expect((result as Record<string, unknown>)['readiness']).toBe('NOT_READY');
    });
  });
});
