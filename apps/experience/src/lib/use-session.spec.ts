import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock auth module — control what getToken/clearToken do without needing localStorage
vi.mock('./auth', () => ({
  getToken: vi.fn().mockReturnValue(null),
  clearToken: vi.fn(),
}));

// Keep ApiError real so instanceof checks work; mock only apiFetch
vi.mock('./api', async (importActual) => {
  const actual = await importActual<typeof import('./api')>();
  return { ...actual, apiFetch: vi.fn() };
});

import * as auth from './auth';
import * as api from './api';
import { ApiError } from './api';
import { validateSession } from './use-session';

const mockGetToken = auth.getToken as ReturnType<typeof vi.fn>;
const mockClearToken = auth.clearToken as ReturnType<typeof vi.fn>;
const mockApiFetch = api.apiFetch as ReturnType<typeof vi.fn>;

describe('validateSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockReturnValue(null);
  });

  it('returns anonymous immediately and skips /auth/me when no token', async () => {
    mockGetToken.mockReturnValue(null);
    const result = await validateSession();
    expect(result.status).toBe('anonymous');
    expect(result.user).toBeNull();
    expect(mockApiFetch).not.toHaveBeenCalled();
    expect(mockClearToken).not.toHaveBeenCalled();
  });

  it('returns authenticated with user when /auth/me responds 200', async () => {
    const mockUser = { id: 'u1', email: 'fan@psl.co.za', role: 'FAN' };
    mockGetToken.mockReturnValue('valid-jwt');
    mockApiFetch.mockResolvedValue(mockUser);

    const result = await validateSession();

    expect(result.status).toBe('authenticated');
    expect(result.user).toEqual(mockUser);
    expect(mockApiFetch).toHaveBeenCalledWith('/auth/me');
    expect(mockClearToken).not.toHaveBeenCalled();
  });

  it('returns anonymous and clears token when /auth/me responds 401', async () => {
    mockGetToken.mockReturnValue('expired-jwt');
    mockApiFetch.mockRejectedValue(new ApiError(401, 'Unauthorized'));

    const result = await validateSession();

    expect(result.status).toBe('anonymous');
    expect(result.user).toBeNull();
    expect(mockClearToken).toHaveBeenCalledOnce();
  });

  it('returns network-error and preserves token for non-401 API error', async () => {
    mockGetToken.mockReturnValue('maybe-valid-jwt');
    mockApiFetch.mockRejectedValue(new ApiError(503, 'Service Unavailable'));

    const result = await validateSession();

    expect(result.status).toBe('network-error');
    expect(result.user).toBeNull();
    expect(mockClearToken).not.toHaveBeenCalled();
  });

  it('returns network-error and preserves token for actual network failure', async () => {
    mockGetToken.mockReturnValue('maybe-valid-jwt');
    mockApiFetch.mockRejectedValue(new TypeError('Failed to fetch'));

    const result = await validateSession();

    expect(result.status).toBe('network-error');
    expect(result.user).toBeNull();
    expect(mockClearToken).not.toHaveBeenCalled();
  });

  it('returns network-error and does NOT clear token for 403 Forbidden', async () => {
    mockGetToken.mockReturnValue('valid-but-no-access-jwt');
    mockApiFetch.mockRejectedValue(new ApiError(403, 'Forbidden'));

    const result = await validateSession();

    expect(result.status).toBe('network-error');
    expect(mockClearToken).not.toHaveBeenCalled();
  });

  it('calls /auth/me with the right endpoint when token is present', async () => {
    mockGetToken.mockReturnValue('some-token');
    mockApiFetch.mockResolvedValue({ id: 'u2', email: 'admin@psl.co.za', role: 'PSL_ADMIN' });

    await validateSession();

    expect(mockApiFetch).toHaveBeenCalledWith('/auth/me');
    expect(mockApiFetch).toHaveBeenCalledTimes(1);
  });
});
