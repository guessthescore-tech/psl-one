import { Controller, Get } from '@nestjs/common';
import { getRuntimeMetadata } from '../runtime-metadata';

@Controller('version')
export class VersionController {
  @Get()
  version() {
    return getRuntimeMetadata();
  }
}
