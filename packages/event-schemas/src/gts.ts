import { z } from 'zod';

export const GTS_PREDICTION_CREATED_TOPIC = 'gts.prediction.created';
export const GTS_PREDICTION_UPDATED_TOPIC = 'gts.prediction.updated';
export const GTS_PREDICTION_SETTLED_TOPIC = 'gts.prediction.settled';

export const GtsPredictionCreatedPayloadSchema = z.object({
  predictionId: z.string().uuid(),
  userId: z.string().uuid(),
  fixtureId: z.string().uuid(),
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
});

export type GtsPredictionCreatedPayload = z.infer<typeof GtsPredictionCreatedPayloadSchema>;

export enum GtsOutcome {
  EXACT_SCORE = 'EXACT_SCORE',
  CORRECT_RESULT = 'CORRECT_RESULT',
  INCORRECT = 'INCORRECT',
}

export const GtsPredictionSettledPayloadSchema = z.object({
  predictionId: z.string().uuid(),
  userId: z.string().uuid(),
  fixtureId: z.string().uuid(),
  outcome: z.nativeEnum(GtsOutcome),
  pointsAwarded: z.number().int().min(0),
});

export type GtsPredictionSettledPayload = z.infer<typeof GtsPredictionSettledPayloadSchema>;
