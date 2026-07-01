import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production', 'staging']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    CORS_ORIGINS: z.string().optional(),

    // Required for building email verification and password-reset links
    APP_BASE_URL: z
      .string()
      .url('APP_BASE_URL must be a valid URL — e.g. https://beta.pslone.co.za'),

    // Email provider: smtp | console | null  (console = dev-only, null = silent discard)
    EMAIL_PROVIDER: z.enum(['smtp', 'console', 'null']).optional(),

    // SMTP — all five are required when EMAIL_PROVIDER=smtp (validated below)
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_SECURE: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.EMAIL_PROVIDER === 'smtp') {
      const required = [
        'SMTP_HOST',
        'SMTP_PORT',
        'SMTP_SECURE',
        'SMTP_USER',
        'SMTP_PASSWORD',
      ] as const;
      for (const key of required) {
        if (!data[key]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: `${key} is required when EMAIL_PROVIDER=smtp`,
          });
        }
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

export const API_CORS_METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Environment validation failed:\n${result.error.toString()}`);
  }
  return result.data;
}

/**
 * Parse a comma-separated CORS_ORIGINS string into an array of allowed origins.
 * Wildcard '*' is rejected because credentials: true is required for auth cookies.
 * Falls back to localhost:3001 only in development.
 */
export function parseCorsOrigins(raw: string | undefined, nodeEnv: string): string[] {
  if (!raw) {
    if (nodeEnv === 'development' || nodeEnv === 'test') {
      return ['http://localhost:3001', 'http://127.0.0.1:3001'];
    }
    throw new Error(
      'CORS_ORIGINS must be set in staging and production environments. ' +
      'Example: CORS_ORIGINS=https://app.pslone.co.za',
    );
  }

  const origins = raw.split(',').map(s => s.trim()).filter(Boolean);

  for (const origin of origins) {
    if (origin === '*') {
      throw new Error(
        'CORS_ORIGINS must not be "*" when credentials are enabled. ' +
        'Specify exact origins: CORS_ORIGINS=https://app.pslone.co.za',
      );
    }
    // Validate each entry looks like a URL scheme + host
    if (!origin.startsWith('http://') && !origin.startsWith('https://')) {
      throw new Error(
        `CORS_ORIGINS entry "${origin}" must start with http:// or https://`,
      );
    }
  }

  return origins;
}
