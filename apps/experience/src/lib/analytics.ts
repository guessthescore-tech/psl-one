import { apiPost } from './api';

const FORBIDDEN_KEYS = ['password', 'token', 'wallet', 'apiKey', 'api_key', 'secret', 'authorization', 'Bearer'];

function sanitize(props?: Record<string, unknown>): Record<string, string | number | boolean> {
  if (!props) return {};
  const result: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props)) {
    if (FORBIDDEN_KEYS.some(f => k.toLowerCase().includes(f.toLowerCase()))) continue;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      result[k] = v;
    }
  }
  return result;
}

export async function trackEvent(
  event: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  const safe = sanitize(properties);
  // Never throw — analytics failure must not break UX
  try {
    await apiPost('/analytics/events', { event, properties: safe });
  } catch {
    // Intentional: analytics failure is silent
  }
}
