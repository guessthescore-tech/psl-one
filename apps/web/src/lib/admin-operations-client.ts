import { getToken } from './auth-client';

const API = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

function authedHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { ...authedHeaders(), ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${path}`);
  return res.json() as Promise<T>;
}

export function getAdminOperationsOverview() {
  return apiFetch('/admin/operations/overview');
}

export function getCapabilityReview() {
  return apiFetch('/admin/operations/capability-review');
}

export function getLaunchReadiness() {
  return apiFetch('/admin/operations/launch-readiness');
}

export function getSeasonModuleReadiness(seasonId: string) {
  return apiFetch(`/admin/operations/module-readiness/${seasonId}`);
}

export function getSmokeTestRoutes() {
  return apiFetch('/admin/operations/smoke-tests/routes');
}

export function getSmokeTestRbac() {
  return apiFetch('/admin/operations/smoke-tests/rbac');
}

export function getSmokeTestWorkflows() {
  return apiFetch('/admin/operations/smoke-tests/workflows');
}

export function runSmokeTests() {
  return apiFetch('/admin/operations/smoke-tests/run', { method: 'POST' });
}

export function getIntegrationProviders() {
  return apiFetch('/admin/operations/integrations/providers');
}

export function getCommercialReadiness() {
  return apiFetch('/admin/operations/integrations/commercial-readiness');
}

export function getWalletPaymentsReadiness() {
  return apiFetch('/admin/operations/integrations/wallet-payments');
}

export function getCheckoutCommerceReadiness() {
  return apiFetch('/admin/operations/integrations/checkout-commerce');
}

export function getTicketingReadiness() {
  return apiFetch('/admin/operations/integrations/ticketing');
}

export function getLiveDataReadiness() {
  return apiFetch('/admin/operations/integrations/live-data');
}

export function getSponsorActivationReadiness() {
  return apiFetch('/admin/operations/integrations/sponsor-activation');
}

export function getRewardsRedemptionReadiness() {
  return apiFetch('/admin/operations/integrations/rewards-redemption');
}
