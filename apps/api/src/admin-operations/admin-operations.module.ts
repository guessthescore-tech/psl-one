import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AdminOperationsController } from './admin-operations.controller';
import { AdminOperationsService } from './admin-operations.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminOperationsController],
  providers: [AdminOperationsService],
  exports: [AdminOperationsService],
})
export class AdminOperationsModule {}
