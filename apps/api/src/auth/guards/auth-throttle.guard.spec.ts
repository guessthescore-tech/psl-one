import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { ExecutionContext, HttpException } from '@nestjs/common';
import { AuthThrottleGuard } from './auth-throttle.guard';

function makeCtx(ip: string, xForwardedFor?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        ip,
        // X-Forwarded-For present but must not be used by the guard directly.
        // Fastify resolves req.ip from XFF when trustProxy=true (configured in main.ts).
        headers: xForwardedFor ? { 'x-forwarded-for': xForwardedFor } : {},
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('AuthThrottleGuard', () => {
  let guard: AuthThrottleGuard;

  beforeEach(() => {
    guard = new AuthThrottleGuard();
  });

  it('allows requests within the limit', () => {
    const ctx = makeCtx('1.2.3.4');
    for (let i = 0; i < 5; i++) {
      expect(guard.canActivate(ctx)).toBe(true);
    }
  });

  it('blocks requests exceeding the limit from the same IP', () => {
    const ctx = makeCtx('5.5.5.5');
    // Exhaust the limit
    for (let i = 0; i < 20; i++) {
      guard.canActivate(ctx);
    }
    expect(() => guard.canActivate(ctx)).toThrow(HttpException);
  });

  it('does not block a different IP', () => {
    const ctxA = makeCtx('10.0.0.1');
    const ctxB = makeCtx('10.0.0.2');
    for (let i = 0; i < 20; i++) {
      guard.canActivate(ctxA);
    }
    // ctxA exhausted — ctxB must still pass
    expect(guard.canActivate(ctxB)).toBe(true);
  });

  it('keys on req.ip only — spoofed X-Forwarded-For does not create a separate bucket', () => {
    // Both requests have the same req.ip (Fastify-resolved); a different spoofed
    // XFF header must NOT bypass the rate limit by creating a separate bucket.
    const ctx1 = makeCtx('203.0.113.1');
    const ctx2 = makeCtx('203.0.113.1', '1.1.1.1'); // same IP, different XFF

    // Exhaust limit via ctx1
    for (let i = 0; i < 20; i++) guard.canActivate(ctx1);
    // ctx2 has same req.ip — must also be blocked
    expect(() => guard.canActivate(ctx2)).toThrow(HttpException);
  });

  it('429 response does not disclose account existence', () => {
    const ctx = makeCtx('9.9.9.9');
    for (let i = 0; i < 20; i++) guard.canActivate(ctx);

    try {
      guard.canActivate(ctx);
    } catch (err) {
      expect(err).toBeInstanceOf(HttpException);
      const response = (err as HttpException).getResponse() as { message: string };
      expect(response.message).not.toMatch(/email|account|user|exist/i);
    }
  });
});
