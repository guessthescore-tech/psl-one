import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Abstraction for delivering password-reset tokens out-of-band.
 * Raw tokens must never reach structured logs in shared environments.
 */
export abstract class PasswordResetNotifier {
  abstract sendPasswordResetEmail(email: string, rawToken: string): Promise<void>;
}

/**
 * Local-development sink. Emits a non-sensitive breadcrumb only in NODE_ENV=development.
 * Must never be registered in staging or production.
 */
@Injectable()
export class ConsolePasswordResetNotifier extends PasswordResetNotifier {
  async sendPasswordResetEmail(email: string, rawToken: string): Promise<void> {
    void email;
    void rawToken;
    console.log('[DEV] Password reset email queued');
  }
}

/**
 * Null sink used in production and staging until SES delivery is wired.
 * The token is discarded — the user receives no email until a real adapter
 * is provided. This is intentional: real SES wiring is an infrastructure story.
 */
@Injectable()
export class NullPasswordResetNotifier extends PasswordResetNotifier {
  constructor(private config: ConfigService) {
    super();
  }

  async sendPasswordResetEmail(_email: string, _rawToken: string): Promise<void> {
    // Token intentionally discarded. Wire SES adapter before production launch.
    // ADR-027 covers the email provider selection.
  }
}
