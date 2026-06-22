import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PslActivationPreflightService } from './psl-activation-preflight.service';

function makePrisma() {
  return {
    season: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    fixture: {
      count: vi.fn(),
    },
    walletProviderDetail: {
      count: vi.fn().mockResolvedValue(0),
    },
    seasonActivationApproval: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
    adminAuditLog: {
      create: vi.fn().mockResolvedValue({}),
    },
  };
}

const PSL_SEASON = {
  id: 'season-psl-1',
  name: 'Betway Premiership 2026/27',
  isActive: false,
  startDate: new Date('2026-08-01'),
};

describe('PslActivationPreflightService', () => {
  let service: PslActivationPreflightService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    service = new PslActivationPreflightService(prisma as never);
  });

  describe('runPreflight', () => {
    it('returns NO_GO when no PSL season found', async () => {
      prisma.season.findFirst.mockResolvedValue(null);
      const result = await service.runPreflight();
      expect(result.status).toBe('NO_GO');
      expect(result.blockers).toContain('No PSL season found in the database');
    });

    it('returns NO_GO when no fixtures exist', async () => {
      prisma.season.findFirst.mockResolvedValue(PSL_SEASON);
      prisma.fixture.count.mockResolvedValue(0);
      const result = await service.runPreflight();
      expect(result.status).toBe('NO_GO');
      expect(result.blockers.some(b => b.includes('No fixtures exist'))).toBe(true);
    });

    it('returns CONDITIONAL_GO when fixtures exist but unpublished', async () => {
      prisma.season.findFirst.mockResolvedValue(PSL_SEASON);
      prisma.fixture.count
        .mockResolvedValueOnce(10) // totalFixtures
        .mockResolvedValueOnce(0)  // fixturesMissingTeams
        .mockResolvedValueOnce(0)  // publishedCount
        .mockResolvedValueOnce(10); // importedFixtures
      const result = await service.runPreflight();
      expect(result.status).toBe('CONDITIONAL_GO');
      expect(result.warnings.some(w => w.includes('unpublished'))).toBe(true);
    });

    it('returns NO_GO when non-sandbox wallet provider is active', async () => {
      prisma.season.findFirst.mockResolvedValue(PSL_SEASON);
      prisma.fixture.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(10);
      prisma.walletProviderDetail.count.mockResolvedValue(1); // non-sandbox provider
      const result = await service.runPreflight();
      expect(result.status).toBe('NO_GO');
      expect(result.blockers.some(b => b.includes('wallet'))).toBe(true);
    });

    it('accepts explicit seasonId', async () => {
      prisma.season.findUnique.mockResolvedValue(PSL_SEASON);
      prisma.fixture.count
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(5);
      prisma.seasonActivationApproval.findFirst.mockResolvedValue({
        id: 'appr-1', approvalStatus: 'APPROVED',
      });
      const result = await service.runPreflight('season-psl-1');
      expect(prisma.season.findUnique).toHaveBeenCalledWith({ where: { id: 'season-psl-1' } });
      expect(result.status).not.toBe('NO_GO');
    });

    it('returns PASS for no_real_money_flags check', async () => {
      prisma.season.findFirst.mockResolvedValue(PSL_SEASON);
      prisma.fixture.count
        .mockResolvedValue(5);
      const result = await service.runPreflight();
      const noRealMoneyCheck = result.checks.find(c => c.name === 'no_real_money_flags');
      expect(noRealMoneyCheck?.status).toBe('PASS');
    });

    it('does not mutate any DB record', async () => {
      prisma.season.findFirst.mockResolvedValue(PSL_SEASON);
      prisma.fixture.count.mockResolvedValue(3);
      await service.runPreflight();
      expect((prisma.season as Record<string, unknown>)['update']).toBeUndefined();
      expect((prisma.season as Record<string, unknown>)['updateMany']).toBeUndefined();
      expect((prisma.fixture as Record<string, unknown>)['update']).toBeUndefined();
      expect((prisma.fixture as Record<string, unknown>)['updateMany']).toBeUndefined();
    });

    it('writes PSL_PREFLIGHT_CHECK_RUN audit log', async () => {
      prisma.season.findFirst.mockResolvedValue(PSL_SEASON);
      prisma.fixture.count.mockResolvedValue(3);
      await service.runPreflight();
      expect(prisma.adminAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'PSL_PREFLIGHT_CHECK_RUN' }) }),
      );
    });

    it('audit failure does not block preflight', async () => {
      prisma.season.findFirst.mockResolvedValue(PSL_SEASON);
      prisma.fixture.count.mockResolvedValue(3);
      prisma.adminAuditLog.create.mockRejectedValue(new Error('audit DB error'));
      const result = await service.runPreflight();
      expect(result.checks.length).toBeGreaterThan(0);
    });

    it('has wallet_sandbox_only check', async () => {
      prisma.season.findFirst.mockResolvedValue(PSL_SEASON);
      prisma.fixture.count.mockResolvedValue(3);
      const result = await service.runPreflight();
      expect(result.checks.some(c => c.name === 'wallet_sandbox_only')).toBe(true);
    });

    it('preflight endpoint file has no PSL activation', () => {
      const src = require('fs').readFileSync(
        require('path').resolve(__dirname, 'psl-activation-preflight.service.ts'),
        'utf8',
      );
      expect(src).not.toMatch(/season\.update|isActive.*:\s*true/);
    });

    it('preflight service has no scheduler', () => {
      const src = require('fs').readFileSync(
        require('path').resolve(__dirname, 'psl-activation-preflight.service.ts'),
        'utf8',
      );
      expect(src).not.toMatch(/@Cron|SchedulerRegistry|setInterval/);
    });
  });
});
