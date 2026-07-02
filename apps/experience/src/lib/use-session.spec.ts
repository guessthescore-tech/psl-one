import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_CHANGE_EVENT, TOKEN_KEY } from './auth';
import { subscribeToSessionChanges, validateSession } from './use-session';

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  clear() {
    this.values.clear();
  }
}

function installBrowserGlobals() {
  const windowTarget = new EventTarget();
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, 'window', {
    value: windowTarget,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    configurable: true,
  });
  return { windowTarget, storage };
}

function storageEventForToken() {
  const event = new Event('storage');
  Object.defineProperty(event, 'key', { value: TOKEN_KEY });
  return event;
}

describe('validateSession', () => {
  beforeEach(() => {
    installBrowserGlobals();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(globalThis, 'window');
    Reflect.deleteProperty(globalThis, 'localStorage');
  });

  it('returns anonymous when no token exists', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(validateSession()).resolves.toEqual({ status: 'anonymous', user: null });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns authenticated when token exists and /auth/me succeeds', async () => {
    localStorage.setItem(TOKEN_KEY, 'jwt-1');
    const user = { id: 'u1', email: 'fan@example.com', role: 'FAN' };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => user,
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(validateSession()).resolves.toEqual({ status: 'authenticated', user });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/me'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-1' }),
      }),
    );
  });

  it('clears token and returns anonymous when /auth/me returns 401', async () => {
    localStorage.setItem(TOKEN_KEY, 'jwt-1');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(validateSession()).resolves.toEqual({ status: 'anonymous', user: null });
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('preserves token and returns network-error on fetch failure', async () => {
    localStorage.setItem(TOKEN_KEY, 'jwt-1');
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(validateSession()).resolves.toEqual({ status: 'network-error', user: null });
    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-1');
  });

  it('preserves token and returns network-error on non-401 API errors', async () => {
    localStorage.setItem(TOKEN_KEY, 'jwt-1');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ message: 'Service unavailable' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(validateSession()).resolves.toEqual({ status: 'network-error', user: null });
    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-1');
  });
});

describe('subscribeToSessionChanges', () => {
  beforeEach(() => {
    installBrowserGlobals();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(globalThis, 'window');
    Reflect.deleteProperty(globalThis, 'localStorage');
  });

  it('revalidates when psl-auth-change fires', () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToSessionChanges(onChange);

    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));

    expect(onChange).toHaveBeenCalledOnce();
    unsubscribe();
  });

  it('revalidates when the shared token changes in storage', () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToSessionChanges(onChange);

    window.dispatchEvent(storageEventForToken());

    expect(onChange).toHaveBeenCalledOnce();
    unsubscribe();
  });

  it('ignores storage changes for unrelated keys', () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToSessionChanges(onChange);
    const event = new Event('storage');
    Object.defineProperty(event, 'key', { value: 'unrelated' });

    window.dispatchEvent(event);

    expect(onChange).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('revalidates on window focus', () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToSessionChanges(onChange);

    window.dispatchEvent(new Event('focus'));

    expect(onChange).toHaveBeenCalledOnce();
    unsubscribe();
  });

  it('removes all listeners on unsubscribe so unmounted headers do not update', () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToSessionChanges(onChange);

    unsubscribe();
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    window.dispatchEvent(storageEventForToken());
    window.dispatchEvent(new Event('focus'));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('returns a no-op unsubscribe on the server', () => {
    Reflect.deleteProperty(globalThis, 'window');

    expect(() => subscribeToSessionChanges(() => undefined)()).not.toThrow();
  });
});
