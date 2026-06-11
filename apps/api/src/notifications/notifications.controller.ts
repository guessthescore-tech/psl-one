import {
  Controller, Get, Post, Patch, Param, Body, Query, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { NotificationPriority, NotificationStatus, NotificationType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  NotificationsService,
  UpdatePreferencesDto,
  AdminBroadcastDto,
} from './notifications.service';

interface JwtUser { sub: string }

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  // ── Fan: inbox ─────────────────────────────────────────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard)
  getInbox(
    @CurrentUser() user: JwtUser,
    @Query('type') type?: NotificationType,
    @Query('status') status?: NotificationStatus,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.service.getInbox(user.sub, {
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      limit: limit ? parseInt(limit, 10) : 20,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  getUnreadCount(@CurrentUser() user: JwtUser) {
    return this.service.getUnreadCount(user.sub);
  }

  @Get('preferences')
  @UseGuards(JwtAuthGuard)
  getPreferences(@CurrentUser() user: JwtUser) {
    return this.service.getOrCreatePreferences(user.sub);
  }

  @Patch('preferences')
  @UseGuards(JwtAuthGuard)
  updatePreferences(@CurrentUser() user: JwtUser, @Body() dto: UpdatePreferencesDto) {
    return this.service.updatePreferences(user.sub, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getDetail(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.service.getNotificationDetail(user.sub, id);
  }

  @Post(':id/read')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  markRead(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.service.markRead(user.sub, id);
  }

  @Post('read-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  markAllRead(@CurrentUser() user: JwtUser) {
    return this.service.markAllRead(user.sub);
  }

  @Post(':id/archive')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  archive(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.service.archiveNotification(user.sub, id);
  }

  // ── Admin ──────────────────────────────────────────────────────────────────

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  getAdminStats() {
    return this.service.getAdminStats();
  }

  @Get('admin/recent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  getAdminRecent(@Query('limit') limit?: string) {
    return this.service.getAdminRecentNotifications(limit ? parseInt(limit, 10) : 50);
  }

  @Post('admin/users/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  createForUser(
    @Param('userId') userId: string,
    @Body() body: {
      type: NotificationType;
      title: string;
      body: string;
      priority?: NotificationPriority;
      actionUrl?: string;
      sourceType?: string;
      sourceId?: string;
      metadataJson?: object;
    },
  ) {
    return this.service.createAdminNotification(userId, body);
  }

  @Post('admin/broadcast')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  broadcast(@Body() dto: AdminBroadcastDto) {
    return this.service.createAdminBroadcast(dto);
  }

  @Post('admin/fantasy-deadline')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  createFantasyDeadline(
    @Body() dto: { gameweekId: string; deadlineAt: string; gameweekName: string },
  ) {
    return this.service.createFantasyDeadlineAlert({
      gameweekId: dto.gameweekId,
      deadlineAt: new Date(dto.deadlineAt),
      gameweekName: dto.gameweekName,
    });
  }

  @Post('admin/live-match-alert')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  createLiveMatchAlert(@Body() dto: { fixtureId: string; title: string; body: string }) {
    return this.service.createLiveMatchAlert(dto);
  }
}
