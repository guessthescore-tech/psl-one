import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { firstValueFrom, of, throwError } from 'rxjs';
import { RequestContextService } from './request-context.service';
import { StructuredLoggerService } from './structured-logger.service';
import { RequestLoggingInterceptor } from './request-logging.interceptor';

describe('observability', () => {
  let requestContext: RequestContextService;
  let logger: StructuredLoggerService;

  beforeEach(() => {
    requestContext = new RequestContextService();
    logger = new StructuredLoggerService(requestContext);
  });

  it('middleware seeds request and correlation IDs and preserves headers', () => {
    const next = vi.fn();
    const req = { method: 'GET', url: '/health', headers: { 'x-request-id': 'req-1' } };
    const res = { setHeader: vi.fn() };

    requestContext.middleware()(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', 'req-1');
    expect(res.setHeader).toHaveBeenCalledWith('x-correlation-id', 'req-1');
  });

  it('structured logger emits JSON with request context attached', () => {
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true as never);
    requestContext.middleware()(
      { method: 'GET', url: '/fixtures', headers: {} },
      { setHeader: vi.fn() },
      () => {
        requestContext.setUserId('user-1');
        logger.log({ action: 'test.event', foo: 'bar' });
      },
    );
    const payload = JSON.parse(String(writeSpy.mock.calls[0]?.[0]));

    expect(payload.action).toBe('test.event');
    expect(payload.foo).toBe('bar');
    expect(payload.userId).toBe('user-1');
    expect(payload.level).toBe('INFO');
    writeSpy.mockRestore();
  });

  it('request logging interceptor records successful requests', async () => {
    const logSpy = vi.spyOn(logger, 'log');
    const interceptor = new RequestLoggingInterceptor(requestContext, logger);
    let resultPromise: Promise<unknown> | undefined;

    requestContext.middleware()(
      { method: 'POST', url: '/profile', headers: {} },
      { setHeader: vi.fn() },
      () => {
        const context = {
          switchToHttp: () => ({
            getRequest: () => ({ method: 'POST', url: '/profile', user: { sub: 'user-1' } }),
            getResponse: () => ({ statusCode: 200 }),
          }),
        } as never;

        resultPromise = firstValueFrom(interceptor.intercept(context, { handle: () => of('ok') } as never));
      },
    );

    await expect(resultPromise).resolves.toBe('ok');

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'http.request.completed',
        method: 'POST',
        route: '/profile',
        statusCode: 200,
      }),
    );
    logSpy.mockRestore();
  });

  it('request logging interceptor records failures with warn/error levels', async () => {
    const warnSpy = vi.spyOn(logger, 'warn');
    const interceptor = new RequestLoggingInterceptor(requestContext, logger);
    let resultPromise: Promise<unknown> | undefined;

    requestContext.middleware()(
      { method: 'POST', url: '/profile', headers: {} },
      { setHeader: vi.fn() },
      () => {
        const context = {
          switchToHttp: () => ({
            getRequest: () => ({ method: 'POST', url: '/profile', user: { sub: 'user-1' } }),
            getResponse: () => ({ statusCode: 400 }),
          }),
        } as never;

        resultPromise = firstValueFrom(
          interceptor.intercept(context, {
            handle: () => throwError(() => ({ status: 400, message: 'Bad Request' })),
          } as never),
        );
      },
    );

    await expect(resultPromise).rejects.toMatchObject({ status: 400 });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'http.request.failed',
        method: 'POST',
        route: '/profile',
        statusCode: 400,
      }),
    );
    warnSpy.mockRestore();
  });
});
