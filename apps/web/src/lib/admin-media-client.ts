const API = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

async function adminFetch(path: string, token: string, options?: RequestInit) {
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

// ── Admin: media management routes ───────────────────────────────────────

export function adminListMedia(token: string, params?: { clubId?: string; type?: string; status?: string }) {
  const q = new URLSearchParams();
  if (params?.clubId) q.set('clubId', params.clubId);
  if (params?.type) q.set('type', params.type);
  if (params?.status) q.set('status', params.status);
  const qs = q.toString() ? `?${q.toString()}` : '';
  return adminFetch(`/admin/media${qs}`, token);
}

export function adminCreateMedia(token: string, data: Record<string, unknown>) {
  return adminFetch('/admin/media', token, { method: 'POST', body: JSON.stringify(data) });
}

export function adminGetMedia(token: string, id: string) {
  return adminFetch(`/admin/media/${id}`, token);
}

export function adminUpdateMedia(token: string, id: string, data: Record<string, unknown>) {
  return adminFetch(`/admin/media/${id}`, token, { method: 'PATCH', body: JSON.stringify(data) });
}

export function adminPublishMedia(token: string, id: string) {
  return adminFetch(`/admin/media/${id}/publish`, token, { method: 'POST' });
}

export function adminArchiveMedia(token: string, id: string) {
  return adminFetch(`/admin/media/${id}/archive`, token, { method: 'POST' });
}
