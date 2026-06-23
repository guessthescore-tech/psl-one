import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ClubPortalController } from './club-portal.controller';
import { ClubPortalService } from './club-portal.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ClubPortalController],
  providers: [ClubPortalService],
})
export class ClubPortalModule {}
