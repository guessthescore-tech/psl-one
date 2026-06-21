import { Injectable, Logger } from '@nestjs/common';
import { TrackEventDto, sanitizeProperties } from './dto/track-event.dto';

@Injectable()
export class PreviewAnalyticsService {
  private readonly logger = new Logger(PreviewAnalyticsService.name);
  private readonly enabled: boolean;

  constructor() {
    this.enabled = process.env['PREVIEW_ANALYTICS_ENABLED'] === 'true' || process.env['NODE_ENV'] !== 'production';
  }

  track(event: string, userId?: string, properties?: Record<string, unknown>) {
    if (!this.enabled) return;
    const safe = sanitizeProperties(properties);
    // In preview mode: structured log only — no third-party calls
    this.logger.log(JSON.stringify({ type: 'analytics', event, userId, properties: safe, ts: new Date().toISOString() }));
  }

  validateEvent(dto: TrackEventDto): { valid: boolean; sanitized: Record<string, string | number | boolean> } {
    const sanitized = sanitizeProperties(dto.properties);
    return { valid: true, sanitized };
  }
}
