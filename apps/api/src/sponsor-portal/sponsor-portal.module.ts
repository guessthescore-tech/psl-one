import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SponsorPortalController } from './sponsor-portal.controller';
import { SponsorPortalService } from './sponsor-portal.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SponsorPortalController],
  providers: [SponsorPortalService],
})
export class SponsorPortalModule {}
