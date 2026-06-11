import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsInt, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FantasyCalibrationService } from './fantasy-calibration.service';
import { UpdateRulesDto } from '../fantasy/fantasy-rules-config.service';

class UpdatePlayerPriceDto {
  @IsInt()
  @Min(1)
  price!: number;
}

@Controller('fantasy/admin/calibration')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class FantasyCalibrationController {
  constructor(private readonly calibrationService: FantasyCalibrationService) {}

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
  getFantasyRules(@Param('seasonId') seasonId: string) {
    return this.calibrationService.getFantasyRules(seasonId);
  }

  @Post(':seasonId/rules')
  createProvisionalRules(@Param('seasonId') seasonId: string) {
    return this.calibrationService.createProvisionalRules(seasonId);
  }

  @Patch(':seasonId/rules')
  updateFantasyRules(@Param('seasonId') seasonId: string, @Body() dto: UpdateRulesDto) {
    return this.calibrationService.updateFantasyRules(seasonId, dto);
  }

  @Get(':seasonId/players')
  getPlayerPriceReadiness(@Param('seasonId') seasonId: string) {
    return this.calibrationService.getPlayerPriceReadiness(seasonId);
  }

  @Post(':seasonId/players/generate-prices')
  generateProvisionalPrices(@Param('seasonId') seasonId: string) {
    return this.calibrationService.generateProvisionalPrices(seasonId);
  }

  @Patch(':seasonId/players/:playerId/price')
  updatePlayerPrice(
    @Param('seasonId') seasonId: string,
    @Param('playerId') playerId: string,
    @Body() dto: UpdatePlayerPriceDto,
  ) {
    return this.calibrationService.updatePlayerPrice(seasonId, playerId, dto.price);
  }

  @Get(':seasonId/squads')
  getSquadReadiness(@Param('seasonId') seasonId: string) {
    return this.calibrationService.getSquadReadiness(seasonId);
  }

  @Get(':seasonId/gameweeks')
  getGameweekReadiness(@Param('seasonId') seasonId: string) {
    return this.calibrationService.getGameweekReadiness(seasonId);
  }

  @Post(':seasonId/gameweeks/derive-deadlines')
  deriveGameweekDeadlines(@Param('seasonId') seasonId: string) {
    return this.calibrationService.deriveGameweekDeadlines(seasonId);
  }

  @Get(':seasonId/activation-impact')
  getActivationImpact(@Param('seasonId') seasonId: string) {
    return this.calibrationService.getActivationImpact(seasonId);
  }
}
