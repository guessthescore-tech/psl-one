/**
 * Password-reset notifier environment-selection tests.
 *
 * Requirements:
 * - NODE_ENV=development → ConsolePasswordResetNotifier (logs to stdout, local dev only)
 * - NODE_ENV=test        → NullPasswordResetNotifier  (discards token, no log)
 * - NODE_ENV=staging     → NullPasswordResetNotifier  (discards token, no log)
 * - NODE_ENV=production  → NullPasswordResetNotifier  (discards token, no log)
 *
 * Raw reset tokens must NEVER be logged in test, CI, staging, or production.
 */
import { describe, it, expect, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import {
  ConsolePasswordResetNotifier,
  NullPasswordResetNotifier,
} from './password-reset-notifier';
import { passwordResetNotifierFactory } from '../auth.module';

function makeConfig(nodeEnv: string): ConfigService {
  return {
    get: (key: string) => (key === 'NODE_ENV' ? nodeEnv : undefined),
    getOrThrow: (key: string) => {
      if (key === 'NODE_ENV') return nodeEnv;
      throw new Error(`Config key not mocked: ${key}`);
    },
  } as unknown as ConfigService;
}

// ── Factory selection ──────────────────────────────────────────────────────

describe('passwordResetNotifierFactory — provider selection', () => {
  it('development → ConsolePasswordResetNotifier', () => {
    const notifier = passwordResetNotifierFactory(makeConfig('development'));
    expect(notifier).toBeInstanceOf(ConsolePasswordResetNotifier);
  });

  it('test → NullPasswordResetNotifier', () => {
    const notifier = passwordResetNotifierFactory(makeConfig('test'));
    expect(notifier).toBeInstanceOf(NullPasswordResetNotifier);
  });

  it('staging → NullPasswordResetNotifier', () => {
    const notifier = passwordResetNotifierFactory(makeConfig('staging'));
    expect(notifier).toBeInstanceOf(NullPasswordResetNotifier);
  });

  it('production → NullPasswordResetNotifier', () => {
    const notifier = passwordResetNotifierFactory(makeConfig('production'));
    expect(notifier).toBeInstanceOf(NullPasswordResetNotifier);
  });
});

// ── NullPasswordResetNotifier safety ──────────────────────────────────────

describe('NullPasswordResetNotifier', () => {
  it('does not log the raw token in any environment', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const notifier = new NullPasswordResetNotifier(makeConfig('staging'));

    await notifier.sendPasswordResetEmail('user@test.co.za', 'super-secret-raw-token');

    const calls = consoleSpy.mock.calls.flat().join(' ');
    expect(calls).not.toContain('super-secret-raw-token');
    consoleSpy.mockRestore();
  });

  it('resolves without throwing', async () => {
    const notifier = new NullPasswordResetNotifier(makeConfig('production'));
    await expect(
      notifier.sendPasswordResetEmail('user@test.co.za', 'raw-token-abc'),
    ).resolves.toBeUndefined();
  });
});

// ── ConsolePasswordResetNotifier — dev only ────────────────────────────────

describe('ConsolePasswordResetNotifier', () => {
  it('logs in development (the expected local-dev behaviour)', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const notifier = new ConsolePasswordResetNotifier();

    await notifier.sendPasswordResetEmail('dev@local.co.za', 'dev-raw-token');

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('dev-raw-token'));
    consoleSpy.mockRestore();
  });

  it('is never constructed in test/staging/production by the factory', () => {
    for (const env of ['test', 'staging', 'production']) {
      const notifier = passwordResetNotifierFactory(makeConfig(env));
      expect(notifier).not.toBeInstanceOf(ConsolePasswordResetNotifier);
    }
  });
});
