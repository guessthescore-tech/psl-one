import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FixturePublicationService } from './fixture-publication.service';

function makePrisma() {
  return {
    fixture: {
      findMany: vi.fn(),
      count: vi.fn(),
      updateMany: vi.fn(),
    },
    adminAuditLog: {
      create: vi.fn().mockResolvedValue({}),
    },
  };
}

describe('FixturePublicationService', () => {
  let service: FixturePublicationService;
  let prisma: ReturnType<typeof makePrisma>;

  const baseFixture = {
    id: 'fix-1',
    seasonId: 'season-1',
    kickoffAt: new Date('2026-08-01T15:00:00Z'),
    status: 'SCHEDULED',
    isPublished: false,
    providerSource: 'parse-psl',
    providerFixtureId: 'ext-1',
    externalId: 'ext-1',
    sourceUrl: 'https://api.parse.bot/fixtures',
    importedAt: new Date(),
    lastSyncedAt: new Date(),
    homeTeam: { name: 'Kaizer Chiefs' },
    awayTeam: { name: 'Orlando Pirates' },
    homeTeamId: 'team-home',
    awayTeamId: 'team-away',
  };

  beforeEach(() => {
    prisma = makePrisma();
    service = new FixturePublicationService(prisma as never);
  });

  describe('listImportedFixtures', () => {
    it('returns fixtures and total', async () => {
      prisma.fixture.findMany.mockResolvedValue([baseFixture]);
      prisma.fixture.count.mockResolvedValue(1);
      const result = await service.listImportedFixtures({ providerSource: 'parse-psl' });
      expect(result.total).toBe(1);
      expect(result.fixtures[0]?.homeTeamName).toBe('Kaizer Chiefs');
    });

    it('filters by isPublished', async () => {
      prisma.fixture.findMany.mockResolvedValue([]);
      prisma.fixture.count.mockResolvedValue(0);
      const result = await service.listImportedFixtures({ isPublished: false });
      expect(prisma.fixture.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isPublished: false } }),
      );
      expect(result.total).toBe(0);
    });

    it('filters by seasonId', async () => {
      prisma.fixture.findMany.mockResolvedValue([]);
      prisma.fixture.count.mockResolvedValue(0);
      await service.listImportedFixtures({ seasonId: 'season-1' });
      expect(prisma.fixture.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { seasonId: 'season-1' } }),
      );
    });

    it('does not expose provider keys', () => {
      const src = require('fs').readFileSync(
        require('path').resolve(__dirname, 'fixture-publication.service.ts'),
        'utf8',
      );
      expect(src).not.toMatch(/PARSE_API_KEY/);
      expect(src).not.toMatch(/NEXT_PUBLIC/);
    });
  });

  describe('publishFixtures', () => {
    it('throws if confirmPublication is false', async () => {
      await expect(
        service.publishFixtures({ fixtureIds: ['fix-1'], publish: true, confirmPublication: false }),
      ).rejects.toThrow('confirmPublication');
    });

    it('throws if fixtureIds is empty', async () => {
      await expect(
        service.publishFixtures({ fixtureIds: [], publish: true, confirmPublication: true }),
      ).rejects.toThrow('fixtureIds must not be empty');
    });

    it('publishes unpublished fixtures', async () => {
      prisma.fixture.findMany.mockResolvedValue([baseFixture]);
      prisma.fixture.updateMany.mockResolvedValue({ count: 1 });
      const result = await service.publishFixtures({
        fixtureIds: ['fix-1'],
        publish: true,
        confirmPublication: true,
      });
      expect(result.changed).toBe(1);
      expect(result.published).toBe(1);
      expect(result.unpublished).toBe(0);
      expect(prisma.fixture.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['fix-1'] } },
        data: { isPublished: true },
      });
    });

    it('unpublishes published fixtures', async () => {
      prisma.fixture.findMany.mockResolvedValue([{ ...baseFixture, isPublished: true }]);
      prisma.fixture.updateMany.mockResolvedValue({ count: 1 });
      const result = await service.publishFixtures({
        fixtureIds: ['fix-1'],
        publish: false,
        confirmPublication: true,
      });
      expect(result.changed).toBe(1);
      expect(result.unpublished).toBe(1);
      expect(result.published).toBe(0);
    });

    it('is idempotent — skips already-published fixtures when publishing', async () => {
      prisma.fixture.findMany.mockResolvedValue([{ ...baseFixture, isPublished: true }]);
      const result = await service.publishFixtures({
        fixtureIds: ['fix-1'],
        publish: true,
        confirmPublication: true,
      });
      expect(result.changed).toBe(0);
      expect(result.skipped).toBe(1);
      expect(prisma.fixture.updateMany).not.toHaveBeenCalled();
    });

    it('skips unknown fixture IDs with a warning', async () => {
      prisma.fixture.findMany.mockResolvedValue([]);
      const result = await service.publishFixtures({
        fixtureIds: ['unknown-id'],
        publish: true,
        confirmPublication: true,
      });
      expect(result.changed).toBe(0);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('unknown fixture ID');
    });

    it('does not alter scores during publication', async () => {
      prisma.fixture.findMany.mockResolvedValue([baseFixture]);
      prisma.fixture.updateMany.mockResolvedValue({ count: 1 });
      await service.publishFixtures({
        fixtureIds: ['fix-1'],
        publish: true,
        confirmPublication: true,
      });
      expect(prisma.fixture.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['fix-1'] } },
        data: { isPublished: true }, // only isPublished — no scores
      });
    });

    it('does not activate PSL during publication', async () => {
      prisma.fixture.findMany.mockResolvedValue([baseFixture]);
      prisma.fixture.updateMany.mockResolvedValue({ count: 1 });
      await service.publishFixtures({ fixtureIds: ['fix-1'], publish: true, confirmPublication: true });
      // No season mutation
      expect((prisma as Record<string, unknown>)['season']).toBeUndefined();
    });

    it('writes audit log on success', async () => {
      prisma.fixture.findMany.mockResolvedValue([baseFixture]);
      prisma.fixture.updateMany.mockResolvedValue({ count: 1 });
      await service.publishFixtures({ fixtureIds: ['fix-1'], publish: true, confirmPublication: true });
      expect(prisma.adminAuditLog.create).toHaveBeenCalledTimes(2); // attempted + completed
    });

    it('audit log failure does not block publication', async () => {
      prisma.fixture.findMany.mockResolvedValue([baseFixture]);
      prisma.fixture.updateMany.mockResolvedValue({ count: 1 });
      prisma.adminAuditLog.create.mockRejectedValue(new Error('DB error'));
      const result = await service.publishFixtures({
        fixtureIds: ['fix-1'],
        publish: true,
        confirmPublication: true,
      });
      expect(result.changed).toBe(1); // still succeeded despite audit failure
    });
  });

  describe('service has no scheduler or PSL activation', () => {
    it('service has no scheduler', () => {
      const src = require('fs').readFileSync(
        require('path').resolve(__dirname, 'fixture-publication.service.ts'),
        'utf8',
      );
      expect(src).not.toMatch(/@Cron|SchedulerRegistry|setInterval/);
    });

    it('service does not activate PSL season', () => {
      const src = require('fs').readFileSync(
        require('path').resolve(__dirname, 'fixture-publication.service.ts'),
        'utf8',
      );
      expect(src).not.toMatch(/season\.update|isActive.*true/);
    });
  });
});
