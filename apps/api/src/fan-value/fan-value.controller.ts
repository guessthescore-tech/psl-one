import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { FanValueSourceType, FanValueType } from '@prisma/client';
import { FanValueLedgerService } from './fan-value-ledger.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface JwtUser { sub: string }

@Controller('fan-value')
export class FanValueController {
  constructor(private readonly ledgerService: FanValueLedgerService) {}

  // ── Fan: summary ──────────────────────────────────────────────────────────

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  getSummary(@CurrentUser() user: JwtUser) {
    return this.ledgerService.getFanValueSummary(user.sub);
  }

  @Get('ledger')
  @UseGuards(JwtAuthGuard)
  getLedger(
    @CurrentUser() user: JwtUser,
    @Query('valueType') valueType?: FanValueType,
    @Query('sourceType') sourceType?: FanValueSourceType,
    @Query('seasonId') seasonId?: string,
    @Query('gameweekId') gameweekId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.ledgerService.getFanLedgerEntries(user.sub, {
      ...(valueType ? { valueType } : {}),
      ...(sourceType ? { sourceType } : {}),
      ...(seasonId ? { seasonId } : {}),
      ...(gameweekId ? { gameweekId } : {}),
      ...(fromDate ? { fromDate: new Date(fromDate) } : {}),
      ...(toDate ? { toDate: new Date(toDate) } : {}),
      ...(limit ? { limit: parseInt(limit, 10) } : {}),
      ...(offset ? { offset: parseInt(offset, 10) } : {}),
    });
  }

  @Get('by-type')
  @UseGuards(JwtAuthGuard)
  getByType(@CurrentUser() user: JwtUser) {
    return this.ledgerService.getFanValueByType(user.sub);
  }

  @Get('by-source')
  @UseGuards(JwtAuthGuard)
  getBySource(@CurrentUser() user: JwtUser) {
    return this.ledgerService.getFanValueBySource(user.sub);
  }

  @Get('seasons/:seasonId')
  @UseGuards(JwtAuthGuard)
  getSeasonValue(@CurrentUser() user: JwtUser, @Param('seasonId') seasonId: string) {
    return this.ledgerService.getSeasonFanValue(user.sub, seasonId);
  }

  @Get('gameweeks/:gameweekId')
  @UseGuards(JwtAuthGuard)
  getGameweekValue(@CurrentUser() user: JwtUser, @Param('gameweekId') gameweekId: string) {
    return this.ledgerService.getGameweekFanValue(user.sub, gameweekId);
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  @Get('admin/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminSummary(
    @Query('valueType') valueType?: FanValueType,
    @Query('sourceType') sourceType?: FanValueSourceType,
    @Query('seasonId') seasonId?: string,
    @Query('gameweekId') gameweekId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.ledgerService.getAdminPlatformSummary({
      ...(valueType ? { valueType } : {}),
      ...(sourceType ? { sourceType } : {}),
      ...(seasonId ? { seasonId } : {}),
      ...(gameweekId ? { gameweekId } : {}),
      ...(fromDate ? { fromDate: new Date(fromDate) } : {}),
      ...(toDate ? { toDate: new Date(toDate) } : {}),
    });
  }

  @Get('admin/users/:userId/ledger')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminUserLedger(
    @Param('userId') userId: string,
    @Query('valueType') valueType?: FanValueType,
    @Query('sourceType') sourceType?: FanValueSourceType,
    @Query('seasonId') seasonId?: string,
    @Query('gameweekId') gameweekId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.ledgerService.getAdminUserLedger(userId, {
      ...(valueType ? { valueType } : {}),
      ...(sourceType ? { sourceType } : {}),
      ...(seasonId ? { seasonId } : {}),
      ...(gameweekId ? { gameweekId } : {}),
      ...(limit ? { limit: parseInt(limit, 10) } : {}),
      ...(offset ? { offset: parseInt(offset, 10) } : {}),
    });
  }

  @Post('admin/entries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminPostEntry(
    @Body() body: {
      userId: string;
      points: number;
      valueType?: FanValueType;
      sourceId?: string;
      description?: string;
      idempotencyKey: string;
      metadataJson?: object;
    },
  ) {
    return this.ledgerService.adminPostEntry({
      userId: body.userId,
      sourceType: FanValueSourceType.ADMIN_ADJUSTMENT,
      sourceId: body.sourceId ?? body.idempotencyKey,
      idempotencyKey: body.idempotencyKey,
      points: body.points,
      ...(body.valueType ? { valueType: body.valueType } : {}),
      ...(body.description ? { description: body.description } : {}),
      ...(body.metadataJson ? { metadataJson: body.metadataJson } : {}),
    });
  }

  @Post('admin/entries/:entryId/void')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminVoidEntry(
    @Param('entryId') entryId: string,
    @Body() body: { reason: string },
  ) {
    return this.ledgerService.voidEntry(entryId, body.reason ?? 'Admin void');
  }

  @Post('admin/sponsor-engagement-ready')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminSponsorEngagement(
    @Body() body: {
      userId: string;
      points: number;
      description?: string;
      idempotencyKey: string;
      metadataJson?: object;
    },
  ) {
    return this.ledgerService.postSponsorEngagementReadyEvent({
      userId: body.userId,
      points: body.points,
      idempotencyKey: body.idempotencyKey,
      ...(body.description ? { description: body.description } : {}),
      ...(body.metadataJson ? { metadataJson: body.metadataJson } : {}),
    });
  }
}
