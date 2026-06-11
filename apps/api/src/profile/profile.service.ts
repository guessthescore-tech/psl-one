import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AchievementsService } from '../achievements/achievements.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

const PREFERRED_TEAM_SELECT = {
  id: true,
  name: true,
  slug: true,
  shortName: true,
} as const;

const PROFILE_INCLUDE = {
  preferredTeam: { select: PREFERRED_TEAM_SELECT },
  preferences: true,
} as const;

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private readonly achievementsService: AchievementsService,
  ) {}

  async getOrCreateProfile(userId: string) {
    return this.prisma.fanProfile.upsert({
      where: { userId },
      create: {
        userId,
        preferences: { create: {} },
      },
      update: {},
      include: PROFILE_INCLUDE,
    });
  }

  getProfile(userId: string) {
    return this.getOrCreateProfile(userId);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.preferredTeamId !== undefined && dto.preferredTeamId !== null) {
      const team = await this.prisma.team.findUnique({
        where: { id: dto.preferredTeamId },
        select: { id: true },
      });
      if (!team) throw new BadRequestException('preferredTeamId references an unknown team');
    }

    await this.getOrCreateProfile(userId);

    const profile = await this.prisma.fanProfile.update({
      where: { userId },
      data: {
        ...(dto.displayName !== undefined ? { displayName: dto.displayName } : {}),
        ...(dto.city !== undefined ? { city: dto.city } : {}),
        ...(dto.country !== undefined ? { country: dto.country } : {}),
        ...(dto.preferredTeamId !== undefined ? { preferredTeamId: dto.preferredTeamId } : {}),
      },
      include: PROFILE_INCLUDE,
    });

    this.achievementsService.safeEvaluate(userId, ['profile-completed']).catch(() => null);
    return profile;
  }

  async getPreferences(userId: string) {
    const profile = await this.getOrCreateProfile(userId);
    return profile.preferences;
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const profile = await this.getOrCreateProfile(userId);

    return this.prisma.notificationPreferences.update({
      where: { profileId: profile.id },
      data: {
        ...(dto.matchReminders !== undefined ? { matchReminders: dto.matchReminders } : {}),
        ...(dto.teamNews !== undefined ? { teamNews: dto.teamNews } : {}),
        ...(dto.fantasyUpdates !== undefined ? { fantasyUpdates: dto.fantasyUpdates } : {}),
        ...(dto.rewardsUpdates !== undefined ? { rewardsUpdates: dto.rewardsUpdates } : {}),
      },
    });
  }

  async getSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const profile = await this.getOrCreateProfile(userId);

    const optionalFields = [
      profile.displayName,
      profile.city,
      profile.country,
      profile.preferredTeamId,
    ];
    const filled = optionalFields.filter(f => f !== null && f !== undefined).length;
    const completionPercent = Math.round((filled / optionalFields.length) * 100);

    return {
      email: user.email,
      role: user.role,
      displayName: profile.displayName,
      city: profile.city,
      country: profile.country,
      preferredTeam: profile.preferredTeam,
      completionPercent,
    };
  }
}
