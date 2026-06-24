import { Inject, Injectable } from '@nestjs/common';
import { CACHE_PROVIDER, CacheProvider, CacheSetOptions } from './cache.interface';

@Injectable()
export class ApiCacheService {
  constructor(
    @Inject(CACHE_PROVIDER)
    private readonly provider: CacheProvider,
  ) {}

  get<T>(key: string): T | undefined {
    return this.provider.get<T>(key);
  }

  set<T>(key: string, value: T, options: CacheSetOptions): void {
    this.provider.set(key, value, options);
  }

  delete(key: string): void {
    this.provider.delete(key);
  }

  deleteByPrefix(prefix: string): void {
    this.provider.deleteByPrefix(prefix);
  }

  flush(): void {
    this.provider.flush();
  }

  size(): number {
    return this.provider.size();
  }
}
