import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DataProviderService } from './data-provider.service';
import { DataProviderController } from './data-provider.controller';

@Module({
  imports: [AuthModule],
  providers: [DataProviderService],
  controllers: [DataProviderController],
  exports: [DataProviderService],
})
export class DataProviderModule {}
