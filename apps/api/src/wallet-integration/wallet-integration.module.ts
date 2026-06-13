import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ActivityFeedModule } from '../activity-feed/activity-feed.module';
import { WalletIntegrationService } from './wallet-integration.service';
import { WalletIntegrationController } from './wallet-integration.controller';
import { SiliconEnterpriseSandboxWalletAdapter } from './wallet-provider.adapter';

@Module({
  imports: [PrismaModule, AuthModule, NotificationsModule, ActivityFeedModule],
  providers: [WalletIntegrationService, SiliconEnterpriseSandboxWalletAdapter],
  controllers: [WalletIntegrationController],
  exports: [WalletIntegrationService],
})
export class WalletIntegrationModule {}
