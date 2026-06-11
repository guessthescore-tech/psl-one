import { getToken } from './auth-client';

const BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

function challengesUrl(path: string) {
  return `${BASE}/challenges${path}`;
}

function leaderboardsUrl(path: string) {
  return `${BASE}/leaderboards${path}`;
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

async function publicReq<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export type ChallengeStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'SETTLED';

export type ChallengePrediction = {
  id: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  pointsAwarded: number;
  status: string;
};

export type ChallengeFixture = {
  id: string;
  kickoffAt: string;
  status: string;
  homeTeam: { id: string; name: string; shortName: string; slug: string };
  awayTeam: { id: string; name: string; shortName: string; slug: string };
};

export type Challenge = {
  id: string;
  fixtureId: string;
  challengerUserId: string;
  opponentUserId: string;
  status: ChallengeStatus;
  winnerUserId: string | null;
  pointsAwardedChallenger: number | null;
  pointsAwardedOpponent: number | null;
  createdAt: string;
  acceptedAt: string | null;
  settledAt: string | null;
  fixture: ChallengeFixture;
  challengerPrediction: ChallengePrediction | null;
  opponentPrediction: ChallengePrediction | null;
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  displayName: string | null;
  totalPoints: number;
  predictionCount: number;
};

export const challengesClient = {
  createChallenge(fixtureId: string, opponentEmail: string): Promise<Challenge> {
    return req<Challenge>(challengesUrl(''), {
      method: 'POST',
      body: JSON.stringify({ fixtureId, opponentEmail }),
    });
  },

  getMyChallenges(): Promise<Challenge[]> {
    return req<Challenge[]>(challengesUrl('/me'));
  },

  getChallenge(challengeId: string): Promise<Challenge> {
    return req<Challenge>(challengesUrl(`/${challengeId}`));
  },

  acceptChallenge(challengeId: string): Promise<Challenge> {
    return req<Challenge>(challengesUrl(`/${challengeId}/accept`), { method: 'POST' });
  },

  declineChallenge(challengeId: string): Promise<Challenge> {
    return req<Challenge>(challengesUrl(`/${challengeId}/decline`), { method: 'POST' });
  },

  cancelChallenge(challengeId: string): Promise<Challenge> {
    return req<Challenge>(challengesUrl(`/${challengeId}/cancel`), { method: 'POST' });
  },
};

export const leaderboardsClient = {
  getPredictionsLeaderboard(): Promise<LeaderboardEntry[]> {
    return publicReq<LeaderboardEntry[]>(leaderboardsUrl('/predictions'));
  },
};
