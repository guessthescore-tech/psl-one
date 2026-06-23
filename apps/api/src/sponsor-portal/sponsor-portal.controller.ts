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
  getSponsorOverview(@Query('sponsorId') sponsorId?: string) {
    return this.service.getSponsorOverview(sponsorId);
  }

  @Get('profile')
  getSponsorProfile(@Query('sponsorId') sponsorId?: string) {
    return this.service.getSponsorProfile(sponsorId);
  }

  @Get('campaigns')
  getSponsorCampaigns(@Query('sponsorId') sponsorId?: string) {
    return this.service.getSponsorCampaigns(sponsorId);
  }

  @Post('campaigns/drafts')
  createCampaignDraft(
    @Body() dto: CreateCampaignDraftDto,
    @Query('sponsorId') sponsorId?: string,
    @Request() req?: any,
  ) {
    return this.service.createCampaignDraft(dto, sponsorId, req?.user?.userId);
  }

  @Get('audiences')
  getSponsorAudiences(@Query('sponsorId') sponsorId?: string) {
    return this.service.getSponsorAudiences(sponsorId);
  }

  @Get('activations')
  getSponsorActivations(@Query('sponsorId') sponsorId?: string) {
    return this.service.getSponsorActivations(sponsorId);
  }

  @Get('rewards')
  getSponsorRewards(@Query('sponsorId') sponsorId?: string) {
    return this.service.getSponsorRewards(sponsorId);
  }

  @Get('analytics')
  getSponsorAnalytics(@Query('sponsorId') sponsorId?: string) {
    return this.service.getSponsorAnalytics(sponsorId);
  }

  @Get('clubs')
  getSponsorClubs(@Query('sponsorId') sponsorId?: string) {
    return this.service.getSponsorClubs(sponsorId);
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
