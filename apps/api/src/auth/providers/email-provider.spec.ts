import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ConfigService } from '@nestjs/config';

const { mockSendMail, mockCreateTransport } = vi.hoisted(() => {
  const mockSendMail = vi.fn().mockResolvedValue({
    messageId: 'test-msg',
    accepted: ['user@test.co.za'],
    rejected: [],
  });
  const mockCreateTransport = vi.fn().mockReturnValue({ sendMail: mockSendMail });
  return { mockSendMail, mockCreateTransport };
});

vi.mock('nodemailer', () => ({
  default: { createTransport: mockCreateTransport },
  createTransport: mockCreateTransport,
}));

import { ConsoleEmailProvider, SmtpEmailProvider } from './email-provider';

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

describe('SmtpEmailProvider — transport config', () => {
  function makeConfig(overrides: Record<string, string> = {}) {
    const values: Record<string, string> = {
      SMTP_HOST: 'mail.pslone.co.za',
      SMTP_PORT: '465',
      SMTP_SECURE: 'true',
      SMTP_USER: 'no-reply@pslone.co.za',
      SMTP_PASSWORD: 'secret',
      SMTP_FROM: 'PSL One <no-reply@pslone.co.za>',
      ...overrides,
    };
    return {
      get: vi.fn().mockImplementation((key: string) => values[key]),
      getOrThrow: vi.fn().mockImplementation((key: string) => {
        if (key in values) return values[key];
        throw new Error(`Missing config: ${key}`);
      }),
    } as unknown as ConfigService;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockSendMail.mockResolvedValue({
      messageId: 'test-msg',
      accepted: ['user@test.co.za'],
      rejected: [],
    });
    mockCreateTransport.mockReturnValue({ sendMail: mockSendMail });
  });

  it('creates transporter with port 465 and secure:true (SSL/TLS required by cPanel)', async () => {
    const provider = new SmtpEmailProvider(makeConfig());
    await provider.sendEmailVerification(
      'user@test.co.za',
      'https://beta.pslone.co.za/verify-email?token=abc',
    );

    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({ host: 'mail.pslone.co.za', port: 465, secure: true }),
    );
  });

  it('creates transporter with port 587 and secure:false when config says so', async () => {
    const provider = new SmtpEmailProvider(
      makeConfig({ SMTP_PORT: '587', SMTP_SECURE: 'false' }),
    );
    await provider.sendEmailVerification('user@test.co.za', 'https://example.com/verify?token=x');

    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({ port: 587, secure: false }),
    );
  });

  it('sendPasswordReset includes resetUrl in both text and html body', async () => {
    const provider = new SmtpEmailProvider(makeConfig());
    const resetUrl = 'https://beta.pslone.co.za/reset-password?token=deadbeef01234567';
    await provider.sendPasswordReset('user@test.co.za', resetUrl);

    const mailArg = mockSendMail.mock.calls[0]?.[0] as { text: string; html: string };
    expect(mailArg.text).toContain(resetUrl);
    expect(mailArg.html).toContain('reset-password');
  });

  it('sendEmailVerification includes verifyUrl in both text and html body', async () => {
    const provider = new SmtpEmailProvider(makeConfig());
    const verifyUrl = 'https://beta.pslone.co.za/verify-email?token=cafebabe0987';
    await provider.sendEmailVerification('user@test.co.za', verifyUrl);

    const mailArg = mockSendMail.mock.calls[0]?.[0] as { text: string; html: string };
    expect(mailArg.text).toContain(verifyUrl);
    expect(mailArg.html).toContain('verify-email');
  });

  it('transporter is reused across calls (created once, not per call)', async () => {
    const provider = new SmtpEmailProvider(makeConfig());
    await provider.sendEmailVerification('a@test.co.za', 'https://x.co/verify?token=1');
    await provider.sendPasswordReset('a@test.co.za', 'https://x.co/reset?token=2');

    expect(mockCreateTransport).toHaveBeenCalledTimes(1);
  });
});
