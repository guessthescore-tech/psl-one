import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TokenPayload } from '../auth/providers/auth.provider.interface';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';

@Controller('challenges')
@UseGuards(JwtAuthGuard)
export class ChallengesController {
  constructor(private challengesService: ChallengesService) {}

  @Post()
  create(@CurrentUser() user: TokenPayload, @Body() dto: CreateChallengeDto) {
    return this.challengesService.createChallenge(user.sub, dto);
  }

  @Get('me')
  getMyChallenges(@CurrentUser() user: TokenPayload) {
    return this.challengesService.getMyChallenge(user.sub);
  }

  @Get(':id')
  getChallenge(@CurrentUser() user: TokenPayload, @Param('id') id: string) {
    return this.challengesService.getChallenge(user.sub, id);
  }

  @Post(':id/accept')
  accept(@CurrentUser() user: TokenPayload, @Param('id') id: string) {
    return this.challengesService.acceptChallenge(user.sub, id);
  }

  @Post(':id/decline')
  decline(@CurrentUser() user: TokenPayload, @Param('id') id: string) {
    return this.challengesService.declineChallenge(user.sub, id);
  }

  @Post(':id/cancel')
  cancel(@CurrentUser() user: TokenPayload, @Param('id') id: string) {
    return this.challengesService.cancelChallenge(user.sub, id);
  }
}
