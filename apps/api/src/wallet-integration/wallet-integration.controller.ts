import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TokenPayload } from '../auth/providers/auth.provider.interface';
import {
  WalletIntegrationService,
  CreateProviderDto,
  UpdateProviderDto,
  SandboxWebhookDto,
  StartLinkDto,
  ConfirmLinkDto,
  UnlinkDto,
} from './wallet-integration.service';

@Controller()
export class WalletIntegrationController {
  constructor(private readonly walletIntegrationService: WalletIntegrationService) {}

  @Get('fan/wallet/status')
  @UseGuards(JwtAuthGuard)
  fanGetWalletStatus(@CurrentUser() user: TokenPayload) {
    return this.walletIntegrationService.fanGetWalletStatus(user.sub);
  }

  @Post('fan/wallet/link/start')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  fanStartWalletLink(
    @Body() dto: StartLinkDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.walletIntegrationService.fanStartWalletLink(user.sub, dto);
  }

  @Post('fan/wallet/link/confirm')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  fanConfirmWalletLink(
    @Body() dto: ConfirmLinkDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.walletIntegrationService.fanConfirmWalletLink(user.sub, dto);
  }

  @Post('fan/wallet/unlink')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  fanUnlinkWallet(
    @Body() dto: UnlinkDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.walletIntegrationService.fanUnlinkWallet(user.sub, dto);
  }

  @Get('admin/wallet/providers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminListProviders() {
    return this.walletIntegrationService.adminListProviders();
  }

  @Post('admin/wallet/providers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminCreateProvider(
    @Body() dto: CreateProviderDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.walletIntegrationService.adminCreateProvider(dto, user.sub);
  }

  @Patch('admin/wallet/providers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminUpdateProvider(
    @Param('id') id: string,
    @Body() dto: UpdateProviderDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.walletIntegrationService.adminUpdateProvider(id, dto, user.sub);
  }

  @Get('admin/wallet/links')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminListWalletLinks(
    @Query('fanUserId') fanUserId?: string,
    @Query('status') status?: string,
  ) {
    const filters: { fanUserId?: string; status?: string } = {};
    if (fanUserId) filters.fanUserId = fanUserId;
    if (status) filters.status = status;
    return this.walletIntegrationService.adminListWalletLinks(filters);
  }

  @Get('admin/wallet/transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminListTransactions(
    @Query('fanUserId') fanUserId?: string,
    @Query('transactionType') transactionType?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: { fanUserId?: string; transactionType?: string; limit?: number } = {};
    if (fanUserId) filters.fanUserId = fanUserId;
    if (transactionType) filters.transactionType = transactionType;
    if (limit) filters.limit = parseInt(limit, 10);
    return this.walletIntegrationService.adminListTransactions(filters);
  }

  @Post('admin/wallet/webhooks/:providerSlug/sandbox')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  adminProcessSandboxWebhook(
    @Param('providerSlug') providerSlug: string,
    @Body() dto: SandboxWebhookDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.walletIntegrationService.adminProcessSandboxWebhook(providerSlug, dto, user.sub);
  }
}
