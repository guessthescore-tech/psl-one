import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { AchievementCategory } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AchievementsService, CreateAchievementDefinitionDto, CreateBadgeDefinitionDto } from './achievements.service';

interface JwtUser { sub: string }

@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  // ── Fan: achievements ─────────────────────────────────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard)
  getFanAchievements(@CurrentUser() user: JwtUser) {
    return this.achievementsService.getFanAchievements(user.sub);
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  getFanAchievementSummary(@CurrentUser() user: JwtUser) {
    return this.achievementsService.getFanAchievementSummary(user.sub);
  }

  @Get('progress')
  @UseGuards(JwtAuthGuard)
  getFanAchievementProgress(@CurrentUser() user: JwtUser) {
    return this.achievementsService.getFanAchievementProgress(user.sub);
  }

  @Get('badges')
  @UseGuards(JwtAuthGuard)
  getFanBadges(@CurrentUser() user: JwtUser) {
    return this.achievementsService.getFanBadges(user.sub);
  }

  @Get('definitions')
  getDefinitions(
    @Query('category') category?: AchievementCategory,
    @Query('isActive') isActive?: string,
  ) {
    const filters: { category?: AchievementCategory; isActive?: boolean } = {};
    if (category) filters.category = category;
    if (isActive !== undefined) filters.isActive = isActive !== 'false';
    return this.achievementsService.getDefinitions(filters);
  }

  @Get('definitions/badges')
  getBadgeDefinitions(
    @Query('category') category?: AchievementCategory,
    @Query('isActive') isActive?: string,
  ) {
    const filters: { category?: AchievementCategory; isActive?: boolean } = {};
    if (category) filters.category = category;
    if (isActive !== undefined) filters.isActive = isActive !== 'false';
    return this.achievementsService.getBadgeDefinitions(filters);
  }

  @Post('evaluate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  evaluateSelf(@CurrentUser() user: JwtUser) {
    return this.achievementsService.evaluateUserAchievements(user.sub);
  }

  // ── Admin: stats & definitions ────────────────────────────────────────────

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  getAdminStats() {
    return this.achievementsService.getAdminAchievementStats();
  }

  @Get('admin/definitions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminGetDefinitions(
    @Query('category') category?: AchievementCategory,
    @Query('isActive') isActive?: string,
  ) {
    const filters: { category?: AchievementCategory; isActive?: boolean } = {};
    if (category) filters.category = category;
    if (isActive !== undefined) filters.isActive = isActive !== 'false';
    return this.achievementsService.getDefinitions(filters);
  }

  @Post('admin/definitions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  createAchievementDefinition(@Body() dto: CreateAchievementDefinitionDto) {
    return this.achievementsService.createAchievementDefinition(dto);
  }

  @Patch('admin/definitions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  updateAchievementDefinition(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAchievementDefinitionDto>,
  ) {
    return this.achievementsService.updateAchievementDefinition(id, dto);
  }

  // ── Admin: badges ─────────────────────────────────────────────────────────

  @Get('admin/badges')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminGetBadgeDefinitions(
    @Query('category') category?: AchievementCategory,
    @Query('isActive') isActive?: string,
  ) {
    const filters: { category?: AchievementCategory; isActive?: boolean } = {};
    if (category) filters.category = category;
    if (isActive !== undefined) filters.isActive = isActive !== 'false';
    return this.achievementsService.getBadgeDefinitions(filters);
  }

  @Post('admin/badges')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  createBadgeDefinition(@Body() dto: CreateBadgeDefinitionDto) {
    return this.achievementsService.createBadgeDefinition(dto);
  }

  @Patch('admin/badges/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  updateBadgeDefinition(
    @Param('id') id: string,
    @Body() dto: Partial<CreateBadgeDefinitionDto>,
  ) {
    return this.achievementsService.updateBadgeDefinition(id, dto);
  }

  @Post('admin/link-badge')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  linkBadgeToAchievement(
    @Body() body: { achievementDefinitionId: string; badgeDefinitionId: string },
  ) {
    return this.achievementsService.linkBadgeToAchievement(body.achievementDefinitionId, body.badgeDefinitionId);
  }

  // ── Admin: user management ────────────────────────────────────────────────

  @Get('admin/users/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminGetUserAchievements(@Param('userId') userId: string) {
    return this.achievementsService.getFanAchievements(userId);
  }

  @Post('admin/users/:userId/award')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  adminAwardAchievement(
    @Param('userId') userId: string,
    @Body() body: { slug: string; metadata?: object },
    @CurrentUser() adminUser: JwtUser,
  ) {
    return this.achievementsService.awardAchievement(userId, body.slug, body.metadata, adminUser.sub);
  }

  @Post('admin/users/:userId/revoke-achievement/:fanAchievementId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  revokeAchievement(
    @Param('userId') userId: string,
    @Param('fanAchievementId') fanAchievementId: string,
    @Body() body: { reason: string },
    @CurrentUser() adminUser: JwtUser,
  ) {
    return this.achievementsService.revokeAchievement(userId, fanAchievementId, body.reason, adminUser.sub);
  }

  @Post('admin/users/:userId/revoke-badge/:fanBadgeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  revokeBadge(
    @Param('userId') userId: string,
    @Param('fanBadgeId') fanBadgeId: string,
    @Body() body: { reason: string },
    @CurrentUser() adminUser: JwtUser,
  ) {
    return this.achievementsService.revokeBadge(userId, fanBadgeId, body.reason, adminUser.sub);
  }

  @Post('admin/evaluate/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  evaluateUserAchievements(@Param('userId') userId: string) {
    return this.achievementsService.evaluateUserAchievements(userId);
  }
}
