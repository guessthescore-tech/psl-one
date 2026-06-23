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
import { ClubPortalService } from './club-portal.service';
import { ContentSubmissionDto } from './club-portal.dto';

@Controller('club-portal')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CLUB_ADMIN', 'PSL_ADMIN')
export class ClubPortalController {
  constructor(private readonly service: ClubPortalService) {}

  @Get('overview')
  getClubOverview(@Query('clubId') clubId?: string) {
    return this.service.getClubOverview(clubId);
  }

  @Get('profile')
  getClubProfile(@Query('clubId') clubId?: string) {
    return this.service.getClubProfile(clubId);
  }

  @Get('squad')
  getClubSquad(@Query('clubId') clubId?: string) {
    return this.service.getClubSquad(clubId);
  }

  @Get('fixtures')
  getClubFixtures(@Query('clubId') clubId?: string) {
    return this.service.getClubFixtures(clubId);
  }

  @Get('fans')
  getClubFans(
    @Query('clubId') clubId?: string,
    @Query('limit') _limit?: string,
    @Query('offset') _offset?: string,
  ) {
    return this.service.getClubFans(clubId);
  }

  @Get('analytics')
  getClubAnalytics(@Query('clubId') clubId?: string) {
    return this.service.getClubAnalytics(clubId);
  }

  @Get('campaigns')
  getClubCampaigns(@Query('clubId') clubId?: string) {
    return this.service.getClubCampaigns(clubId);
  }

  @Get('sponsors')
  getClubSponsors(@Query('clubId') clubId?: string) {
    return this.service.getClubSponsors(clubId);
  }

  @Get('content')
  getClubContent(@Query('clubId') clubId?: string) {
    return this.service.getClubContent(clubId);
  }

  @Post('content-submissions')
  submitContent(
    @Body() dto: ContentSubmissionDto,
    @Query('clubId') clubId?: string,
    @Request() req?: any,
  ) {
    return this.service.submitContent(dto, clubId, req?.user?.userId);
  }
}
