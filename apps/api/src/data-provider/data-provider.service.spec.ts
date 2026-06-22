import 'reflect-metadata';
import { describe, it, expect, vi, afterEach } from 'vitest';

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
});
