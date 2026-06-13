import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { FantasyPriceCalibrationService } from './fantasy-price-calibration.service';
import { FantasyPriceCalibrationController } from './fantasy-price-calibration.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [FantasyPriceCalibrationController],
  providers: [FantasyPriceCalibrationService],
  exports: [FantasyPriceCalibrationService],
})
export class FantasyPriceCalibrationModule {}
