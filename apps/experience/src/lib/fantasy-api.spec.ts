import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPlayerPool, getPlayerPrices } from './fantasy-api';

describe('fantasy-api getPlayerPrices', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('normalizes API price values from tenths to millions', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          playerId: 'p1',
          playerName: 'Player One',
          seasonId: 'season-1',
          currentPrice: 55,
        },
      ],
    });

    vi.stubGlobal('fetch', fetchMock);

    const prices = await getPlayerPrices('season-1');

    expect(fetchMock).toHaveBeenCalled();
    expect(prices[0]!.currentPrice).toBe(5.5);
  });
});

describe('fantasy-api getPlayerPool', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('passes seasonId through to the player-pool endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    vi.stubGlobal('fetch', fetchMock);

    await getPlayerPool(undefined, 'season-1');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/fantasy/player-pool?seasonId=season-1'),
      expect.any(Object),
    );
  });
});
