import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { FixtureImportModule } from '../fixture-import/fixture-import.module';
import { FantasyCalibrationModule } from '../fantasy-calibration/fantasy-calibration.module';
import { PredictionCalibrationModule } from '../prediction-calibration/prediction-calibration.module';
import { GameweekOperationsService } from './gameweek-operations.service';
import { GameweekOperationsController } from './gameweek-operations.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    FixtureImportModule,
    FantasyCalibrationModule,
    PredictionCalibrationModule,
  ],
  providers: [GameweekOperationsService],
  controllers: [GameweekOperationsController],
  exports: [GameweekOperationsService],
})
export class GameweekOperationsModule {}
