import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PortalScopeService } from './portal-scope.service';

@Module({
  imports: [PrismaModule],
  providers: [PortalScopeService],
  exports: [PortalScopeService],
})
export class PortalScopeModule {}
