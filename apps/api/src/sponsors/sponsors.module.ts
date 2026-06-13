import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SponsorsService } from './sponsors.service';
import { SponsorsController } from './sponsors.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [SponsorsService],
  controllers: [SponsorsController],
  exports: [SponsorsService],
})
export class SponsorsModule {}
