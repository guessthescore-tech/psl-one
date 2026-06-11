import { getToken } from './auth-client';

const BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

function achUrl(path: string) {
  return `${BASE}/achievements${path}`;
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

export type AchievementStatus = 'LOCKED' | 'IN_PROGRESS' | 'UNLOCKED' | 'REVOKED';
export type AchievementCategory = 'FANTASY' | 'PREDICTIONS' | 'CHALLENGES' | 'LEAGUES' | 'PROFILE' | 'FAN_VALUE' | 'SOCIAL_READY' | 'SPONSOR_READY' | 'PLATFORM';
export type BadgeRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface AchievementBadgeSummary {
  badgeId: string;
  slug: string;
  name: string;
  rarity: BadgeRarity;
  icon: string | null;
}

export interface AchievementItem {
  definitionId: string;
  slug: string;
  name: string;
  description: string;
  category: AchievementCategory;
  triggerType: string;
  threshold: number | null;
  fanValuePoints: number;
  status: AchievementStatus;
  progress: number;
  target: number | null;
  unlockedAt: string | null;
  badges: AchievementBadgeSummary[];
}

export interface BadgeItem {
  badgeId: string;
  badgeDefinitionId: string;
  slug: string;
  name: string;
  description: string;
  rarity: BadgeRarity;
  icon: string | null;
  imageUrl: string | null;
  category: AchievementCategory;
  awardedAt: string;
  isDisplayed: boolean;
}

export interface AchievementSummary {
  userId: string;
  unlockedCount: number;
  totalCount: number;
  badgeCount: number;
  achievementPoints: number;
  recentUnlocks: { slug: string; name: string; unlockedAt: string | null }[];
  featuredBadges: { slug: string; name: string; rarity: BadgeRarity; icon: string | null }[];
}

export interface ProgressItem {
  slug: string;
  name: string;
  category: AchievementCategory;
  progress: number;
  target: number | null;
  percent: number;
}

export interface AchievementDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: AchievementCategory;
  triggerType: string;
  threshold: number | null;
  fanValuePoints: number;
  isActive: boolean;
  sortOrder: number;
}

export interface AdminAchievementStats {
  totalDefinitions: number;
  totalFanAchievements: number;
  totalUnlocked: number;
  totalBadges: number;
  unlockRate: number;
  byStatus: { status: string; count: number }[];
  recentUnlocks: AchievementItem[];
}

export interface EvaluateResult {
  userId: string;
  evaluated: number;
  results: { slug: string; awarded: boolean }[];
}

// ── Fan methods ─────────────────────────────────────────────────────────────

