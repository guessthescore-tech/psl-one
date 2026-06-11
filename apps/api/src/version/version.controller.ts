import { Controller, Get } from '@nestjs/common';

@Controller('version')
export class VersionController {
  @Get()
  version() {
    return {
      version: '0.1.0',
      environment: process.env['NODE_ENV'] ?? 'development',
    };
  }
}
