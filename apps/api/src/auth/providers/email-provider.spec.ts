import 'reflect-metadata';
import { describe, it, expect, vi } from 'vitest';
import { ConsoleEmailProvider } from './email-provider';

describe('ConsoleEmailProvider', () => {
  it('does not log verification URLs or reset tokens in development', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const provider = new ConsoleEmailProvider();

    await provider.sendEmailVerification('user@test.co.za', 'https://example.com/verify?token=secret');
    await provider.sendPasswordReset('user@test.co.za', 'https://example.com/reset?token=secret');

    const combined = consoleSpy.mock.calls.flat().join(' ');
    expect(combined).not.toContain('verify?token=secret');
    expect(combined).not.toContain('reset?token=secret');
    consoleSpy.mockRestore();
  });
});
