import 'reflect-metadata';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { WhenIsKickoffAdapter } from './wheniskickoff.adapter';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('WhenIsKickoffAdapter', () => {
  it('reports health when matches are available', async () => {
    vi.stubGlobal('fetch', async () => ({
      ok: true,
      json: async () => ({
        matches: [
          { id: 'wk-1', homeTeam: { name: 'Brazil' }, awayTeam: { name: 'France' }, kickoffAt: '2026-06-14T18:00:00Z', status: 'SCHEDULED' },
        ],
      }),
    }));

    const adapter = new WhenIsKickoffAdapter();
    const health = await adapter.health();

    expect(health.available).toBe(true);
    expect(health.provider).toBe('wheniskickoff');
    expect(health.message).toContain('public schedule feed');
  });

  it('maps public matches into provider fixtures', async () => {
    vi.stubGlobal('fetch', async () => ({
      ok: true,
      json: async () => ({
        matches: [
          {
            id: 101,
            homeTeam: { name: 'Brazil' },
            awayTeam: { name: 'France' },
            utcDate: '2026-06-14T18:00:00Z',
            status: 'FINISHED',
            score: { fullTime: { home: 2, away: 1 } },
          },
        ],
      }),
    }));

    const adapter = new WhenIsKickoffAdapter();
    const fixtures = await adapter.getFixtures('wheniskickoff-world-cup-2026');

    expect(fixtures).toHaveLength(1);
    expect(fixtures[0]).toMatchObject({
      externalId: '101',
      homeTeamName: 'Brazil',
      awayTeamName: 'France',
      kickoffAt: '2026-06-14T18:00:00Z',
      status: 'FINISHED',
      homeScore: 2,
      awayScore: 1,
    });
  });
});
