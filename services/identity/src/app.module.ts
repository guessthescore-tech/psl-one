import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    // Feature modules added by Platform Agent in Sprint 1:
    // AuthModule, UserModule, ConsentModule, PopiaModule
  ],
})
export class AppModule {}
