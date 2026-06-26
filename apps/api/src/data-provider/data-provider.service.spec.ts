import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('DataProviderService', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it('returns disabled health when no API key set', async () => {
    delete process.env['SPORTMONKS_API_KEY'];
    const { DataProviderService: Svc } = await import('./data-provider.service');
    const svc = new Svc();
    const health = await svc.health();
    expect(health.available).toBe(false);
    expect(health.message).toMatch(/disabled|not configured|No provider/i);
  });

  it('returns empty fixtures list when no key', async () => {
    delete process.env['SPORTMONKS_API_KEY'];
    const { DataProviderService: Svc } = await import('./data-provider.service');
    const svc = new Svc();
    const fixtures = await svc.getFixtures('season-1');
    expect(fixtures).toEqual([]);
  });

  it('returns empty teams list when no key', async () => {
    delete process.env['SPORTMONKS_API_KEY'];
    const { DataProviderService: Svc } = await import('./data-provider.service');
    const svc = new Svc();
    const teams = await svc.getTeams('season-1');
    expect(teams).toEqual([]);
  });

  it('health response does not expose API key', async () => {
    delete process.env['SPORTMONKS_API_KEY'];
    const { DataProviderService: Svc } = await import('./data-provider.service');
    const svc = new Svc();
    const health = await svc.health();
    expect(JSON.stringify(health)).not.toMatch(/api_key|apiKey|api-key/i);
  });

  it('provider name is not a browser-facing provider URL', async () => {
    delete process.env['SPORTMONKS_API_KEY'];
    const { DataProviderService: Svc } = await import('./data-provider.service');
    const svc = new Svc();
    const health = await svc.health();
    // no URL with API token
    expect(health.message).not.toMatch(/api_token=/i);
  });

  // Sprint 10 amendment — Sportmonks removed from active strategy
  it('uses NoOpAdapter even when SPORTMONKS_API_KEY is set (primary provider UNDECIDED)', async () => {
    process.env['SPORTMONKS_API_KEY'] = 'test-key-should-not-activate-sportmonks';
    const { DataProviderService: Svc } = await import('./data-provider.service');
    const svc = new Svc();
    const health = await svc.health();
    expect(health.available).toBe(false);
    expect(JSON.stringify(health)).not.toMatch(/sportmonks/i);
  });

  // Sprint 11 — DATA_PROVIDER explicit selection flag
  it('uses NoOpAdapter when DATA_PROVIDER is not set', async () => {
    delete process.env['DATA_PROVIDER'];
    delete process.env['API_FOOTBALL_KEY'];
    const { DataProviderService: Svc } = await import('./data-provider.service');
    const svc = new Svc();
    const health = await svc.health();
    expect(health.available).toBe(false);
    expect(health.provider).toBe('no-op');
  });

  it('uses NoOpAdapter when DATA_PROVIDER=api-football but API_FOOTBALL_KEY is absent', async () => {
    process.env['DATA_PROVIDER'] = 'api-football';
    delete process.env['API_FOOTBALL_KEY'];
    const { DataProviderService: Svc } = await import('./data-provider.service');
    const svc = new Svc();
    const health = await svc.health();
    expect(health.provider).toBe('no-op');
  });

  it('uses ApiFootballAdapter when DATA_PROVIDER=api-football and key is set', async () => {
    process.env['DATA_PROVIDER'] = 'api-football';
    process.env['API_FOOTBALL_KEY'] = 'test-key-sprint11-adapter-selection';
    vi.stubGlobal('fetch', async () => ({ ok: false, status: 503, json: async () => ({}) }));
    const { DataProviderService: Svc } = await import('./data-provider.service');
    const svc = new Svc();
    const health = await svc.health();
    expect(health.provider).toBe('api-football');
    expect(health.available).toBe(false);
    vi.unstubAllGlobals();
  });

  it('uses NoOpAdapter for unknown DATA_PROVIDER value', async () => {
    process.env['DATA_PROVIDER'] = 'unknown-provider-xyz';
    delete process.env['API_FOOTBALL_KEY'];
    const { DataProviderService: Svc } = await import('./data-provider.service');
    const svc = new Svc();
    const health = await svc.health();
    expect(health.provider).toBe('no-op');
  });

  it('key alone does not activate provider without DATA_PROVIDER flag', async () => {
    delete process.env['DATA_PROVIDER'];
    process.env['API_FOOTBALL_KEY'] = 'test-key-should-not-auto-activate';
    const { DataProviderService: Svc } = await import('./data-provider.service');
    const svc = new Svc();
    const health = await svc.health();
    expect(health.provider).toBe('no-op');
  });

  // Sprint 12 — football-data-org explicit selection
  it('uses FootballDataOrgAdapter when DATA_PROVIDER=football-data-org and key is set', async () => {
    process.env['DATA_PROVIDER'] = 'football-data-org';
    process.env['FOOTBALL_DATA_API_KEY'] = 'test-key-sprint12-fdorg';
    vi.stubGlobal('fetch', async () => ({ ok: false, status: 503, json: async () => ({}) }));
    const { DataProviderService: Svc } = await import('./data-provider.service');
    const svc = new Svc();
    const health = await svc.health();
    expect(health.provider).toBe('football-data-org');
    expect(health.available).toBe(false);
    vi.unstubAllGlobals();
  });

  it('uses NoOpAdapter when DATA_PROVIDER=football-data-org but FOOTBALL_DATA_API_KEY is absent', async () => {
    process.env['DATA_PROVIDER'] = 'football-data-org';
    delete process.env['FOOTBALL_DATA_API_KEY'];
    const { DataProviderService: Svc } = await import('./data-provider.service');
    const svc = new Svc();
    const health = await svc.health();
    expect(health.provider).toBe('no-op');
  });

  it('FOOTBALL_DATA_API_KEY alone does not activate football-data-org without DATA_PROVIDER flag', async () => {
    delete process.env['DATA_PROVIDER'];
    process.env['FOOTBALL_DATA_API_KEY'] = 'test-key-should-not-auto-activate-fdorg';
    const { DataProviderService: Svc } = await import('./data-provider.service');
    const svc = new Svc();
    const health = await svc.health();
    expect(health.provider).toBe('no-op');
  });

  it('DataProviderService supports football-data-org in provider selection', () => {
    const src = require('fs').readFileSync(
      require('path').resolve(__dirname, 'data-provider.service.ts'),
      'utf8',
    );
    expect(src).toContain('FootballDataOrgAdapter');
    expect(src).toContain("provider === 'football-data-org'");
  });
});

