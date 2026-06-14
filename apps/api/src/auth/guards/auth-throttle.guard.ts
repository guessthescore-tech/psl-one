import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';

interface ThrottleEntry {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 20;

/**
 * Simple in-process rate limiter for authentication endpoints.
 *
 * Trust boundary:
 *   The client IP is read from `req.ip`, which Fastify resolves based on its
 *   `trustProxy` option (set in main.ts).
 *   - Development (trustProxy: false): socket remote address — not spoofable.
 *   - Staging/production (trustProxy: true): leftmost trusted IP from
 *     X-Forwarded-For, correctly managed by Fastify after ALB sets it.
 *   Do NOT read X-Forwarded-For directly — arbitrary clients can inject it
 *   before the load balancer, bypassing rate limiting entirely.
 *
 * Classification:
 *   - Local/single-instance: BUILT
 *   - Multi-replica distributed: INFRASTRUCTURE_REQUIRED (Redis + sliding window)
 *
 * Does not distinguish between IPs behind a shared NAT — acceptable at beta scale.
 */
@Injectable()
export class AuthThrottleGuard implements CanActivate {
  private readonly store = new Map<string, ThrottleEntry>();

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ ip?: string }>();
    const ip = req.ip ?? 'unknown';

    const now = Date.now();
    const entry = this.store.get(ip);

    if (!entry || now > entry.resetAt) {
      this.store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
      return true;
    }

    if (entry.count >= MAX_REQUESTS) {
      throw new HttpException(
        { message: 'Too many requests. Please try again later.' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    entry.count++;
    return true;
  }

  /** Exposed for testing only — resets the in-memory store. */
  _resetStore() {
    this.store.clear();
  }
}
