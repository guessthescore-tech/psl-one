import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

export interface RequestContextState {
  requestId: string;
  correlationId: string;
  userId?: string;
}

function normalizeHeader(value: unknown): string | undefined {
  if (typeof value === 'string') return value.trim() || undefined;
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' ? first.trim() || undefined : undefined;
  }
  return undefined;
}

@Injectable()
export class RequestContextService {
  private readonly store = new AsyncLocalStorage<RequestContextState>();

  middleware() {
    return (req: { headers?: Record<string, unknown>; method?: string; url?: string }, res: { setHeader?: (k: string, v: string) => void }, next: () => void) => {
      const requestId =
        normalizeHeader(req.headers?.['x-request-id']) ??
        normalizeHeader(req.headers?.['x-correlation-id']) ??
        randomUUID();
      const correlationId = normalizeHeader(req.headers?.['x-correlation-id']) ?? requestId;

      const state: RequestContextState = {
        requestId,
        correlationId,
      };

      req.headers = {
        ...(req.headers ?? {}),
        'x-request-id': requestId,
        'x-correlation-id': correlationId,
      };
      res.setHeader?.('x-request-id', requestId);
      res.setHeader?.('x-correlation-id', correlationId);

      this.store.run(state, () => next());
    };
  }

  getCurrent(): RequestContextState | undefined {
    const state = this.store.getStore();
    return state ? { ...state } : undefined;
  }

  setUserId(userId: string | undefined | null): void {
    const state = this.store.getStore();
    if (!state) return;
    if (userId === undefined || userId === null || userId === '') {
      delete state.userId;
      return;
    }
    state.userId = userId;
  }
}
