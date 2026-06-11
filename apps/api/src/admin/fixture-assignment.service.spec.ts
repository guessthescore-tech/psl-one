import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { FixtureAssignmentService } from './fixture-assignment.service';
import type { PrismaService } from '../prisma/prisma.service';
import { CompetitionFormat } from '@prisma/client';

const makePrismaMock = () => ({
  fixture: {
    findUnique: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue({}),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    count: vi.fn().mockResolvedValue(0),
    groupBy: vi.fn().mockResolvedValue([]),
  },
  gameweek: {
    findUnique: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
  },
  competitionStage: {
    findUnique: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
  },
  season: {
    findUnique: vi.fn(),
  },
});

const groupGameweeks = [
  { id: 'gw-gmd1', slug: 'group-matchday-1', name: 'Group Stage – Matchday 1', round: 1, startsAt: new Date('2026-06-11'), endsAt: new Date('2026-06-17T23:59:59Z') },
  { id: 'gw-gmd2', slug: 'group-matchday-2', name: 'Group Stage – Matchday 2', round: 2, startsAt: new Date('2026-06-18'), endsAt: new Date('2026-06-24T23:59:59Z') },
  { id: 'gw-gmd3', slug: 'group-matchday-3', name: 'Group Stage – Matchday 3', round: 3, startsAt: new Date('2026-06-25'), endsAt: new Date('2026-07-01T23:59:59Z') },
  { id: 'gw-r32',  slug: 'round-of-32',      name: 'Round of 32',              round: 4, startsAt: new Date('2026-07-02'), endsAt: new Date('2026-07-06T23:59:59Z') },
  { id: 'gw-r16',  slug: 'round-of-16',      name: 'Round of 16',              round: 5, startsAt: new Date('2026-07-07'), endsAt: new Date('2026-07-10T23:59:59Z') },
  { id: 'gw-qf',   slug: 'quarter-finals',   name: 'Quarter-finals',           round: 6, startsAt: new Date('2026-07-11'), endsAt: new Date('2026-07-13T23:59:59Z') },
  { id: 'gw-sf',   slug: 'semi-finals',       name: 'Semi-finals',              round: 7, startsAt: new Date('2026-07-14'), endsAt: new Date('2026-07-16T23:59:59Z') },
  { id: 'gw-3p',   slug: 'third-place',       name: 'Third-place Play-off',     round: 8, startsAt: new Date('2026-07-18'), endsAt: new Date('2026-07-18T23:59:59Z') },
  { id: 'gw-f',    slug: 'final',             name: 'Final',                    round: 9, startsAt: new Date('2026-07-19'), endsAt: new Date('2026-07-19T23:59:59Z') },
];

const wcStages = [
  { id: 'st-grp', slug: 'group-stage',          name: 'Group Stage',          type: 'GROUP',    order: 1 },
  { id: 'st-r32', slug: 'round-of-32',          name: 'Round of 32',          type: 'KNOCKOUT', order: 2 },
  { id: 'st-r16', slug: 'round-of-16',          name: 'Round of 16',          type: 'KNOCKOUT', order: 3 },
  { id: 'st-qf',  slug: 'quarter-finals',       name: 'Quarter-finals',       type: 'KNOCKOUT', order: 4 },
  { id: 'st-sf',  slug: 'semi-finals',          name: 'Semi-finals',          type: 'KNOCKOUT', order: 5 },
  { id: 'st-3p',  slug: 'third-place-play-off', name: 'Third-place Play-off', type: 'PLAYOFF',  order: 6 },
  { id: 'st-f',   slug: 'final',                name: 'Final',                type: 'FINAL',    order: 7 },
];

const wcSeason = {
  id: 'season-wc',
  competition: { format: CompetitionFormat.HYBRID, stages: wcStages },
};

const pslSeason = {
  id: 'season-psl',
  competition: { format: CompetitionFormat.LEAGUE, stages: [] },
};

