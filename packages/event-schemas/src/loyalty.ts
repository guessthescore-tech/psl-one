import { z } from 'zod';

export const LOYALTY_POINTS_AWARDED_TOPIC = 'loyalty.points.awarded';
export const LOYALTY_TIER_CHANGED_TOPIC = 'loyalty.tier.changed';

export enum LoyaltyTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  SUPERFAN = 'SUPERFAN',
}

export enum PointsEarningAction {
  REGISTRATION = 'REGISTRATION',
  DAILY_LOGIN = 'DAILY_LOGIN',
  GTS_PREDICTION = 'GTS_PREDICTION',
  GTS_EXACT_SCORE = 'GTS_EXACT_SCORE',
  GTS_CORRECT_RESULT = 'GTS_CORRECT_RESULT',
  FANTASY_SQUAD_CREATED = 'FANTASY_SQUAD_CREATED',
  CONTENT_VIEW = 'CONTENT_VIEW',
  REWARD_REDEMPTION = 'REWARD_REDEMPTION',
}

export const LoyaltyPointsAwardedPayloadSchema = z.object({
  transactionId: z.string().uuid(),
  userId: z.string().uuid(),
  points: z.number().int().positive(),
  action: z.nativeEnum(PointsEarningAction),
  referenceId: z.string().uuid().optional(),
  newBalance: z.number().int().min(0),
});

export type LoyaltyPointsAwardedPayload = z.infer<typeof LoyaltyPointsAwardedPayloadSchema>;

export const LoyaltyTierChangedPayloadSchema = z.object({
  userId: z.string().uuid(),
  previousTier: z.nativeEnum(LoyaltyTier),
  newTier: z.nativeEnum(LoyaltyTier),
  totalPoints: z.number().int().min(0),
});

export type LoyaltyTierChangedPayload = z.infer<typeof LoyaltyTierChangedPayloadSchema>;
