import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
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

  it('returns a valid ISO 8601 timestamp', () => {
    const result = controller.health();
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });
});
