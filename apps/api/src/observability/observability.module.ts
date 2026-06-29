import { Module } from '@nestjs/common';
import { RequestContextService } from './request-context.service';
import { StructuredLoggerService } from './structured-logger.service';
import { RequestLoggingInterceptor } from './request-logging.interceptor';

@Module({
  providers: [RequestContextService, StructuredLoggerService, RequestLoggingInterceptor],
  exports: [RequestContextService, StructuredLoggerService, RequestLoggingInterceptor],
})
export class ObservabilityModule {}
