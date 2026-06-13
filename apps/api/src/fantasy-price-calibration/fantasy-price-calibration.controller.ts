import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { IsInt, Max, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FantasyPriceCalibrationService } from './fantasy-price-calibration.service';

class UpdatePlayerPriceDto {
  @IsInt()
  @Min(1)
  @Max(10000)
  price!: number;
}

@Controller('admin/fantasy-price-calibration')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class FantasyPriceCalibrationController {
  constructor(private readonly service: FantasyPriceCalibrationService) {}

  @Get('seasons')
  getSeasons() {
    return this.service.getSeasons();
  }

  @Get(':seasonId/overview')
  getOverview(@Param('seasonId') seasonId: string) {
    return this.service.getOverview(seasonId);
  }

  @Get(':seasonId/players')
  listPlayers(@Param('seasonId') seasonId: string) {
    return this.service.listPlayers(seasonId);
  }

  @Get(':seasonId/missing-prices')
  listMissingPrices(@Param('seasonId') seasonId: string) {
    return this.service.listMissingPrices(seasonId);
  }

  @Get(':seasonId/invalid-prices')
  listInvalidPrices(@Param('seasonId') seasonId: string) {
    return this.service.listInvalidPrices(seasonId);
  }

  @Patch(':seasonId/players/:playerId')
  updatePlayerPrice(
    @Param('seasonId') seasonId: string,
    @Param('playerId') playerId: string,
    @Body() dto: UpdatePlayerPriceDto,
    @Request() req: { user?: { userId?: string } },
  ) {
    return this.service.updatePlayerPrice(seasonId, playerId, dto.price, req.user?.userId);
  }

  @Post(':seasonId/bulk-apply-defaults')
  bulkApplyDefaults(
    @Param('seasonId') seasonId: string,
    @Request() req: { user?: { userId?: string } },
  ) {
    return this.service.bulkApplyDefaults(seasonId, req.user?.userId);
  }

  @Post(':seasonId/validate')
  validateCalibration(
    @Param('seasonId') seasonId: string,
    @Request() req: { user?: { userId?: string } },
  ) {
    return this.service.validateCalibration(seasonId, req.user?.userId);
  }

  @Post(':seasonId/publish')
  publishCalibration(
    @Param('seasonId') seasonId: string,
    @Request() req: { user?: { userId?: string } },
  ) {
    return this.service.publishCalibration(seasonId, req.user?.userId);
  }

  @Get(':seasonId/readiness')
  getReadiness(@Param('seasonId') seasonId: string) {
    return this.service.getReadiness(seasonId);
  }

  @Get(':seasonId/activation-impact')
  getActivationImpact(@Param('seasonId') seasonId: string) {
    return this.service.getActivationImpact(seasonId);
  }

  @Get(':seasonId/activation-dry-run')
  getActivationDryRun(@Param('seasonId') seasonId: string) {
    return this.service.getActivationDryRun(seasonId);
  }
}
