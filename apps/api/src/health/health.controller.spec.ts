import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let prisma: { $queryRaw: ReturnType<typeof vi.fn> };
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/psl_test',
      JWT_SECRET: 'test-secret-at-least-32-characters-long',
      NODE_ENV: 'test',
    };
    prisma = { $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]) };
    controller = new HealthController(prisma as any);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns status ok', () => {
    const result = controller.health();
    expect(result.status).toBe('ok');
  });

  it('returns service name api', () => {
    const result = controller.health();
    expect(result.service).toBe('api');
  });

  it('returns a version string', () => {
    const result = controller.health();
    expect(result.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('returns safe deployment metadata', () => {
    const result = controller.health();
    expect(result.environment).toBeDefined();
    expect(result.gitSha).toBeDefined();
    expect(result.buildTimestamp).toBeDefined();
    expect(JSON.stringify(result)).not.toContain('DATABASE_URL');
    expect(JSON.stringify(result)).not.toContain('JWT_SECRET');
  });

  it('returns a valid ISO 8601 timestamp', () => {
    const result = controller.health();
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  it('returns readiness when database and configuration are healthy', async () => {
    const result = await controller.readiness();
    expect(result.status).toBe('ready');
    expect(result.checks.database).toBe('ok');
    expect(result.checks.configuration).toBe('ok');
    expect(prisma.$queryRaw).toHaveBeenCalledOnce();
  });

  it('throws a generic unavailable response when the database is unavailable', async () => {
    prisma.$queryRaw.mockRejectedValueOnce(new Error('database password leaked'));

    await expect(controller.readiness()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('does not expose secret details in readiness failures', async () => {
    prisma.$queryRaw.mockRejectedValueOnce(new Error('JWT_SECRET=secret DATABASE_URL=postgres'));

    try {
      await controller.readiness();
      throw new Error('readiness should have failed');
    } catch (error) {
      const response = (error as ServiceUnavailableException).getResponse();
      expect(JSON.stringify(response)).not.toContain('JWT_SECRET');
      expect(JSON.stringify(response)).not.toContain('DATABASE_URL');
      expect(JSON.stringify(response)).not.toContain('postgres');
    }
  });
});
