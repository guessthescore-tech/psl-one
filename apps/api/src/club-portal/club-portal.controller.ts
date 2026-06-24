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
  getClubOverview(@Request() req: any, @Query('teamId') teamId?: string) {
    return this.service.getClubOverview(req.user?.sub, req.user?.role, teamId);
  }

  @Get('profile')
  getClubProfile(@Request() req: any, @Query('teamId') teamId?: string) {
    return this.service.getClubProfile(req.user?.sub, req.user?.role, teamId);
  }

  @Get('squad')
  getClubSquad(@Request() req: any, @Query('teamId') teamId?: string) {
    return this.service.getClubSquad(req.user?.sub, req.user?.role, teamId);
  }

  @Get('fixtures')
  getClubFixtures(@Request() req: any, @Query('teamId') teamId?: string) {
    return this.service.getClubFixtures(req.user?.sub, req.user?.role, teamId);
  }

  @Get('fans')
  getClubFans(
    @Query('teamId') teamId?: string,
    @Query('limit') _limit?: string,
    @Query('offset') _offset?: string,
  ) {
    return this.service.getClubFans(teamId);
  }

  @Get('analytics')
  getClubAnalytics(@Request() req: any, @Query('teamId') teamId?: string) {
    return this.service.getClubAnalytics(req.user?.sub, req.user?.role, teamId);
  }

  @Get('campaigns')
  getClubCampaigns(@Request() req: any, @Query('teamId') teamId?: string) {
    return this.service.getClubCampaigns(req.user?.sub, req.user?.role, teamId);
  }

  @Get('sponsors')
  getClubSponsors(@Request() req: any, @Query('teamId') teamId?: string) {
    return this.service.getClubSponsors(req.user?.sub, req.user?.role, teamId);
  }

  @Get('content')
  getClubContent(@Request() req: any, @Query('teamId') teamId?: string) {
    return this.service.getClubContent(req.user?.sub, req.user?.role, teamId);
  }

  @Post('content-submissions')
  submitContent(
    @Body() dto: ContentSubmissionDto,
    @Request() req: any,
    @Query('teamId') teamId?: string,
  ) {
    return this.service.submitContent(dto, req.user?.sub, req.user?.role, teamId);
  }
}
