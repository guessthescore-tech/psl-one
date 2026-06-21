import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TokenPayload } from '../auth/providers/auth.provider.interface';
import { AccountDeletionService } from './account-deletion.service';
import { CreateDeletionRequestDto } from './dto/create-deletion-request.dto';

@Controller('account')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private deletionService: AccountDeletionService) {}

  @Post('deletion-request')
  @HttpCode(HttpStatus.OK)
  async requestDeletion(
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreateDeletionRequestDto,
  ) {
    return this.deletionService.requestDeletion(user.sub, dto);
  }

  @Get('deletion-request/status')
  async getDeletionStatus(@CurrentUser() user: TokenPayload) {
    return this.deletionService.getStatus(user.sub);
  }

  @Post('deletion-request/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelDeletion(@CurrentUser() user: TokenPayload) {
    return this.deletionService.cancelRequest(user.sub);
  }
}
