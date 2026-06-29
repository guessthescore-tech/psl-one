import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { firstValueFrom, of, Subject } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { CacheResponseInterceptor } from './cache-response.interceptor';
import { ApiCacheService } from '../api-cache.service';
import { CACHE_TTL_METADATA } from '../cache.interface';

describe('CacheResponseInterceptor', () => {
  let cache: ApiCacheService;
  let reflector: Reflector;
  let interceptor: CacheResponseInterceptor;

  beforeEach(() => {
    const backing = new Map<string, unknown>();
    cache = {
      get: vi.fn((key: string) => backing.get(key)),
      set: vi.fn((key: string, value: unknown) => backing.set(key, value)),
      delete: vi.fn(),
      deleteByPrefix: vi.fn(),
      flush: vi.fn(),
      size: vi.fn(),
    } as unknown as ApiCacheService;

    reflector = {
      get: vi.fn((key: string) => (key === CACHE_TTL_METADATA ? 30 : undefined)),
    } as unknown as Reflector;

    interceptor = new CacheResponseInterceptor(cache, reflector);
  });

  it('deduplicates in-flight GET requests for the same cache key', async () => {
    const subject = new Subject<{ id: string }>();
    const handle = vi.fn(() => subject.asObservable());
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/fixtures?season=wc' }),
      }),
      getHandler: () => ({}),
    } as never;

    const first = interceptor.intercept(context, { handle } as never);
    const second = interceptor.intercept(context, { handle } as never);

    const firstPromise = firstValueFrom(first);
    const secondPromise = firstValueFrom(second);
    subject.next({ id: 'fixture-1' });
    subject.complete();

    await expect(firstPromise).resolves.toEqual({ id: 'fixture-1' });
    await expect(secondPromise).resolves.toEqual({ id: 'fixture-1' });
    expect(handle).toHaveBeenCalledTimes(1);
  });

  it('returns cached data immediately when present', async () => {
    const getMock = cache.get as unknown as { mockReturnValueOnce: (value: unknown) => void };
    getMock.mockReturnValueOnce({ cached: true });

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/fixtures?season=wc' }),
      }),
      getHandler: () => ({}),
    } as never;

    const result = await firstValueFrom(
      interceptor.intercept(context, { handle: vi.fn(() => of({ fresh: true })) } as never),
    );
    expect(result).toEqual({ cached: true });
  });
});
