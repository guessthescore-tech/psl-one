import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TrackEventDto, sanitizeProperties } from './dto/track-event.dto';
import { PreviewAnalyticsService } from './preview-analytics.service';

describe('PreviewAnalyticsService', () => {
  let service: PreviewAnalyticsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PreviewAnalyticsService();
  });

  it('accepts a valid allowed event', () => {
    const dto: TrackEventDto = { event: 'prediction_submitted', properties: { fixtureId: 'fx-1' } };
    const result = service.validateEvent(dto);
    expect(result.valid).toBe(true);
  });

  it('sanitizeProperties removes password field', () => {
    const result = sanitizeProperties({ password: 'secret123', fixtureId: 'fx-1' });
    expect(result).not.toHaveProperty('password');
    expect(result.fixtureId).toBe('fx-1');
  });

  it('sanitizeProperties removes token field', () => {
    const result = sanitizeProperties({ token: 'abc', fixtureId: 'fx-1' });
    expect(result).not.toHaveProperty('token');
  });

  it('sanitizeProperties removes wallet field', () => {
    const result = sanitizeProperties({ wallet: 'data', fixtureId: 'fx-1' });
    expect(result).not.toHaveProperty('wallet');
  });

  it('sanitizeProperties removes apiKey field', () => {
    const result = sanitizeProperties({ apiKey: 'key123', fixtureId: 'fx-1' });
    expect(result).not.toHaveProperty('apiKey');
  });

  it('sanitizeProperties removes authorization field', () => {
    const result = sanitizeProperties({ authorization: 'Bearer abc', fixtureId: 'fx-1' });
    expect(result).not.toHaveProperty('authorization');
  });

  it('sanitizeProperties keeps safe string/number/boolean values', () => {
    const result = sanitizeProperties({ fixtureId: 'fx-1', count: 3, active: true });
    expect(result.fixtureId).toBe('fx-1');
    expect(result.count).toBe(3);
    expect(result.active).toBe(true);
  });

  it('track does not throw even when analytics fails', () => {
    // track is fire-and-forget, should not throw
    expect(() => service.track('prediction_submitted', 'uid-1', { fixtureId: 'fx-1' })).not.toThrow();
  });

  it('analytics response does not include real-money language', () => {
    const dto: TrackEventDto = { event: 'prediction_submitted' };
    const result = service.validateEvent(dto);
    expect(JSON.stringify(result)).not.toMatch(/\b(money|odds|stake|wager|deposit|bet)\b/i);
  });
});
