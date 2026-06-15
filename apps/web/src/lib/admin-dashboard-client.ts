const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

async function apiFetch(path: string, token: string) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export const getFullDashboard = (token: string) => apiFetch('/admin-dashboard', token);
export const getDashboardOverview = (token: string) => apiFetch('/admin-dashboard/overview', token);
export const getPlatformHealth = (token: string) => apiFetch('/admin-dashboard/health', token);
export const getActionRequired = (token: string) => apiFetch('/admin-dashboard/action-required', token);
export const getRecentEvents = (token: string) => apiFetch('/admin-dashboard/recent-events', token);
export const getQuickLinks = (token: string) => apiFetch('/admin-dashboard/quick-links', token);

export const getFootballSummary = (token: string) => apiFetch('/admin-dashboard/football', token);
export const getFansSummary = (token: string) => apiFetch('/admin-dashboard/fans', token);
export const getFantasySummary = (token: string) => apiFetch('/admin-dashboard/fantasy', token);
export const getPredictionsSummary = (token: string) => apiFetch('/admin-dashboard/predictions', token);
export const getChallengesSummary = (token: string) => apiFetch('/admin-dashboard/challenges', token);
export const getFanValueSummary = (token: string) => apiFetch('/admin-dashboard/fan-value', token);
export const getAchievementsSummary = (token: string) => apiFetch('/admin-dashboard/achievements', token);
export const getRewardsSummary = (token: string) => apiFetch('/admin-dashboard/rewards', token);
export const getNotificationsSummary = (token: string) => apiFetch('/admin-dashboard/notifications', token);
export const getActivitySummary = (token: string) => apiFetch('/admin-dashboard/activity', token);

export const getGuessTheScore = (token: string) => apiFetch('/admin-dashboard/guess-the-score', token);
export const getFantasyRules = (token: string) => apiFetch('/admin-dashboard/fantasy-rules', token);
export const getFantasyLeague = (token: string) => apiFetch('/admin-dashboard/fantasy-league', token);
export const getLeagueManagement = (token: string) => apiFetch('/admin-dashboard/league-management', token);
export const getFixtureManagement = (token: string) => apiFetch('/admin-dashboard/fixture-management', token);
export const getSponsorManagement = (token: string) => apiFetch('/admin-dashboard/sponsor-management', token);
export const getContentModeration = (token: string) => apiFetch('/admin-dashboard/content-moderation', token);
export const getReporting = (token: string) => apiFetch('/admin-dashboard/reporting', token);
export const getCompliance = (token: string) => apiFetch('/admin-dashboard/compliance', token);
export const getUserAudience = (token: string) => apiFetch('/admin-dashboard/user-audience', token);
export const getSystemOperations = (token: string) => apiFetch('/admin-dashboard/system-operations', token);
