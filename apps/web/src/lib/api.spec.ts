import { describe, it, expect } from 'vitest';
import { apiUrl } from './api';

describe('apiUrl', () => {
  it('builds a URL from a path', () => {
    const url = apiUrl('/health');
    expect(url).toContain('/health');
    expect(url).toMatch(/^https?:\/\//);
  });

  it('appends path to base', () => {
    const url = apiUrl('/version');
    expect(url.endsWith('/version')).toBe(true);
  });
});
