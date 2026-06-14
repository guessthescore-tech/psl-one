export class GrantAllocationDto {
  gameweekId!: string;
  seasonId!: string;
  totalAllocation?: number = 500;
  maxConcurrentChallenges?: number = 10;
  maxCommitmentPctPerPrediction?: number = 50;
  maxConfidenceMultiplier?: number = 2.0;
}
