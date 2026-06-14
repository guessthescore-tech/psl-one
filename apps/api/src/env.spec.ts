import { describe, it, expect } from 'vitest';
import { parseCorsOrigins } from './env';

describe('parseCorsOrigins', () => {
  it('returns localhost in development when CORS_ORIGINS not set', () => {
    expect(parseCorsOrigins(undefined, 'development')).toEqual(['http://localhost:3001']);
  });

  it('returns localhost in test when CORS_ORIGINS not set', () => {
    expect(parseCorsOrigins(undefined, 'test')).toEqual(['http://localhost:3001']);
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
