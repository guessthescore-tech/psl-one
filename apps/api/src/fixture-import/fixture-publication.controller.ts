import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FixturePublicationService, FixturePublishRequest } from './fixture-publication.service';
import { PslActivationPreflightService } from './psl-activation-preflight.service';

/**
 * Admin-only fixture publication and PSL activation pre-flight endpoints.
 *
 * Publishing fixtures is separate from PSL season activation.
 * All routes are read-only or require explicit confirmation.
 * No PSL activation is performed here.
 * Fixtures are points-only; no real-money functionality.
 */
@Controller('admin/fixtures')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class FixturePublicationController {
  constructor(private readonly publication: FixturePublicationService) {}

  /**
   * List fixtures imported from a provider source.
   * Supports filtering by providerSource, isPublished, seasonId.
   */
  @Get('imported')
  listImported(
    @Query('providerSource') providerSource?: string,
    @Query('isPublished') isPublishedStr?: string,
    @Query('seasonId') seasonId?: string,
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
  ) {
    const isPublished =
      isPublishedStr === 'true' ? true : isPublishedStr === 'false' ? false : undefined;
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;
    const offset = offsetStr ? parseInt(offsetStr, 10) : undefined;
    const opts: {
      providerSource?: string;
      isPublished?: boolean;
      seasonId?: string;
      limit?: number;
      offset?: number;
    } = {};
    if (providerSource !== undefined) opts.providerSource = providerSource;
    if (isPublished !== undefined) opts.isPublished = isPublished;
    if (seasonId !== undefined) opts.seasonId = seasonId;
    if (limit !== undefined) opts.limit = limit;
    if (offset !== undefined) opts.offset = offset;
    return this.publication.listImportedFixtures(opts);
  }

  /**
   * Publish or unpublish a set of fixtures.
   *
   * Rules:
   * - confirmPublication=true is required
   * - fixtureIds must not be empty
   * - Publishing is idempotent (already-published fixtures are skipped)
   * - Fixtures with missing teams cannot be published
   * - Does NOT activate PSL
   * - Fixtures remain points-only; no real-money interaction
   */
  @Post('publish')
  publish(@Body() body: FixturePublishRequest) {
    if (!body || !body.fixtureIds) throw new BadRequestException('fixtureIds is required');
    return this.publication.publishFixtures(body);
  }
}

@Controller('admin/psl')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class PslPreflightController {
  constructor(private readonly preflight: PslActivationPreflightService) {}

  /**
   * Read-only PSL activation pre-flight check.
   *
   * This endpoint checks readiness for PSL season activation WITHOUT activating anything.
   * Returns status: NO_GO | CONDITIONAL_GO | GO with blockers, warnings, and individual check results.
   *
   * Optional query param: seasonId — if omitted, the most recent inactive PSL season is used.
   */
  @Get('preflight')
  runPreflight(@Query('seasonId') seasonId?: string) {
    return this.preflight.runPreflight(seasonId);
  }
}
