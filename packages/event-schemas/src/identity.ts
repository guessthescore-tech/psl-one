import { z } from 'zod';

export const USER_REGISTERED_TOPIC = 'identity.user.registered';
export const USER_REGISTERED_VERSION = '1.0.0';

export const UserRegisteredPayloadSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  mobile: z.string(),
  province: z.string().optional(),
  primaryClubId: z.string().uuid().optional(),
  consentMarketing: z.boolean(),
  consentAnalytics: z.boolean(),
  consentThirdParty: z.boolean(),
});

export type UserRegisteredPayload = z.infer<typeof UserRegisteredPayloadSchema>;

export const USER_DELETED_TOPIC = 'identity.user.deleted';
export const USER_DELETED_VERSION = '1.0.0';

export const UserDeletedPayloadSchema = z.object({
  userId: z.string().uuid(),
  anonymisedAt: z.string().datetime(),
});

export type UserDeletedPayload = z.infer<typeof UserDeletedPayloadSchema>;
