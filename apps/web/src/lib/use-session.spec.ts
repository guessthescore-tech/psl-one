import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock auth-client: keep WebApiError real so instanceof checks work; mock functions
vi.mock('./auth-client', async (importActual) => {
  const actual = await importActual<typeof import('./auth-client')>();
  return {
    ...actual,
    getToken: vi.fn().mockReturnValue(null),
    clearToken: vi.fn(),
    me: vi.fn(),
  };
});

import * as authClient from './auth-client';
import { WebApiError } from './auth-client';
import { validateWebSession } from './use-session';

const mockGetToken  = authClient.getToken  as ReturnType<typeof vi.fn>;
const mockClearToken = authClient.clearToken as ReturnType<typeof vi.fn>;
const mockMe        = authClient.me        as ReturnType<typeof vi.fn>;

describe('validateWebSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockReturnValue(null);
  });

  it('returns anonymous without calling me() when no token is stored', async () => {
    mockGetToken.mockReturnValue(null);
    const result = await validateWebSession();
    expect(result.status).toBe('anonymous');
    expect(mockMe).not.toHaveBeenCalled();
    expect(mockClearToken).not.toHaveBeenCalled();
  });

  it('returns authenticated when me() resolves successfully', async () => {
    mockGetToken.mockReturnValue('valid-jwt');
    mockMe.mockResolvedValue({ id: 'u1', email: 'fan@psl.co.za', role: 'FAN' });

    const result = await validateWebSession();

    expect(result.status).toBe('authenticated');
    expect(mockMe).toHaveBeenCalledOnce();
    expect(mockClearToken).not.toHaveBeenCalled();
  });

  it('returns anonymous and clears token when me() throws 401', async () => {
    mockGetToken.mockReturnValue('expired-jwt');
    mockMe.mockRejectedValue(new WebApiError(401, 'Unauthorized'));

    const result = await validateWebSession();

    expect(result.status).toBe('anonymous');
    expect(mockClearToken).toHaveBeenCalledOnce();
  });

  it('returns network-error and does NOT clear token for a 503 error', async () => {
    mockGetToken.mockReturnValue('maybe-valid-jwt');
    mockMe.mockRejectedValue(new WebApiError(503, 'Service Unavailable'));

    const result = await validateWebSession();

    expect(result.status).toBe('network-error');
    expect(mockClearToken).not.toHaveBeenCalled();
  });

  it('returns network-error and does NOT clear token for a network failure', async () => {
    mockGetToken.mockReturnValue('maybe-valid-jwt');
    mockMe.mockRejectedValue(new TypeError('Failed to fetch'));

    const result = await validateWebSession();

    expect(result.status).toBe('network-error');
    expect(mockClearToken).not.toHaveBeenCalled();
  });

  it('returns network-error for 403 Forbidden — only 401 triggers token clear', async () => {
    mockGetToken.mockReturnValue('wrong-scope-jwt');
    mockMe.mockRejectedValue(new WebApiError(403, 'Forbidden'));

    const result = await validateWebSession();

    expect(result.status).toBe('network-error');
    expect(mockClearToken).not.toHaveBeenCalled();
  });

  it('calls me() exactly once per invocation', async () => {
    mockGetToken.mockReturnValue('some-token');
    mockMe.mockResolvedValue({ id: 'u2', email: 'admin@psl.co.za', role: 'PSL_ADMIN' });

    await validateWebSession();

    expect(mockMe).toHaveBeenCalledTimes(1);
  });
});
