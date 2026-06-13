import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  MediaService,
  CreateMediaDto,
  UpdateMediaDto,
  ListPublicMediaFilters,
  AdminListMediaFilters,
} from './media.service';

@Controller()
export class MediaController {
  constructor(private readonly service: MediaService) {}

  // ── Fan: public listing ────────────────────────────────────────────────────

  @Get('fan/media')
  listPublicMedia(
    @Query('clubId') clubId?: string,
    @Query('mediaType') mediaType?: string,
    @Query('category') category?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const filters: ListPublicMediaFilters = {};
    if (clubId) filters.clubId = clubId;
    if (mediaType) filters.mediaType = mediaType;
    if (category) filters.category = category;
    if (limit) filters.limit = parseInt(limit, 10);
    if (offset) filters.offset = parseInt(offset, 10);
    return this.service.listPublicMedia(filters);
  }

  @Get('fan/media/:slug')
  getPublicMediaDetail(@Param('slug') slug: string) {
    return this.service.getPublicMediaDetail(slug);
  }

  @Get('fan/clubs/:clubId/media')
  listClubMedia(@Param('clubId') clubId: string) {
    return this.service.listClubMedia(clubId);
  }

  @Post('fan/media/:id/view')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  recordView(
    @Param('id') id: string,
    @Request() req: { user?: { userId?: string } },
    @Body() body: { idempotencyKey?: string },
  ) {
    return this.service.recordView(id, req.user?.userId ?? '', body?.idempotencyKey);
  }

  @Post('fan/media/:id/complete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  recordCompletion(
    @Param('id') id: string,
    @Request() req: { user?: { userId?: string } },
    @Body() body: { idempotencyKey?: string },
  ) {
    return this.service.recordCompletion(id, req.user?.userId ?? '', body?.idempotencyKey);
  }

  // ── Admin ──────────────────────────────────────────────────────────────────

  @Get('admin/media')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminListMedia(
    @Query('visibility') visibility?: string,
    @Query('mediaType') mediaType?: string,
  ) {
    const filters: AdminListMediaFilters = {};
    if (visibility) filters.visibility = visibility;
    if (mediaType) filters.mediaType = mediaType;
    return this.service.adminListMedia(filters);
  }

  @Post('admin/media')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminCreateMedia(
    @Body() dto: CreateMediaDto,
    @Request() req: { user?: { userId?: string } },
  ) {
    return this.service.adminCreateMedia(dto, req.user?.userId);
  }

  @Get('admin/media/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminGetMedia(@Param('id') id: string) {
    return this.service.adminGetMedia(id);
  }

  @Patch('admin/media/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminUpdateMedia(
    @Param('id') id: string,
    @Body() dto: UpdateMediaDto,
    @Request() req: { user?: { userId?: string } },
  ) {
    return this.service.adminUpdateMedia(id, dto, req.user?.userId);
  }

  @Post('admin/media/:id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  adminPublishMedia(
    @Param('id') id: string,
    @Request() req: { user?: { userId?: string } },
  ) {
    return this.service.adminPublishMedia(id, req.user?.userId);
  }

  @Post('admin/media/:id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  adminArchiveMedia(
    @Param('id') id: string,
    @Request() req: { user?: { userId?: string } },
  ) {
    return this.service.adminArchiveMedia(id, req.user?.userId);
  }
}
