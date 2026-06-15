import { describe, expect, it, vi, afterEach } from 'vitest';
import { getWebRuntimeMetadata } from './runtime-metadata';

describe('getWebRuntimeMetadata', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllEnvs();
  });

  it('returns safe defaults', () => {
    vi.stubEnv('NODE_ENV', 'test');
    delete process.env['NEXT_PUBLIC_APP_VERSION'];
    delete process.env['NEXT_PUBLIC_ENVIRONMENT_LABEL'];
    delete process.env['NEXT_PUBLIC_GIT_SHA'];
    delete process.env['NEXT_PUBLIC_BUILD_TIMESTAMP'];

    expect(getWebRuntimeMetadata()).toEqual({
      service: 'web',
      status: 'ok',
      version: '0.1.0',
      environment: 'test',
      gitSha: 'local',
      buildTimestamp: 'local',
    });
  });
});
