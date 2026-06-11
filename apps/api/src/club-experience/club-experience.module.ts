import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ClubAdminService } from './club-admin.service';
import { ClubExperienceController } from './club-experience.controller';
import { ClubExperienceService } from './club-experience.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ClubExperienceController],
  providers: [ClubExperienceService, ClubAdminService],
  exports: [ClubExperienceService, ClubAdminService],
})
export class ClubExperienceModule {}
