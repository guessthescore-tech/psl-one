import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { SeasonSwitchingService } from './season-switching.service';
import { ActivateSeasonDto } from './dto/activate-season.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('seasons/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class SeasonSwitchingController {
  constructor(private readonly service: SeasonSwitchingService) {}

  @Get('context')
  getContext() {
    return this.service.getAdminSeasonContext();
  }

  @Get('switching/history')
  getHistory(@Query('seasonId') seasonId?: string) {
    return this.service.getSwitchHistory(seasonId);
  }

  @Get('switching/readiness/:seasonId')
  getReadiness(@Param('seasonId') seasonId: string) {
    return this.service.getSeasonSwitchReadiness(seasonId);
  }

  @Get('switching/preview/:seasonId')
  getPreview(@Param('seasonId') seasonId: string) {
    return this.service.getSeasonSwitchPreview(seasonId);
  }

  @Post('switching/activate/:seasonId')
  activate(
    @Param('seasonId') seasonId: string,
    @Body() dto: ActivateSeasonDto,
    @Request() req: { user?: { userId?: string } },
  ) {
    const userId = req.user?.userId ?? null;
    return this.service.activateSeason(seasonId, userId, dto);
  }

  @Post('switching/complete/:seasonId')
  complete(
    @Param('seasonId') seasonId: string,
    @Request() req: { user?: { userId?: string } },
  ) {
    const userId = req.user?.userId ?? null;
    return this.service.completeSeason(seasonId, userId);
  }

  @Post('switching/rollback/:seasonId')
  rollback(
    @Param('seasonId') seasonId: string,
    @Request() req: { user?: { userId?: string } },
  ) {
    const userId = req.user?.userId ?? null;
    return this.service.rollbackSeason(seasonId, userId);
  }
}
