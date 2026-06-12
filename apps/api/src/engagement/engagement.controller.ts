import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EngagementService } from './engagement.service';

@Controller('admin/engagement')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Get('seasons')
  listEngagementSeasons() {
    return this.engagementService.listEngagementSeasons();
  }

  @Get(':seasonId/overview')
  getEngagementOverview(@Param('seasonId') seasonId: string) {
    return this.engagementService.getEngagementOverview(seasonId);
  }

  @Get(':seasonId/leaderboards')
  getEngagementLeaderboards(@Param('seasonId') seasonId: string) {
    return this.engagementService.getEngagementLeaderboards(seasonId);
  }

  @Get(':seasonId/fan-value')
  getEngagementFanValue(@Param('seasonId') seasonId: string) {
    return this.engagementService.getEngagementFanValue(seasonId);
  }

  @Get(':seasonId/fantasy')
  getEngagementFantasy(@Param('seasonId') seasonId: string) {
    return this.engagementService.getEngagementFantasy(seasonId);
  }

  @Get(':seasonId/predictions')
  getEngagementPredictions(@Param('seasonId') seasonId: string) {
    return this.engagementService.getEngagementPredictions(seasonId);
  }

  @Get(':seasonId/achievements')
  getEngagementAchievements(@Param('seasonId') seasonId: string) {
    return this.engagementService.getEngagementAchievements(seasonId);
  }

  @Get(':seasonId/unscoped-ledger')
  getUnscopedLedger(@Param('seasonId') seasonId: string) {
    return this.engagementService.getUnscopedLedger(seasonId);
  }

  @Get(':seasonId/season-scope-audit')
  getSeasonScopeAudit(@Param('seasonId') seasonId: string) {
    return this.engagementService.getSeasonScopeAudit(seasonId);
  }

  @Get(':seasonId/activation-impact')
  getActivationImpact(@Param('seasonId') seasonId: string) {
    return this.engagementService.getActivationImpact(seasonId);
  }
}
