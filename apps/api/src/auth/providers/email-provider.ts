import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/**
 * Abstraction for delivering out-of-band email messages.
 * Raw tokens must never reach structured logs in shared environments.
 */
export abstract class EmailProvider {
  abstract sendEmailVerification(to: string, verifyUrl: string): Promise<void>;
  abstract sendPasswordReset(to: string, resetUrl: string): Promise<void>;
}

/**
 * Local-development sink. Logs only to console — never used in staging/beta/prod.
 * verifyUrl is logged because it contains the raw token; acceptable only when
 * NODE_ENV=development with no shared log sink.
 */
@Injectable()
export class ConsoleEmailProvider extends EmailProvider {
  async sendEmailVerification(to: string, verifyUrl: string): Promise<void> {
    console.log(`[DEV] Email verification link for ${to}: ${verifyUrl}`);
  }

  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    console.log(`[DEV] Password reset link for ${to}: ${resetUrl}`);
  }
}

/**
 * Null sink used until a real transport is wired.
 * Tokens are discarded — users receive no email.
 */
@Injectable()
export class NullEmailProvider extends EmailProvider {
  constructor(private config: ConfigService) {
    super();
  }

  async sendEmailVerification(_to: string, _verifyUrl: string): Promise<void> {
    // Intentionally discarded. Wire SmtpEmailProvider or SesEmailProvider.
  }

  async sendPasswordReset(_to: string, _resetUrl: string): Promise<void> {
    // Intentionally discarded.
  }
}

/**
 * SMTP transport using nodemailer. Activated when EMAIL_PROVIDER=smtp.
 * SMTP credentials must be set in env — never in source.
 * Transporter is created lazily and reused across calls.
 */
@Injectable()
export class SmtpEmailProvider extends EmailProvider {
  private transporter: nodemailer.Transporter | null = null;

  constructor(private config: ConfigService) {
    super();
  }

  private getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      const host = this.config.getOrThrow<string>('SMTP_HOST');
      const port = parseInt(this.config.get<string>('SMTP_PORT') ?? '587', 10);
      const secure = this.config.get<string>('SMTP_SECURE') === 'true';
      const user = this.config.getOrThrow<string>('SMTP_USER');
      const pass = this.config.getOrThrow<string>('SMTP_PASSWORD');

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
      });
    }
    return this.transporter;
  }

  private get from(): string {
    return this.config.get<string>('SMTP_FROM') ?? 'PSL One <no-reply@pslone.co.za>';
  }

  async sendEmailVerification(to: string, verifyUrl: string): Promise<void> {
    const transport = this.getTransporter();
    await transport.sendMail({
      from: this.from,
      to,
      subject: 'Verify your PSL One account',
      text: [
        'Welcome to PSL One — The Digital Operating System of South African Football.',
        '',
        'Please verify your email address by clicking the link below:',
        verifyUrl,
        '',
        'This link expires in 24 hours. If you did not create an account, you can safely ignore this email.',
        '',
        '— PSL One Team',
      ].join('\n'),
      html: verificationEmailHtml(verifyUrl),
    });
  }

  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    const transport = this.getTransporter();
    await transport.sendMail({
      from: this.from,
      to,
      subject: 'Reset your PSL One password',
      text: [
        'You requested a password reset for your PSL One account.',
        '',
        'Click the link below to set a new password:',
        resetUrl,
        '',
        'This link expires in 1 hour. If you did not request a reset, please ignore this email.',
        '',
        '— PSL One Team',
      ].join('\n'),
      html: passwordResetEmailHtml(resetUrl),
    });
  }
}

function verificationEmailHtml(verifyUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0e1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e1a;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
        <tr><td style="padding-bottom:32px;text-align:center">
          <span style="font-size:24px;font-weight:900;color:#f5a623;letter-spacing:-0.5px">PSL ONE</span>
        </td></tr>
        <tr><td style="background:#111827;border-radius:12px;padding:40px">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#ffffff">Verify your email address</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#9ca3af">
            Welcome to PSL One — The Digital Operating System of South African Football.<br>
            Click below to verify your email and activate your account.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px">
            <tr><td style="border-radius:8px;background:#f5a623">
              <a href="${escapeHtml(verifyUrl)}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#0a0e1a;text-decoration:none;border-radius:8px">
                Verify Email Address
              </a>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280">Or copy this link into your browser:</p>
          <p style="margin:0 0 32px;font-size:12px;color:#6b7280;word-break:break-all">${escapeHtml(verifyUrl)}</p>
          <p style="margin:0;font-size:13px;color:#6b7280">This link expires in 24 hours. If you did not create an account, you can safely ignore this email.</p>
        </td></tr>
        <tr><td style="padding-top:24px;text-align:center">
          <p style="margin:0;font-size:12px;color:#374151">© 2026 PSL One. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function passwordResetEmailHtml(resetUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0e1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e1a;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
        <tr><td style="padding-bottom:32px;text-align:center">
          <span style="font-size:24px;font-weight:900;color:#f5a623;letter-spacing:-0.5px">PSL ONE</span>
        </td></tr>
        <tr><td style="background:#111827;border-radius:12px;padding:40px">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#ffffff">Reset your password</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#9ca3af">
            You requested a password reset for your PSL One account.<br>
            Click below to set a new password.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px">
            <tr><td style="border-radius:8px;background:#f5a623">
              <a href="${escapeHtml(resetUrl)}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#0a0e1a;text-decoration:none;border-radius:8px">
                Reset Password
              </a>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280">Or copy this link into your browser:</p>
          <p style="margin:0 0 32px;font-size:12px;color:#6b7280;word-break:break-all">${escapeHtml(resetUrl)}</p>
          <p style="margin:0;font-size:13px;color:#6b7280">This link expires in 1 hour. If you did not request a reset, please ignore this email.</p>
        </td></tr>
        <tr><td style="padding-top:24px;text-align:center">
          <p style="margin:0;font-size:12px;color:#374151">© 2026 PSL One. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
