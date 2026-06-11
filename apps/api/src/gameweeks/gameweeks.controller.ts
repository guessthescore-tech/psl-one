import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { GameweeksService } from './gameweeks.service';
import { GameweekDeadlineService } from './gameweek-deadline.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateGameweekStatusDto } from './dto/update-gameweek-status.dto';
import { UpdateGameweekDeadlinesDto } from './dto/update-gameweek-deadlines.dto';

@Controller('gameweeks')
export class GameweeksController {
  constructor(
    private gameweeksService: GameweeksService,
    private deadlineService: GameweekDeadlineService,
  ) {}

  @Get()
  findAll() {
    return this.gameweeksService.findAll();
  }

  @Get('active')
  findActive() {
    return this.gameweeksService.findActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gameweeksService.findOne(id);
  }

  @Get(':id/fixtures')
  findFixtures(@Param('id') id: string) {
    return this.gameweeksService.findFixtures(id);
  }

  @Get(':id/lock-state')
  getLockState(@Param('id') id: string) {
    return this.gameweeksService.getLockState(id);
  }
}

@Controller('admin/gameweeks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class AdminGameweeksController {
  constructor(private gameweeksService: GameweeksService) {}

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateGameweekStatusDto) {
    return this.gameweeksService.updateStatus(id, dto);
  }

  @Patch(':id/deadlines')
  updateDeadlines(@Param('id') id: string, @Body() dto: UpdateGameweekDeadlinesDto) {
    return this.gameweeksService.updateDeadlines(id, dto);
  }
}
