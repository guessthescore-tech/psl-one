const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

async function apiFetch(path: string, token: string, options?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export function getGlobalFeed(token: string, params?: { type?: string; limit?: number; offset?: number }) {
  const q = new URLSearchParams();
  if (params?.type) q.set('type', params.type);
  if (params?.limit !== undefined) q.set('limit', String(params.limit));
  if (params?.offset !== undefined) q.set('offset', String(params.offset));
  return apiFetch(`/activity-feed?${q.toString()}`, token);
}

export function getMyFeed(token: string, params?: { type?: string; limit?: number; offset?: number }) {
  const q = new URLSearchParams();
  if (params?.type) q.set('type', params.type);
  if (params?.limit !== undefined) q.set('limit', String(params.limit));
  if (params?.offset !== undefined) q.set('offset', String(params.offset));
  return apiFetch(`/activity-feed/me?${q.toString()}`, token);
}

export function getActivityDetail(token: string, id: string) {
  return apiFetch(`/activity-feed/${id}`, token);
}

export function addReaction(token: string, id: string, reactionType: string) {
  return apiFetch(`/activity-feed/${id}/reactions`, token, {
    method: 'POST',
    body: JSON.stringify({ reactionType }),
  });
}

export function removeReaction(token: string, id: string, reactionType: string) {
  return apiFetch(`/activity-feed/${id}/reactions/${reactionType}`, token, { method: 'DELETE' });
}

export function hideOwnActivity(token: string, id: string) {
  return apiFetch(`/activity-feed/${id}/hide`, token, { method: 'POST' });
}

export function getAdminFeed(token: string, params?: { type?: string; status?: string; visibility?: string; limit?: number; offset?: number }) {
  const q = new URLSearchParams();
  if (params?.type) q.set('type', params.type);
  if (params?.status) q.set('status', params.status);
  if (params?.visibility) q.set('visibility', params.visibility);
  if (params?.limit !== undefined) q.set('limit', String(params.limit));
  if (params?.offset !== undefined) q.set('offset', String(params.offset));
  return apiFetch(`/activity-feed/admin?${q.toString()}`, token);
}

export function getAdminStats(token: string) {
  return apiFetch('/activity-feed/admin/stats', token);
}

export function createSystemActivity(token: string, dto: { type: string; title: string; body: string; visibility?: string }) {
  return apiFetch('/activity-feed/admin/system', token, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function createLiveMatchAlert(token: string, dto: { fixtureId: string; title: string; body: string }) {
  return apiFetch('/activity-feed/admin/live-match-alert', token, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function adminHideActivity(token: string, id: string, reason?: string) {
  return apiFetch(`/activity-feed/admin/${id}/hide`, token, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export function adminUnhideActivity(token: string, id: string) {
  return apiFetch(`/activity-feed/admin/${id}/unhide`, token, { method: 'POST' });
}
