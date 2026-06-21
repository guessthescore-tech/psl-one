import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AccountController } from './account.controller';
import { AccountDeletionService } from './account-deletion.service';
import { AccountOnboardingService } from './account-onboarding.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AccountController],
  providers: [AccountDeletionService, AccountOnboardingService],
})
export class AccountModule {}
