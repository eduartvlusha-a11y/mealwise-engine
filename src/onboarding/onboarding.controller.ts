import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { MealwiseService } from '../mealwise/mealwise.service';
import { ProfileService } from '../profile/profile.service';
import { ApiBearerAuth } from '@nestjs/swagger';


@Controller('onboarding')
export class OnboardingController {
  constructor(
    private readonly onboardingService: OnboardingService,
    private readonly mealwiseService: MealwiseService,
    private readonly profileService: ProfileService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMyOnboarding(@Req() req: any) {
    const userId = req.user.sub;
    return this.onboardingService.getOnboarding(userId);
  }


  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
 @Post('save')
  async saveMyOnboarding(@Req() req: any, @Body() body: any) {
    const userId = req.user.sub;


    // 1️⃣ Save onboarding data
    await this.onboardingService.saveOnboarding(userId, {
      age: body.age,
      gender: body.gender,
      activityLevel: body.activityLevel,
      goal: body.goal,
      height: body.height,
      weight: body.weight,
      dietaryPreferences: body.dietaryPreferences,
      allergies: body.allergies,
      budget: body.budget,
      country: body.country,
    });

    console.log('🧩 ONBOARDING: saved. About to upsert profile. userId=', userId);

const profile = await this.profileService.upsertProfileFromOnboarding(userId);

console.log('✅ PROFILE UPSERT DONE. profileId=', profile?.id);


    // 2️⃣ Auto-run REAL MealWise pipeline (Option C)
    await this.mealwiseService.initializeUserAfterOnboarding(userId);

    // 3️⃣ Response to Flutter
    return { success: true };
  }
}
