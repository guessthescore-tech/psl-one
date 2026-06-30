import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createScorePrediction, getMyFixturePrediction } from './predictions-api';

const MOCK_PREDICTION = {
  id: 'pred-1',
  fixtureId: 'fixture-123',
  predictedHomeScore: 2,
  predictedAwayScore: 1,
  status: 'PENDING',
  pointsAwarded: null,
  createdAt: '2026-06-30T10:00:00Z',
};

function makeOkResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  };
}

function makeErrorResponse(status: number, message: string) {
  return {
    ok: false,
    status,
    json: async () => ({ message }),
  };
}

describe('predictions-api getMyFixturePrediction', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls GET /predictions/me/:fixtureId — not the legacy fixtures path', async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeOkResponse(MOCK_PREDICTION));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getMyFixturePrediction('fixture-123');

    const [url] = fetchMock.mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain('/predictions/me/fixture-123');
    expect(url).not.toContain('/predictions/fixtures/');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('pred-1');
  });

  it('returns null when the API responds 404 (no prediction exists)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'No prediction found for this fixture' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getMyFixturePrediction('fixture-unknown');

    expect(result).toBeNull();
  });

  it('throws UNAUTHORIZED on 401', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(getMyFixturePrediction('fixture-123')).rejects.toThrow('UNAUTHORIZED');
  });

  it('throws with API message on other errors', async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeErrorResponse(500, 'Internal server error'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getMyFixturePrediction('fixture-123')).rejects.toThrow('Internal server error');
  });

  it('maps createdAt from the API response (not submittedAt)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeOkResponse(MOCK_PREDICTION));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getMyFixturePrediction('fixture-123');

    expect(result).not.toBeNull();
    expect(result!.createdAt).toBe('2026-06-30T10:00:00Z');
    // The interface must not have submittedAt — assert the field is absent
    expect((result as unknown as Record<string, unknown>)['submittedAt']).toBeUndefined();
  });
});

describe('predictions-api createScorePrediction', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls POST /predictions with the prediction DTO', async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeOkResponse(MOCK_PREDICTION));
    vi.stubGlobal('fetch', fetchMock);

    const result = await createScorePrediction({
      fixtureId: 'fixture-123',
      predictedHomeScore: 2,
      predictedAwayScore: 1,
    });

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/predictions');
    expect(options.method).toBe('POST');

    const body = JSON.parse(options.body as string) as {
      fixtureId: string;
      predictedHomeScore: number;
      predictedAwayScore: number;
    };
    expect(body.fixtureId).toBe('fixture-123');
    expect(body.predictedHomeScore).toBe(2);
    expect(body.predictedAwayScore).toBe(1);

    expect(result.createdAt).toBe('2026-06-30T10:00:00Z');
  });

  it('exposes createdAt on the response shape (not submittedAt)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeOkResponse(MOCK_PREDICTION));
    vi.stubGlobal('fetch', fetchMock);

    const result = await createScorePrediction({
      fixtureId: 'fixture-123',
      predictedHomeScore: 1,
      predictedAwayScore: 0,
    });

    expect(typeof result.createdAt).toBe('string');
    // Guard: if this assertion fails it means submittedAt leaked back into the interface
    expect((result as unknown as Record<string, unknown>)['submittedAt']).toBeUndefined();
  });
});
