/**
 * ApiCacheModule — Sprint 34
 *
 * In-memory response cache with TTL. Provider-abstracted for future Redis swap.
 * CACHE_PROVIDER token: InMemoryCacheAdapter by default.
 * Switch to Redis: set CACHE_ADAPTER=redis and wire RedisAdapter (future sprint).
 *
 * See ADR-036 for the caching strategy decision.
 */
import { Module, Global } from '@nestjs/common';
import { InMemoryCacheAdapter } from './adapters/in-memory-cache.adapter';
import { ApiCacheService } from './api-cache.service';
import { CacheInvalidationService } from './cache-invalidation.service';
import { CacheResponseInterceptor } from './interceptors/cache-response.interceptor';
import { CACHE_PROVIDER } from './cache.interface';

const cacheProvider = {
  provide: CACHE_PROVIDER,
  useClass: InMemoryCacheAdapter,
};

@Global()
@Module({
  providers: [cacheProvider, ApiCacheService, CacheInvalidationService, CacheResponseInterceptor],
  exports: [ApiCacheService, CacheInvalidationService, CacheResponseInterceptor],
})
export class ApiCacheModule {}
