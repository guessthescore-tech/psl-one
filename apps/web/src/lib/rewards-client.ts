import { getToken } from './auth-client';

const BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

function url(path: string) {
  return `${BASE}/rewards-readiness${path}`;
}

function authedHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url(path), { ...init, headers: { ...authedHeaders(), ...init?.headers } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error((err as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export type RewardReadinessStatus = 'ELIGIBLE' | 'INELIGIBLE' | 'PENDING_EVALUATION';
export type RewardReadinessCategory =
  | 'FANTASY'
  | 'PREDICTIONS'
  | 'CHALLENGES'
  | 'SPONSOR_READY'
  | 'FAN_VALUE'
  | 'LOYALTY'
  | 'PLATFORM';

export interface RewardDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: RewardReadinessCategory;
  isEnabled: boolean;
  sortOrder: number;
  minFanValuePoints: number | null;
  requiredAchievementSlugs: string[];
  requiredBadgeSlugs: string[];
  requiresFantasyTeam: boolean;
  requiresPredictionActivity: boolean;
  requiresChallengeActivity: boolean;
  unlockHint: string | null;
  sponsorName: string | null;
  notRedeemableNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface RewardReadinessRow {
  fanRewardReadinessId: string;
  definitionId: string;
  slug: string;
  name: string;
  description: string;
  category: RewardReadinessCategory;
  status: RewardReadinessStatus;
  unlockHint: string | null;
  sponsorName: string | null;
  notRedeemableNote: string;
  evaluatedAt: string | null;
  metRequirements: string[];
  unmetRequirements: string[];
}

export interface FanReadinessOverview {
  userId: string;
  totalDefinitions: number;
  eligibleCount: number;
  ineligibleCount: number;
  pendingCount: number;
  nonFinancialDisclaimer: string;
  notYetRedeemableNote: string;
  rows: RewardReadinessRow[];
}

export interface FanEligibleRewards {
  userId: string;
  eligibleCount: number;
  nonFinancialDisclaimer: string;
  notYetRedeemableNote: string;
  rewards: RewardReadinessRow[];
}

export interface FanLockedRewards {
  userId: string;
  lockedCount: number;
  nonFinancialDisclaimer: string;
  locked: RewardReadinessRow[];
}

export interface EligibilityResult {
  definitionId: string;
  slug: string;
  name: string;
  status: RewardReadinessStatus;
  metRequirements: string[];
  unmetRequirements: string[];
}

export interface AdminRewardStats {
  totalDefinitions: number;
  enabledDefinitions: number;
  totalEvaluations: number;
  eligibleCount: number;
  ineligibleCount: number;
  pendingCount: number;
  eligibilityRate: number;
  byCategory: { category: RewardReadinessCategory; count: number }[];
  nonFinancialConfirmation: string;
}

export interface EligibleFansResult {
  definitionId: string;
  definitionSlug: string;
  definitionName: string;
  total: number;
  limit: number;
  offset: number;
  fans: { fanRewardReadinessId: string; userId: string; email: string; evaluatedAt: string | null; metRequirements: string[] }[];
}

export interface EvaluateAllResult {
  evaluated: number;
  results: { userId: string; eligibleCount: number }[];
}

// ── Fan methods ──────────────────────────────────────────────────────────────

export const rewardsClient = {
  getOverview(): Promise<FanReadinessOverview> {
    return req('');
  },

  getEligible(): Promise<FanEligibleRewards> {
    return req('/eligible');
  },

  getLocked(): Promise<FanLockedRewards> {
    return req('/locked');
  },

  evaluate(): Promise<EligibilityResult[]> {
    return req('/evaluate', { method: 'POST' });
  },

  getPublicDefinitions(params?: { category?: RewardReadinessCategory }): Promise<RewardDefinition[]> {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    return req(`/definitions${qs.toString() ? `?${qs}` : ''}`);
  },

  // ── Admin ─────────────────────────────────────────────────────────────────

  adminGetStats(): Promise<AdminRewardStats> {
    return req('/admin/stats');
  },

  adminGetDefinitions(params?: { isEnabled?: boolean; category?: RewardReadinessCategory }): Promise<RewardDefinition[]> {
    const qs = new URLSearchParams();
    if (params?.isEnabled !== undefined) qs.set('isEnabled', String(params.isEnabled));
    if (params?.category) qs.set('category', params.category);
    return req(`/admin/definitions${qs.toString() ? `?${qs}` : ''}`);
  },

  adminCreateDefinition(dto: Partial<RewardDefinition>): Promise<RewardDefinition> {
    return req('/admin/definitions', { method: 'POST', body: JSON.stringify(dto) });
  },

  adminUpdateDefinition(id: string, dto: Partial<RewardDefinition>): Promise<RewardDefinition> {
    return req(`/admin/definitions/${id}`, { method: 'PATCH', body: JSON.stringify(dto) });
  },

  adminToggleDefinition(id: string): Promise<RewardDefinition> {
    return req(`/admin/definitions/${id}/toggle`, { method: 'POST' });
  },

  adminGetEligibleFans(definitionId: string, params?: { limit?: number; offset?: number }): Promise<EligibleFansResult> {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set('limit', String(params.limit));
    if (params?.offset !== undefined) qs.set('offset', String(params.offset));
    return req(`/admin/definitions/${definitionId}/eligible-fans${qs.toString() ? `?${qs}` : ''}`);
  },

  adminEvaluateFan(userId: string): Promise<EligibilityResult[]> {
    return req(`/admin/evaluate/${userId}`, { method: 'POST' });
  },

  adminEvaluateAll(): Promise<EvaluateAllResult> {
    return req('/admin/evaluate-all', { method: 'POST' });
  },
};

// ── Display helpers ───────────────────────────────────────────────────────────

export const REWARD_STATUS_LABELS: Record<RewardReadinessStatus, string> = {
  ELIGIBLE: 'Eligible',
  INELIGIBLE: 'Not Yet Eligible',
  PENDING_EVALUATION: 'Not Evaluated',
};

export const REWARD_STATUS_COLORS: Record<RewardReadinessStatus, string> = {
  ELIGIBLE: 'text-green-600',
  INELIGIBLE: 'text-red-500',
  PENDING_EVALUATION: 'text-gray-400',
};

export const REWARD_CATEGORY_LABELS: Record<RewardReadinessCategory, string> = {
  FANTASY: 'Fantasy',
  PREDICTIONS: 'Predictions',
  CHALLENGES: 'Challenges',
  SPONSOR_READY: 'Sponsor',
  FAN_VALUE: 'Fan Value',
  LOYALTY: 'Loyalty',
  PLATFORM: 'Platform',
};
