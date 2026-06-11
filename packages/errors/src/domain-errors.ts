import { ErrorCode } from './error-codes';

export class DomainError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id: string) {
    super(ErrorCode.NOT_FOUND, `${resource} with id ${id} not found`, { resource, id });
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(ErrorCode.VALIDATION_ERROR, message, context);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'Access denied') {
    super(ErrorCode.FORBIDDEN, message);
  }
}
