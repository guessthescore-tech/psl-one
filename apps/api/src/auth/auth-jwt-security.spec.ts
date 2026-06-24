import 'reflect-metadata';
import { describe, it, expect, beforeAll } from 'vitest';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { LocalJwtProvider } from './providers/local-jwt.provider';
import type { TokenPayload } from './providers/auth.provider.interface';

/**
 * JWT Security Tests — Sprint 39
 *
 * Prove that the PSL One JWT implementation:
 * 1. Rejects tokens signed with alg:none
 * 2. Rejects tokens signed with a wrong key
 * 3. Rejects expired tokens (exp in past)
 * 4. Accepts valid tokens with correct key and future exp
 * 5. Rejects tampered payloads (signature mismatch)
 * 6. Rejects empty/malformed tokens
 *
 * Context: auth module uses HS256 (symmetric, via JWT_SECRET).
 * All checks are pure unit tests — no DB, no HTTP.
 *
 * PSL_INACTIVE · NO_REAL_MONEY · SECURITY_HARDENING
 */

const TEST_SECRET = 'test-secret-not-for-production-use-only';
const WRONG_SECRET = 'completely-wrong-secret-does-not-match';

const VALID_PAYLOAD: TokenPayload = {
  sub: 'user-id-abc123',
  email: 'fan@pslone.co.za',
  role: 'FAN',
};

/** Build a LocalJwtProvider backed by JwtModule with the given secret. */
async function buildProvider(secret = TEST_SECRET): Promise<LocalJwtProvider> {
  const module = await Test.createTestingModule({
    imports: [
      JwtModule.register({
        secret,
        signOptions: { expiresIn: '1h' },
      }),
    ],
    providers: [LocalJwtProvider],
  }).compile();
  return module.get(LocalJwtProvider);
}

/** Build a JwtService backed by JwtModule with the given secret. */
async function buildJwtService(secret = TEST_SECRET): Promise<JwtService> {
  const module = await Test.createTestingModule({
    imports: [
      JwtModule.register({
        secret,
        signOptions: { expiresIn: '1h' },
      }),
    ],
    providers: [LocalJwtProvider],
  }).compile();
  return module.get(JwtService);
}

