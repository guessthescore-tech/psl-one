import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { CacheResponseInterceptor } from '../interceptors/cache-response.interceptor';
import { CACHE_TTL_METADATA } from '../cache.interface';

/**
 * Cache a GET endpoint response for `ttlSeconds`.
 * Uses the full request URL (path + query string) as the cache key.
 * Only caches HTTP GET requests — mutations are never cached.
 *
 * Usage: @CacheResponse(60) on a controller method.
 */
export const CacheResponse = (ttlSeconds: number) =>
  applyDecorators(
    SetMetadata(CACHE_TTL_METADATA, ttlSeconds),
    UseInterceptors(CacheResponseInterceptor),
  );
