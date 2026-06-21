import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DataProviderService } from './data-provider.service';

@Controller('admin/data-provider')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class DataProviderController {
  constructor(private service: DataProviderService) {}

  @Get('health')
  health() { return this.service.health(); }

  @Get('discovery/seasons')
  seasons() { return this.service.getSeasons(); }

  @Get('discovery/fixtures/:seasonId')
  fixtures(@Param('seasonId') seasonId: string) { return this.service.getFixtures(seasonId); }

  @Get('discovery/teams/:seasonId')
  teams(@Param('seasonId') seasonId: string) { return this.service.getTeams(seasonId); }

  @Get('discovery/standings/:seasonId')
  standings(@Param('seasonId') seasonId: string) { return this.service.getStandings(seasonId); }
}
