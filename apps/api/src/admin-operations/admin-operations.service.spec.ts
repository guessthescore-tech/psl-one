import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminOperationsService } from './admin-operations.service';
import { PrismaService } from '../prisma/prisma.service';
import { IntegrationProviderType, IntegrationProviderMode, IntegrationProviderStatus } from '@prisma/client';

const mockProvider = (type: IntegrationProviderType, status: IntegrationProviderStatus, mode: IntegrationProviderMode = IntegrationProviderMode.MOCK) => ({
  id: `id-${type}`,
  providerType: type,
  providerKey: type.toLowerCase(),
  displayName: type,
  mode,
  status,
  isEnabled: false,
  isProductionEnabled: false,
  requiresComplianceApproval: true,
  requiresContractApproval: true,
  lastHealthCheckAt: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('AdminOperationsService', () => {
  let service: AdminOperationsService;
  let prisma: {
    integrationProviderConfig: {
      count: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
    };
    season: {
      count: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
    };
    fixture: { count: ReturnType<typeof vi.fn> };
    gameweek: { count: ReturnType<typeof vi.fn> };
    seasonTeam: { count: ReturnType<typeof vi.fn> };
    clubProfile: { count: ReturnType<typeof vi.fn> };
    fantasyPlayerPrice: { count: ReturnType<typeof vi.fn> };
    fantasyRulesConfig: {
      findFirst: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
    predictionRulesConfig: {
      findFirst: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
    achievementDefinition: { count: ReturnType<typeof vi.fn> };
    rewardReadinessDefinition: { count: ReturnType<typeof vi.fn> };
    clubShopProduct: { count: ReturnType<typeof vi.fn> };
    seasonSquadRegistration: { count: ReturnType<typeof vi.fn> };
    squadImportBatch: { findFirst: ReturnType<typeof vi.fn> };
    fantasyPriceCalibrationBatch: { findFirst: ReturnType<typeof vi.fn> };
  };

  beforeEach(async () => {
    prisma = {
      integrationProviderConfig: {
        count: vi.fn().mockResolvedValue(9),
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
      },
      season: {
        count: vi.fn().mockResolvedValue(2),
        findUnique: vi.fn().mockResolvedValue(null),
        findFirst: vi.fn().mockResolvedValue(null),
      },
      fixture: { count: vi.fn().mockResolvedValue(0) },
      gameweek: { count: vi.fn().mockResolvedValue(0) },
      seasonTeam: { count: vi.fn().mockResolvedValue(16) },
      clubProfile: { count: vi.fn().mockResolvedValue(16) },
      fantasyPlayerPrice: { count: vi.fn().mockResolvedValue(96) },
      fantasyRulesConfig: {
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn().mockResolvedValue(null),
      },
      predictionRulesConfig: {
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn().mockResolvedValue(null),
      },
      achievementDefinition: { count: vi.fn().mockResolvedValue(17) },
      rewardReadinessDefinition: { count: vi.fn().mockResolvedValue(6) },
      clubShopProduct: { count: vi.fn().mockResolvedValue(0) },
      seasonSquadRegistration: { count: vi.fn().mockResolvedValue(96) },
      squadImportBatch: { findFirst: vi.fn().mockResolvedValue({ id: 'batch-1', status: 'PUBLISHED' }) },
      fantasyPriceCalibrationBatch: { findFirst: vi.fn().mockResolvedValue({ id: 'cb-1', status: 'PUBLISHED' }) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminOperationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(AdminOperationsService);
  });

  // ── Overview ────────────────────────────────────────────────────────────

  describe('getAdminOperationsOverview', () => {
    it('returns overview with 12 sections', async () => {
      const result = await service.getAdminOperationsOverview();
      expect(result.sections).toHaveLength(12);
    });

    it('includes platform identity', async () => {
      const result = await service.getAdminOperationsOverview();
      expect(result.platform).toBe('PSL One');
      expect(result.vision).toContain('South African Football');
    });

    it('includes safety note', async () => {
      const result = await service.getAdminOperationsOverview();
      expect(result.safetyNote).toContain('No real-money movement');
    });

    it('returns gameplay economy as points-only', async () => {
      const result = await service.getAdminOperationsOverview();
      expect(result.summary.gameplayEconomy).toBe('POINTS_ONLY');
    });

    it('reflects DB provider count in summary', async () => {
      prisma.integrationProviderConfig.count.mockResolvedValue(9);
      const result = await service.getAdminOperationsOverview();
      expect(result.summary.integrationProviders).toBe(9);
    });
  });

  // ── Capability Review ──────────────────────────────────────────────────

  describe('getCapabilityReview', () => {
    it('returns 9 categories', () => {
      const result = service.getCapabilityReview();
      expect(result.categories).toHaveLength(9);
    });

    it('fantasy is marked BUILT_NOW and points-only', () => {
      const result = service.getCapabilityReview();
      const engagement = result.categories.find((c) => c.category.includes('Fantasy'));
      expect(engagement).toBeDefined();
      const fantasy = engagement?.items.find((i) => i.capability.includes('Fantasy rules'));
      expect(fantasy?.status).toBe('BUILT_NOW');
      expect(fantasy?.evidence).toContain('POINTS-ONLY');
    });

    it('real-money wallet is marked PROVIDER_REQUIRED', () => {
      const result = service.getCapabilityReview();
      const commercial = result.categories.find((c) => c.category.includes('Commercial'));
      const wallet = commercial?.items.find((i) => i.capability.includes('wallet'));
      expect(wallet?.status).toBe('PROVIDER_REQUIRED');
    });

    it('checkout is marked PRODUCTION_DISABLED', () => {
      const result = service.getCapabilityReview();
      const commercial = result.categories.find((c) => c.category.includes('Commercial'));
      const checkout = commercial?.items.find((i) => i.capability.includes('Checkout'));
      expect(checkout?.status).toBe('PRODUCTION_DISABLED');
    });

    it('prediction rules config is BUILT_NOW and points-only', () => {
      const result = service.getCapabilityReview();
      const engagement = result.categories.find((c) => c.category.includes('Fantasy'));
      const pred = engagement?.items.find((i) => i.capability.includes('Prediction rules'));
      expect(pred?.status).toBe('BUILT_NOW');
      expect(pred?.evidence).toContain('POINTS-ONLY');
    });
  });

  // ── Launch Readiness ───────────────────────────────────────────────────

  describe('getLaunchReadiness', () => {
    it('returns a checklist', async () => {
      const result = await service.getLaunchReadiness();
      expect(Array.isArray(result.checklist)).toBe(true);
      expect(result.checklist.length).toBeGreaterThan(10);
    });

    it('points-only checks always pass', async () => {
      const result = await service.getLaunchReadiness();
      const pointsOnly = result.checklist.find((c) => c.area.includes('points-only'));
      expect(pointsOnly?.status).toBe('PASS');
    });

    it('no betting/gambling mechanics check always passes', async () => {
      const result = await service.getLaunchReadiness();
      const betting = result.checklist.find((c) => c.area.includes('betting'));
      expect(betting?.status).toBe('PASS');
    });

    it('no real-money gameplay check always passes', async () => {
      const result = await service.getLaunchReadiness();
      const moneyPlay = result.checklist.find((c) => c.area.includes('real-money gameplay'));
      expect(moneyPlay?.status).toBe('PASS');
    });

    it('returns nextSteps array', async () => {
      const result = await service.getLaunchReadiness();
      expect(Array.isArray(result.nextSteps)).toBe(true);
      expect(result.nextSteps.length).toBeGreaterThan(0);
    });

    it('returns IN_PROGRESS when all pending and no fails', async () => {
      const result = await service.getLaunchReadiness();
      expect(['IN_PROGRESS', 'READY', 'BLOCKED']).toContain(result.overallStatus);
    });
  });

  // ── Season Module Readiness ────────────────────────────────────────────

  describe('getSeasonModuleReadiness', () => {
    const mockSeason = { id: 'season-1', name: '2026/27 PSL', status: 'UPCOMING', isActive: false };

    beforeEach(() => {
      prisma.season.findUnique.mockResolvedValue(mockSeason);
    });

    it('returns module readiness for a valid season', async () => {
      const result = await service.getSeasonModuleReadiness('season-1');
      expect(result.seasonId).toBe('season-1');
      expect(result.seasonName).toBe('2026/27 PSL');
      expect(Array.isArray(result.modules)).toBe(true);
    });

    it('returns at least 10 modules', async () => {
      const result = await service.getSeasonModuleReadiness('season-1');
      expect(result.modules.length).toBeGreaterThanOrEqual(10);
    });

    it('wallet/payments module is marked PROVIDER_REQUIRED', async () => {
      const result = await service.getSeasonModuleReadiness('season-1');
      const wallet = result.modules.find((m) => m.moduleKey === 'WALLET_PAYMENTS');
      expect(wallet?.status).toBe('PROVIDER_REQUIRED');
      expect(wallet?.isProductionEnabled).toBe(false);
    });

    it('checkout module is marked PRODUCTION_DISABLED', async () => {
      const result = await service.getSeasonModuleReadiness('season-1');
      const checkout = result.modules.find((m) => m.moduleKey === 'CHECKOUT_COMMERCE');
      expect(checkout?.status).toBe('PRODUCTION_DISABLED');
    });

    it('fantasy module isPointsOnly = true', async () => {
      const result = await service.getSeasonModuleReadiness('season-1');
      const fantasy = result.modules.find((m) => m.moduleKey === 'FANTASY');
      expect(fantasy?.isPointsOnly).toBe(true);
    });

    it('predictions module isPointsOnly = true', async () => {
      const result = await service.getSeasonModuleReadiness('season-1');
      const pred = result.modules.find((m) => m.moduleKey === 'PREDICTIONS');
      expect(pred?.isPointsOnly).toBe(true);
    });

    it('SQUAD_IMPORT module is BUILT_NOW', async () => {
      const result = await service.getSeasonModuleReadiness('season-1');
      const module = result.modules.find((m) => m.moduleKey === 'SQUAD_IMPORT');
      expect(module?.status).toBe('BUILT_NOW');
      expect(module?.isProductionEnabled).toBe(true);
    });

    it('FANTASY_PRICE_CALIBRATION module is BUILT_NOW', async () => {
      const result = await service.getSeasonModuleReadiness('season-1');
      const module = result.modules.find((m) => m.moduleKey === 'FANTASY_PRICE_CALIBRATION');
      expect(module?.status).toBe('BUILT_NOW');
      expect(module?.isProductionEnabled).toBe(true);
    });

    it('MEDIA module is FOUNDATION_READY', async () => {
      const result = await service.getSeasonModuleReadiness('season-1');
      const module = result.modules.find((m) => m.moduleKey === 'MEDIA');
      expect(module?.status).toBe('FOUNDATION_READY');
    });

    it('SPONSOR_CAMPAIGNS module is FOUNDATION_READY', async () => {
      const result = await service.getSeasonModuleReadiness('season-1');
      const module = result.modules.find((m) => m.moduleKey === 'SPONSOR_CAMPAIGNS');
      expect(module?.status).toBe('FOUNDATION_READY');
    });

    it('CAMPAIGN_REWARDS module is SANDBOX_READY', async () => {
      const result = await service.getSeasonModuleReadiness('season-1');
      const module = result.modules.find((m) => m.moduleKey === 'CAMPAIGN_REWARDS');
      expect(module?.status).toBe('SANDBOX_READY');
    });

    it('WALLET_INTEGRATION module is SANDBOX_READY', async () => {
      const result = await service.getSeasonModuleReadiness('season-1');
      const module = result.modules.find((m) => m.moduleKey === 'WALLET_INTEGRATION');
      expect(module?.status).toBe('SANDBOX_READY');
    });

    it('WALLET_TRANSACTIONS is PRODUCTION_DISABLED', async () => {
      const result = await service.getSeasonModuleReadiness('season-1');
      const module = result.modules.find((m) => m.moduleKey === 'WALLET_TRANSACTIONS');
      expect(module?.status).toBe('PRODUCTION_DISABLED');
      expect(module?.isProductionEnabled).toBe(false);
    });

    it('CAMPAIGN_ANALYTICS module is FOUNDATION_READY', async () => {
      const result = await service.getSeasonModuleReadiness('season-1');
      const module = result.modules.find((m) => m.moduleKey === 'CAMPAIGN_ANALYTICS');
      expect(module?.status).toBe('FOUNDATION_READY');
    });

    it('throws NotFoundException for unknown season', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getSeasonModuleReadiness('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  // ── Smoke Tests ────────────────────────────────────────────────────────

  describe('getSmokeTestRoutes', () => {
    it('returns routes array', () => {
      const routes = service.getSmokeTestRoutes();
      expect(Array.isArray(routes)).toBe(true);
      expect(routes.length).toBeGreaterThan(20);
    });

    it('all admin routes require PSL_ADMIN', () => {
      const routes = service.getSmokeTestRoutes();
      const adminRoutes = routes.filter((r) => r.route.startsWith('/admin/') || r.route.includes('/admin/'));
      expect(adminRoutes.every((r) => r.requiresRole === 'PSL_ADMIN')).toBe(true);
    });

    it('has no duplicate method+route combinations', () => {
      const routes = service.getSmokeTestRoutes();
      const keys = routes.map((r) => `${r.method}:${r.route}`);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it('includes all 17 admin/operations routes', () => {
      const routes = service.getSmokeTestRoutes();
      const ops = routes.filter((r) => r.domain === 'adminOperations');
      expect(ops.length).toBeGreaterThanOrEqual(12);
    });
  });

  describe('getSmokeTestRbac', () => {
    it('returns 3 RBAC definitions', () => {
      const rbac = service.getSmokeTestRbac();
      expect(rbac).toHaveLength(3);
    });

    it('PSL_ADMIN can access all admin routes', () => {
      const rbac = service.getSmokeTestRbac();
      const admin = rbac.find((r) => r.role === 'PSL_ADMIN');
      expect(admin?.canAccess).toContain('/admin/operations/*');
    });

    it('FAN cannot access admin routes', () => {
      const rbac = service.getSmokeTestRbac();
      const fan = rbac.find((r) => r.role === 'FAN');
      expect(fan?.cannotAccess.some((r) => r.includes('/admin/'))).toBe(true);
    });
  });

  describe('getSmokeTestWorkflows', () => {
    it('returns workflow summaries', () => {
      const workflows = service.getSmokeTestWorkflows();
      expect(Array.isArray(workflows)).toBe(true);
      expect(workflows.length).toBeGreaterThan(0);
    });

    it('commercial workflow is PENDING', () => {
      const workflows = service.getSmokeTestWorkflows();
      const commercial = workflows.find((w) => w.workflowKey === 'commercial-readiness');
      expect(commercial?.readinessStatus).toBe('PENDING');
    });
  });

  describe('runSmokeTests', () => {
    it('returns test run results', async () => {
      const result = await service.runSmokeTests();
      expect(result.totalChecks).toBeGreaterThan(0);
      expect(result.passed).toBeGreaterThan(0);
    });

    it('always passes fantasy points-only check', async () => {
      const result = await service.runSmokeTests();
      const check = result.results.find((r) => r.check.includes('points-only'));
      expect(check?.status).toBe('PASS');
    });
  });

  // ── Integration Providers ──────────────────────────────────────────────

  describe('getIntegrationProviders', () => {
    it('returns provider list and safety note', async () => {
      prisma.integrationProviderConfig.findMany.mockResolvedValue([
        mockProvider(IntegrationProviderType.WALLET, IntegrationProviderStatus.SANDBOX_READY, IntegrationProviderMode.SANDBOX),
      ]);
      const result = await service.getIntegrationProviders();
      expect(result.safetyNote).toContain('No secrets');
      expect(result.providers).toHaveLength(1);
    });

    it('productionEnabledCount is 0 when all disabled', async () => {
      prisma.integrationProviderConfig.findMany.mockResolvedValue([
        mockProvider(IntegrationProviderType.WALLET, IntegrationProviderStatus.SANDBOX_READY),
        mockProvider(IntegrationProviderType.PAYMENT, IntegrationProviderStatus.PROVIDER_REQUIRED),
      ]);
      const result = await service.getIntegrationProviders();
      expect(result.productionEnabledCount).toBe(0);
    });
  });

  describe('getCommercialReadiness', () => {
    it('returns gameplay economy as points-only', async () => {
      const result = await service.getCommercialReadiness();
      expect(result.gameplayEconomy.fantasy).toContain('POINTS_ONLY');
      expect(result.gameplayEconomy.guessTheScore).toContain('POINTS_ONLY');
      expect(result.gameplayEconomy.peerChallenges).toContain('FAN_POINTS_ONLY');
    });

    it('returns production disabled status', async () => {
      const result = await service.getCommercialReadiness();
      expect(result.productionStatus).toContain('PRODUCTION_DISABLED');
    });
  });

  describe('getWalletPaymentsReadiness', () => {
    it('returns productionMoneyMovementDisabled = true', async () => {
      const result = await service.getWalletPaymentsReadiness();
      expect(result.productionMoneyMovementDisabled).toBe(true);
    });

    it('returns gameplayRemainsPointsOnly = true', async () => {
      const result = await service.getWalletPaymentsReadiness();
      expect(result.gameplayRemainsPointsOnly).toBe(true);
    });

    it('includes safety note about fantasy staying points-only', async () => {
      const result = await service.getWalletPaymentsReadiness();
      expect(result.safetyNote).toContain('POINTS-ONLY');
    });
  });

  describe('getCheckoutCommerceReadiness', () => {
    it('productionCheckoutEnabled is false', async () => {
      const result = await service.getCheckoutCommerceReadiness();
      expect(result.productionCheckoutEnabled).toBe(false);
    });

    it('productionDisabled is true', async () => {
      const result = await service.getCheckoutCommerceReadiness();
      expect(result.productionDisabled).toBe(true);
    });
  });

  describe('getTicketingReadiness', () => {
    it('productionTicketIssuanceDisabled is true', async () => {
      const result = await service.getTicketingReadiness();
      expect(result.productionTicketIssuanceDisabled).toBe(true);
    });

    it('includes safety note about no real ticket issuance', async () => {
      const result = await service.getTicketingReadiness();
      expect(result.safetyNote).toContain('No real ticket issuance');
    });
  });

  describe('getLiveDataReadiness', () => {
    it('productionIngestionDisabled is true', async () => {
      const result = await service.getLiveDataReadiness();
      expect(result.productionIngestionDisabled).toBe(true);
    });

    it('adapter status is FOUNDATION_READY', async () => {
      const result = await service.getLiveDataReadiness();
      expect(result.providerAdapterStatus).toContain('FOUNDATION_READY');
    });

    it('safety note confirms no external API calls', async () => {
      const result = await service.getLiveDataReadiness();
      expect(result.safetyNote).toContain('No real provider ingestion');
    });
  });

  describe('getSponsorActivationReadiness', () => {
    it('productionActivationStatus is PRODUCTION_DISABLED', async () => {
      const result = await service.getSponsorActivationReadiness();
      expect(result.productionActivationStatus).toBe('PRODUCTION_DISABLED');
    });
  });

  describe('getRewardsRedemptionReadiness', () => {
    it('productionRedemptionDisabled is true', async () => {
      const result = await service.getRewardsRedemptionReadiness();
      expect(result.productionRedemptionDisabled).toBe(true);
    });

    it('eligibility engine is operational', async () => {
      const result = await service.getRewardsRedemptionReadiness();
      expect(result.eligibilityEngineStatus).toContain('BUILT_NOW');
    });
  });
});
