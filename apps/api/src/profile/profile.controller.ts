import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TokenPayload } from '../auth/providers/auth.provider.interface';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get('me')
  getProfile(@CurrentUser() user: TokenPayload) {
    return this.profileService.getProfile(user.sub);
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: TokenPayload, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(user.sub, dto);
  }

  @Get('preferences')
  getPreferences(@CurrentUser() user: TokenPayload) {
    return this.profileService.getPreferences(user.sub);
  }

  @Patch('preferences')
  updatePreferences(@CurrentUser() user: TokenPayload, @Body() dto: UpdatePreferencesDto) {
    return this.profileService.updatePreferences(user.sub, dto);
  }

  @Get('summary')
  getSummary(@CurrentUser() user: TokenPayload) {
    return this.profileService.getSummary(user.sub);
  }
}
