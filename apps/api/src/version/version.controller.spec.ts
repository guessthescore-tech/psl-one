import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { VersionController } from './version.controller';

describe('VersionController', () => {
  it('returns runtime metadata', () => {
    const controller = new VersionController();
    const result = controller.version();

    expect(result.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(result.environment).toBeDefined();
    expect(result.environmentLabel).toBeDefined();
    expect(result.gitSha).toBeDefined();
    expect(result.buildTimestamp).toBeDefined();
  });
});
