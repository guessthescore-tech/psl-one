import { ChallengeListingVisibility } from '@prisma/client';

export class CreateListingDto {
  fixtureMarketId!: string;
  gameweekId!: string;
  seasonId!: string;
  supportingSelection!: string;
  pointsCommitmentPct!: number;
  confidenceMultiplier!: number;
  visibility?: ChallengeListingVisibility = ChallengeListingVisibility.PUBLIC;
  leagueId?: string;
  idempotencyKey!: string;
  expiresAt?: string;
}
