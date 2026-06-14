import { PredictionMarketType } from '@prisma/client';

/**
 * DTO for creating a PredictionMarketConfig.
 *
 * NOTE: PSL One social prediction challenges use system-issued gameplay points only.
 * Gameplay points cannot be purchased, transferred, withdrawn or exchanged for money.
 * Challenge results affect platform scoring and leaderboard positions only.
 */
export class CreateMarketConfigDto {
  marketType!: PredictionMarketType;
  label!: string;
  description?: string;
  baseOpportunity?: number;
  allowedMultipliers!: number[];
  minCommitmentPct?: number;
  maxCommitmentPct?: number;
  pointsReturnRate?: number;
  seasonId!: string;
}
