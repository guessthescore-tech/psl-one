import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, publicFetch, ApiError } from './api';

// ── Network-error translation ───────────────────────────────────────────────
//
// fetch() itself rejects (not an HTTP error response) on DNS failure, CORS
// rejection, connection refused, offline, etc. The browser's rejection reason
// is a raw `TypeError: Failed to fetch`. Regression: this literal string must
// never reach the UI — apiFetch/publicFetch must translate it into a friendly
// ApiError instead.

describe('apiFetch — network error translation', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('translates a raw fetch() rejection into an ApiError, not the literal "Failed to fetch"', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiFetch('/fantasy/team/me')).rejects.toBeInstanceOf(ApiError);

    try {
      await apiFetch('/fantasy/team/me');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).message).not.toBe('Failed to fetch');
      expect((err as ApiError).status).toBe(0);
    }
  });

  it('still surfaces the server-provided message for real HTTP error responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Invalid squad' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiFetch('/fantasy/team/me')).rejects.toThrow('Invalid squad');
  });
});

describe('publicFetch — network error translation', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('translates a raw fetch() rejection into an ApiError, not the literal "Failed to fetch"', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    try {
      await publicFetch('/fantasy/player-prices');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).message).not.toBe('Failed to fetch');
    }
  });
});
