import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_CHANGE_EVENT, TOKEN_KEY, clearToken, setToken } from './auth';

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
}

describe('auth token change events', () => {
  beforeEach(() => {
    installBrowserGlobals();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(globalThis, 'window');
    Reflect.deleteProperty(globalThis, 'localStorage');
  });

  it('setToken writes the shared token key and dispatches psl-auth-change', () => {
    const listener = vi.fn();
    window.addEventListener(AUTH_CHANGE_EVENT, listener);

    setToken('jwt-1');

    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-1');
    expect(listener).toHaveBeenCalledOnce();
  });

  it('clearToken removes the shared token key and dispatches psl-auth-change', () => {
    localStorage.setItem(TOKEN_KEY, 'jwt-1');
    const listener = vi.fn();
    window.addEventListener(AUTH_CHANGE_EVENT, listener);

    clearToken();

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(listener).toHaveBeenCalledOnce();
  });
});
