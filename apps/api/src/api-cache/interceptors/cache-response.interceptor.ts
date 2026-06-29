import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { firstValueFrom, from, Observable, of, tap } from 'rxjs';
import { ApiCacheService } from '../api-cache.service';
import { CACHE_TTL_METADATA } from '../cache.interface';

@Injectable()
export class CacheResponseInterceptor implements NestInterceptor {
  private readonly inFlight = new Map<string, Promise<unknown>>();

  constructor(
    private readonly cache: ApiCacheService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ttl = this.reflector.get<number>(CACHE_TTL_METADATA, context.getHandler());
    if (!ttl) return next.handle();

    const req = context.switchToHttp().getRequest<{ url: string; method: string }>();
    if (req.method !== 'GET') return next.handle();

    const cacheKey = `http:${req.url}`;
    const cached = this.cache.get<unknown>(cacheKey);
    if (cached !== undefined) return of(cached);

    const inFlight = this.inFlight.get(cacheKey);
    if (inFlight) {
      return from(inFlight);
    }

    const request = firstValueFrom(
      next.handle().pipe(
        tap((data) => {
          if (data !== null && data !== undefined) {
            this.cache.set(cacheKey, data, { ttlSeconds: ttl });
          }
        }),
      ),
    ).finally(() => {
      this.inFlight.delete(cacheKey);
    });

    this.inFlight.set(cacheKey, request);
    return from(request);
  }
}
