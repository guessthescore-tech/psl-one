import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ChallengeListingStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AcceptListingDto } from './dto/accept-listing.dto';
import { AdjustAllocationDto } from './dto/adjust-allocation.dto';
import { CreateDirectChallengeDto } from './dto/create-direct-challenge.dto';
import { CreateListingDto } from './dto/create-listing.dto';
import { CreateMarketConfigDto } from './dto/create-market-config.dto';
import { GenerateFixtureMarketsDto } from './dto/generate-fixture-markets.dto';
import { GrantAllocationDto } from './dto/grant-allocation.dto';
import { SettleMarketDto } from './dto/settle-market.dto';
import { VoidMarketDto } from './dto/void-market.dto';
import { SocialPredictionService } from './social-prediction.service';

// ── Fan Routes ───────────────────────────────────────────────────────────────

@Controller('social-predictions')
@UseGuards(JwtAuthGuard)
export class SocialPredictionFanController {
  constructor(private readonly svc: SocialPredictionService) {}

  @Get('allocation')
  fanGetAllocation(@Request() req: { user: { sub: string } }, @Query('gameweekId') gameweekId: string) {
    return this.svc.fanGetAllocation(req.user.sub, gameweekId);
  }

  @Get('marketplace/:fixtureId')
  fanGetMarketplace(@Param('fixtureId') fixtureId: string) {
    return this.svc.fanGetMarketplace(fixtureId);
  }

  @Get('markets/:marketId')
  fanGetFixtureMarket(@Param('marketId') marketId: string) {
    return this.svc.fanGetFixtureMarket(marketId);
  }

  @Get('markets/:marketId/listings')
  fanGetMarketplaceListings(@Param('marketId') marketId: string, @Request() req: { user: { sub: string } }) {
    return this.svc.fanGetMarketplaceListings(marketId, req.user.sub);
  }

  @Post('listings')
  fanCreateListing(@Request() req: { user: { sub: string } }, @Body() dto: CreateListingDto) {
    return this.svc.fanCreateListing(req.user.sub, dto);
  }

  @Get('listings')
  fanGetMyListings(@Request() req: { user: { sub: string } }) {
    return this.svc.fanGetMyListings(req.user.sub);
  }

  @Get('listings/:id')
  fanGetListing(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.svc.fanGetListing(req.user.sub, id);
  }

  @Delete('listings/:id')
  fanWithdrawListing(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.svc.fanWithdrawListing(req.user.sub, id);
  }

  @Post('listings/:id/accept')
  fanAcceptListing(@Request() req: { user: { sub: string } }, @Param('id') id: string, @Body() dto: AcceptListingDto) {
    return this.svc.fanAcceptListing(req.user.sub, id, dto);
  }

  @Get('leaderboard')
  fanGetLeaderboard(@Query('seasonId') seasonId: string, @Query('gameweekId') gameweekId?: string) {
    return this.svc.fanGetLeaderboard(seasonId, gameweekId);
  }

  @Get('ledger')
  fanGetMyLedger(@Request() req: { user: { sub: string } }, @Query('seasonId') seasonId?: string) {
    return this.svc.fanGetMyLedger(req.user.sub, seasonId);
  }

  // ── Direct Friend Challenge routes ─────────────────────────────────────────

  @Get('challenges/incoming')
  fanGetIncomingChallenges(@Request() req: { user: { sub: string } }) {
    return this.svc.fanGetIncomingChallenges(req.user.sub);
  }

  @Get('challenges/outgoing')
  fanGetOutgoingChallenges(@Request() req: { user: { sub: string } }) {
    return this.svc.fanGetOutgoingChallenges(req.user.sub);
  }

  @Post('listings/:id/challenge')
  fanCreateDirectChallenge(
    @Request() req: { user: { sub: string } },
    @Param('id') id: string,
    @Body() dto: CreateDirectChallengeDto,
  ) {
    return this.svc.fanCreateDirectChallenge(req.user.sub, id, dto.challengedUserId);
  }

  @Post('listings/:id/challenge/accept')
  fanAcceptDirectChallenge(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.svc.fanAcceptDirectChallenge(req.user.sub, id);
  }

