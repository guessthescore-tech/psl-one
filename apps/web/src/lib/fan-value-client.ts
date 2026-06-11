import { getToken } from './auth-client';

const BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

function fanValueUrl(path: string) {
  return `${BASE}/fan-value${path}`;
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

export type FanValueSourceType =
  | 'FANTASY_GAMEWEEK_SCORE'
  | 'FANTASY_AUTO_SUBSTITUTION'
  | 'PREDICTION_SETTLEMENT'
  | 'PEER_CHALLENGE'
  | 'ACHIEVEMENT'
  | 'SPONSOR_ENGAGEMENT_READY'
  | 'REWARD_ELIGIBILITY_READY'
  | 'ADMIN_ADJUSTMENT';

export type FanValueType =
  | 'FANTASY_POINTS'
  | 'PREDICTION_POINTS'
  | 'CHALLENGE_POINTS'
  | 'ACHIEVEMENT_POINTS'
  | 'LOYALTY_POINTS'
  | 'REWARD_CREDITS_READY';

export type FanValueStatus = 'POSTED' | 'VOIDED';

export type FanValueEntry = {
  id: string;
  userId: string;
  sourceType: FanValueSourceType;
  sourceId: string;
  valueType: FanValueType;
  points: number;
  status: FanValueStatus;
  description: string | null;
  idempotencyKey: string | null;
  fantasyTeamId: string | null;
  predictionId: string | null;
  challengeId: string | null;
  achievementId: string | null;
  fixtureId: string | null;
  seasonId: string | null;
  gameweekId: string | null;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
};

export type FanValueSummary = {
  userId: string;
  totalPoints: number;
  totalEntries: number;
  byType: Record<string, number>;
  recentEntries: Pick<FanValueEntry, 'id' | 'sourceType' | 'valueType' | 'points' | 'description' | 'occurredAt' | 'status'>[];
  nonFinancialDisclaimer: string;
};

export type FanValueLedgerResponse = {
  entries: Pick<FanValueEntry, 'id' | 'sourceType' | 'sourceId' | 'points' | 'valueType' | 'status' | 'description' | 'seasonId' | 'gameweekId' | 'occurredAt' | 'createdAt'>[];
  total: number;
  limit: number;
  offset: number;
};

export type FanValueByType = { valueType: FanValueType; totalPoints: number; entryCount: number }[];
export type FanValueBySource = { sourceType: FanValueSourceType; totalPoints: number; entryCount: number }[];

export type SeasonFanValue = {
  userId: string;
  seasonId: string;
  totalPoints: number;
  byType: Record<FanValueType, number>;
};

export type GameweekFanValue = {
  userId: string;
  gameweekId: string;
  totalPoints: number;
  byType: Record<FanValueType, number>;
};

export type AdminPlatformSummary = {
  totalPoints: number;
  totalEntries: number;
  totalUsers: number;
  byType: Record<string, number>;
  bySource: Record<string, number>;
  recentEntries: Pick<FanValueEntry, 'id' | 'userId' | 'sourceType' | 'valueType' | 'points' | 'description' | 'occurredAt' | 'status'>[];
  nonFinancialDisclaimer: string;
};

export type AdminPostEntryBody = {
  userId: string;
  points: number;
  valueType?: FanValueType;
  sourceId?: string;
  description?: string;
  idempotencyKey: string;
  metadataJson?: object;
};

export type VoidEntryBody = { reason: string };

function buildQuery(params: Record<string, string | undefined>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v!)}`)
    .join('&');
  return q ? `?${q}` : '';
}

export const fanValueClient = {
  // Fan routes
  getSummary(): Promise<FanValueSummary> {
    return req<FanValueSummary>(fanValueUrl('/summary'));
  },

  getLedger(params?: {
    valueType?: FanValueType;
    sourceType?: FanValueSourceType;
    seasonId?: string;
    gameweekId?: string;
    limit?: number;
    offset?: number;
  }): Promise<FanValueLedgerResponse> {
    const q = buildQuery({
      valueType: params?.valueType,
      sourceType: params?.sourceType,
      seasonId: params?.seasonId,
      gameweekId: params?.gameweekId,
      limit: params?.limit?.toString(),
      offset: params?.offset?.toString(),
    });
    return req<FanValueLedgerResponse>(fanValueUrl(`/ledger${q}`));
  },

  getByType(): Promise<FanValueByType> {
    return req<FanValueByType>(fanValueUrl('/by-type'));
  },

  getBySource(): Promise<FanValueBySource> {
    return req<FanValueBySource>(fanValueUrl('/by-source'));
  },

  getSeasonValue(seasonId: string): Promise<SeasonFanValue> {
    return req<SeasonFanValue>(fanValueUrl(`/seasons/${seasonId}`));
  },

  getGameweekValue(gameweekId: string): Promise<GameweekFanValue> {
    return req<GameweekFanValue>(fanValueUrl(`/gameweeks/${gameweekId}`));
  },

  // Admin routes
  adminGetSummary(params?: {
    valueType?: FanValueType;
    sourceType?: FanValueSourceType;
    seasonId?: string;
    gameweekId?: string;
  }): Promise<AdminPlatformSummary> {
    const q = buildQuery({
      valueType: params?.valueType,
      sourceType: params?.sourceType,
      seasonId: params?.seasonId,
      gameweekId: params?.gameweekId,
    });
    return req<AdminPlatformSummary>(fanValueUrl(`/admin/summary${q}`));
  },

  adminGetUserLedger(userId: string, params?: {
    valueType?: FanValueType;
    sourceType?: FanValueSourceType;
    limit?: number;
    offset?: number;
  }): Promise<FanValueLedgerResponse> {
    const q = buildQuery({
      valueType: params?.valueType,
      sourceType: params?.sourceType,
      limit: params?.limit?.toString(),
      offset: params?.offset?.toString(),
    });
    return req<FanValueLedgerResponse>(fanValueUrl(`/admin/users/${userId}/ledger${q}`));
  },

  adminPostEntry(body: AdminPostEntryBody): Promise<FanValueEntry> {
    return req<FanValueEntry>(fanValueUrl('/admin/entries'), {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  adminVoidEntry(entryId: string, reason: string): Promise<FanValueEntry> {
    return req<FanValueEntry>(fanValueUrl(`/admin/entries/${entryId}/void`), {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  adminPostSponsorEngagement(body: {
    userId: string;
    points: number;
    description?: string;
    idempotencyKey: string;
    metadataJson?: object;
  }): Promise<FanValueEntry> {
    return req<FanValueEntry>(fanValueUrl('/admin/sponsor-engagement-ready'), {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};
