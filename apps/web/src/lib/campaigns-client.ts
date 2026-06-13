const API = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

async function authFetch(path: string, token: string, options?: RequestInit) {
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

// ── Fan: campaign discovery & participation routes ────────────────────────

export function listPublicCampaigns(token: string, params?: { sponsorId?: string; clubId?: string }) {
  const q = new URLSearchParams();
  if (params?.sponsorId) q.set('sponsorId', params.sponsorId);
  if (params?.clubId) q.set('clubId', params.clubId);
  const qs = q.toString() ? `?${q.toString()}` : '';
  return authFetch(`/fan/campaigns${qs}`, token);
}

export function getPublicCampaign(token: string, slug: string) {
  return authFetch(`/fan/campaigns/${slug}`, token);
}

export function startCampaignParticipation(token: string, campaignId: string) {
  return authFetch(`/fan/campaigns/${campaignId}/start`, token, { method: 'POST' });
}

export function completeCampaignAction(
  token: string,
  campaignId: string,
  actionId: string,
  data: { idempotencyKey: string; evidenceUrl?: string; evidenceText?: string },
) {
  return authFetch(`/fan/campaigns/${campaignId}/actions/${actionId}/complete`, token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getCampaignProgress(token: string, campaignId: string) {
  return authFetch(`/fan/campaigns/${campaignId}/progress`, token);
}
