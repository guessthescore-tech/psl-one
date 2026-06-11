import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AchievementsModule } from '../achievements/achievements.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [PrismaModule, AuthModule, AchievementsModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
