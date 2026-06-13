import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SquadImportService, CreateManualBatchDto } from './squad-import.service';

@Controller('admin/squad-import')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class SquadImportController {
  constructor(private readonly squadImportService: SquadImportService) {}

  @Get('seasons')
  getImportSeasons() {
    return this.squadImportService.getImportSeasons();
  }

  @Get(':seasonId/overview')
  getImportOverview(@Param('seasonId') seasonId: string) {
    return this.squadImportService.getImportOverview(seasonId);
  }

  @Get(':seasonId/batches')
  listBatches(@Param('seasonId') seasonId: string) {
    return this.squadImportService.listBatches(seasonId);
  }

  @Get(':seasonId/batches/:batchId')
  getBatch(@Param('seasonId') seasonId: string, @Param('batchId') batchId: string) {
    return this.squadImportService.getBatch(seasonId, batchId);
  }

  @Get(':seasonId/batches/:batchId/rows')
  listRows(@Param('seasonId') seasonId: string, @Param('batchId') batchId: string) {
    return this.squadImportService.listRows(seasonId, batchId);
  }

  @Post(':seasonId/batches/manual')
  createManualBatch(
    @Param('seasonId') seasonId: string,
    @Body() dto: CreateManualBatchDto,
    @Request() req: { user?: { userId?: string } },
  ) {
    return this.squadImportService.createManualBatch(seasonId, dto, req.user?.userId);
  }

  @Post(':seasonId/batches/:batchId/validate')
  validateBatch(
    @Param('seasonId') seasonId: string,
    @Param('batchId') batchId: string,
    @Request() req: { user?: { userId?: string } },
  ) {
    return this.squadImportService.validateBatch(seasonId, batchId, req.user?.userId);
  }

  @Post(':seasonId/batches/:batchId/import')
  importBatch(
    @Param('seasonId') seasonId: string,
    @Param('batchId') batchId: string,
    @Request() req: { user?: { userId?: string } },
  ) {
    return this.squadImportService.importBatch(seasonId, batchId, req.user?.userId);
  }

  @Post(':seasonId/batches/:batchId/publish')
  publishBatch(
    @Param('seasonId') seasonId: string,
    @Param('batchId') batchId: string,
    @Request() req: { user?: { userId?: string } },
  ) {
    return this.squadImportService.publishBatch(seasonId, batchId, req.user?.userId);
  }

  @Post(':seasonId/batches/:batchId/cancel')
  cancelBatch(
    @Param('seasonId') seasonId: string,
    @Param('batchId') batchId: string,
    @Request() req: { user?: { userId?: string } },
  ) {
    return this.squadImportService.cancelBatch(seasonId, batchId, req.user?.userId);
  }

  @Get(':seasonId/duplicates')
  getDuplicates(@Param('seasonId') seasonId: string) {
    return this.squadImportService.getDuplicates(seasonId);
  }

  @Get(':seasonId/readiness')
  getReadiness(@Param('seasonId') seasonId: string) {
    return this.squadImportService.getReadiness(seasonId);
  }

  @Get(':seasonId/activation-impact')
  getActivationImpact(@Param('seasonId') seasonId: string) {
    return this.squadImportService.getActivationImpact(seasonId);
  }

  @Get(':seasonId/activation-dry-run')
  getActivationDryRun(@Param('seasonId') seasonId: string) {
    return this.squadImportService.getActivationDryRun(seasonId);
  }
}
