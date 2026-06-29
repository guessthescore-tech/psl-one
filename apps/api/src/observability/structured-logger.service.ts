import { Injectable, LoggerService } from '@nestjs/common';
import { RequestContextService } from './request-context.service';

type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

@Injectable()
export class StructuredLoggerService implements LoggerService {
  constructor(private readonly requestContext: RequestContextService) {}

  log(message: unknown, context?: string): void {
    this.write('INFO', message, context);
  }

  warn(message: unknown, context?: string): void {
    this.write('WARN', message, context);
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.write('ERROR', message, context, trace);
  }

  debug(message: unknown, context?: string): void {
    if ((process.env['NODE_ENV'] ?? 'development') === 'production') return;
    this.write('DEBUG', message, context);
  }

  verbose(message: unknown, context?: string): void {
    this.write('DEBUG', message, context);
  }

  private write(level: LogLevel, message: unknown, context?: string, trace?: string): void {
    const requestContext = this.requestContext.getCurrent();
    const base = {
      timestamp: new Date().toISOString(),
      level,
      service: 'api',
      ...(requestContext ?? {}),
      ...(context ? { context } : {}),
    };

    const payload =
      message instanceof Error
        ? { message: message.message, stack: message.stack }
        : typeof message === 'string'
          ? { message }
          : message && typeof message === 'object'
            ? { ...(message as Record<string, unknown>) }
            : { message: String(message) };

    const entry = {
      ...base,
      ...payload,
      ...(trace ? { trace } : {}),
    };

    const line = `${JSON.stringify(entry)}\n`;
    if (level === 'ERROR') {
      process.stderr.write(line);
      return;
    }
    process.stdout.write(line);
  }
}