  @Post('listings/:id/challenge/decline')
  fanDeclineDirectChallenge(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.svc.fanDeclineDirectChallenge(req.user.sub, id);
  }

  @Post('listings/:id/challenge/withdraw')
  fanWithdrawDirectChallenge(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.svc.fanWithdrawDirectChallenge(req.user.sub, id);
  }

  @Get('listings/:id/share-link')
  fanGetChallengeShareLink(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.svc.fanGetChallengeShareLink(req.user.sub, id);
  }
}

// ── Admin Routes ─────────────────────────────────────────────────────────────

@Controller('admin/social-predictions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class SocialPredictionAdminController {
  constructor(private readonly svc: SocialPredictionService) {}

  @Post('market-configs')
  adminCreateMarketConfig(@Request() req: { user: { sub: string } }, @Body() dto: CreateMarketConfigDto) {
    return this.svc.adminCreateMarketConfig(req.user.sub, dto);
  }

  @Get('market-configs')
  adminListMarketConfigs(@Query('seasonId') seasonId: string) {
    return this.svc.adminListMarketConfigs(seasonId);
  }

  @Patch('market-configs/:id/toggle')
  adminToggleMarketConfig(@Param('id') id: string, @Body() body: { isEnabled: boolean }) {
    return this.svc.adminToggleMarketConfig(id, body.isEnabled);
  }

  @Post('fixtures/:fixtureId/markets')
  adminGenerateFixtureMarkets(
    @Request() req: { user: { sub: string } },
    @Param('fixtureId') fixtureId: string,
    @Body() dto: GenerateFixtureMarketsDto,
  ) {
    return this.svc.adminGenerateFixtureMarkets(req.user.sub, fixtureId, dto);
  }

  @Get('fixtures/:fixtureId/markets')
  adminListFixtureMarkets(@Param('fixtureId') fixtureId: string) {
    return this.svc.adminListFixtureMarkets(fixtureId);
  }

  @Patch('markets/:id/open')
  adminOpenMarket(@Param('id') id: string) {
    return this.svc.adminOpenMarket(id);
  }

  @Patch('markets/:id/lock')
  adminLockMarket(@Param('id') id: string) {
    return this.svc.adminLockMarket(id);
  }

  @Patch('markets/:id/settle')
  adminSettleMarket(@Param('id') id: string, @Body() dto: SettleMarketDto) {
    return this.svc.adminSettleMarket(id, dto);
  }

  @Patch('markets/:id/void')
  adminVoidMarket(@Param('id') id: string, @Body() dto: VoidMarketDto) {
    return this.svc.adminVoidMarket(id, dto);
  }

  @Post('allocations/grant')
  adminGrantAllocation(@Request() req: { user: { sub: string } }, @Body() dto: GrantAllocationDto) {
    return this.svc.adminGrantAllocation(req.user.sub, dto);
  }

  @Patch('allocations/:fanUserId/:gameweekId')
  adminAdjustAllocation(
    @Request() req: { user: { sub: string } },
    @Param('fanUserId') fanUserId: string,
    @Param('gameweekId') gameweekId: string,
    @Body() dto: AdjustAllocationDto,
  ) {
    return this.svc.adminAdjustAllocation(req.user.sub, fanUserId, gameweekId, dto);
  }

  @Get('listings')
  adminListAllListings(
    @Query('fixtureMarketId') fixtureMarketId?: string,
    @Query('status') status?: ChallengeListingStatus,
    @Query('fanUserId') fanUserId?: string,
  ) {
    return this.svc.adminListAllListings({
      ...(fixtureMarketId !== undefined ? { fixtureMarketId } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(fanUserId !== undefined ? { fanUserId } : {}),
    });
  }

  @Get('listings/:id')
  adminGetListing(@Param('id') id: string) {
    return this.svc.adminGetListing(id);
  }

  @Patch('matches/:id/void')
  adminVoidMatch(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.svc.adminVoidMatch(id, body.reason);
  }

  @Get('compliance')
  adminGetComplianceStatus() {
    return this.svc.adminGetComplianceStatus();
  }
}
