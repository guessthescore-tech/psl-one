import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminCompetitionsService } from './admin-competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';

@Controller('admin/competitions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class AdminCompetitionsController {
  constructor(private service: AdminCompetitionsService) {}

  @Get()
  listCompetitions() {
    return this.service.listCompetitions();
  }

  @Post()
  createCompetition(@Body() dto: CreateCompetitionDto) {
    return this.service.createCompetition(dto);
  }

  @Patch(':id')
  updateCompetition(@Param('id') id: string, @Body() dto: UpdateCompetitionDto) {
    return this.service.updateCompetition(id, dto);
  }

  @Get(':id/seasons')
  listSeasons(@Param('id') id: string) {
    return this.service.listSeasons(id);
  }

  @Post(':id/seasons')
  createSeason(@Param('id') id: string, @Body() dto: CreateSeasonDto) {
    return this.service.createSeason(id, dto);
  }
}

@Controller('admin/seasons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class AdminSeasonsController {
  constructor(private service: AdminCompetitionsService) {}

  @Patch(':id')
  updateSeason(@Param('id') id: string, @Body() dto: UpdateSeasonDto) {
    return this.service.updateSeason(id, dto);
  }

  @Post(':id/activate')
  activateSeason(@Param('id') id: string) {
    return this.service.activateSeason(id);
  }
}
