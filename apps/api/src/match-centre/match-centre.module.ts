import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { MatchCentreService } from './match-centre.service';
import { MatchCentreFanController, MatchCentreAdminController } from './match-centre.controller';

@Module({
  imports: [PrismaModule, AuthModule, CampaignsModule],
  providers: [MatchCentreService],
  controllers: [MatchCentreFanController, MatchCentreAdminController],
  exports: [MatchCentreService],
})
export class MatchCentreModule {}
