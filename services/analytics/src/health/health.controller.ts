import { Controller, Get } from '@nestjs/common';
@Controller('health')
export class HealthController {
  @Get()
  health() { return { status: 'ok', service: 'analytics', version: '0.0.1', timestamp: new Date().toISOString() }; }
  @Get('ready')
  ready() { return { status: 'ok' }; }
}
