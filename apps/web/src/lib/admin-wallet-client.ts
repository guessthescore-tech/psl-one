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

// ── Admin: wallet provider management routes ──────────────────────────────
// Safety: all wallet operations are sandbox-only. No production credentials.

export function adminListWalletProviders(token: string) {
  return adminFetch('/admin/wallet/providers', token);
}

export function adminCreateWalletProvider(token: string, data: Record<string, unknown>) {
  return adminFetch('/admin/wallet/providers', token, { method: 'POST', body: JSON.stringify(data) });
}

export function adminUpdateWalletProvider(token: string, id: string, data: Record<string, unknown>) {
  return adminFetch(`/admin/wallet/providers/${id}`, token, { method: 'PATCH', body: JSON.stringify(data) });
}

export function adminListWalletLinks(token: string, params?: { fanUserId?: string; status?: string }) {
  const q = new URLSearchParams();
  if (params?.fanUserId) q.set('fanUserId', params.fanUserId);
  if (params?.status) q.set('status', params.status);
  const qs = q.toString() ? `?${q.toString()}` : '';
  return adminFetch(`/admin/wallet/links${qs}`, token);
}

export function adminListWalletTransactions(token: string, params?: { fanUserId?: string; type?: string }) {
  const q = new URLSearchParams();
  if (params?.fanUserId) q.set('fanUserId', params.fanUserId);
  if (params?.type) q.set('type', params.type);
  const qs = q.toString() ? `?${q.toString()}` : '';
  return adminFetch(`/admin/wallet/transactions${qs}`, token);
}

export function adminProcessSandboxWebhook(token: string, providerSlug: string, data: Record<string, unknown>) {
  return adminFetch(`/admin/wallet/webhooks/${providerSlug}/sandbox`, token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
