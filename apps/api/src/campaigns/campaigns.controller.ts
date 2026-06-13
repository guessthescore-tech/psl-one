import {
  Controller, Get, Post, Patch, Param, Body, Query, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TokenPayload } from '../auth/providers/auth.provider.interface';
import {
  CampaignsService,
  CreateCampaignDto,
  UpdateCampaignDto,
  AddActionDto,
  CompleteActionDto,
} from './campaigns.service';

@Controller()
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get('fan/campaigns')
  @UseGuards(JwtAuthGuard)
  listFanCampaigns(
    @Query('clubId') clubId?: string,
    @Query('seasonId') seasonId?: string,
  ) {
    const filters: { clubId?: string; seasonId?: string } = {};
    if (clubId) filters.clubId = clubId;
    if (seasonId) filters.seasonId = seasonId;
    return this.campaignsService.listFanCampaigns(filters);
  }

  @Get('fan/campaigns/:slug')
  @UseGuards(JwtAuthGuard)
  getFanCampaign(@Param('slug') slug: string) {
    return this.campaignsService.getFanCampaign(slug);
  }

  @Post('fan/campaigns/:id/start')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  startParticipation(
    @Param('id') id: string,
    @Body() body: { ageConfirmed?: boolean },
    @CurrentUser() user: TokenPayload,
  ) {
    return this.campaignsService.startParticipation(id, user.sub, body?.ageConfirmed);
  }

  @Post('fan/campaigns/:id/actions/:actionId/complete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  completeAction(
    @Param('id') campaignId: string,
    @Param('actionId') actionId: string,
    @Body() dto: CompleteActionDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.campaignsService.completeAction(campaignId, actionId, user.sub, dto);
  }

  @Get('fan/campaigns/:id/progress')
  @UseGuards(JwtAuthGuard)
  getProgress(
    @Param('id') campaignId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.campaignsService.getProgress(campaignId, user.sub);
  }

  @Get('admin/campaigns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminListCampaigns(
    @Query('status') status?: string,
    @Query('sponsorId') sponsorId?: string,
  ) {
    const filters: { status?: string; sponsorId?: string } = {};
    if (status) filters.status = status;
    if (sponsorId) filters.sponsorId = sponsorId;
    return this.campaignsService.adminListCampaigns(filters);
  }

  @Post('admin/campaigns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminCreateCampaign(
    @Body() dto: CreateCampaignDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.campaignsService.adminCreateCampaign(dto, user.sub);
  }

  @Get('admin/campaigns/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminGetCampaign(@Param('id') id: string) {
    return this.campaignsService.adminGetCampaign(id);
  }

  @Patch('admin/campaigns/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminUpdateCampaign(
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.campaignsService.adminUpdateCampaign(id, dto, user.sub);
  }

  @Post('admin/campaigns/:id/submit-for-approval')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  adminSubmitForApproval(
    @Param('id') id: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.campaignsService.adminSubmitForApproval(id, user.sub);
  }

  @Post('admin/campaigns/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  adminApproveCampaign(
    @Param('id') id: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.campaignsService.adminApproveCampaign(id, user.sub);
  }

  @Post('admin/campaigns/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  adminRejectCampaign(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @CurrentUser() user: TokenPayload,
  ) {
    return this.campaignsService.adminRejectCampaign(id, body.reason, user.sub);
  }

  @Post('admin/campaigns/:id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  adminPublishCampaign(
    @Param('id') id: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.campaignsService.adminPublishCampaign(id, user.sub);
  }

  @Post('admin/campaigns/:id/pause')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  adminPauseCampaign(
    @Param('id') id: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.campaignsService.adminPauseCampaign(id, user.sub);
  }

  @Post('admin/campaigns/:id/resume')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  adminResumeCampaign(
    @Param('id') id: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.campaignsService.adminResumeCampaign(id, user.sub);
  }

  @Post('admin/campaigns/:id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  adminCompleteCampaign(
    @Param('id') id: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.campaignsService.adminCompleteCampaign(id, user.sub);
  }

  @Post('admin/campaigns/:id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  adminArchiveCampaign(
    @Param('id') id: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.campaignsService.adminArchiveCampaign(id, user.sub);
  }

  @Post('admin/campaigns/:id/actions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminAddAction(
    @Param('id') id: string,
    @Body() dto: AddActionDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.campaignsService.adminAddAction(id, dto, user.sub);
  }

  @Get('admin/campaigns/:id/participations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminListParticipations(
    @Param('id') id: string,
    @Query('status') status?: string,
  ) {
    return this.campaignsService.adminListParticipations(id, status);
  }
}