// ── getWcBetaCapability ───────────────────────────────────────────────────────

describe('DataProviderService.getWcBetaCapability', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env['FOOTBALL_DATA_API_KEY'];
    delete process.env['SPORTMONKS_API_KEY'];
    delete process.env['SCOREBAT_WIDGET_TOKEN'];
    delete process.env['WC_LIVE_PROVIDER'];
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  async function makeSvc() {
    const { DataProviderService } = await import('./data-provider.service');
    return new DataProviderService();
  }

  it('reports fixture provider READY when football-data-org key present', async () => {
    vi.stubEnv('FOOTBALL_DATA_API_KEY', 'test-fd-key');
    const svc = await makeSvc();
    const result = svc.getWcBetaCapability();
    expect(result.providers.fixture.keyPresent).toBe(true);
    expect(result.providers.fixture.status).toBe('READY');
    expect(result.providers.fixture.name).toBe('football-data-org');
  });

  it('reports fixture provider NO_KEY when football-data-org key absent', async () => {
    const svc = await makeSvc();
    const result = svc.getWcBetaCapability();
    expect(result.providers.fixture.keyPresent).toBe(false);
    expect(result.providers.fixture.status).toBe('NO_KEY');
  });

  it('reports live provider READY when WC_LIVE_PROVIDER=sportmonks and key present', async () => {
    vi.stubEnv('WC_LIVE_PROVIDER', 'sportmonks');
    vi.stubEnv('SPORTMONKS_API_KEY', 'test-sm-key');
    const svc = await makeSvc();
    const result = svc.getWcBetaCapability();
    expect(result.providers.live.status).toBe('READY');
    expect(result.providers.live.keyPresent).toBe(true);
    expect(result.providers.live.capabilities).toContain('match_events');
  });

  it('reports live provider NO_KEY when WC_LIVE_PROVIDER=sportmonks but key absent', async () => {
    vi.stubEnv('WC_LIVE_PROVIDER', 'sportmonks');
    const svc = await makeSvc();
    const result = svc.getWcBetaCapability();
    expect(result.providers.live.status).toBe('NO_KEY');
  });

  it('reports live provider MANUAL_FALLBACK when WC_LIVE_PROVIDER not set', async () => {
    const svc = await makeSvc();
    const result = svc.getWcBetaCapability();
    expect(result.providers.live.status).toBe('MANUAL_FALLBACK');
  });

  it('reports video WIDGET_READY when ScoreBat token present', async () => {
    vi.stubEnv('SCOREBAT_WIDGET_TOKEN', 'test-sb-token');
    const svc = await makeSvc();
    const result = svc.getWcBetaCapability();
    expect(result.providers.video.keyPresent).toBe(true);
    expect(result.providers.video.status).toBe('WIDGET_READY');
  });

  it('reports video NO_KEY when ScoreBat token absent', async () => {
    const svc = await makeSvc();
    const result = svc.getWcBetaCapability();
    expect(result.providers.video.keyPresent).toBe(false);
    expect(result.providers.video.status).toBe('NO_KEY');
  });

  it('never includes key values in the response', async () => {
    vi.stubEnv('FOOTBALL_DATA_API_KEY', 'secret-fd');
    vi.stubEnv('SPORTMONKS_API_KEY', 'secret-sm');
    vi.stubEnv('SCOREBAT_WIDGET_TOKEN', 'secret-sb');
    const svc = await makeSvc();
    const result = svc.getWcBetaCapability();
    const str = JSON.stringify(result);
    expect(str).not.toContain('secret-fd');
    expect(str).not.toContain('secret-sm');
    expect(str).not.toContain('secret-sb');
  });

  it('always returns guards with pslActivated=false', async () => {
    const svc = await makeSvc();
    const result = svc.getWcBetaCapability();
    expect(result.guards.pslActivated).toBe(false);
    expect(result.guards.bettingEnabled).toBe(false);
    expect(result.guards.realMoneyEnabled).toBe(false);
  });

  it('competition is always fifa-world-cup-2026', async () => {
    const svc = await makeSvc();
    const result = svc.getWcBetaCapability();
    expect(result.competition).toBe('fifa-world-cup-2026');
  });
});
