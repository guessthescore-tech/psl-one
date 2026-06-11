import {
  Controller, Get, Post, Patch, Param, Body, Query, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { RewardReadinessCategory } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RewardsReadinessService, CreateRewardDefinitionDto } from './rewards-readiness.service';

interface JwtUser { sub: string }

@Controller('rewards-readiness')
export class RewardsReadinessController {
  constructor(private readonly service: RewardsReadinessService) {}

  // ── Fan: overview ──────────────────────────────────────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard)
  getFanOverview(@CurrentUser() user: JwtUser) {
    return this.service.getFanReadinessOverview(user.sub);
  }

  @Get('eligible')
  @UseGuards(JwtAuthGuard)
  getFanEligible(@CurrentUser() user: JwtUser) {
    return this.service.getFanEligibleRewards(user.sub);
  }

  @Get('locked')
  @UseGuards(JwtAuthGuard)
  getFanLocked(@CurrentUser() user: JwtUser) {
    return this.service.getFanLockedRewards(user.sub);
  }

  @Post('evaluate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  evaluateSelf(@CurrentUser() user: JwtUser) {
    return this.service.evaluateFanEligibility(user.sub);
  }

  // ── Public: definitions ────────────────────────────────────────────────────

  @Get('definitions')
  getPublicDefinitions(@Query('category') category?: RewardReadinessCategory) {
    const filters: { isEnabled: boolean; category?: RewardReadinessCategory } = { isEnabled: true };
    if (category) filters.category = category;
    return this.service.getDefinitions(filters);
  }

  // ── Admin: stats & definitions ─────────────────────────────────────────────

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  getAdminStats() {
    return this.service.getAdminStats();
  }

  @Get('admin/definitions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  getAdminDefinitions(
    @Query('isEnabled') isEnabled?: string,
    @Query('category') category?: RewardReadinessCategory,
  ) {
    const filters: { isEnabled?: boolean; category?: RewardReadinessCategory } = {};
    if (isEnabled !== undefined) filters.isEnabled = isEnabled !== 'false';
    if (category) filters.category = category;
    return this.service.getDefinitions(filters);
  }

  @Post('admin/definitions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  createDefinition(@Body() dto: CreateRewardDefinitionDto) {
    return this.service.createDefinition(dto);
  }

  @Patch('admin/definitions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  updateDefinition(@Param('id') id: string, @Body() dto: Partial<CreateRewardDefinitionDto>) {
    return this.service.updateDefinition(id, dto);
  }

  @Post('admin/definitions/:id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  toggleDefinition(@Param('id') id: string) {
    return this.service.toggleDefinition(id);
  }

  @Get('admin/definitions/:id/eligible-fans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  getEligibleFans(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.service.getEligibleFansForDefinition(
      id,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Post('admin/evaluate/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  evaluateFan(@Param('userId') userId: string) {
    return this.service.evaluateFanEligibility(userId);
  }

  @Post('admin/evaluate-all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  evaluateAll() {
    return this.service.evaluateAllFans();
  }
}
