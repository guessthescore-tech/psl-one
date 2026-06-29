import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { RequestContextService } from './request-context.service';
import { StructuredLoggerService } from './structured-logger.service';

function extractUserId(user: unknown): string | undefined {
  if (!user || typeof user !== 'object') return undefined;
  const record = user as Record<string, unknown>;
  const candidate = record['sub'] ?? record['id'] ?? record['userId'];
  return typeof candidate === 'string' && candidate.length > 0 ? candidate : undefined;
}

function statusFromError(error: unknown, fallback: number): number {
  if (!error || typeof error !== 'object') return fallback;
  const exception = error as { getStatus?: () => number };
  if (typeof exception.getStatus === 'function') {
    try {
      return exception.getStatus();
    } catch {
      // Fall through to property inspection.
    }
  }

  const record = error as Record<string, unknown>;
  const status = record['statusCode'] ?? record['status'];
  return typeof status === 'number' ? status : fallback;
}

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly requestContext: RequestContextService,
    private readonly logger: StructuredLoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<{ method?: string; url?: string; user?: unknown }>();
    const res = http.getResponse<{ statusCode?: number }>();

    this.requestContext.setUserId(extractUserId(req.user));

    const startedAt = Date.now();
    const route = req.url ?? '/';
    const method = req.method ?? 'GET';

    return next.handle().pipe(
      tap(() => {
        const statusCode = res.statusCode ?? 200;
        this.logger.log({
          action: 'http.request.completed',
          method,
          route,
          statusCode,
          durationMs: Date.now() - startedAt,
        });
      }),
      catchError((error: unknown) => {
        const statusCode = statusFromError(error, res.statusCode ?? 500);
        const payload = {
          action: 'http.request.failed',
          method,
          route,
          statusCode,
          durationMs: Date.now() - startedAt,
          error: error instanceof Error ? error.message : String(error),
        };

        if (statusCode >= 500) {
          this.logger.error(payload, error instanceof Error ? error.stack : undefined);
        } else {
          this.logger.warn(payload);
        }

        return throwError(() => error);
      }),
    );
  }
}
