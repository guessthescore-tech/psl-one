const API = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

type ApiMediaAsset = {
  id: string;
  title: string;
  slug: string;
  mediaType: string;
  description: string | null;
  thumbnailUrl: string | null;
  playbackUrl?: string | null;
  durationSeconds: number | null;
};

type UiMediaAsset = ApiMediaAsset & {
  contentUrl: string | null;
  viewCount: number;
  completionCount: number;
};

function normalizeMediaAsset(asset: ApiMediaAsset): UiMediaAsset {
  return {
    ...asset,
    contentUrl: asset.playbackUrl ?? null,
    viewCount: 0,
    completionCount: 0,
  };
}

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || res.statusText);
  }
  return res.json();
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

// ── Fan: public media routes (no auth for browse, auth for events) ────────

export function listPublicMedia(params?: { clubId?: string; type?: string }) {
  const q = new URLSearchParams();
  if (params?.clubId) q.set('clubId', params.clubId);
  if (params?.type) q.set('type', params.type);
  const qs = q.toString() ? `?${q.toString()}` : '';
  return apiFetch(`/fan/media${qs}`).then((data: ApiMediaAsset[] | { assets?: ApiMediaAsset[] }) => {
    const assets = Array.isArray(data) ? data : data.assets ?? [];
    return { assets: assets.map(normalizeMediaAsset) };
  });
}

export function getPublicMedia(slug: string) {
  return apiFetch(`/fan/media/${slug}`).then((asset: ApiMediaAsset) => normalizeMediaAsset(asset));
}

export function getClubMedia(clubId: string) {
  return apiFetch(`/fan/clubs/${clubId}/media`).then((data: ApiMediaAsset[] | { assets?: ApiMediaAsset[] }) => {
    const assets = Array.isArray(data) ? data : data.assets ?? [];
    return { assets: assets.map(normalizeMediaAsset) };
  });
}

export function recordMediaView(token: string, id: string, idempotencyKey: string) {
  return authFetch(`/fan/media/${id}/view`, token, {
    method: 'POST',
    body: JSON.stringify({ idempotencyKey }),
  });
}

export function recordMediaCompletion(token: string, id: string, idempotencyKey: string) {
  return authFetch(`/fan/media/${id}/complete`, token, {
    method: 'POST',
    body: JSON.stringify({ idempotencyKey }),
  });
}
