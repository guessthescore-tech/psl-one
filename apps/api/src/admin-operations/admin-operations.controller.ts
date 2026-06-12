import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminOperationsService } from './admin-operations.service';

@Controller('admin/operations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class AdminOperationsController {
  constructor(private readonly service: AdminOperationsService) {}

  @Get('overview')
  getAdminOperationsOverview() {
    return this.service.getAdminOperationsOverview();
  }

  @Get('capability-review')
  getCapabilityReview() {
    return this.service.getCapabilityReview();
  }

  @Get('launch-readiness')
  getLaunchReadiness() {
    return this.service.getLaunchReadiness();
  }

  @Get('module-readiness/:seasonId')
  getSeasonModuleReadiness(@Param('seasonId') seasonId: string) {
    return this.service.getSeasonModuleReadiness(seasonId);
  }

  @Get('smoke-tests/routes')
  getSmokeTestRoutes() {
    return this.service.getSmokeTestRoutes();
  }

  @Get('smoke-tests/rbac')
  getSmokeTestRbac() {
    return this.service.getSmokeTestRbac();
  }

  @Get('smoke-tests/workflows')
  getSmokeTestWorkflows() {
    return this.service.getSmokeTestWorkflows();
  }

  @Post('smoke-tests/run')
  runSmokeTests() {
    return this.service.runSmokeTests();
  }

  @Get('integrations/providers')
  getIntegrationProviders() {
    return this.service.getIntegrationProviders();
  }

  @Get('integrations/commercial-readiness')
  getCommercialReadiness() {
    return this.service.getCommercialReadiness();
  }

  @Get('integrations/wallet-payments')
  getWalletPaymentsReadiness() {
    return this.service.getWalletPaymentsReadiness();
  }

  @Get('integrations/checkout-commerce')
  getCheckoutCommerceReadiness() {
    return this.service.getCheckoutCommerceReadiness();
  }

  @Get('integrations/ticketing')
  getTicketingReadiness() {
    return this.service.getTicketingReadiness();
  }

  @Get('integrations/live-data')
  getLiveDataReadiness() {
    return this.service.getLiveDataReadiness();
  }

  @Get('integrations/sponsor-activation')
  getSponsorActivationReadiness() {
    return this.service.getSponsorActivationReadiness();
  }

  @Get('integrations/rewards-redemption')
  getRewardsRedemptionReadiness() {
    return this.service.getRewardsRedemptionReadiness();
  }
}
