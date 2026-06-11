import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { CompetitionImportService } from './competition-import.service';
import type { PrismaService } from '../prisma/prisma.service';
import { CompetitionFormat, CompetitionImportStatus, SeasonStatus } from '@prisma/client';
import type { CompetitionImportPayload } from './dto/competition-import-payload.dto';

const makePrismaMock = () => ({
  competitionImportJob: {
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn(),
  },
  competition: { upsert: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn().mockResolvedValue(null), update: vi.fn() },
  season: { upsert: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn() },
  venue: { upsert: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  team: { upsert: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn().mockResolvedValue(null) },
  player: { create: vi.fn(), update: vi.fn(), findFirst: vi.fn() },
  group: { upsert: vi.fn() },
  gameweek: { upsert: vi.fn() },
  fixture: { create: vi.fn(), update: vi.fn(), findFirst: vi.fn() },
  $transaction: vi.fn(async (cb: any) =>
    cb({
      season: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        update: vi.fn().mockResolvedValue({}),
      },
    }),
  ),
});

const COMP_PAYLOAD: CompetitionImportPayload = {
  source: 'MANUAL',
  sourceType: 'MANUAL',
  competition: {
    externalId: 'psl-premiership',
    name: 'PSL Premiership',
    slug: 'psl-premiership',
    format: CompetitionFormat.LEAGUE,
    teamCount: 16,
    hasGroups: false,
    hasKnockouts: false,
    hasHomeAway: true,
    usesNeutralVenues: false,
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
  },
};

const SEASON_PAYLOAD: CompetitionImportPayload = {
  ...COMP_PAYLOAD,
  season: {
    externalId: 'psl-2026-27',
    name: 'PSL Premiership 2026/27',
    slug: 'psl-premiership-2026-27',
    startDate: '2026-08-01',
    endDate: '2027-05-31',
    status: SeasonStatus.UPCOMING,
    isActive: false,
  },
};

