import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DataProviderService } from './data-provider.service';
import { DataProviderController } from './data-provider.controller';
import { ProviderRouterService } from './provider-router.service';

@Module({
  imports: [AuthModule],
  providers: [DataProviderService, ProviderRouterService],
  controllers: [DataProviderController],
  exports: [DataProviderService, ProviderRouterService],
})
export class DataProviderModule {}
