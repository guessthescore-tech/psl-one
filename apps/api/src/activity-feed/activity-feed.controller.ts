import {
  Controller, Get, Post, Delete, Param, Body, Query, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ActivityFeedType, ActivityReactionType, ActivityStatus, ActivityVisibility } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ActivityFeedService, CreateActivityItemDto } from './activity-feed.service';

interface JwtUser { sub: string }

@Controller('activity-feed')
export class ActivityFeedController {
  constructor(private readonly service: ActivityFeedService) {}

  // ── Fan: global feed ───────────────────────────────────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard)
  getGlobalFeed(
    @CurrentUser() user: JwtUser,
    @Query('type') type?: ActivityFeedType,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.service.getGlobalFeed(
      {
        ...(type ? { type } : {}),
        limit: limit ? parseInt(limit, 10) : 20,
        offset: offset ? parseInt(offset, 10) : 0,
      },
      user.sub,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyFeed(
    @CurrentUser() user: JwtUser,
    @Query('type') type?: ActivityFeedType,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.service.getMyFeed(user.sub, {
      ...(type ? { type } : {}),
      limit: limit ? parseInt(limit, 10) : 20,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  // ── Admin routes (must come before :id to avoid route shadowing) ──────────

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  getAdminFeed(
    @Query('type') type?: ActivityFeedType,
    @Query('status') status?: ActivityStatus,
    @Query('visibility') visibility?: ActivityVisibility,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.service.getAdminFeed({
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      ...(visibility ? { visibility } : {}),
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  getAdminStats() {
    return this.service.getAdminStats();
  }

  @Post('admin/system')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  createSystemActivity(@Body() dto: Omit<CreateActivityItemDto, 'userId'>) {
    return this.service.createSystemActivity(dto);
  }

  @Post('admin/live-match-alert')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  createLiveMatchAlert(@Body() dto: { fixtureId: string; title: string; body: string }) {
    return this.service.createLiveMatchAlertActivity(dto);
  }

  @Post('admin/:id/hide')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  adminHide(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.service.adminHideActivity(user.sub, id, body.reason);
  }

  @Post('admin/:id/unhide')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  adminUnhide(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.service.adminUnhideActivity(user.sub, id);
  }

  // ── Fan: item actions ──────────────────────────────────────────────────────

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getDetail(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.service.getActivityDetail(user.sub, id);
  }

  @Post(':id/reactions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  addReaction(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() body: { reactionType: ActivityReactionType },
  ) {
    return this.service.addReaction(user.sub, id, body.reactionType);
  }

  @Delete(':id/reactions/:reactionType')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  removeReaction(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Param('reactionType') reactionType: ActivityReactionType,
  ) {
    return this.service.removeReaction(user.sub, id, reactionType);
  }

  @Post(':id/hide')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  hideOwnActivity(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.service.hideOwnActivity(user.sub, id);
  }
}
