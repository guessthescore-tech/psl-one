import { getToken } from './auth-client';

const BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

function authedHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: authedHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${path}`);
  return res.json() as Promise<T>;
}

// Overview & seasons
export const adminGetBetaLaunchOverview = () => req('GET', '/admin/beta-launch/overview');
export const adminGetBetaLaunchSeasons = () => req('GET', '/admin/beta-launch/seasons');

// Readiness
export const adminGetReadiness = (seasonId: string) => req('GET', `/admin/beta-launch/${seasonId}/readiness`);
export const adminGetBlockers = (seasonId: string) => req('GET', `/admin/beta-launch/${seasonId}/blockers`);
export const adminGetWarnings = (seasonId: string) => req('GET', `/admin/beta-launch/${seasonId}/warnings`);
export const adminGetFrontendReadiness = (seasonId: string) => req('GET', `/admin/beta-launch/${seasonId}/frontend-readiness`);
export const adminGetDataReadiness = (seasonId: string) => req('GET', `/admin/beta-launch/${seasonId}/data-readiness`);
export const adminGetSecurityReadiness = (seasonId: string) => req('GET', `/admin/beta-launch/${seasonId}/security-readiness`);
export const adminGetOperationsReadiness = (seasonId: string) => req('GET', `/admin/beta-launch/${seasonId}/operations-readiness`);
export const adminGetBetaCohortReadiness = (seasonId: string) => req('GET', `/admin/beta-launch/${seasonId}/beta-cohort-readiness`);

// Dry runs
export const adminGetActivationPreview = (seasonId: string) => req('GET', `/admin/beta-launch/${seasonId}/activation-preview`);
export const adminRunDryRun = (seasonId: string) => req('POST', `/admin/beta-launch/${seasonId}/dry-run`);
export const adminRunRollbackDryRun = (seasonId: string) => req('POST', `/admin/beta-launch/${seasonId}/rollback-dry-run`);

// Approval
export const adminCreateApproval = (seasonId: string, dto: unknown) => req('POST', `/admin/beta-launch/${seasonId}/approve`);
export const adminRejectApproval = (seasonId: string, dto: unknown) => req('POST', `/admin/beta-launch/${seasonId}/reject`);
export const adminGetApproval = (seasonId: string) => req('GET', `/admin/beta-launch/${seasonId}/approval`);

// Cohorts
export const adminListCohorts = (seasonId?: string) => {
  const qs = seasonId ? `?seasonId=${encodeURIComponent(seasonId)}` : '';
  return req('GET', `/admin/beta-launch/cohorts${qs}`);
};
export const adminCreateCohort = (dto: unknown) => req('POST', '/admin/beta-launch/cohorts', dto);
export const adminAddCohortMember = (cohortId: string, dto: unknown) => req('POST', `/admin/beta-launch/cohorts/${cohortId}/members`, dto);
export const adminRemoveCohortMember = (cohortId: string, userId: string) => req('DELETE', `/admin/beta-launch/cohorts/${cohortId}/members/${userId}`);
export const adminStartCohort = (cohortId: string) => req('POST', `/admin/beta-launch/cohorts/${cohortId}/start`);
export const adminPauseCohort = (cohortId: string) => req('POST', `/admin/beta-launch/cohorts/${cohortId}/pause`);
export const adminCompleteCohort = (cohortId: string) => req('POST', `/admin/beta-launch/cohorts/${cohortId}/complete`);

// Smoke tests
export const adminGetSmokeTests = () => req('GET', '/admin/beta-launch/smoke-tests');
export const adminRunSmokeTests = () => req('POST', '/admin/beta-launch/smoke-tests/run');

// Runbooks
export const adminGetRunbook = (seasonId: string) => req('GET', `/admin/beta-launch/${seasonId}/runbook`);
export const adminGetWalkthrough = (seasonId: string) => req('GET', `/admin/beta-launch/${seasonId}/walkthrough`);
