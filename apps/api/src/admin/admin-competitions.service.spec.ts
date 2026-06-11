import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AdminCompetitionsService } from './admin-competitions.service';
import type { PrismaService } from '../prisma/prisma.service';
import { CompetitionFormat, SeasonStatus } from '@prisma/client';

const makePrismaMock = () => ({
  competition: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  season: {
    findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn(),
  },
  $transaction: vi.fn((cb: (tx: any) => Promise<any>) => cb({
    season: { updateMany: vi.fn().mockResolvedValue({ count: 1 }), update: vi.fn() },
  })),
});

const MOCK_COMP = {
  id: 'comp-1', name: 'FIFA World Cup', slug: 'fifa-world-cup', logoUrl: null,
  format: 'HYBRID', teamCount: 48, hasGroups: true, hasKnockouts: true,
  hasHomeAway: true, usesNeutralVenues: true,
  pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0,
  source: null, externalId: null, sourceUrl: null,
  _count: { seasons: 1, stages: 7 },
};

const MOCK_SEASON = {
  id: 'season-1', competitionId: 'comp-1',
  name: 'FIFA World Cup 2026', slug: 'fifa-world-cup-2026',
  startDate: new Date('2026-06-11'), endDate: new Date('2026-07-19'),
  isActive: true, status: 'ACTIVE',
  source: null, externalId: null, sourceUrl: null, importedAt: null,
  _count: { fixtures: 104 },
};