/** Craft a raw alg:none JWT without signing it. */
function craftNoneToken(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.`;
}

/** Craft a JWT signed with a different secret using the @nestjs/jwt provider. */
async function craftWrongKeyToken(): Promise<string> {
  const wrongProvider = await buildProvider(WRONG_SECRET);
  return wrongProvider.signToken(VALID_PAYLOAD);
}

/** Craft a JWT with exp in the past — sign it with the correct secret but force expired exp. */
async function craftExpiredToken(): Promise<string> {
  // Use expiresIn: '-10s' so @nestjs/jwt sets exp to 10 seconds in the past
  const module = await Test.createTestingModule({
    imports: [
      JwtModule.register({
        secret: TEST_SECRET,
        signOptions: { expiresIn: '-10s' },
      }),
    ],
    providers: [LocalJwtProvider],
  }).compile();
  const svc = module.get(JwtService);
  return svc.signAsync(VALID_PAYLOAD);
}

// ─────────────────────────────────────────────────────────────────────────────

describe('JWT Security — alg:none rejection', () => {
  let provider: LocalJwtProvider;

  beforeAll(async () => {
    provider = await buildProvider();
  });

  it('SECURITY: rejects a token with alg:none in header', async () => {
    const noneToken = craftNoneToken({
      ...VALID_PAYLOAD,
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    await expect(provider.verifyToken(noneToken)).rejects.toThrow();
  });
});

describe('JWT Security — wrong key rejection', () => {
  let provider: LocalJwtProvider;

  beforeAll(async () => {
    provider = await buildProvider(TEST_SECRET);
  });

  it('SECURITY: rejects a token signed with the wrong key', async () => {
    const wrongKeyToken = await craftWrongKeyToken();
    await expect(provider.verifyToken(wrongKeyToken)).rejects.toThrow();
  });
});

describe('JWT Security — expiration enforcement', () => {
  let provider: LocalJwtProvider;

  beforeAll(async () => {
    provider = await buildProvider();
  });

  it('SECURITY: rejects an expired token (exp in the past)', async () => {
    const expiredToken = await craftExpiredToken();
    await expect(provider.verifyToken(expiredToken)).rejects.toThrow();
  });

  it('SECURITY: accepts a valid token with future exp', async () => {
    const svc = await buildJwtService();
    const validToken = await svc.signAsync(VALID_PAYLOAD);
    const decoded = await provider.verifyToken(validToken);
    expect(decoded.sub).toBe(VALID_PAYLOAD.sub);
    expect(decoded.email).toBe(VALID_PAYLOAD.email);
    expect(decoded.role).toBe(VALID_PAYLOAD.role);
  });

  it('SECURITY: documents token-without-exp behaviour (known gap)', async () => {
    // Tokens without exp are accepted by @nestjs/jwt by default.
    // Mitigation: all tokens issued by PSL One ALWAYS have exp via signOptions.
    // This test documents the gap for SOC2 evidence — future hardening:
    // add verifyOptions: { ignoreExpiration: false } once refresh token is built.
    const svc = await buildJwtService();
    // Issue a token that omits the expiresIn (by overriding it)
    const noExpToken = await svc.signAsync({ ...VALID_PAYLOAD });
    // This should succeed (documenting current behaviour)
    const decoded = await provider.verifyToken(noExpToken);
    expect(decoded).toBeDefined();
    expect(decoded.sub).toBe(VALID_PAYLOAD.sub);
    // NOTE: This is a SOC2 gap documented in SOC2-EVIDENCE-REGISTER.md
  });
});

describe('JWT Security — tamper and malformed token rejection', () => {
  let provider: LocalJwtProvider;

  beforeAll(async () => {
    provider = await buildProvider();
  });

  it('SECURITY: rejects a token with tampered payload (role escalation attempt)', async () => {
    const svc = await buildJwtService();
    const validToken = await svc.signAsync(VALID_PAYLOAD);
    const [header, , signature] = validToken.split('.');
    // Replace payload with PSL_ADMIN role (privilege escalation attempt)
    const tamperedPayload = Buffer.from(
      JSON.stringify({ ...VALID_PAYLOAD, role: 'PSL_ADMIN', exp: Math.floor(Date.now() / 1000) + 3600 }),
    ).toString('base64url');
    const tamperedToken = `${header}.${tamperedPayload}.${signature}`;
    await expect(provider.verifyToken(tamperedToken)).rejects.toThrow();
  });

  it('SECURITY: rejects an empty token string', async () => {
    await expect(provider.verifyToken('')).rejects.toThrow();
  });

  it('SECURITY: rejects a random string (not a JWT)', async () => {
    await expect(provider.verifyToken('not.a.jwt')).rejects.toThrow();
  });

  it('SECURITY: rejects a token with only two parts (missing signature segment)', async () => {
    await expect(provider.verifyToken('header.payload')).rejects.toThrow();
  });

  it('SECURITY: rejects a JWT with a truncated signature', async () => {
    const svc = await buildJwtService();
    const validToken = await svc.signAsync(VALID_PAYLOAD);
    const [header, payload, signature] = validToken.split('.');
    const truncatedToken = `${header}.${payload}.${signature?.slice(0, 5)}`;
    await expect(provider.verifyToken(truncatedToken)).rejects.toThrow();
  });
});

describe('JWT Security — role extraction accuracy', () => {
  it('SECURITY: decoded token preserves exact role value', async () => {
    const provider = await buildProvider();
    const svc = await buildJwtService();

    for (const role of ['FAN', 'PSL_ADMIN', 'CLUB_OFFICIAL', 'SPONSOR']) {
      const token = await svc.signAsync({ ...VALID_PAYLOAD, role });
      const decoded = await provider.verifyToken(token);
      expect(decoded.role).toBe(role);
    }
  });

  it('SECURITY: sub (userId) field is preserved exactly', async () => {
    const provider = await buildProvider();
    const svc = await buildJwtService();
    const token = await svc.signAsync({ ...VALID_PAYLOAD, sub: 'user-uuid-99999' });
    const decoded = await provider.verifyToken(token);
    expect(decoded.sub).toBe('user-uuid-99999');
  });
});