export const achievementsClient = {
  getAchievements(): Promise<{ achievements: AchievementItem[] }> {
    return req(achUrl(''));
  },

  getSummary(): Promise<AchievementSummary> {
    return req(achUrl('/summary'));
  },

  getProgress(): Promise<{ inProgress: ProgressItem[] }> {
    return req(achUrl('/progress'));
  },

  getBadges(): Promise<{ badges: BadgeItem[] }> {
    return req(achUrl('/badges'));
  },

  getDefinitions(params?: { category?: string; isActive?: boolean }): Promise<AchievementDefinition[]> {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.isActive !== undefined) qs.set('isActive', String(params.isActive));
    return req(achUrl(`/definitions${qs.toString() ? `?${qs}` : ''}`));
  },

  getBadgeDefinitions(params?: { category?: string; isActive?: boolean }): Promise<unknown[]> {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.isActive !== undefined) qs.set('isActive', String(params.isActive));
    return req(achUrl(`/definitions/badges${qs.toString() ? `?${qs}` : ''}`));
  },

  evaluate(): Promise<EvaluateResult> {
    return req(achUrl('/evaluate'), { method: 'POST' });
  },

  // ── Admin ──────────────────────────────────────────────────────────────────

  adminGetStats(): Promise<AdminAchievementStats> {
    return req(achUrl('/admin/stats'));
  },

  adminGetDefinitions(params?: { category?: string; isActive?: boolean }): Promise<AchievementDefinition[]> {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.isActive !== undefined) qs.set('isActive', String(params.isActive));
    return req(achUrl(`/admin/definitions${qs.toString() ? `?${qs}` : ''}`));
  },

  adminCreateDefinition(dto: Partial<AchievementDefinition>): Promise<AchievementDefinition> {
    return req(achUrl('/admin/definitions'), { method: 'POST', body: JSON.stringify(dto) });
  },

  adminUpdateDefinition(id: string, dto: Partial<AchievementDefinition>): Promise<AchievementDefinition> {
    return req(achUrl(`/admin/definitions/${id}`), { method: 'PATCH', body: JSON.stringify(dto) });
  },

  adminGetBadgeDefinitions(params?: { category?: string; isActive?: boolean }): Promise<unknown[]> {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.isActive !== undefined) qs.set('isActive', String(params.isActive));
    return req(achUrl(`/admin/badges${qs.toString() ? `?${qs}` : ''}`));
  },

  adminCreateBadge(dto: Record<string, unknown>): Promise<unknown> {
    return req(achUrl('/admin/badges'), { method: 'POST', body: JSON.stringify(dto) });
  },

  adminLinkBadge(achievementDefinitionId: string, badgeDefinitionId: string): Promise<unknown> {
    return req(achUrl('/admin/link-badge'), {
      method: 'POST',
      body: JSON.stringify({ achievementDefinitionId, badgeDefinitionId }),
    });
  },

  adminGetUserAchievements(userId: string): Promise<{ achievements: AchievementItem[] }> {
    return req(achUrl(`/admin/users/${userId}`));
  },

  adminAwardAchievement(userId: string, slug: string, metadata?: object): Promise<AchievementItem> {
    return req(achUrl(`/admin/users/${userId}/award`), {
      method: 'POST',
      body: JSON.stringify({ slug, ...(metadata ? { metadata } : {}) }),
    });
  },

  adminRevokeAchievement(userId: string, fanAchievementId: string, reason: string): Promise<AchievementItem> {
    return req(achUrl(`/admin/users/${userId}/revoke-achievement/${fanAchievementId}`), {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  adminRevokeBadge(userId: string, fanBadgeId: string, reason: string): Promise<BadgeItem> {
    return req(achUrl(`/admin/users/${userId}/revoke-badge/${fanBadgeId}`), {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  adminEvaluateUser(userId: string): Promise<EvaluateResult> {
    return req(achUrl(`/admin/evaluate/${userId}`), { method: 'POST' });
  },
};

// ── Rarity helpers ───────────────────────────────────────────────────────────

export const RARITY_COLORS: Record<BadgeRarity, string> = {
  COMMON: 'text-gray-500',
  UNCOMMON: 'text-green-600',
  RARE: 'text-blue-600',
  EPIC: 'text-purple-600',
  LEGENDARY: 'text-yellow-500',
};

export const RARITY_LABELS: Record<BadgeRarity, string> = {
  COMMON: 'Common',
  UNCOMMON: 'Uncommon',
  RARE: 'Rare',
  EPIC: 'Epic',
  LEGENDARY: 'Legendary',
};

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  FANTASY: 'Fantasy',
  PREDICTIONS: 'Predictions',
  CHALLENGES: 'Challenges',
  LEAGUES: 'Leagues',
  PROFILE: 'Profile',
  FAN_VALUE: 'Fan Value',
  SOCIAL_READY: 'Social',
  SPONSOR_READY: 'Sponsor',
  PLATFORM: 'Platform',
};

// ── Legacy standalone exports (keep for compatibility) ─────────────────────

export const getFanAchievements = () => achievementsClient.getAchievements();
export const getFanAchievementSummary = () => achievementsClient.getSummary();
export const getFanAchievementProgress = () => achievementsClient.getProgress();
export const getFanBadges = () => achievementsClient.getBadges();
export const getAchievementDefinitions = (p?: { category?: string; isActive?: boolean }) => achievementsClient.getDefinitions(p);
export const getBadgeDefinitions = (p?: { category?: string; isActive?: boolean }) => achievementsClient.getBadgeDefinitions(p);
export const getAdminAchievementStats = () => achievementsClient.adminGetStats();
export const getAdminDefinitions = (p?: { category?: string; isActive?: boolean }) => achievementsClient.adminGetDefinitions(p);
export const createAchievementDefinition = (dto: Partial<AchievementDefinition>) => achievementsClient.adminCreateDefinition(dto);
export const adminGetUserAchievements = (_adminId: string, userId: string) => achievementsClient.adminGetUserAchievements(userId);
export const adminAwardAchievement = (_adminId: string, userId: string, slug: string, metadata?: object) => achievementsClient.adminAwardAchievement(userId, slug, metadata);
export const revokeAchievement = (_adminId: string, userId: string, fanAchievementId: string, reason: string) => achievementsClient.adminRevokeAchievement(userId, fanAchievementId, reason);
export const revokeBadge = (_adminId: string, userId: string, fanBadgeId: string, reason: string) => achievementsClient.adminRevokeBadge(userId, fanBadgeId, reason);
export const evaluateUserAchievements = (_adminId: string, userId: string) => achievementsClient.adminEvaluateUser(userId);
