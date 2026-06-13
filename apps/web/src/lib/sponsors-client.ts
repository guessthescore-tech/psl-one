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

// ── Admin: sponsor management routes ─────────────────────────────────────

export function adminListSponsors(token: string, params?: { status?: string; sector?: string }) {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.sector) q.set('sector', params.sector);
  const qs = q.toString() ? `?${q.toString()}` : '';
  return adminFetch(`/admin/sponsors${qs}`, token);
}

export function adminCreateSponsor(token: string, data: Record<string, unknown>) {
  return adminFetch('/admin/sponsors', token, { method: 'POST', body: JSON.stringify(data) });
}

export function adminGetSponsor(token: string, id: string) {
  return adminFetch(`/admin/sponsors/${id}`, token);
}

export function adminUpdateSponsor(token: string, id: string, data: Record<string, unknown>) {
  return adminFetch(`/admin/sponsors/${id}`, token, { method: 'PATCH', body: JSON.stringify(data) });
}
