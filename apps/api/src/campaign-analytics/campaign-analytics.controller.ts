import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TokenPayload } from '../auth/providers/auth.provider.interface';
import { CampaignAnalyticsService } from './campaign-analytics.service';
import { RecalculateSnapshotDto } from './dto/recalculate-snapshot.dto';

@Controller()
export class CampaignAnalyticsController {
  constructor(private readonly campaignAnalyticsService: CampaignAnalyticsService) {}

  @Get('admin/campaigns/:id/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  getCampaignAnalytics(@Param('id') id: string) {
    return this.campaignAnalyticsService.getCampaignAnalytics(id);
  }

  @Post('admin/campaigns/:id/analytics/recalculate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  recalculateDailySnapshot(
    @Param('id') id: string,
    @Body() body: RecalculateSnapshotDto,
    @CurrentUser() user: TokenPayload,
  ) {
    const snapshotDate = body.snapshotDate ? new Date(body.snapshotDate) : undefined;
    return this.campaignAnalyticsService.recalculateDailySnapshot(id, snapshotDate, user.sub);
  }

  @Get('admin/sponsors/:id/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  getSponsorAnalytics(@Param('id') id: string) {
    return this.campaignAnalyticsService.getSponsorAnalytics(id);
  }
}
