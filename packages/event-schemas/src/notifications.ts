import { z } from 'zod';

export const NOTIFICATION_PUSH_SENT_TOPIC = 'notifications.push.sent';
export const NOTIFICATION_EMAIL_SENT_TOPIC = 'notifications.email.sent';

export const NotificationSentPayloadSchema = z.object({
  notificationId: z.string().uuid(),
  userId: z.string().uuid(),
  channel: z.enum(['PUSH', 'EMAIL', 'SMS']),
  templateId: z.string(),
  deliveredAt: z.string().datetime().optional(),
  failed: z.boolean().default(false),
  failureReason: z.string().optional(),
});

export type NotificationSentPayload = z.infer<typeof NotificationSentPayloadSchema>;
