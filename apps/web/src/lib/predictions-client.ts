import { getToken } from './auth-client';

const BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

function predictionsUrl(path: string) {
  return `${BASE}/predictions${path}`;
}

function authedHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { ...authedHeaders(), ...init?.headers } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error((err as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export type PredictionStatus = 'PENDING' | 'LOCKED' | 'WON' | 'LOST' | 'SETTLED';

export type PredictionFixture = {
  id: string;
  kickoffAt: string;
  status: string;
  homeTeam: { id: string; name: string; shortName: string; slug: string };
  awayTeam: { id: string; name: string; shortName: string; slug: string };
  homeScore: number | null;
  awayScore: number | null;
};

export type Prediction = {
  id: string;
  userId: string;
  fixtureId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  pointsAwarded: number;
  status: PredictionStatus;
  createdAt: string;
  updatedAt: string;
  settledAt: string | null;
  fixture: PredictionFixture;
};

export type SettleResult = {
  fixtureId: string;
  predictionsSettled: number;
  challengesSettled: number;
  summary: { predictionId: string; userId: string; points: number }[];
};

export const predictionsClient = {
  createPrediction(fixtureId: string, predictedHomeScore: number, predictedAwayScore: number): Promise<Prediction> {
    return req<Prediction>(predictionsUrl(''), {
      method: 'POST',
      body: JSON.stringify({ fixtureId, predictedHomeScore, predictedAwayScore }),
    });
  },

  updatePrediction(
    predictionId: string,
    data: { predictedHomeScore?: number; predictedAwayScore?: number },
  ): Promise<Prediction> {
    return req<Prediction>(predictionsUrl(`/${predictionId}`), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getMyPredictions(): Promise<Prediction[]> {
    return req<Prediction[]>(predictionsUrl('/me'));
  },

  getMyPredictionForFixture(fixtureId: string): Promise<Prediction> {
    return req<Prediction>(predictionsUrl(`/me/${fixtureId}`));
  },

  settleFixture(fixtureId: string): Promise<SettleResult> {
    return req<SettleResult>(predictionsUrl(`/admin/settle-fixture/${fixtureId}`), { method: 'POST' });
  },
};
