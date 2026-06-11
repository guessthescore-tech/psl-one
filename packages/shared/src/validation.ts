import { z } from 'zod';
import { PAGINATION_DEFAULTS } from './constants';

export const emailSchema = z.string().email('Invalid email address').toLowerCase().trim();

export const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g. +27821234567)');

export const uuidSchema = z.string().uuid('Invalid UUID');

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens')
  .min(1)
  .max(100);

export const saIdNumberSchema = z
  .string()
  .regex(/^\d{13}$/, 'South African ID number must be 13 digits');

export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(PAGINATION_DEFAULTS.PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION_DEFAULTS.MAX_LIMIT)
    .default(PAGINATION_DEFAULTS.LIMIT),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
