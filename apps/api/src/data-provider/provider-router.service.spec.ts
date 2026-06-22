import 'reflect-metadata';
import { describe, it, expect, vi, afterEach } from 'vitest';

describe('ProviderRouterService', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  // ── WC routing ────────────────────────────────────────────────────────────

  describe('WC routing', () => {
    it('getAdapterForCompetition("WC") with FOOTBALL_DATA_API_KEY set returns football-data-org adapter', async () => {
      process.env['FOOTBALL_DATA_API_KEY'] = 'test-wc-key-sprint13';
      vi.stubGlobal('fetch', async () => ({ ok: false, status: 503, json: async () => ({}) }));
      const { ProviderRouterService } = await import('./provider-router.service');
      const svc = new ProviderRouterService();
      const adapter = svc.getAdapterForCompetition('WC');
      expect(adapter.name).toBe('football-data-org');
    });

    it('getAdapterForCompetition("WC") without key returns no-op adapter', async () => {
      delete process.env['FOOTBALL_DATA_API_KEY'];
      const { ProviderRouterService } = await import('./provider-router.service');
      const svc = new ProviderRouterService();
      const adapter = svc.getAdapterForCompetition('WC');
      expect(adapter.name).toBe('no-op');
    });

    it('getAdapterForCompetition("WORLD_CUP_2026") with key returns football-data-org adapter', async () => {
      process.env['FOOTBALL_DATA_API_KEY'] = 'test-wc-key-world-cup-2026';
      vi.stubGlobal('fetch', async () => ({ ok: false, status: 503, json: async () => ({}) }));
      const { ProviderRouterService } = await import('./provider-router.service');
      const svc = new ProviderRouterService();
      const adapter = svc.getAdapterForCompetition('WORLD_CUP_2026');
      expect(adapter.name).toBe('football-data-org');
    });

    it('getAdapterForCompetition("FIFA_WORLD_CUP") with key returns football-data-org adapter', async () => {
      process.env['FOOTBALL_DATA_API_KEY'] = 'test-wc-key-fifa-world-cup';
      vi.stubGlobal('fetch', async () => ({ ok: false, status: 503, json: async () => ({}) }));
      const { ProviderRouterService } = await import('./provider-router.service');
      const svc = new ProviderRouterService();
      const adapter = svc.getAdapterForCompetition('FIFA_WORLD_CUP');
      expect(adapter.name).toBe('football-data-org');
    });

    it('getAdapterForCompetition("wc") lowercase with key is case-insensitive and returns football-data-org', async () => {
      process.env['FOOTBALL_DATA_API_KEY'] = 'test-wc-key-lowercase';
      vi.stubGlobal('fetch', async () => ({ ok: false, status: 503, json: async () => ({}) }));
      const { ProviderRouterService } = await import('./provider-router.service');
      const svc = new ProviderRouterService();
      const adapter = svc.getAdapterForCompetition('wc');
      expect(adapter.name).toBe('football-data-org');
    });

    it('health of WC adapter with key returns an object with a provider field', async () => {
      process.env['FOOTBALL_DATA_API_KEY'] = 'test-wc-key-health-check';
      vi.stubGlobal('fetch', async () => ({ ok: false, status: 503, json: async () => ({}) }));
      const { ProviderRouterService } = await import('./provider-router.service');
      const svc = new ProviderRouterService();
      const adapter = svc.getAdapterForCompetition('WC');
      const health = await adapter.health();
      expect(health).toBeTypeOf('object');
      expect(health).toHaveProperty('provider');
    });
  });

  // ── PSL routing ───────────────────────────────────────────────────────────

  describe('PSL routing', () => {
    it('getAdapterForCompetition("PSL") with API_FOOTBALL_KEY set returns api-football adapter', async () => {
      process.env['API_FOOTBALL_KEY'] = 'test-psl-key-sprint13';
      vi.stubGlobal('fetch', async () => ({ ok: false, status: 503, json: async () => ({}) }));
      const { ProviderRouterService } = await import('./provider-router.service');
      const svc = new ProviderRouterService();
      const adapter = svc.getAdapterForCompetition('PSL');
      expect(adapter.name).toBe('api-football');
    });

    it('getAdapterForCompetition("PSL") without key returns no-op adapter', async () => {
      delete process.env['API_FOOTBALL_KEY'];
      const { ProviderRouterService } = await import('./provider-router.service');
      const svc = new ProviderRouterService();
      const adapter = svc.getAdapterForCompetition('PSL');
      expect(adapter.name).toBe('no-op');
    });

    it('getAdapterForCompetition("SOUTH_AFRICA_PSL") with key returns api-football adapter', async () => {
      process.env['API_FOOTBALL_KEY'] = 'test-psl-key-south-africa';
      vi.stubGlobal('fetch', async () => ({ ok: false, status: 503, json: async () => ({}) }));
      const { ProviderRouterService } = await import('./provider-router.service');
      const svc = new ProviderRouterService();
      const adapter = svc.getAdapterForCompetition('SOUTH_AFRICA_PSL');
      expect(adapter.name).toBe('api-football');
    });

    it('getAdapterForCompetition("288") with key returns api-football adapter', async () => {
      process.env['API_FOOTBALL_KEY'] = 'test-psl-key-288';
      vi.stubGlobal('fetch', async () => ({ ok: false, status: 503, json: async () => ({}) }));
      const { ProviderRouterService } = await import('./provider-router.service');
      const svc = new ProviderRouterService();
      const adapter = svc.getAdapterForCompetition('288');
      expect(adapter.name).toBe('api-football');
    });

    it('PSL route with key set: getRouteStatus().psl contains "api-football"', async () => {
      process.env['API_FOOTBALL_KEY'] = 'test-psl-key-route-status';
      const { ProviderRouterService } = await import('./provider-router.service');
      const svc = new ProviderRouterService();
      const status = svc.getRouteStatus();
      expect(status.psl).toContain('api-football');
    });
  });

  // ── NoOp fallback ─────────────────────────────────────────────────────────

  describe('NoOp fallback', () => {
    it('unknown competition code returns no-op adapter', async () => {
      const { ProviderRouterService } = await import('./provider-router.service');
      const svc = new ProviderRouterService();
      const adapter = svc.getAdapterForCompetition('BUNDESLIGA');
      expect(adapter.name).toBe('no-op');
    });

    it('empty string returns no-op adapter', async () => {
      const { ProviderRouterService } = await import('./provider-router.service');
      const svc = new ProviderRouterService();
      const adapter = svc.getAdapterForCompetition('');
      expect(adapter.name).toBe('no-op');
    });

    it('getAdapterForCompetition("CL") (Champions League, not in router) returns no-op adapter', async () => {
      const { ProviderRouterService } = await import('./provider-router.service');
      const svc = new ProviderRouterService();
      const adapter = svc.getAdapterForCompetition('CL');
      expect(adapter.name).toBe('no-op');
    });

    it('getRouteStatus() with no keys set returns BLOCKED_NO_KEY for both wc and psl', async () => {
      delete process.env['FOOTBALL_DATA_API_KEY'];
      delete process.env['API_FOOTBALL_KEY'];
      const { ProviderRouterService } = await import('./provider-router.service');
      const svc = new ProviderRouterService();
      const status = svc.getRouteStatus();
      expect(status.wc).toBe('BLOCKED_NO_KEY');
      expect(status.psl).toBe('BLOCKED_NO_KEY');
    });
  });

  // ── Security ──────────────────────────────────────────────────────────────

  describe('Security', () => {
    const src = require('fs').readFileSync(
      require('path').resolve(__dirname, 'provider-router.service.ts'),
      'utf8',
    );

    it('does not import SportmonksAdapter', () => {
      expect(src).not.toContain('SportmonksAdapter');
      expect(src).not.toContain('sportmonks');
    });

    it('does not use NEXT_PUBLIC_ env vars', () => {
      expect(src).not.toContain("process.env['NEXT_PUBLIC_");
      expect(src).not.toContain('process.env.NEXT_PUBLIC_');
    });

    it('does not reference betting or odds endpoints', () => {
      expect(src.toLowerCase()).not.toContain('betting');
      expect(src.toLowerCase()).not.toContain('/odds');
    });

    it('imports FootballDataOrgAdapter and ApiFootballAdapter correctly', () => {
      expect(src).toContain("import { FootballDataOrgAdapter } from './football-data-org.adapter'");
      expect(src).toContain("import { ApiFootballAdapter } from './api-football.adapter'");
    });
  });

  // ── getRouteStatus ────────────────────────────────────────────────────────

  describe('getRouteStatus', () => {
    it('with both keys set returns READY status for wc and psl', async () => {
      process.env['FOOTBALL_DATA_API_KEY'] = 'test-wc-status-key';
      process.env['API_FOOTBALL_KEY'] = 'test-psl-status-key';
      const { ProviderRouterService } = await import('./provider-router.service');
      const svc = new ProviderRouterService();
      const status = svc.getRouteStatus();
      expect(status.wc).toMatch(/^READY/);
      expect(status.psl).toMatch(/^READY/);
    });

    it('with no keys set returns BLOCKED_NO_KEY for both, default is NoOpAdapter', async () => {
      delete process.env['FOOTBALL_DATA_API_KEY'];
      delete process.env['API_FOOTBALL_KEY'];
      const { ProviderRouterService } = await import('./provider-router.service');
      const svc = new ProviderRouterService();
      const status = svc.getRouteStatus();
      expect(status.wc).toBe('BLOCKED_NO_KEY');
      expect(status.psl).toBe('BLOCKED_NO_KEY');
      expect(status.default).toBe('NoOpAdapter');
    });
  });
});
