import { describe, it, expect, vi } from 'vitest';
import { emailProviderFactory } from './auth.module';
import { ConsoleEmailProvider, NullEmailProvider, SmtpEmailProvider } from './providers/email-provider';

function makeConfig(overrides: Record<string, string | undefined> = {}) {
  return {
    get: vi.fn((key: string) => overrides[key]),
    getOrThrow: vi.fn((key: string) => {
      const value = overrides[key];
      if (value === undefined) throw new Error(`Missing ${key}`);
      return value;
    }),
  } as never;
}

describe('emailProviderFactory', () => {
  it('uses SMTP when EMAIL_PROVIDER=smtp', () => {
    const config = makeConfig({
      EMAIL_PROVIDER: 'smtp',
      SMTP_HOST: 'smtp.example.com',
      SMTP_USER: 'user',
      SMTP_PASSWORD: 'pass',
    });
    expect(emailProviderFactory(config)).toBeInstanceOf(SmtpEmailProvider);
  });

  it('auto-detects SMTP when provider is unset but SMTP config exists', () => {
    const config = makeConfig({
      SMTP_HOST: 'smtp.example.com',
      SMTP_USER: 'user',
      SMTP_PASSWORD: 'pass',
    });
    expect(emailProviderFactory(config)).toBeInstanceOf(SmtpEmailProvider);
  });

  it('uses console provider in development when SMTP is absent', () => {
    const config = makeConfig({ NODE_ENV: 'development' });
    expect(emailProviderFactory(config)).toBeInstanceOf(ConsoleEmailProvider);
  });

  it('falls back to null provider outside development when SMTP is absent', () => {
    const config = makeConfig({ NODE_ENV: 'production' });
    expect(emailProviderFactory(config)).toBeInstanceOf(NullEmailProvider);
  });
});
