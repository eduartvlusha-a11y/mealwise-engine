import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

 @Get()
async getMyProfile(@Req() req: any) {
  const userId = req.user.userId;

  if (!userId) throw new Error('User not found in request');

  const result = await this.profileService.getProfileWithMetrics(userId);

  if (!result) {
    return null;
  }

  return result;
}



  @Patch()
  async updateMyProfile(
    @Req() req: any,
    @Body()
    body: {
      age?: number;
      height?: number;
      weight?: number;
      gender?: string;
      goal?: string;
      activityLevel?: string;
      dietaryPreferences?: string[];
      allergies?: string[];
      budget?: number;
      country?: string;
      preferredSystem?: string;
      preferredWeightUnit?: string;
      preferredVolumeUnit?: string;
    },
  ) {
    const userId = req.user.userId;

    if (!userId) throw new Error('User not found in request');

    return this.profileService.updateProfile(userId, body);
  }
}
