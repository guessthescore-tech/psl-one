/**
 * Integration tests for CORS configuration and security headers.
 *
 * Verifies that:
 * - Permitted origins receive the correct CORS headers
 * - Unlisted origins do not receive permissive CORS headers
 * - Wildcard origin is rejected by parseCorsOrigins at configuration time
 * - Missing CORS_ORIGINS throws in staging/production
 * - Security headers are present on all responses
 * - x-powered-by is absent
 *
 * Uses a minimal NestJS Fastify app without database.
 */
import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { Controller, Get, Module } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { API_CORS_METHODS, parseCorsOrigins } from './env';

// ── Minimal controller for health check ───────────────────────────────────

@Controller()
class PingController {
  @Get('ping')
  ping() {
    return { ok: true };
  }
}

@Module({ controllers: [PingController] })
class PingModule {}

// ── CORS configuration logic tests ────────────────────────────────────────

describe('parseCorsOrigins()', () => {
  it('returns localhost:3001 fallback in development when CORS_ORIGINS not set', () => {
    expect(parseCorsOrigins(undefined, 'development')).toEqual([
      'http://localhost:3001',
      'http://127.0.0.1:3001',
    ]);
  });

  it('returns localhost:3001 fallback in test when CORS_ORIGINS not set', () => {
    expect(parseCorsOrigins(undefined, 'test')).toEqual([
      'http://localhost:3001',
      'http://127.0.0.1:3001',
    ]);
  });

  it('throws in staging when CORS_ORIGINS not set', () => {
    expect(() => parseCorsOrigins(undefined, 'staging')).toThrow('CORS_ORIGINS must be set');
  });

  it('throws in production when CORS_ORIGINS not set', () => {
    expect(() => parseCorsOrigins(undefined, 'production')).toThrow('CORS_ORIGINS must be set');
  });

  it('rejects wildcard origin', () => {
    expect(() => parseCorsOrigins('*', 'production')).toThrow('must not be "*"');
  });

  it('rejects malformed origin without http/https scheme', () => {
    expect(() => parseCorsOrigins('app.pslone.co.za', 'production')).toThrow('must start with http');
  });

  it('parses multi-origin comma-separated list', () => {
    const result = parseCorsOrigins(
      'https://app.pslone.co.za, https://admin.pslone.co.za',
      'production',
    );
    expect(result).toEqual(['https://app.pslone.co.za', 'https://admin.pslone.co.za']);
  });
});

// ── Security headers via HTTP response ────────────────────────────────────

describe('Security headers on API responses', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [PingModule],
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({ trustProxy: false }),
    );

    app.enableCors({
      origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
      credentials: true,
      methods: API_CORS_METHODS,
    });

    app.getHttpAdapter().getInstance().addHook(
      'onSend',
      async (
        _request: unknown,
        reply: { header: (k: string, v: string) => void; removeHeader: (k: string) => void },
      ) => {
        reply.header('X-Content-Type-Options', 'nosniff');
        reply.header('X-Frame-Options', 'DENY');
        reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
        reply.header('X-XSS-Protection', '0');
        reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        reply.removeHeader('x-powered-by');
      },
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('permitted origin receives Access-Control-Allow-Origin header', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/ping',
      headers: { Origin: 'http://localhost:3001' },
    });
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3001');
  });

  it('loopback IP origin also receives Access-Control-Allow-Origin header', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/ping',
      headers: { Origin: 'http://127.0.0.1:3001' },
    });
    expect(res.headers['access-control-allow-origin']).toBe('http://127.0.0.1:3001');
  });

  it('preflight allows PATCH and DELETE for authenticated browser API calls', async () => {
    const res = await app.inject({
      method: 'OPTIONS',
      url: '/ping',
      headers: {
        Origin: 'http://localhost:3001',
        'Access-Control-Request-Method': 'PATCH',
        'Access-Control-Request-Headers': 'authorization,content-type',
      },
    });
    expect(res.statusCode).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3001');
    expect(res.headers['access-control-allow-methods']).toContain('PATCH');
    expect(res.headers['access-control-allow-methods']).toContain('DELETE');
    expect(res.headers['access-control-allow-headers']).toContain('authorization');
  });

  it('unlisted origin does not receive permissive CORS headers', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/ping',
      headers: { Origin: 'https://evil.example.com' },
    });
    // Fastify CORS sets the header only for allowed origins
    expect(res.headers['access-control-allow-origin']).not.toBe('https://evil.example.com');
    expect(res.headers['access-control-allow-origin']).not.toBe('*');
  });

  it('response includes X-Content-Type-Options: nosniff', async () => {
    const res = await app.inject({ method: 'GET', url: '/ping' });
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('response includes X-Frame-Options: DENY', async () => {
    const res = await app.inject({ method: 'GET', url: '/ping' });
    expect(res.headers['x-frame-options']).toBe('DENY');
  });

  it('response includes Referrer-Policy', async () => {
    const res = await app.inject({ method: 'GET', url: '/ping' });
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  it('response includes Permissions-Policy', async () => {
    const res = await app.inject({ method: 'GET', url: '/ping' });
    expect(res.headers['permissions-policy']).toMatch(/camera=\(\)/);
  });

  it('x-powered-by header is absent', async () => {
    const res = await app.inject({ method: 'GET', url: '/ping' });
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
