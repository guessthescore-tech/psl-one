import { describe, it, expect } from 'vitest';
import { APP_VERSION, HTTP_STATUS, PAGINATION_DEFAULTS, SERVICE_NAME } from './constants';
import { emailSchema, phoneSchema, paginationSchema, saIdNumberSchema } from './validation';

describe('constants', () => {
  it('APP_VERSION matches semver', () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('HTTP_STATUS.OK is 200', () => {
    expect(HTTP_STATUS.OK).toBe(200);
  });

  it('HTTP_STATUS.UNAUTHORIZED is 401', () => {
    expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
  });

  it('PAGINATION_DEFAULTS are sensible', () => {
    expect(PAGINATION_DEFAULTS.PAGE).toBe(1);
    expect(PAGINATION_DEFAULTS.LIMIT).toBe(20);
    expect(PAGINATION_DEFAULTS.MAX_LIMIT).toBe(100);
  });

  it('SERVICE_NAME.API is api', () => {
    expect(SERVICE_NAME.API).toBe('api');
  });
});

describe('emailSchema', () => {
  it('accepts valid email', () => {
    expect(emailSchema.safeParse('fan@pslone.co.za').success).toBe(true);
  });

  it('lowercases email', () => {
    const result = emailSchema.safeParse('FAN@PSLONE.CO.ZA');
    expect(result.success && result.data).toBe('fan@pslone.co.za');
  });

  it('rejects invalid email', () => {
    expect(emailSchema.safeParse('not-an-email').success).toBe(false);
  });
});

describe('phoneSchema', () => {
  it('accepts valid E.164 South African number', () => {
    expect(phoneSchema.safeParse('+27821234567').success).toBe(true);
  });

  it('rejects number without country code', () => {
    expect(phoneSchema.safeParse('0821234567').success).toBe(false);
  });

  it('rejects number with spaces', () => {
    expect(phoneSchema.safeParse('+27 82 123 4567').success).toBe(false);
  });
});

describe('paginationSchema', () => {
  it('applies defaults when no input given', () => {
    const result = paginationSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it('coerces string numbers', () => {
    const result = paginationSchema.parse({ page: '2', limit: '50' });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(50);
  });

  it('rejects limit over MAX_LIMIT', () => {
    expect(paginationSchema.safeParse({ limit: 101 }).success).toBe(false);
  });
});

describe('saIdNumberSchema', () => {
  it('accepts 13-digit ID', () => {
    expect(saIdNumberSchema.safeParse('9001015009087').success).toBe(true);
  });

  it('rejects 12-digit ID', () => {
    expect(saIdNumberSchema.safeParse('900101500908').success).toBe(false);
  });
});
