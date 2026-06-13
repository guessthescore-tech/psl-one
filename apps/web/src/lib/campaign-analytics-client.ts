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

// ── Admin: campaign analytics routes ─────────────────────────────────────

export function adminGetCampaignAnalytics(token: string, campaignId: string) {
  return adminFetch(`/admin/campaigns/${campaignId}/analytics`, token);
}

export function adminRecalculateCampaignAnalytics(token: string, campaignId: string, snapshotDate?: string) {
  const body = snapshotDate ? { snapshotDate } : {};
  return adminFetch(`/admin/campaigns/${campaignId}/analytics/recalculate`, token, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function adminGetSponsorAnalytics(token: string, sponsorId: string) {
  return adminFetch(`/admin/sponsors/${sponsorId}/analytics`, token);
}
