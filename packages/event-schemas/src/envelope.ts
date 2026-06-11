import { z } from 'zod';

export const KafkaEventEnvelopeSchema = z.object({
  eventId: z.string().uuid(),
  eventType: z.string(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  timestamp: z.string().datetime(),
  tenantId: z.string(),
  correlationId: z.string().uuid(),
  payload: z.unknown(),
});

export type KafkaEventEnvelope<T = unknown> = {
  eventId: string;
  eventType: string;
  version: string;
  timestamp: string;
  tenantId: string;
  correlationId: string;
  payload: T;
};

export function createEvent<T>(
  eventType: string,
  version: string,
  tenantId: string,
  correlationId: string,
  payload: T,
): KafkaEventEnvelope<T> {
  return {
    eventId: crypto.randomUUID(),
    eventType,
    version,
    timestamp: new Date().toISOString(),
    tenantId,
    correlationId,
    payload,
  };
}
