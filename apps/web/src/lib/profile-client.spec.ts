import { describe, it, expect } from 'vitest';

describe('profileClient', () => {
  it('exports all expected methods', async () => {
    const { profileClient } = await import('./profile-client');
    expect(typeof profileClient.getProfile).toBe('function');
    expect(typeof profileClient.updateProfile).toBe('function');
    expect(typeof profileClient.getPreferences).toBe('function');
    expect(typeof profileClient.updatePreferences).toBe('function');
    expect(typeof profileClient.getSummary).toBe('function');
  });
});
