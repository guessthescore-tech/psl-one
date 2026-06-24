import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { ApiCacheService } from './api-cache.service';
import { CacheInvalidationService } from './cache-invalidation.service';
import { InMemoryCacheAdapter } from './adapters/in-memory-cache.adapter';
import { CACHE_PROVIDER } from './cache.interface';

// ── InMemoryCacheAdapter ────────────────────────────────────────────────────

describe('InMemoryCacheAdapter', () => {
  let adapter: InMemoryCacheAdapter;

  beforeEach(() => {
    adapter = new InMemoryCacheAdapter();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('get returns undefined for missing key', () => {
    expect(adapter.get('nonexistent')).toBeUndefined();
  });

  it('set and get round-trip', () => {
    adapter.set('key1', { value: 42 }, { ttlSeconds: 60 });
    expect(adapter.get('key1')).toEqual({ value: 42 });
  });

  it('get returns undefined after TTL expires', async () => {
    adapter.set('short-ttl', 'hello', { ttlSeconds: 0 });
    await new Promise((r) => setTimeout(r, 10));
    expect(adapter.get('short-ttl')).toBeUndefined();
  });

  it('delete removes a key', () => {
    adapter.set('key2', 'value', { ttlSeconds: 60 });
    adapter.delete('key2');
    expect(adapter.get('key2')).toBeUndefined();
  });

  it('deleteByPrefix removes matching keys', () => {
    adapter.set('fixture:123:detail', 'data1', { ttlSeconds: 60 });
    adapter.set('fixture:123:stats', 'data2', { ttlSeconds: 60 });
    adapter.set('club:456', 'data3', { ttlSeconds: 60 });
    adapter.deleteByPrefix('fixture:123');
    expect(adapter.get('fixture:123:detail')).toBeUndefined();
    expect(adapter.get('fixture:123:stats')).toBeUndefined();
    expect(adapter.get('club:456')).toBe('data3');
  });

  it('flush clears all entries', () => {
    adapter.set('a', 1, { ttlSeconds: 60 });
    adapter.set('b', 2, { ttlSeconds: 60 });
    adapter.flush();
    expect(adapter.get('a')).toBeUndefined();
    expect(adapter.get('b')).toBeUndefined();
  });

  it('size counts non-expired entries', () => {
    adapter.set('x', 1, { ttlSeconds: 60 });
    adapter.set('y', 2, { ttlSeconds: 60 });
    expect(adapter.size()).toBe(2);
  });

  it('size excludes expired entries', async () => {
    adapter.set('live', 'yes', { ttlSeconds: 60 });
    adapter.set('dead', 'no', { ttlSeconds: 0 });
    await new Promise((r) => setTimeout(r, 10));
    adapter.get('dead'); // trigger eviction
    expect(adapter.size()).toBe(1);
  });

  it('handles cache miss gracefully (returns undefined)', () => {
    expect(adapter.get<string>('missing-key')).toBeUndefined();
  });

  it('overwrites existing key with new value', () => {
    adapter.set('k', 'old', { ttlSeconds: 60 });
    adapter.set('k', 'new', { ttlSeconds: 60 });
    expect(adapter.get('k')).toBe('new');
  });
});

// ── ApiCacheService ──────────────────────────────────────────────────────────

describe('ApiCacheService', () => {
  let service: ApiCacheService;
  let adapter: InMemoryCacheAdapter;

  beforeEach(async () => {
    adapter = new InMemoryCacheAdapter();
    const module = await Test.createTestingModule({
      providers: [
        ApiCacheService,
        { provide: CACHE_PROVIDER, useValue: adapter },
      ],
    }).compile();
    service = module.get<ApiCacheService>(ApiCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('get/set round-trip via service', () => {
    service.set('test-key', { data: 'value' }, { ttlSeconds: 60 });
    expect(service.get('test-key')).toEqual({ data: 'value' });
  });

  it('delete delegates to adapter', () => {
    service.set('del-key', 'val', { ttlSeconds: 60 });
    service.delete('del-key');
    expect(service.get('del-key')).toBeUndefined();
  });

  it('deleteByPrefix delegates to adapter', () => {
    service.set('news:1', 'a', { ttlSeconds: 60 });
    service.set('news:2', 'b', { ttlSeconds: 60 });
    service.set('video:1', 'c', { ttlSeconds: 60 });
    service.deleteByPrefix('news:');
    expect(service.get('news:1')).toBeUndefined();
    expect(service.get('video:1')).toBe('c');
  });

  it('flush clears all', () => {
    service.set('a', 1, { ttlSeconds: 60 });
    service.flush();
    expect(service.get('a')).toBeUndefined();
  });

  it('size reflects live entries', () => {
    service.set('k1', 1, { ttlSeconds: 60 });
    service.set('k2', 2, { ttlSeconds: 60 });
    expect(service.size()).toBe(2);
  });
});

// ── CacheInvalidationService ──────────────────────────────────────────────────

describe('CacheInvalidationService', () => {
  let service: CacheInvalidationService;
  let cache: ApiCacheService;
  let adapter: InMemoryCacheAdapter;

  beforeEach(async () => {
    adapter = new InMemoryCacheAdapter();
    const module = await Test.createTestingModule({
      providers: [
        ApiCacheService,
        CacheInvalidationService,
        { provide: CACHE_PROVIDER, useValue: adapter },
      ],
    }).compile();
    service = module.get<CacheInvalidationService>(CacheInvalidationService);
    cache = module.get<ApiCacheService>(ApiCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('invalidateFixture clears fixture and fixtures keys', () => {
    cache.set('fixture:fix-1:detail', 'd', { ttlSeconds: 60 });
    cache.set('fixtures:page=1', 'list', { ttlSeconds: 60 });
    cache.set('club:club-1', 'c', { ttlSeconds: 60 });
    service.invalidateFixture('fix-1');
    expect(cache.get('fixture:fix-1:detail')).toBeUndefined();
    expect(cache.get('fixtures:page=1')).toBeUndefined();
    expect(cache.get('club:club-1')).toBe('c');
  });

  it('invalidateLeaderboard clears leaderboard and standings keys', () => {
    cache.set('leaderboard:global', 'l', { ttlSeconds: 60 });
    cache.set('standings:season-1', 's', { ttlSeconds: 60 });
    cache.set('news:1', 'n', { ttlSeconds: 60 });
    service.invalidateLeaderboard();
    expect(cache.get('leaderboard:global')).toBeUndefined();
    expect(cache.get('standings:season-1')).toBeUndefined();
    expect(cache.get('news:1')).toBe('n');
  });

  it('invalidateClub clears club-specific and clubs list keys', () => {
    cache.set('club:club-1:profile', 'p', { ttlSeconds: 60 });
    cache.set('clubs:all', 'a', { ttlSeconds: 60 });
    service.invalidateClub('club-1');
    expect(cache.get('club:club-1:profile')).toBeUndefined();
    expect(cache.get('clubs:all')).toBeUndefined();
  });

  it('invalidateMedia clears media, news, video keys', () => {
    cache.set('media:asset-1', 'm', { ttlSeconds: 60 });
    cache.set('news:latest', 'n', { ttlSeconds: 60 });
    cache.set('video:highlights', 'v', { ttlSeconds: 60 });
    cache.set('club:club-1', 'c', { ttlSeconds: 60 });
    service.invalidateMedia();
    expect(cache.get('media:asset-1')).toBeUndefined();
    expect(cache.get('news:latest')).toBeUndefined();
    expect(cache.get('video:highlights')).toBeUndefined();
    expect(cache.get('club:club-1')).toBe('c');
  });

  it('invalidateAll flushes everything', () => {
    cache.set('a', 1, { ttlSeconds: 60 });
    cache.set('b', 2, { ttlSeconds: 60 });
    service.invalidateAll();
    expect(cache.size()).toBe(0);
  });

  it('invalidateSponsor clears sponsor-scoped keys', () => {
    cache.set('sponsor:sp-1:assets', 'a', { ttlSeconds: 60 });
    cache.set('club:club-1', 'c', { ttlSeconds: 60 });
    service.invalidateSponsor('sp-1');
    expect(cache.get('sponsor:sp-1:assets')).toBeUndefined();
    expect(cache.get('club:club-1')).toBe('c');
  });
});
