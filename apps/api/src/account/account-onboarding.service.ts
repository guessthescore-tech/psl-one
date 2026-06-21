import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface OnboardingStatus {
  isComplete: boolean;
  steps: {
    profileCreated: boolean;
    favouriteTeamSet: boolean;
    firstPredictionMade: boolean;
    firstChallengeCreated: boolean;
  };
  completedSteps: number;
  totalSteps: number;
}

@Injectable()
export class AccountOnboardingService {
  constructor(private prisma: PrismaService) {}

  async getOnboardingStatus(userId: string): Promise<OnboardingStatus> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true },
    });
    if (!user || !user.isActive) throw new UnauthorizedException();

    const [profile, predictionCount, challengeCount] = await Promise.all([
      this.prisma.fanProfile.findUnique({
        where: { userId },
        select: { displayName: true, preferredTeamId: true },
      }),
      this.prisma.scorePrediction.count({ where: { userId } }),
      this.prisma.predictionChallenge.count({ where: { creatorUserId: userId } }),
    ]);

    const steps = {
      profileCreated: !!profile?.displayName,
      favouriteTeamSet: !!profile?.preferredTeamId,
      firstPredictionMade: predictionCount > 0,
      firstChallengeCreated: challengeCount > 0,
    };

    const completedSteps = Object.values(steps).filter(Boolean).length;
    const totalSteps = Object.keys(steps).length;

    return {
      isComplete: completedSteps === totalSteps,
      steps,
      completedSteps,
      totalSteps,
    };
  }
}
