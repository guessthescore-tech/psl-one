import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { parseCorsOrigins } from '../env';
import { PrismaService } from '../prisma/prisma.service';
import { getRuntimeMetadata } from '../runtime-metadata';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  health() {
    const metadata = getRuntimeMetadata();
    return {
      status: 'ok',
      service: 'api',
      version: metadata.version,
      environment: metadata.environmentLabel,
      gitSha: metadata.gitSha,
      buildTimestamp: metadata.buildTimestamp,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async readiness() {
    try {
      this.assertRequiredConfiguration();
      await this.prisma.$queryRaw(Prisma.sql`SELECT 1`);
      const metadata = getRuntimeMetadata();

      return {
        status: 'ready',
        service: 'api',
        version: metadata.version,
        environment: metadata.environmentLabel,
        gitSha: metadata.gitSha,
        buildTimestamp: metadata.buildTimestamp,
        checks: {
          database: 'ok',
          configuration: 'ok',
        },
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        service: 'api',
        checks: {
          database: 'unavailable',
          configuration: 'unavailable',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  private assertRequiredConfiguration() {
    const databaseUrl = process.env['DATABASE_URL'];
    const jwtSecret = process.env['JWT_SECRET'];
    const nodeEnv = process.env['NODE_ENV'] ?? 'development';

    if (!databaseUrl) throw new Error('DATABASE_URL is required');
    if (!jwtSecret || jwtSecret.length < 32) throw new Error('JWT_SECRET is invalid');
    parseCorsOrigins(process.env['CORS_ORIGINS'], nodeEnv);
  }
}
