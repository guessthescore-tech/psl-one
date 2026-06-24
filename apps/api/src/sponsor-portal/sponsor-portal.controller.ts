import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SponsorPortalService } from './sponsor-portal.service';
import { CreateCampaignDraftDto } from './sponsor-portal.dto';

@Controller('sponsor-portal')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SPONSOR', 'PSL_ADMIN')
export class SponsorPortalController {
  constructor(private readonly service: SponsorPortalService) {}

  @Get('overview')
  getSponsorOverview(@Request() req: any, @Query('sponsorId') sponsorId?: string) {
    return this.service.getSponsorOverview(req.user?.sub, req.user?.role, sponsorId);
  }

  @Get('profile')
  getSponsorProfile(@Request() req: any, @Query('sponsorId') sponsorId?: string) {
    return this.service.getSponsorProfile(req.user?.sub, req.user?.role, sponsorId);
  }

  @Get('campaigns')
  getSponsorCampaigns(@Request() req: any, @Query('sponsorId') sponsorId?: string) {
    return this.service.getSponsorCampaigns(req.user?.sub, req.user?.role, sponsorId);
  }

  @Post('campaigns/drafts')
  createCampaignDraft(
    @Body() dto: CreateCampaignDraftDto,
    @Request() req: any,
    @Query('sponsorId') sponsorId?: string,
  ) {
    return this.service.createCampaignDraft(dto, req.user?.sub, req.user?.role, sponsorId);
  }

  @Get('audiences')
  getSponsorAudiences(@Query('sponsorId') sponsorId?: string) {
    return this.service.getSponsorAudiences(sponsorId);
  }

  @Get('activations')
  getSponsorActivations(@Request() req: any, @Query('sponsorId') sponsorId?: string) {
    return this.service.getSponsorActivations(req.user?.sub, req.user?.role, sponsorId);
  }

  @Get('rewards')
  getSponsorRewards(@Request() req: any, @Query('sponsorId') sponsorId?: string) {
    return this.service.getSponsorRewards(req.user?.sub, req.user?.role, sponsorId);
  }

  @Get('analytics')
  getSponsorAnalytics(@Request() req: any, @Query('sponsorId') sponsorId?: string) {
    return this.service.getSponsorAnalytics(req.user?.sub, req.user?.role, sponsorId);
  }

  @Get('clubs')
  getSponsorClubs(@Request() req: any, @Query('sponsorId') sponsorId?: string) {
    return this.service.getSponsorClubs(req.user?.sub, req.user?.role, sponsorId);
  }

  @Get('assets')
  getSponsorAssets(@Query('sponsorId') sponsorId?: string) {
    return this.service.getSponsorAssets(sponsorId);
  }

  @Get('billing-placeholder')
  getBillingPlaceholder() {
    return this.service.getBillingPlaceholder();
  }
}
