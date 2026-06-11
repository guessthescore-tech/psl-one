import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TokenPayload } from '../auth/providers/auth.provider.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FixtureImportService } from './fixture-import.service';
import { AddRowDto } from './dto/add-row.dto';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateRowDto } from './dto/update-row.dto';

// All routes under this controller require PSL_ADMIN.
// Route ordering: static sub-paths before parameterised :batchId routes.

@Controller('fixtures/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class FixtureImportController {
  constructor(private readonly svc: FixtureImportService) {}

  // ── Batch list / create ───────────────────────────────────────────────────

  @Get('imports')
  listBatches(@Query('seasonId') seasonId?: string) {
    return this.svc.listBatches(seasonId);
  }

  @Post('imports')
  @HttpCode(HttpStatus.CREATED)
  createBatch(@Body() dto: CreateBatchDto, @CurrentUser() user: TokenPayload) {
    return this.svc.createBatch(dto, user.sub);
  }

  // ── Season-level validation / conflicts / gameweeks / publishing ──────────
  // These must be declared before :batchId routes to prevent capture.

  @Get('validation/season/:seasonId')
  getSeasonValidation(@Param('seasonId') seasonId: string) {
    return this.svc.getSeasonFixtureValidation(seasonId);
  }

  @Get('conflicts/season/:seasonId')
  getSeasonConflicts(@Param('seasonId') seasonId: string) {
    return this.svc.getSeasonFixtureConflicts(seasonId);
  }

  @Get('gameweeks/season/:seasonId/readiness')
  getGameweekReadiness(@Param('seasonId') seasonId: string) {
    return this.svc.getGameweekReadiness(seasonId);
  }

  @Post('gameweeks/season/:seasonId/auto-create')
  @HttpCode(HttpStatus.OK)
  autoCreateGameweeks(@Param('seasonId') seasonId: string) {
    return this.svc.autoCreateGameweeks(seasonId);
  }

  @Post('gameweeks/season/:seasonId/assign-by-round')
  @HttpCode(HttpStatus.OK)
  assignFixturesByRound(@Param('seasonId') seasonId: string) {
    return this.svc.assignFixturesByRound(seasonId);
  }

  @Get('publishing/season/:seasonId/readiness')
  getPublishingReadiness(@Param('seasonId') seasonId: string) {
    return this.svc.getPublishingReadiness(seasonId);
  }

  @Post('publishing/season/:seasonId/publish-provisional')
  @HttpCode(HttpStatus.OK)
  publishProvisional(@Param('seasonId') seasonId: string) {
    return this.svc.publishProvisionalFixtures(seasonId);
  }

  @Post('publishing/season/:seasonId/unpublish-provisional')
  @HttpCode(HttpStatus.OK)
  unpublishProvisional(@Param('seasonId') seasonId: string) {
    return this.svc.unpublishProvisionalFixtures(seasonId);
  }

  // ── Batch detail ─────────────────────────────────────────────────────────

  @Get('imports/:batchId')
  getBatch(@Param('batchId') batchId: string) {
    return this.svc.getBatch(batchId);
  }

  @Delete('imports/:batchId')
  @HttpCode(HttpStatus.OK)
  deleteBatch(@Param('batchId') batchId: string) {
    return this.svc.deleteBatch(batchId);
  }

  @Get('imports/:batchId/summary')
  getBatchSummary(@Param('batchId') batchId: string) {
    return this.svc.getBatchSummary(batchId);
  }

  // ── Batch row sub-paths ───────────────────────────────────────────────────

  @Get('imports/:batchId/rows')
  getBatchRows(@Param('batchId') batchId: string) {
    return this.svc.getBatchRows(batchId);
  }

  @Post('imports/:batchId/rows')
  @HttpCode(HttpStatus.CREATED)
  addRow(@Param('batchId') batchId: string, @Body() dto: AddRowDto) {
    return this.svc.addRow(batchId, dto);
  }

  @Patch('imports/:batchId/rows/:rowId')
  updateRow(
    @Param('batchId') batchId: string,
    @Param('rowId') rowId: string,
    @Body() dto: UpdateRowDto,
  ) {
    return this.svc.updateRow(batchId, rowId, dto);
  }

  @Delete('imports/:batchId/rows/:rowId')
  @HttpCode(HttpStatus.OK)
  deleteRow(@Param('batchId') batchId: string, @Param('rowId') rowId: string) {
    return this.svc.deleteRow(batchId, rowId);
  }

  // ── Batch lifecycle actions ───────────────────────────────────────────────

  @Post('imports/:batchId/validate')
  @HttpCode(HttpStatus.OK)
  validateBatch(@Param('batchId') batchId: string) {
    return this.svc.validateBatch(batchId);
  }

  @Post('imports/:batchId/commit')
  @HttpCode(HttpStatus.OK)
  commitBatch(@Param('batchId') batchId: string) {
    return this.svc.commitBatch(batchId);
  }

  @Post('imports/:batchId/publish')
  @HttpCode(HttpStatus.OK)
  publishBatch(@Param('batchId') batchId: string) {
    return this.svc.publishBatch(batchId);
  }

  @Post('imports/:batchId/reject')
  @HttpCode(HttpStatus.OK)
  rejectBatch(@Param('batchId') batchId: string) {
    return this.svc.rejectBatch(batchId);
  }
}
