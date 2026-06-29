const API = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

type ApiCampaignAction = {
  id: string;
  title: string;
  description?: string | null;
  actionType: string;
  pointsAwarded?: number;
  displayOrder?: number;
  isRequired?: boolean;
};

type ApiCampaign = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  startsAt?: string;
  endsAt?: string;
  startDate?: string;
  endDate?: string;
  maxParticipationsPerFan?: number | null;
  campaignActions?: ApiCampaignAction[];
  actions?: ApiCampaignAction[];
};

type UiCampaignAction = {
  id: string;
  actionType: string;
  label: string;
  pointValue: number;
  isRequired: boolean;
  sortOrder: number;
};

type UiCampaign = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  maxParticipationsPerFan: number;
  campaignActions: UiCampaignAction[];
};

function normalizeAction(action: ApiCampaignAction): UiCampaignAction {
  return {
    id: action.id,
    actionType: action.actionType,
    label: action.title,
    pointValue: action.pointsAwarded ?? 0,
    isRequired: action.isRequired ?? true,
    sortOrder: action.displayOrder ?? 0,
  };
}

function normalizeCampaign(campaign: ApiCampaign): UiCampaign {
  return {
    id: campaign.id,
    name: campaign.title,
    slug: campaign.slug,
    description: campaign.description,
    startDate: campaign.startsAt ?? campaign.startDate ?? null,
    endDate: campaign.endsAt ?? campaign.endDate ?? null,
    maxParticipationsPerFan: campaign.maxParticipationsPerFan ?? 0,
    campaignActions: (campaign.campaignActions ?? campaign.actions ?? []).map(normalizeAction),
  };
}

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
  return authFetch(`/fan/campaigns${qs}`, token).then((data: ApiCampaign[] | { campaigns?: ApiCampaign[] }) => {
    const campaigns = Array.isArray(data) ? data : data.campaigns ?? [];
    return { campaigns: campaigns.map(normalizeCampaign) };
  });
}

export function getPublicCampaign(token: string, slug: string) {
  return authFetch(`/fan/campaigns/${slug}`, token).then((campaign: ApiCampaign) => normalizeCampaign(campaign));
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
