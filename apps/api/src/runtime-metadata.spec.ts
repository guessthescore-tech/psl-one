import 'reflect-metadata';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { getRuntimeMetadata } from './runtime-metadata';

describe('getRuntimeMetadata', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllEnvs();
  });

  it('returns safe local defaults when build metadata is absent', () => {
    vi.stubEnv('NODE_ENV', 'test');
    delete process.env['APP_VERSION'];
    delete process.env['ENVIRONMENT_LABEL'];
    delete process.env['GIT_SHA'];
    delete process.env['BUILD_TIMESTAMP'];

    expect(getRuntimeMetadata()).toEqual({
      version: '0.1.0',
      environment: 'test',
      environmentLabel: 'test',
      gitSha: 'local',
      buildTimestamp: 'local',
    });
  });

  it('returns provided deployment metadata without infrastructure identifiers', () => {
    vi.stubEnv('APP_VERSION', '0.1.0');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ENVIRONMENT_LABEL', 'staging');
    vi.stubEnv('GIT_SHA', 'abc123');
    vi.stubEnv('BUILD_TIMESTAMP', '2026-06-15T10:00:00Z');

    expect(getRuntimeMetadata()).toEqual({
      version: '0.1.0',
      environment: 'production',
      environmentLabel: 'staging',
      gitSha: 'abc123',
      buildTimestamp: '2026-06-15T10:00:00Z',
    });
  });
});
