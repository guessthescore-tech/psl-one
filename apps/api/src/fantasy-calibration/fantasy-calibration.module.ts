import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { FantasyCalibrationService } from './fantasy-calibration.service';
import { FantasyCalibrationController } from './fantasy-calibration.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [FantasyCalibrationService],
  controllers: [FantasyCalibrationController],
  exports: [FantasyCalibrationService],
})
export class FantasyCalibrationModule {}
