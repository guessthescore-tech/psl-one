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

// ── Fan: wallet sandbox routes ────────────────────────────────────────────
// Safety: wallet integration is sandbox-only. No real financial transactions.

export function fanGetWalletStatus(token: string) {
  return authFetch('/fan/wallet/status', token);
}

export function fanStartWalletLink(token: string, data: { providerSlug: string }) {
  return authFetch('/fan/wallet/link/start', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function fanConfirmWalletLink(token: string, data: { providerSlug: string; providerToken: string }) {
  return authFetch('/fan/wallet/link/confirm', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function fanUnlinkWallet(token: string, data: { providerSlug: string }) {
  return authFetch('/fan/wallet/unlink', token, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
