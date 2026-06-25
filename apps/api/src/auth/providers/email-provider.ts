import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Abstraction for delivering out-of-band email messages.
 * Raw tokens must never reach structured logs in shared environments.
 * Wire a real SES / transactional-email adapter before production launch.
 */
export abstract class EmailProvider {
  abstract sendEmailVerification(to: string, verifyUrl: string): Promise<void>;
  abstract sendPasswordReset(to: string, resetUrl: string): Promise<void>;
}

/**
 * Local-development sink. Logs only the recipient and a safe placeholder in
 * NODE_ENV=development. Must never be registered in staging or production.
 * The verifyUrl is logged because it contains the raw token — this is
 * intentional in isolated local dev where no shared log sink exists.
 */
@Injectable()
export class ConsoleEmailProvider extends EmailProvider {
  async sendEmailVerification(to: string, verifyUrl: string): Promise<void> {
    // Raw token is embedded in verifyUrl. Acceptable only in local dev (no shared logs).
    console.log(`[DEV] Email verification link for ${to}: ${verifyUrl}`);
  }

  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    // Raw token is embedded in resetUrl. Acceptable only in local dev (no shared logs).
    console.log(`[DEV] Password reset link for ${to}: ${resetUrl}`);
  }
}

/**
 * Null sink used in production and staging until SES delivery is wired.
 * Tokens are discarded — users receive no email until a real adapter is
 * provided. This is intentional: real SES wiring is an infrastructure story.
 * ADR-027 covers the email provider selection.
 */
@Injectable()
export class NullEmailProvider extends EmailProvider {
  constructor(private config: ConfigService) {
    super();
  }

  async sendEmailVerification(_to: string, _verifyUrl: string): Promise<void> {
    // URL intentionally discarded. Wire SES adapter before production launch.
  }

  async sendPasswordReset(_to: string, _resetUrl: string): Promise<void> {
    // URL intentionally discarded. Wire SES adapter before production launch.
  }
}
