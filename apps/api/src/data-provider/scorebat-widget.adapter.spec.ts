import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ScoreBatWidgetAdapter } from './scorebat-widget.adapter';

describe('ScoreBatWidgetAdapter — safe mode (no token)', () => {
  beforeEach(() => { delete process.env['SCOREBAT_WIDGET_TOKEN']; });
  afterEach(() => { delete process.env['SCOREBAT_WIDGET_TOKEN']; });

  it('health returns available=false when token absent', async () => {
    const adapter = new ScoreBatWidgetAdapter();
    const h = await adapter.health();
    expect(h.available).toBe(false);
    expect(h.provider).toBe('scorebat-widget');
    expect(h.message).toContain('not configured');
  });

  it('name is scorebat-widget', () => {
    expect(new ScoreBatWidgetAdapter().name).toBe('scorebat-widget');
  });

  it('getWidgetEmbedConfig returns available=false without token', () => {
    const adapter = new ScoreBatWidgetAdapter();
    const config = adapter.getWidgetEmbedConfig();
    expect(config.available).toBe(false);
    expect(config.embedUrl).toBeNull();
    expect(config.allowedHosts).toContain('www.scorebat.com');
  });

  it('getSeasons returns empty array', async () => {
    const result = await new ScoreBatWidgetAdapter().getSeasons();
    expect(result).toEqual([]);
  });

  it('getFixtures returns empty array', async () => {
    const result = await new ScoreBatWidgetAdapter().getFixtures('any');
    expect(result).toEqual([]);
  });

  it('getTeams returns empty array', async () => {
    const result = await new ScoreBatWidgetAdapter().getTeams('any');
    expect(result).toEqual([]);
  });

  it('getPlayers returns empty array', async () => {
    const result = await new ScoreBatWidgetAdapter().getPlayers('any');
    expect(result).toEqual([]);
  });

  it('getStandings returns empty array', async () => {
    const result = await new ScoreBatWidgetAdapter().getStandings('any');
    expect(result).toEqual([]);
  });
});

describe('ScoreBatWidgetAdapter — with token configured', () => {
  beforeEach(() => { process.env['SCOREBAT_WIDGET_TOKEN'] = 'sb-test-token-abc123'; });
  afterEach(() => { delete process.env['SCOREBAT_WIDGET_TOKEN']; });

  it('health returns available=true with token', async () => {
    const adapter = new ScoreBatWidgetAdapter();
    const h = await adapter.health();
    expect(h.available).toBe(true);
    expect(h.message).toContain('ready');
  });

  it('getWidgetEmbedConfig returns available=true and valid embed URL', () => {
    const adapter = new ScoreBatWidgetAdapter();
    const config = adapter.getWidgetEmbedConfig('world-cup');
    expect(config.available).toBe(true);
    expect(config.embedUrl).not.toBeNull();
    expect(config.embedUrl).toContain('scorebat.com');
    expect(config.embedUrl).toContain('world-cup');
  });

  it('embed URL contains token (widget attribution — not a secret API key)', () => {
    const adapter = new ScoreBatWidgetAdapter();
    const config = adapter.getWidgetEmbedConfig();
    // ScoreBat widget tokens are embed attribution tokens, not secret API keys
    expect(config.embedUrl).toContain('sb-test-token-abc123');
  });

  it('health response never exposes raw token value in message', async () => {
    const adapter = new ScoreBatWidgetAdapter();
    const h = await adapter.health();
    // Health message must not leak the raw token value
    expect(h.message).not.toContain('sb-test-token-abc123');
  });

  it('allowedHosts contains both scorebat.com variants', () => {
    const adapter = new ScoreBatWidgetAdapter();
    const config = adapter.getWidgetEmbedConfig();
    expect(config.allowedHosts).toContain('scorebat.com');
    expect(config.allowedHosts).toContain('www.scorebat.com');
  });

  it('static getAllowedHosts returns scorebat domains', () => {
    const hosts = ScoreBatWidgetAdapter.getAllowedHosts();
    expect(hosts).toContain('scorebat.com');
    expect(hosts).toContain('www.scorebat.com');
  });
});