describe('CompetitionImportService', () => {
  let service: CompetitionImportService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    service = new CompetitionImportService(prisma as unknown as PrismaService);
  });

  // ── Validate ──────────────────────────────────────────────────────────────

  it('validates a valid competition-only payload as valid', () => {
    const result = service.validate(COMP_PAYLOAD);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.previewCounts.competitions).toBe(1);
    expect(result.previewCounts.seasons).toBe(0);
  });

  it('validate returns errors for empty payload', () => {
    const result = service.validate({ source: 'MANUAL', sourceType: 'MANUAL' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Payload must contain at least one section (competition, season, teams, venues, players, fixtures, groups, or gameweeks)',
    );
  });

  it('validate requires competition.name', () => {
    const result = service.validate({
      source: 'MANUAL', sourceType: 'MANUAL',
      competition: { name: '', slug: 'x', format: CompetitionFormat.LEAGUE, hasGroups: false, hasKnockouts: false, hasHomeAway: true, usesNeutralVenues: false },
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('competition.name'))).toBe(true);
  });

  it('validate rejects duplicate team slugs', () => {
    const result = service.validate({
      source: 'MANUAL', sourceType: 'MANUAL',
      teams: [
        { name: 'Team A', slug: 'team-a', shortName: 'A', country: 'ZA' },
        { name: 'Team B', slug: 'team-a', shortName: 'B', country: 'ZA' },
      ],
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("duplicate slug 'team-a'"))).toBe(true);
  });

  it('validate requires homeTeam reference when hasHomeAway is true', () => {
    const result = service.validate({
      source: 'MANUAL', sourceType: 'MANUAL',
      competition: { name: 'Test', slug: 'test', format: CompetitionFormat.LEAGUE, hasGroups: false, hasKnockouts: false, hasHomeAway: true, usesNeutralVenues: false },
      fixtures: [{ kickoffAt: '2026-08-01T15:00:00Z' }],
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('homeTeamExternalId or homeTeamSlug required'))).toBe(true);
  });

  it('validate does not require homeTeam when hasHomeAway is false', () => {
    const result = service.validate({
      source: 'MANUAL', sourceType: 'MANUAL',
      competition: { name: 'Test', slug: 'test', format: CompetitionFormat.TOURNAMENT, hasGroups: true, hasKnockouts: true, hasHomeAway: false, usesNeutralVenues: true },
      fixtures: [{ kickoffAt: '2026-08-01T15:00:00Z' }],
    });
    expect(result.errors.some((e) => e.includes('homeTeam'))).toBe(false);
  });

  it('validate returns isValid false for invalid CompetitionFormat', () => {
    const result = service.validate({
      source: 'MANUAL', sourceType: 'MANUAL',
      competition: { name: 'Test', slug: 'test', format: 'INVALID' as any, hasGroups: false, hasKnockouts: false, hasHomeAway: true, usesNeutralVenues: false },
    });
    expect(result.isValid).toBe(false);
  });

  it('validate sets willActivateSeason when activateSeason=true with season', () => {
    const result = service.validate({ ...SEASON_PAYLOAD, activateSeason: true });
    expect(result.willActivateSeason).toBe(true);
    expect(result.warnings.some((w) => w.includes('deactivate'))).toBe(true);
  });

  it('validate does not set willActivateSeason by default', () => {
    const result = service.validate(SEASON_PAYLOAD);
    expect(result.willActivateSeason).toBe(false);
  });

  // ── Commit ────────────────────────────────────────────────────────────────

  it('PSL_ADMIN can create a manual (DRAFT) import job', async () => {
    const mockJob = { id: 'job-1', status: 'DRAFT', source: 'MANUAL', sourceType: 'MANUAL' };
    prisma.competitionImportJob.create.mockResolvedValue(mockJob);
    const result = await service.createDraftJob(COMP_PAYLOAD, 'user-admin');
    expect(result.status).toBe('DRAFT');
    expect(prisma.competitionImportJob.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'DRAFT', createdByUserId: 'user-admin' }) }),
    );
  });

  it('commit creates a competition shell', async () => {
    const mockJob = { id: 'job-1' };
    const mockComp = { id: 'comp-1', slug: 'psl-premiership', format: 'LEAGUE' };
    prisma.competitionImportJob.create.mockResolvedValue(mockJob);
    prisma.competitionImportJob.update.mockResolvedValue({ ...mockJob, status: 'COMPLETED' });
    prisma.competition.upsert.mockResolvedValue(mockComp);

    const result = await service.commit(COMP_PAYLOAD, { userId: 'user-1' });
    expect(prisma.competition.upsert).toHaveBeenCalled();
    expect(result.counts.competitions).toBe(1);
    expect(result.jobId).toBe('job-1');
  });

  it('commit creates a season shell alongside competition', async () => {
    const mockJob = { id: 'job-1' };
    prisma.competitionImportJob.create.mockResolvedValue(mockJob);
    prisma.competitionImportJob.update.mockResolvedValue({ ...mockJob, status: 'COMPLETED' });
    prisma.competition.upsert.mockResolvedValue({ id: 'comp-1' });
    prisma.season.upsert.mockResolvedValue({ id: 'season-1', isActive: false, status: 'UPCOMING' });

    const result = await service.commit(SEASON_PAYLOAD, { userId: 'user-1' });
    expect(prisma.season.upsert).toHaveBeenCalled();
    expect(result.counts.seasons).toBe(1);
    expect(result.counts.competitions).toBe(1);
  });

  it('commit is idempotent — upsert is used not create', async () => {
    const mockJob = { id: 'job-1' };
    prisma.competitionImportJob.create.mockResolvedValue(mockJob);
    prisma.competitionImportJob.update.mockResolvedValue({ ...mockJob, status: 'COMPLETED' });
    prisma.competition.upsert.mockResolvedValue({ id: 'comp-1' });

    // First commit
    await service.commit(COMP_PAYLOAD, { userId: 'u1' });
    // Second commit
    await service.commit(COMP_PAYLOAD, { userId: 'u1' });

    // upsert called twice — no duplicate create separate from upsert
    expect(prisma.competition.upsert).toHaveBeenCalledTimes(2);
  });

  it('commit does not activate season by default', async () => {
    const mockJob = { id: 'job-1' };
    prisma.competitionImportJob.create.mockResolvedValue(mockJob);
    prisma.competitionImportJob.update.mockResolvedValue({ ...mockJob, status: 'COMPLETED' });
    prisma.competition.upsert.mockResolvedValue({ id: 'comp-1' });
    prisma.season.upsert.mockResolvedValue({ id: 'season-1', isActive: false });

    await service.commit(SEASON_PAYLOAD, { userId: 'u1' });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('commit activates season only when activateSeason=true', async () => {
    const mockJob = { id: 'job-1' };
    prisma.competitionImportJob.create.mockResolvedValue(mockJob);
    prisma.competitionImportJob.update.mockResolvedValue({ ...mockJob, status: 'COMPLETED' });
    prisma.competition.upsert.mockResolvedValue({ id: 'comp-1' });
    prisma.season.upsert.mockResolvedValue({ id: 'season-1', isActive: false });

    await service.commit({ ...SEASON_PAYLOAD, activateSeason: true }, { userId: 'u1' });
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('existing active season is NOT deactivated when activateSeason is not set', async () => {
    const updateManySpy = vi.fn();
    prisma.$transaction.mockImplementation(async (cb: any) =>
      cb({ season: { updateMany: updateManySpy, update: vi.fn() } }),
    );
    const mockJob = { id: 'job-1' };
    prisma.competitionImportJob.create.mockResolvedValue(mockJob);
    prisma.competitionImportJob.update.mockResolvedValue({ ...mockJob, status: 'COMPLETED' });
    prisma.competition.upsert.mockResolvedValue({ id: 'comp-1' });
    prisma.season.upsert.mockResolvedValue({ id: 'season-1', isActive: false });

    await service.commit(SEASON_PAYLOAD);
    expect(updateManySpy).not.toHaveBeenCalled();
  });

  it('source + externalId: checks findFirst by externalId before upserting by slug', async () => {
    const mockJob = { id: 'job-1' };
    prisma.competitionImportJob.create.mockResolvedValue(mockJob);
    prisma.competitionImportJob.update.mockResolvedValue({ ...mockJob, status: 'COMPLETED' });
    // findFirst returns null → falls through to upsert by slug
    prisma.competition.findFirst.mockResolvedValue(null);
    prisma.competition.upsert.mockResolvedValue({ id: 'comp-1' });

    await service.commit(COMP_PAYLOAD, { userId: 'u1' });

    expect(prisma.competition.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { externalId: 'psl-premiership' } }),
    );
    expect(prisma.competition.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: 'psl-premiership' } }),
    );
  });

  it('source + externalId: updates existing record found by externalId', async () => {
    const mockJob = { id: 'job-1' };
    prisma.competitionImportJob.create.mockResolvedValue(mockJob);
    prisma.competitionImportJob.update.mockResolvedValue({ ...mockJob, status: 'COMPLETED' });
    // findFirst returns existing record
    prisma.competition.findFirst.mockResolvedValue({ id: 'existing-comp' });
    prisma.competition.update.mockResolvedValue({ id: 'existing-comp' });

    await service.commit(COMP_PAYLOAD, { userId: 'u1' });

    expect(prisma.competition.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'existing-comp' } }),
    );
    expect(prisma.competition.upsert).not.toHaveBeenCalled();
  });

  it('commit falls back to slug upsert when no externalId', async () => {
    const payloadNoExtId: CompetitionImportPayload = {
      source: 'MANUAL', sourceType: 'MANUAL',
      competition: { name: 'PSL Premiership', slug: 'psl-premiership', format: CompetitionFormat.LEAGUE, hasGroups: false, hasKnockouts: false, hasHomeAway: true, usesNeutralVenues: false },
    };
    const mockJob = { id: 'job-2' };
    prisma.competitionImportJob.create.mockResolvedValue(mockJob);
    prisma.competitionImportJob.update.mockResolvedValue({ ...mockJob, status: 'COMPLETED' });
    prisma.competition.upsert.mockResolvedValue({ id: 'comp-1' });

    await service.commit(payloadNoExtId);
    const upsertCall = prisma.competition.upsert.mock.calls[0]![0] as any;
    expect(upsertCall.where).toEqual({ slug: 'psl-premiership' });
  });

  it('import job records counts after commit', async () => {
    const mockJob = { id: 'job-1' };
    prisma.competitionImportJob.create.mockResolvedValue(mockJob);
    const updateMock = vi.fn().mockResolvedValue({ ...mockJob, status: 'COMPLETED', importedRecords: 1 });
    prisma.competitionImportJob.update = updateMock;
    prisma.competition.upsert.mockResolvedValue({ id: 'comp-1' });

    await service.commit(COMP_PAYLOAD, { userId: 'u1' });
    const updateCall = updateMock.mock.calls[0]![0] as any;
    expect(updateCall.data.importedRecords).toBe(1);
    expect(updateCall.data.totalRecords).toBe(1);
  });

  it('import job records FAILED status when commit throws', async () => {
    const mockJob = { id: 'job-err' };
    prisma.competitionImportJob.create.mockResolvedValue(mockJob);
    prisma.competitionImportJob.update.mockResolvedValue({ ...mockJob, status: 'FAILED' });
    prisma.competition.upsert.mockRejectedValue(new Error('DB connection lost'));

    await expect(service.commit(COMP_PAYLOAD, { userId: 'u1' })).rejects.toThrow('DB connection lost');
    const updateCall = prisma.competitionImportJob.update.mock.calls[0]![0] as any;
    expect(updateCall.data.status).toBe(CompetitionImportStatus.FAILED);
  });

  it('getJob throws NotFoundException for unknown id', async () => {
    prisma.competitionImportJob.findUnique.mockResolvedValue(null);
    await expect(service.getJob('unknown')).rejects.toThrow(NotFoundException);
  });

  it('listJobs returns recent jobs', async () => {
    const mockJobs = [{ id: 'j1', status: 'COMPLETED' }, { id: 'j2', status: 'DRAFT' }];
    prisma.competitionImportJob.findMany.mockResolvedValue(mockJobs);
    const result = await service.listJobs();
    expect(result).toHaveLength(2);
  });
});
