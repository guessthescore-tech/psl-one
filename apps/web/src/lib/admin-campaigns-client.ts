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

// ── Admin: campaign management routes ────────────────────────────────────

export function adminListCampaigns(token: string, params?: { sponsorId?: string; status?: string }) {
  const q = new URLSearchParams();
  if (params?.sponsorId) q.set('sponsorId', params.sponsorId);
  if (params?.status) q.set('status', params.status);
  const qs = q.toString() ? `?${q.toString()}` : '';
  return adminFetch(`/admin/campaigns${qs}`, token);
}

export function adminCreateCampaign(token: string, data: Record<string, unknown>) {
  return adminFetch('/admin/campaigns', token, { method: 'POST', body: JSON.stringify(data) });
}

export function adminGetCampaign(token: string, id: string) {
  return adminFetch(`/admin/campaigns/${id}`, token);
}

export function adminUpdateCampaign(token: string, id: string, data: Record<string, unknown>) {
  return adminFetch(`/admin/campaigns/${id}`, token, { method: 'PATCH', body: JSON.stringify(data) });
}

export function adminSubmitCampaignForApproval(token: string, id: string) {
  return adminFetch(`/admin/campaigns/${id}/submit-for-approval`, token, { method: 'POST' });
}

export function adminApproveCampaign(token: string, id: string, data?: { notes?: string }) {
  return adminFetch(`/admin/campaigns/${id}/approve`, token, {
    method: 'POST',
    body: JSON.stringify(data ?? {}),
  });
}

export function adminRejectCampaign(token: string, id: string, data: { reason: string }) {
  return adminFetch(`/admin/campaigns/${id}/reject`, token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function adminPublishCampaign(token: string, id: string) {
  return adminFetch(`/admin/campaigns/${id}/publish`, token, { method: 'POST' });
}

export function adminPauseCampaign(token: string, id: string) {
  return adminFetch(`/admin/campaigns/${id}/pause`, token, { method: 'POST' });
}

export function adminResumeCampaign(token: string, id: string) {
  return adminFetch(`/admin/campaigns/${id}/resume`, token, { method: 'POST' });
}

export function adminCompleteCampaign(token: string, id: string) {
  return adminFetch(`/admin/campaigns/${id}/complete`, token, { method: 'POST' });
}

export function adminArchiveCampaign(token: string, id: string) {
  return adminFetch(`/admin/campaigns/${id}/archive`, token, { method: 'POST' });
}

export function adminAddCampaignAction(token: string, campaignId: string, data: Record<string, unknown>) {
  return adminFetch(`/admin/campaigns/${campaignId}/actions`, token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function adminGetCampaignParticipations(token: string, campaignId: string) {
  return adminFetch(`/admin/campaigns/${campaignId}/participations`, token);
}
