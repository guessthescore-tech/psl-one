import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, Request, Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BetaLaunchService } from './beta-launch.service';
import { BetaLaunchSmokeTestService } from './beta-launch-smoke-test.service';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { UpdateCohortDto } from './dto/update-cohort.dto';
import { AddCohortMemberDto } from './dto/add-cohort-member.dto';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { RejectApprovalDto } from './dto/reject-approval.dto';

type AuthRequest = { user?: { userId?: string } };

@Controller('admin/beta-launch')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class BetaLaunchController {
  constructor(
    private readonly service: BetaLaunchService,
    private readonly smokeTests: BetaLaunchSmokeTestService,
  ) {}

  // ── Static routes first (before :seasonId) ────────────────────────────────

  @Get('overview')
  getOverview() {
    return this.service.getOverview();
  }

  @Get('seasons')
  getSeasons() {
    return this.service.getSeasons();
  }

  @Get('cohorts')
  listCohorts(@Query('seasonId') seasonId?: string) {
    return this.service.listCohorts(seasonId);
  }

  @Post('cohorts')
  createCohort(@Body() dto: CreateCohortDto, @Request() req: AuthRequest) {
    const userId = req.user?.userId ?? 'system';
    return this.service.createCohort(dto, userId);
  }

  @Get('cohorts/:cohortId')
  getCohort(@Param('cohortId') cohortId: string) {
    return this.service.getCohort(cohortId);
  }

  @Patch('cohorts/:cohortId')
  updateCohort(@Param('cohortId') cohortId: string, @Body() dto: UpdateCohortDto, @Request() req: AuthRequest) {
    const userId = req.user?.userId ?? 'system';
    return this.service.updateCohort(cohortId, dto, userId);
  }

  @Post('cohorts/:cohortId/members')
  addMember(@Param('cohortId') cohortId: string, @Body() dto: AddCohortMemberDto, @Request() req: AuthRequest) {
    const userId = req.user?.userId ?? 'system';
    return this.service.addMember(cohortId, dto, userId);
  }

  @Delete('cohorts/:cohortId/members/:userId')
  removeMember(@Param('cohortId') cohortId: string, @Param('userId') memberId: string, @Request() req: AuthRequest) {
    const userId = req.user?.userId ?? 'system';
    return this.service.removeMember(cohortId, memberId, userId);
  }

  @Post('cohorts/:cohortId/start')
  startCohort(@Param('cohortId') cohortId: string, @Request() req: AuthRequest) {
    return this.service.startCohort(cohortId, req.user?.userId ?? 'system');
  }

  @Post('cohorts/:cohortId/pause')
  pauseCohort(@Param('cohortId') cohortId: string, @Request() req: AuthRequest) {
    return this.service.pauseCohort(cohortId, req.user?.userId ?? 'system');
  }

  @Post('cohorts/:cohortId/complete')
  completeCohort(@Param('cohortId') cohortId: string, @Request() req: AuthRequest) {
    return this.service.completeCohort(cohortId, req.user?.userId ?? 'system');
  }

  @Get('smoke-tests')
  getSmokeTests() {
    return this.smokeTests.getSummary();
  }

  @Post('smoke-tests/run')
  runSmokeTests(@Request() req: AuthRequest) {
    return this.smokeTests.runRegistry(req.user?.userId ?? null);
  }

  // ── Dynamic :seasonId routes ──────────────────────────────────────────────

  @Get(':seasonId/readiness')
  getReadiness(@Param('seasonId') seasonId: string) {
    return this.service.getReadiness(seasonId);
  }

  @Get(':seasonId/blockers')
  getBlockers(@Param('seasonId') seasonId: string) {
    return this.service.getBlockers(seasonId);
  }

  @Get(':seasonId/warnings')
  getWarnings(@Param('seasonId') seasonId: string) {
    return this.service.getWarnings(seasonId);
  }

  @Get(':seasonId/frontend-readiness')
  getFrontendReadiness(@Param('seasonId') seasonId: string) {
    return this.service.getFrontendReadiness(seasonId);
  }

  @Get(':seasonId/data-readiness')
  getDataReadiness(@Param('seasonId') seasonId: string) {
    return this.service.getDataReadiness(seasonId);
  }

  @Get(':seasonId/security-readiness')
  getSecurityReadiness(@Param('seasonId') seasonId: string) {
    return this.service.getSecurityReadiness(seasonId);
  }

  @Get(':seasonId/operations-readiness')
  getOperationsReadiness(@Param('seasonId') seasonId: string) {
    return this.service.getOperationsReadiness(seasonId);
  }

  @Get(':seasonId/beta-cohort-readiness')
  getCohortReadiness(@Param('seasonId') seasonId: string) {
    return this.service.getCohortReadiness(seasonId);
  }

  @Get(':seasonId/activation-preview')
  getActivationPreview(@Param('seasonId') seasonId: string) {
    return this.service.getActivationPreview(seasonId);
  }

  @Post(':seasonId/dry-run')
  executeDryRun(@Param('seasonId') seasonId: string, @Request() req: AuthRequest) {
    return this.service.executeDryRun(seasonId, req.user?.userId ?? null);
  }

  @Post(':seasonId/rollback-dry-run')
  executeRollbackDryRun(@Param('seasonId') seasonId: string, @Request() req: AuthRequest) {
    return this.service.executeRollbackDryRun(seasonId, req.user?.userId ?? null);
  }

  @Post(':seasonId/approve')
  createApproval(@Param('seasonId') seasonId: string, @Body() dto: CreateApprovalDto, @Request() req: AuthRequest) {
    const userId = req.user?.userId;
    if (!userId) throw new Error('Authenticated userId required for approval');
    return this.service.createApproval(seasonId, userId, dto);
  }

  @Post(':seasonId/reject')
  rejectApproval(@Param('seasonId') seasonId: string, @Body() dto: RejectApprovalDto, @Request() req: AuthRequest) {
    const userId = req.user?.userId;
    if (!userId) throw new Error('Authenticated userId required for rejection');
    return this.service.rejectApproval(seasonId, userId, dto);
  }

  @Get(':seasonId/approval')
  getApproval(@Param('seasonId') seasonId: string) {
    return this.service.getApproval(seasonId);
  }

  @Get(':seasonId/runbook')
  getRunbook() {
    return this.service.getRunbook();
  }
}