describe('AdminCompetitionsService', () => {
  let service: AdminCompetitionsService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    service = new AdminCompetitionsService(prisma as unknown as PrismaService);
  });

  // ── List ──────────────────────────────────────────────────────────────────

  it('listCompetitions returns all competitions', async () => {
    prisma.competition.findMany.mockResolvedValue([MOCK_COMP]);
    const result = await service.listCompetitions();
    expect(result).toHaveLength(1);
    expect(result[0]).toBeDefined();
  });

  // ── Create competition ────────────────────────────────────────────────────

  it('createCompetition creates LEAGUE competition', async () => {
    prisma.competition.findUnique.mockResolvedValue(null);
    const created = { ...MOCK_COMP, slug: 'psl-premiership', format: 'LEAGUE' };
    prisma.competition.create.mockResolvedValue(created);

    const result = await service.createCompetition({
      name: 'PSL Premiership', slug: 'psl-premiership',
      format: CompetitionFormat.LEAGUE,
      hasGroups: false, hasKnockouts: false, hasHomeAway: true, usesNeutralVenues: false,
    });
    expect(result.format).toBe('LEAGUE');
    expect(prisma.competition.create).toHaveBeenCalled();
  });

  it('createCompetition creates TOURNAMENT competition', async () => {
    prisma.competition.findUnique.mockResolvedValue(null);
    const created = { ...MOCK_COMP, format: 'TOURNAMENT', teamCount: 24 };
    prisma.competition.create.mockResolvedValue(created);

    const result = await service.createCompetition({
      name: 'AFCON', slug: 'afcon',
      format: CompetitionFormat.TOURNAMENT,
      teamCount: 24, hasGroups: true, hasKnockouts: true, hasHomeAway: true, usesNeutralVenues: true,
    });
    expect(result.format).toBe('TOURNAMENT');
  });

  it('createCompetition creates HYBRID competition', async () => {
    prisma.competition.findUnique.mockResolvedValue(null);
    const created = { ...MOCK_COMP, format: 'HYBRID' };
    prisma.competition.create.mockResolvedValue(created);

    const result = await service.createCompetition({
      name: 'Champions League', slug: 'champions-league',
      format: CompetitionFormat.HYBRID,
      hasGroups: true, hasKnockouts: true, hasHomeAway: true, usesNeutralVenues: false,
    });
    expect(result.format).toBe('HYBRID');
  });

  it('createCompetition throws ConflictException for duplicate slug', async () => {
    prisma.competition.findUnique.mockResolvedValue({ id: 'existing' });
    await expect(service.createCompetition({
      name: 'Duplicate', slug: 'existing-slug',
      format: CompetitionFormat.LEAGUE,
      hasGroups: false, hasKnockouts: false, hasHomeAway: true, usesNeutralVenues: false,
    })).rejects.toThrow(ConflictException);
    expect(prisma.competition.create).not.toHaveBeenCalled();
  });

  // ── Update competition ────────────────────────────────────────────────────

  it('updateCompetition throws NotFoundException for unknown id', async () => {
    prisma.competition.findUnique.mockResolvedValue(null);
    await expect(service.updateCompetition('unknown', { name: 'New' }))
      .rejects.toThrow(NotFoundException);
  });

  it('updateCompetition updates fields', async () => {
    prisma.competition.findUnique.mockResolvedValue({ id: 'comp-1' });
    const updated = { ...MOCK_COMP, teamCount: 20 };
    prisma.competition.update.mockResolvedValue(updated);
    const result = await service.updateCompetition('comp-1', { teamCount: 20 });
    expect((result as typeof updated).teamCount).toBe(20);
  });

  // ── Create season ─────────────────────────────────────────────────────────

  it('createSeason creates an UPCOMING season', async () => {
    prisma.competition.findUnique.mockResolvedValue({ id: 'comp-1' });
    prisma.season.findUnique.mockResolvedValue(null);
    const created = { ...MOCK_SEASON, isActive: false, status: 'UPCOMING' };
    prisma.season.create.mockResolvedValue(created);

    const result = await service.createSeason('comp-1', {
      name: 'PSL 2026/27', slug: 'psl-2026-27',
      startDate: '2026-08-01', endDate: '2027-05-31',
    });
    expect(result.isActive).toBe(false);
    expect(result.status).toBe('UPCOMING');
  });

  it('createSeason throws ConflictException for duplicate slug', async () => {
    prisma.competition.findUnique.mockResolvedValue({ id: 'comp-1' });
    prisma.season.findUnique.mockResolvedValue({ id: 'existing' });
    await expect(service.createSeason('comp-1', {
      name: 'Dup', slug: 'duplicate',
      startDate: '2026-08-01', endDate: '2027-05-31',
    })).rejects.toThrow(ConflictException);
  });

  it('createSeason throws NotFoundException for unknown competition', async () => {
    prisma.competition.findUnique.mockResolvedValue(null);
    await expect(service.createSeason('unknown', {
      name: 'New', slug: 'new',
      startDate: '2026-08-01', endDate: '2027-05-31',
    })).rejects.toThrow(NotFoundException);
  });

  // ── Activate season ───────────────────────────────────────────────────────

  it('activateSeason sets target season isActive=true', async () => {
    prisma.season.findUnique.mockResolvedValue({ id: 'season-2', name: 'New', competitionId: 'comp-1' });
    const activated = { ...MOCK_SEASON, id: 'season-2', isActive: true, status: 'ACTIVE' };
    prisma.$transaction.mockImplementation(async (cb: any) => {
      return cb({
        season: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          update: vi.fn().mockResolvedValue(activated),
        },
      });
    });
    const result = await service.activateSeason('season-2');
    expect(result.isActive).toBe(true);
    expect(result.status).toBe('ACTIVE');
  });

  it('activateSeason deactivates previously active season', async () => {
    prisma.season.findUnique.mockResolvedValue({ id: 'season-2', name: 'New', competitionId: 'comp-1' });
    const updateManySpy = vi.fn().mockResolvedValue({ count: 1 });
    prisma.$transaction.mockImplementation(async (cb: any) => {
      return cb({
        season: {
          updateMany: updateManySpy,
          update: vi.fn().mockResolvedValue({ ...MOCK_SEASON, id: 'season-2', isActive: true, status: 'ACTIVE' }),
        },
      });
    });
    await service.activateSeason('season-2');
    expect(updateManySpy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true } }),
    );
  });

  it('activateSeason throws NotFoundException for unknown season', async () => {
    prisma.season.findUnique.mockResolvedValue(null);
    await expect(service.activateSeason('unknown')).rejects.toThrow(NotFoundException);
  });

  it('activateSeason does not delete fixtures from previous season', async () => {
    prisma.season.findUnique.mockResolvedValue({ id: 'season-2', name: 'New', competitionId: 'comp-1' });
    const fixtureDeleteSpy = vi.fn();
    prisma.$transaction.mockImplementation(async (cb: any) => {
      return cb({
        season: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          update: vi.fn().mockResolvedValue({ ...MOCK_SEASON, id: 'season-2', isActive: true, status: 'ACTIVE' }),
        },
        fixture: { deleteMany: fixtureDeleteSpy },
      });
    });
    await service.activateSeason('season-2');
    expect(fixtureDeleteSpy).not.toHaveBeenCalled();
  });
});
