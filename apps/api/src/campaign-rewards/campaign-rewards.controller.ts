import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CampaignRewardsService,
  CreateRewardDefinitionDto,
  UpdateRewardDefinitionDto,
  IssueRewardDto,
} from './campaign-rewards.service';

interface AuthedRequest {
  user?: { userId?: string; sub?: string };
}

@Controller()
export class CampaignRewardsController {
  constructor(private readonly service: CampaignRewardsService) {}

  @Get('fan/rewards')
  @UseGuards(JwtAuthGuard)
  fanListRewards(@Request() req: AuthedRequest) {
    return this.service.fanListRewards(req.user?.userId ?? req.user?.sub ?? '');
  }

  @Get('fan/rewards/:id')
  @UseGuards(JwtAuthGuard)
  fanGetReward(@Param('id') id: string, @Request() req: AuthedRequest) {
    return this.service.fanGetReward(id, req.user?.userId ?? req.user?.sub ?? '');
  }

  @Post('fan/rewards/:id/claim')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  claimReward(@Param('id') id: string, @Request() req: AuthedRequest) {
    return this.service.claimReward(id, req.user?.userId ?? req.user?.sub ?? '');
  }

  @Post('fan/rewards/:id/redeem')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  sandboxRedeemReward(@Param('id') id: string, @Request() req: AuthedRequest) {
    return this.service.sandboxRedeemReward(id, req.user?.userId ?? req.user?.sub ?? '');
  }

  @Get('admin/reward-definitions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminListRewardDefinitions(
    @Query('rewardType') rewardType?: string,
    @Query('isActive') isActive?: string,
    @Query('sponsorId') sponsorId?: string,
  ) {
    return this.service.adminListRewardDefinitions({
      ...(rewardType !== undefined ? { rewardType } : {}),
      ...(isActive !== undefined ? { isActive: isActive !== 'false' } : {}),
      ...(sponsorId !== undefined ? { sponsorId } : {}),
    });
  }

  @Post('admin/reward-definitions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminCreateRewardDefinition(
    @Body() dto: CreateRewardDefinitionDto,
    @Request() req: AuthedRequest,
  ) {
    return this.service.adminCreateRewardDefinition(dto, req.user?.userId);
  }

  @Patch('admin/reward-definitions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminUpdateRewardDefinition(
    @Param('id') id: string,
    @Body() dto: UpdateRewardDefinitionDto,
    @Request() req: AuthedRequest,
  ) {
    return this.service.adminUpdateRewardDefinition(id, dto, req.user?.userId);
  }

  @Post('admin/rewards')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminIssueReward(@Body() dto: IssueRewardDto) {
    return this.service.issueReward(dto);
  }

  @Get('admin/rewards')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminListFanRewards(
    @Query('fanUserId') fanUserId?: string,
    @Query('status') status?: string,
    @Query('campaignId') campaignId?: string,
  ) {
    return this.service.adminListFanRewards({
      ...(fanUserId !== undefined ? { fanUserId } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(campaignId !== undefined ? { campaignId } : {}),
    });
  }
}
