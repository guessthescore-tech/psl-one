import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPlayers } from './football-api';

describe('football-api getPlayers', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches the public football player list', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    vi.stubGlobal('fetch', fetchMock);

    await getPlayers();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/football/players'),
      expect.any(Object),
    );
  });
});
