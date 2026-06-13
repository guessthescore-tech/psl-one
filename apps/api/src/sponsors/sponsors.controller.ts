import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SponsorsService, CreateSponsorDto, UpdateSponsorDto } from './sponsors.service';

@Controller('admin/sponsors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class SponsorsController {
  constructor(private readonly service: SponsorsService) {}

  @Get()
  adminListSponsors() {
    return this.service.adminListSponsors();
  }

  @Post()
  adminCreateSponsor(
    @Body() dto: CreateSponsorDto,
    @Request() req: { user?: { userId?: string } },
  ) {
    return this.service.adminCreateSponsor(dto, req.user?.userId);
  }

  @Get(':id')
  adminGetSponsor(@Param('id') id: string) {
    return this.service.adminGetSponsor(id);
  }

  @Patch(':id')
  adminUpdateSponsor(
    @Param('id') id: string,
    @Body() dto: UpdateSponsorDto,
    @Request() req: { user?: { userId?: string } },
  ) {
    return this.service.adminUpdateSponsor(id, dto, req.user?.userId);
  }
}
