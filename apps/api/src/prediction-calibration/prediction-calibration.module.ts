import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PredictionCalibrationService } from './prediction-calibration.service';
import { PredictionCalibrationController } from './prediction-calibration.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [PredictionCalibrationService],
  controllers: [PredictionCalibrationController],
  exports: [PredictionCalibrationService],
})
export class PredictionCalibrationModule {}
