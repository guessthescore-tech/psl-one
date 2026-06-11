export const APP_VERSION = '0.1.0';

export const API_VERSION = 'v1';

export const SERVICE_NAME = {
  API: 'api',
  IDENTITY: 'identity',
  FAN: 'fan',
  FOOTBALL: 'football',
  FANTASY: 'fantasy',
  LOYALTY: 'loyalty',
  NOTIFICATIONS: 'notifications',
  CONTENT: 'content',
  SEARCH: 'search',
} as const;

export type ServiceName = (typeof SERVICE_NAME)[keyof typeof SERVICE_NAME];

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const KAFKA_TOPICS = {
  FAN_REGISTERED: 'fan.registered',
  FAN_UPDATED: 'fan.updated',
  FAN_DELETED: 'fan.deleted',
  IDENTITY_VERIFIED: 'identity.verified',
  SESSION_CREATED: 'session.created',
  SESSION_REVOKED: 'session.revoked',
} as const;
