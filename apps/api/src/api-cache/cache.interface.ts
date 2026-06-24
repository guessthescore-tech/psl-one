export interface CacheSetOptions {
  ttlSeconds: number;
}

export interface CacheProvider {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, options: CacheSetOptions): void;
  delete(key: string): void;
  deleteByPrefix(prefix: string): void;
  flush(): void;
  size(): number;
}

export const CACHE_PROVIDER = Symbol('CACHE_PROVIDER');
export const CACHE_TTL_METADATA = 'api_cache_ttl';
