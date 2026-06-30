import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPlayers } from './football-api';

describe('football-api getPlayers', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches the public football player list with no params', async () => {
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

  it('passes seasonSlug as a query param', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    vi.stubGlobal('fetch', fetchMock);

    await getPlayers({ seasonSlug: 'fifa-world-cup-2026' });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('seasonSlug=fifa-world-cup-2026'),
      expect.any(Object),
    );
  });

  it('passes teamSlug as a query param', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    vi.stubGlobal('fetch', fetchMock);

    await getPlayers({ teamSlug: 'south-africa' });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('teamSlug=south-africa'),
      expect.any(Object),
    );
  });
});