describe('FixtureAssignmentService', () => {
  let service: FixtureAssignmentService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    service = new FixtureAssignmentService(prisma as unknown as PrismaService);
  });

  // ── assignFixtureToGameweek ───────────────────────────────────────────────

  it('assigns a fixture to a gameweek', async () => {
    prisma.fixture.findUnique.mockResolvedValue({ id: 'fix-1' });
    prisma.gameweek.findUnique.mockResolvedValue({ id: 'gw-1' });
    prisma.fixture.update.mockResolvedValue({ id: 'fix-1', gameweekId: 'gw-1', assignmentStatus: 'MANUALLY_ASSIGNED' });

    const result = await service.assignFixtureToGameweek('fix-1', 'gw-1');

    expect(result.assignmentStatus).toBe('MANUALLY_ASSIGNED');
    expect(prisma.fixture.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ gameweekId: 'gw-1', assignmentStatus: 'MANUALLY_ASSIGNED', assignmentSource: 'admin' }),
      }),
    );
  });

  it('throws NotFoundException when fixture not found in assignFixtureToGameweek', async () => {
    prisma.fixture.findUnique.mockResolvedValue(null);
    await expect(service.assignFixtureToGameweek('bad-id', 'gw-1')).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException when gameweek not found', async () => {
    prisma.fixture.findUnique.mockResolvedValue({ id: 'fix-1' });
    prisma.gameweek.findUnique.mockResolvedValue(null);
    await expect(service.assignFixtureToGameweek('fix-1', 'bad-gw')).rejects.toThrow(NotFoundException);
  });

  // ── assignFixtureToStage ──────────────────────────────────────────────────

  it('assigns a fixture to a stage', async () => {
    prisma.fixture.findUnique.mockResolvedValue({ id: 'fix-1' });
    prisma.competitionStage.findUnique.mockResolvedValue({ id: 'st-1' });
    prisma.fixture.update.mockResolvedValue({ id: 'fix-1', stageId: 'st-1', assignmentStatus: 'MANUALLY_ASSIGNED' });

    const result = await service.assignFixtureToStage('fix-1', 'st-1');

    expect(result.assignmentStatus).toBe('MANUALLY_ASSIGNED');
    expect(prisma.fixture.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ stageId: 'st-1', assignmentStatus: 'MANUALLY_ASSIGNED' }),
      }),
    );
  });

  it('throws NotFoundException when stage not found', async () => {
    prisma.fixture.findUnique.mockResolvedValue({ id: 'fix-1' });
    prisma.competitionStage.findUnique.mockResolvedValue(null);
    await expect(service.assignFixtureToStage('fix-1', 'bad-st')).rejects.toThrow(NotFoundException);
  });

  // ── bulkAssignFixturesToGameweek ──────────────────────────────────────────

  it('bulk assigns fixtures to a gameweek', async () => {
    prisma.gameweek.findUnique.mockResolvedValue({ id: 'gw-1', name: 'Round of 32' });
    prisma.fixture.updateMany.mockResolvedValue({ count: 3 });

    const result = await service.bulkAssignFixturesToGameweek(['f1', 'f2', 'f3'], 'gw-1');

    expect(result.updatedCount).toBe(3);
    expect(prisma.fixture.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: ['f1', 'f2', 'f3'] } } }),
    );
  });

  it('throws BadRequestException for empty fixtureIds in bulk assign', async () => {
    await expect(service.bulkAssignFixturesToGameweek([], 'gw-1')).rejects.toThrow(BadRequestException);
  });

  // ── bulkAssignFixturesToStage ─────────────────────────────────────────────

  it('bulk assigns fixtures to a stage', async () => {
    prisma.competitionStage.findUnique.mockResolvedValue({ id: 'st-1', name: 'Group Stage' });
    prisma.fixture.updateMany.mockResolvedValue({ count: 2 });

    const result = await service.bulkAssignFixturesToStage(['f1', 'f2'], 'st-1');

    expect(result.updatedCount).toBe(2);
    expect(prisma.fixture.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: ['f1', 'f2'] } } }),
    );
  });

  // ── autoAssignFixturesForSeason (WC — tournament/hybrid) ─────────────────

  it('auto-assigns World Cup GROUP fixture to group stage and correct matchday gameweek', async () => {
    prisma.season.findUnique.mockResolvedValue(wcSeason);
    prisma.gameweek.findMany.mockResolvedValue(groupGameweeks);
    prisma.fixture.findMany.mockResolvedValue([
      // Matchday 2 fixture (kickoff June 20)
      { id: 'fix-gmd2', round: 'GROUP', kickoffAt: new Date('2026-06-20T15:00:00Z'), gameweekId: null, stageId: null },
    ]);
    prisma.fixture.update.mockResolvedValue({});

    const result = await service.autoAssignFixturesForSeason('season-wc');

    expect(result.assigned).toBe(1);
    expect(prisma.fixture.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          gameweekId: 'gw-gmd2',
          stageId: 'st-grp',
          assignmentStatus: 'AUTO_ASSIGNED',
        }),
      }),
    );
  });

  it('auto-assigns World Cup ROUND_OF_32 fixture to correct gameweek and stage', async () => {
    prisma.season.findUnique.mockResolvedValue(wcSeason);
    prisma.gameweek.findMany.mockResolvedValue(groupGameweeks);
    prisma.fixture.findMany.mockResolvedValue([
      { id: 'fix-r32', round: 'ROUND_OF_32', kickoffAt: new Date('2026-07-03T19:00:00Z'), gameweekId: null, stageId: null },
    ]);
    prisma.fixture.update.mockResolvedValue({});

    const result = await service.autoAssignFixturesForSeason('season-wc');

    expect(result.assigned).toBe(1);
    expect(prisma.fixture.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ gameweekId: 'gw-r32', stageId: 'st-r32', assignmentStatus: 'AUTO_ASSIGNED' }),
      }),
    );
  });

  it('auto-assigns World Cup FINAL to final gameweek and stage', async () => {
    prisma.season.findUnique.mockResolvedValue(wcSeason);
    prisma.gameweek.findMany.mockResolvedValue(groupGameweeks);
    prisma.fixture.findMany.mockResolvedValue([
      { id: 'fix-f', round: 'FINAL', kickoffAt: new Date('2026-07-19T18:00:00Z'), gameweekId: null, stageId: null },
    ]);
    prisma.fixture.update.mockResolvedValue({});

    const result = await service.autoAssignFixturesForSeason('season-wc');

    expect(result.assigned).toBe(1);
    expect(prisma.fixture.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ gameweekId: 'gw-f', stageId: 'st-f', assignmentStatus: 'AUTO_ASSIGNED' }),
      }),
    );
  });

  it('marks already fully assigned fixtures as AUTO_ASSIGNED', async () => {
    prisma.season.findUnique.mockResolvedValue(wcSeason);
    prisma.gameweek.findMany.mockResolvedValue(groupGameweeks);
    prisma.fixture.findMany.mockResolvedValue([
      { id: 'fix-done', round: 'GROUP', kickoffAt: new Date('2026-06-12T15:00:00Z'), gameweekId: 'gw-gmd1', stageId: 'st-grp' },
    ]);
    prisma.fixture.update.mockResolvedValue({});

    const result = await service.autoAssignFixturesForSeason('season-wc');

    expect(result.assigned).toBe(1);
    expect(prisma.fixture.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ assignmentStatus: 'AUTO_ASSIGNED' }),
      }),
    );
  });

  it('auto-assign does not assume WC structure for league competitions', async () => {
    const leagueGameweeks = [
      { id: 'gw-r1', slug: 'round-1', name: 'Round 1', round: 1, startsAt: new Date('2026-08-01'), endsAt: new Date('2026-08-07T23:59:59Z') },
      { id: 'gw-r2', slug: 'round-2', name: 'Round 2', round: 2, startsAt: new Date('2026-08-08'), endsAt: new Date('2026-08-14T23:59:59Z') },
    ];
    prisma.season.findUnique.mockResolvedValue(pslSeason);
    prisma.gameweek.findMany.mockResolvedValue(leagueGameweeks);
    prisma.fixture.findMany.mockResolvedValue([
      { id: 'fix-psl', round: '1', kickoffAt: new Date('2026-08-02T15:00:00Z'), gameweekId: null, stageId: null },
    ]);
    prisma.fixture.update.mockResolvedValue({});

    const result = await service.autoAssignFixturesForSeason('season-psl');

    expect(result.assigned).toBe(1);
    const updateCall = prisma.fixture.update.mock.calls[0]![0] as any;
    expect(updateCall.data.gameweekId).toBe('gw-r1');
    // No stage assigned for league
    expect(updateCall.data.stageId).toBeUndefined();
  });

  it('auto-assign skips fixtures with unknown round and no date match', async () => {
    prisma.season.findUnique.mockResolvedValue(wcSeason);
    prisma.gameweek.findMany.mockResolvedValue([]);
    prisma.fixture.findMany.mockResolvedValue([
      { id: 'fix-unknown', round: 'UNKNOWN_ROUND', kickoffAt: new Date('2027-01-01'), gameweekId: null, stageId: null },
    ]);

    const result = await service.autoAssignFixturesForSeason('season-wc');

    expect(result.skipped).toBe(1);
    expect(result.assigned).toBe(0);
    expect(prisma.fixture.update).not.toHaveBeenCalled();
  });

  it('throws NotFoundException for unknown seasonId in auto-assign', async () => {
    prisma.season.findUnique.mockResolvedValue(null);
    await expect(service.autoAssignFixturesForSeason('bad-season')).rejects.toThrow(NotFoundException);
  });

  // ── getUnassignedFixtures ─────────────────────────────────────────────────

  it('returns unassigned fixtures for a season', async () => {
    prisma.season.findUnique.mockResolvedValue({ id: 'season-1' });
    const mockFixtures = [
      { id: 'fix-1', assignmentStatus: 'UNASSIGNED', gameweekId: null },
      { id: 'fix-2', assignmentStatus: 'UNASSIGNED', gameweekId: null },
    ];
    prisma.fixture.findMany.mockResolvedValue(mockFixtures);

    const result = await service.getUnassignedFixtures('season-1');

    expect(result).toHaveLength(2);
    expect(prisma.fixture.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ seasonId: 'season-1' }),
      }),
    );
  });

  it('throws NotFoundException when season not found in getUnassignedFixtures', async () => {
    prisma.season.findUnique.mockResolvedValue(null);
    await expect(service.getUnassignedFixtures('bad-season')).rejects.toThrow(NotFoundException);
  });

  // ── getAssignmentSummary ──────────────────────────────────────────────────

  it('returns assignment summary with counts', async () => {
    prisma.season.findUnique.mockResolvedValue({ id: 'season-1' });
    prisma.fixture.count
      .mockResolvedValueOnce(10)  // total
      .mockResolvedValueOnce(3);  // unassigned
    prisma.fixture.groupBy
      .mockResolvedValueOnce([{ gameweekId: 'gw-1', _count: { id: 7 } }]) // byGameweek
      .mockResolvedValueOnce([{ stageId: 'st-1', _count: { id: 7 } }]);    // byStage
    prisma.gameweek.findMany.mockResolvedValue([{ id: 'gw-1', name: 'Round of 32' }]);
    prisma.competitionStage.findMany.mockResolvedValue([{ id: 'st-1', name: 'Round of 32 Stage' }]);

    const result = await service.getAssignmentSummary('season-1');

    expect(result.total).toBe(10);
    expect(result.assigned).toBe(7);
    expect(result.unassigned).toBe(3);
    expect(result.byGameweek[0]!.gameweekName).toBe('Round of 32');
    expect(result.byStage[0]!.stageName).toBe('Round of 32 Stage');
  });

  it('throws NotFoundException for unknown season in getAssignmentSummary', async () => {
    prisma.season.findUnique.mockResolvedValue(null);
    await expect(service.getAssignmentSummary('bad-season')).rejects.toThrow(NotFoundException);
  });

  // ── assignment does not touch predictions/fantasy ─────────────────────────

  it('assignFixtureToGameweek only updates assignment fields — no score/prediction/fantasy change', async () => {
    prisma.fixture.findUnique.mockResolvedValue({ id: 'fix-1' });
    prisma.gameweek.findUnique.mockResolvedValue({ id: 'gw-1' });
    prisma.fixture.update.mockResolvedValue({ id: 'fix-1', assignmentStatus: 'MANUALLY_ASSIGNED' });

    await service.assignFixtureToGameweek('fix-1', 'gw-1');

    const updateCall = prisma.fixture.update.mock.calls[0]![0] as any;
    expect(updateCall.data).not.toHaveProperty('homeScore');
    expect(updateCall.data).not.toHaveProperty('awayScore');
    expect(updateCall.data).not.toHaveProperty('status');
  });
});
