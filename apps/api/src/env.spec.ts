import { describe, it, expect } from 'vitest';
import { parseCorsOrigins, validateEnv } from './env';

const BASE_VALID: Record<string, unknown> = {
  NODE_ENV: 'development',
  DATABASE_URL: 'postgresql://user@localhost:5432/test',
  JWT_SECRET: 'a-secret-that-is-definitely-at-least-32-chars',
  APP_BASE_URL: 'https://beta.pslone.co.za',
};

describe('validateEnv — APP_BASE_URL', () => {
  it('accepts a valid https URL', () => {
    expect(() => validateEnv({ ...BASE_VALID })).not.toThrow();
  });

  it('rejects when APP_BASE_URL is missing', () => {
    const { APP_BASE_URL: _, ...rest } = BASE_VALID;
    expect(() => validateEnv(rest)).toThrow(/APP_BASE_URL/);
  });

  it('rejects when APP_BASE_URL is not a URL', () => {
    expect(() => validateEnv({ ...BASE_VALID, APP_BASE_URL: 'not-a-url' })).toThrow(/APP_BASE_URL/);
  });
});

describe('validateEnv — SMTP fields required when EMAIL_PROVIDER=smtp', () => {
  const SMTP_VALID = {
    EMAIL_PROVIDER: 'smtp',
    SMTP_HOST: 'mail.pslone.co.za',
    SMTP_PORT: '465',
    SMTP_SECURE: 'true',
    SMTP_USER: 'no-reply@pslone.co.za',
    SMTP_PASSWORD: 'secret',
  };

  it('accepts full smtp config', () => {
    expect(() => validateEnv({ ...BASE_VALID, ...SMTP_VALID })).not.toThrow();
  });

  it('rejects when SMTP_HOST is missing', () => {
    const { SMTP_HOST: _, ...rest } = SMTP_VALID;
    expect(() => validateEnv({ ...BASE_VALID, ...rest })).toThrow(/SMTP_HOST/);
  });

  it('rejects when SMTP_PORT is missing', () => {
    const { SMTP_PORT: _, ...rest } = SMTP_VALID;
    expect(() => validateEnv({ ...BASE_VALID, ...rest })).toThrow(/SMTP_PORT/);
  });

  it('rejects when SMTP_SECURE is missing', () => {
    const { SMTP_SECURE: _, ...rest } = SMTP_VALID;
    expect(() => validateEnv({ ...BASE_VALID, ...rest })).toThrow(/SMTP_SECURE/);
  });

  it('rejects when SMTP_USER is missing', () => {
    const { SMTP_USER: _, ...rest } = SMTP_VALID;
    expect(() => validateEnv({ ...BASE_VALID, ...rest })).toThrow(/SMTP_USER/);
  });

  it('rejects when SMTP_PASSWORD is missing', () => {
    const { SMTP_PASSWORD: _, ...rest } = SMTP_VALID;
    expect(() => validateEnv({ ...BASE_VALID, ...rest })).toThrow(/SMTP_PASSWORD/);
  });

  it('does not require SMTP fields when EMAIL_PROVIDER is not smtp', () => {
    expect(() => validateEnv({ ...BASE_VALID, EMAIL_PROVIDER: 'console' })).not.toThrow();
    expect(() => validateEnv({ ...BASE_VALID, EMAIL_PROVIDER: 'null' })).not.toThrow();
    expect(() => validateEnv({ ...BASE_VALID })).not.toThrow();
  });
});

describe('parseCorsOrigins', () => {
  it('returns localhost in development when CORS_ORIGINS not set', () => {
    expect(parseCorsOrigins(undefined, 'development')).toEqual([
      'http://localhost:3001',
      'http://127.0.0.1:3001',
    ]);
  });

  it('returns localhost in test when CORS_ORIGINS not set', () => {
    expect(parseCorsOrigins(undefined, 'test')).toEqual([
      'http://localhost:3001',
      'http://127.0.0.1:3001',
    ]);
  });

  it('throws in staging when CORS_ORIGINS not set', () => {
    expect(() => parseCorsOrigins(undefined, 'staging')).toThrow(/CORS_ORIGINS must be set/);
  });

  it('throws in production when CORS_ORIGINS not set', () => {
    expect(() => parseCorsOrigins(undefined, 'production')).toThrow(/CORS_ORIGINS must be set/);
  });

  it('parses a single origin', () => {
    expect(parseCorsOrigins('https://app.pslone.co.za', 'production')).toEqual([
      'https://app.pslone.co.za',
    ]);
  });

  it('parses comma-separated origins', () => {
    const result = parseCorsOrigins(
      'https://app.pslone.co.za,https://admin.pslone.co.za',
      'production',
    );
    expect(result).toEqual(['https://app.pslone.co.za', 'https://admin.pslone.co.za']);
  });

  it('trims whitespace from entries', () => {
    const result = parseCorsOrigins('https://app.pslone.co.za , https://admin.pslone.co.za', 'production');
    expect(result).toEqual(['https://app.pslone.co.za', 'https://admin.pslone.co.za']);
  });

  it('rejects wildcard origin', () => {
    expect(() => parseCorsOrigins('*', 'production')).toThrow(/must not be "\*"/);
  });

  it('rejects malformed origins without scheme', () => {
    expect(() => parseCorsOrigins('app.pslone.co.za', 'production')).toThrow(
      /must start with http/,
    );
  });

  it('allows http:// in development', () => {
    expect(parseCorsOrigins('http://localhost:3001', 'development')).toEqual([
      'http://localhost:3001',
    ]);
  });
});
