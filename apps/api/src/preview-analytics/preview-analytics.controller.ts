import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { TrackEventDto } from './dto/track-event.dto';
import { PreviewAnalyticsService } from './preview-analytics.service';

@Controller('analytics')
export class PreviewAnalyticsController {
  constructor(private service: PreviewAnalyticsService) {}

  @Post('events')
  @HttpCode(HttpStatus.ACCEPTED)
  track(@Body() dto: TrackEventDto) {
    // UserId is optional — analytics can be called unauthenticated
    this.service.track(dto.event, undefined, dto.properties);
    return { accepted: true };
  }
}
