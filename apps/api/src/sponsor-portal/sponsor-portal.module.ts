import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PortalScopeModule } from '../portal-scope/portal-scope.module';
import { SponsorPortalController } from './sponsor-portal.controller';
import { SponsorPortalService } from './sponsor-portal.service';

@Module({
  imports: [PrismaModule, AuthModule, PortalScopeModule],
  controllers: [SponsorPortalController],
  providers: [SponsorPortalService],
})
export class SponsorPortalModule {}
