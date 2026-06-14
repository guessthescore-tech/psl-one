import { describe, it, expect } from 'vitest';
import { parseBoundedLimit, parseBoundedOffset } from './pagination';

describe('parseBoundedLimit', () => {
  it('returns default when undefined', () => {
    expect(parseBoundedLimit(undefined, 50, 200)).toBe(50);
  });

  it('returns default when empty string', () => {
    expect(parseBoundedLimit('', 50, 200)).toBe(50);
  });

  it('parses valid integer', () => {
    expect(parseBoundedLimit('10', 50, 200)).toBe(10);
  });

  it('caps at max', () => {
    expect(parseBoundedLimit('999', 50, 200)).toBe(200);
  });

  it('returns default for zero', () => {
    expect(parseBoundedLimit('0', 50, 200)).toBe(50);
  });

  it('returns default for negative', () => {
    expect(parseBoundedLimit('-5', 50, 200)).toBe(50);
  });

  it('returns default for non-numeric', () => {
    expect(parseBoundedLimit('abc', 50, 200)).toBe(50);
  });

  it('returns default for float', () => {
    // parseInt('1.5') == 1 which is valid
    expect(parseBoundedLimit('1.5', 50, 200)).toBe(1);
  });
});

describe('parseBoundedOffset', () => {
  it('returns 0 when undefined', () => {
    expect(parseBoundedOffset(undefined)).toBe(0);
  });

  it('parses valid offset', () => {
    expect(parseBoundedOffset('100')).toBe(100);
  });

  it('returns 0 for negative', () => {
    expect(parseBoundedOffset('-1')).toBe(0);
  });
});
