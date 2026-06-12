import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { PredictionRulesStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PredictionCalibrationService } from './prediction-calibration.service';

class UpdatePredictionRulesDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  correctScorePoints?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  correctGoalDifferencePoints?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  correctResultPoints?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  participationPoints?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  challengeWinPoints?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  challengeDrawPoints?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  lockMinutesBeforeKickoff?: number;

  @IsOptional()
  @IsEnum(PredictionRulesStatus)
  status?: PredictionRulesStatus;
}

@Controller('predictions/admin/calibration')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class PredictionCalibrationController {
  constructor(private readonly calibrationService: PredictionCalibrationService) {}

  @Get()
  getCalibrationSeasons() {
    return this.calibrationService.getCalibrationSeasons();
  }

  @Get(':seasonId')
  getCalibrationReadiness(@Param('seasonId') seasonId: string) {
    return this.calibrationService.getCalibrationReadiness(seasonId);
  }

  @Get(':seasonId/readiness')
  getReadinessDetail(@Param('seasonId') seasonId: string) {
    return this.calibrationService.getCalibrationReadiness(seasonId);
  }

  @Get(':seasonId/rules')
  getPredictionRules(@Param('seasonId') seasonId: string) {
    return this.calibrationService.getPredictionRules(seasonId);
  }

  @Post(':seasonId/rules')
  createProvisionalRules(@Param('seasonId') seasonId: string) {
    return this.calibrationService.createProvisionalRules(seasonId);
  }

  @Patch(':seasonId/rules')
  updatePredictionRules(@Param('seasonId') seasonId: string, @Body() dto: UpdatePredictionRulesDto) {
    return this.calibrationService.updatePredictionRules(seasonId, dto);
  }

  @Get(':seasonId/fixture-eligibility')
  getFixtureEligibility(@Param('seasonId') seasonId: string) {
    return this.calibrationService.getFixtureEligibility(seasonId);
  }

  @Get(':seasonId/lock-readiness')
  getLockReadiness(@Param('seasonId') seasonId: string) {
    return this.calibrationService.getLockReadiness(seasonId);
  }

  @Get(':seasonId/settlement-readiness')
  getSettlementReadiness(@Param('seasonId') seasonId: string) {
    return this.calibrationService.getSettlementReadiness(seasonId);
  }

  @Get(':seasonId/peer-challenge-readiness')
  getPeerChallengeReadiness(@Param('seasonId') seasonId: string) {
    return this.calibrationService.getPeerChallengeReadiness(seasonId);
  }

  @Get(':seasonId/activation-impact')
  getActivationImpact(@Param('seasonId') seasonId: string) {
    return this.calibrationService.getActivationImpact(seasonId);
  }
}
