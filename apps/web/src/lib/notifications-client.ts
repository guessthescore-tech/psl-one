const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function getInbox(
  token: string,
  params: { type?: string; status?: string; limit?: number; offset?: number } = {},
) {
  const qs = new URLSearchParams();
  if (params.type) qs.set('type', params.type);
  if (params.status) qs.set('status', params.status);
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  if (params.offset !== undefined) qs.set('offset', String(params.offset));
  const res = await fetch(`${API}/notifications?${qs}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getUnreadCount(token: string) {
  const res = await fetch(`${API}/notifications/unread-count`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getPreferences(token: string) {
  const res = await fetch(`${API}/notifications/preferences`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updatePreferences(token: string, dto: Record<string, boolean>) {
  const res = await fetch(`${API}/notifications/preferences`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getNotificationDetail(token: string, id: string) {
  const res = await fetch(`${API}/notifications/${id}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function markRead(token: string, id: string) {
  const res = await fetch(`${API}/notifications/${id}/read`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function markAllRead(token: string) {
  const res = await fetch(`${API}/notifications/read-all`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function archiveNotification(token: string, id: string) {
  const res = await fetch(`${API}/notifications/${id}/archive`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getAdminStats(token: string) {
  const res = await fetch(`${API}/notifications/admin/stats`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getAdminRecentNotifications(token: string, limit = 50) {
  const res = await fetch(`${API}/notifications/admin/recent?limit=${limit}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function adminSendToUser(
  token: string,
  userId: string,
  dto: { type: string; title: string; body: string; priority?: string; actionUrl?: string },
) {
  const res = await fetch(`${API}/notifications/admin/users/${userId}`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function adminBroadcast(
  token: string,
  dto: { type: string; title: string; body: string; priority?: string; actionUrl?: string },
) {
  const res = await fetch(`${API}/notifications/admin/broadcast`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function adminCreateFantasyDeadline(
  token: string,
  dto: { gameweekId: string; deadlineAt: string; gameweekName: string },
) {
  const res = await fetch(`${API}/notifications/admin/fantasy-deadline`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function adminCreateLiveMatchAlert(
  token: string,
  dto: { fixtureId: string; title: string; body: string },
) {
  const res = await fetch(`${API}/notifications/admin/live-match-alert`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
