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
    // NoOpAdapter returns available:false with no provider-specific message
    expect(health.available).toBe(false);
    expect(JSON.stringify(health)).not.toMatch(/sportmonks/i);
  });
});
