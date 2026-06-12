import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BetaFeedbackService } from './beta-feedback.service';

@Controller('admin/beta-feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class BetaFeedbackController {
  constructor(private readonly service: BetaFeedbackService) {}

  @Get('overview')
  getOverview() {
    return this.service.getOverview();
  }

  @Get('known-issues')
  getKnownIssues() {
    return this.service.getKnownIssues();
  }

  @Get('ux-checklist')
  getUxChecklist() {
    return this.service.getUxChecklist();
  }

  @Get('release-notes')
  getReleaseNotes() {
    return this.service.getReleaseNotes();
  }
}
