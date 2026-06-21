import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TokenPayload } from '../auth/providers/auth.provider.interface';
import { PredictionChallengesService } from './prediction-challenges.service';
import { ChallengeSettlementService } from './challenge-settlement.service';
import { CreatePredictionChallengeDto } from './dto/create-prediction-challenge.dto';
import { AcceptPredictionChallengeDto } from './dto/accept-prediction-challenge.dto';

@Controller('predictions/challenges')
export class PredictionChallengesController {
  constructor(
    private service: PredictionChallengesService,
    private settlementService: ChallengeSettlementService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreatePredictionChallengeDto,
    @Headers('user-agent') ua: string,
  ) {
    return this.service.createChallenge(user.sub, dto, ua);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getMyChallenges(@CurrentUser() user: TokenPayload) {
    return this.service.getMyCreatedChallenges(user.sub);
  }

  @Get(':token')
  getByToken(@Param('token') token: string) {
    return this.service.getChallengeByToken(token);
  }

  @Post(':token/accept')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  accept(
    @CurrentUser() user: TokenPayload,
    @Param('token') token: string,
    @Body() dto: AcceptPredictionChallengeDto,
    @Headers('user-agent') ua: string,
  ) {
    return this.service.acceptChallenge(user.sub, token, dto, ua);
  }

  @Get(':token/status')
  getStatus(@Param('token') token: string) {
    return this.service.getChallengeStatus(token);
  }

  @Post(':token/settle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  settle(@Param('token') token: string) {
    return this.settlementService.settle(token);
  }

  @Get(':token/result')
  getResult(@Param('token') token: string) {
    return this.settlementService.getResult(token);
  }
}
