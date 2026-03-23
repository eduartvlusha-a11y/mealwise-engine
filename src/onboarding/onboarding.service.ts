import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileService } from '../profile/profile.service';
import { MealwiseService } from '../mealwise/mealwise.service';


@Injectable()
export class OnboardingService {
  constructor(
  private prisma: PrismaService,
  private profileService: ProfileService,
  @Inject(forwardRef(() => MealwiseService))
  private mealwiseService: MealwiseService,
) {}



  async getOnboarding(userId: string) {
    return this.prisma.onboarding.findUnique({
      where: { userId },
    });
  }

  async saveOnboarding(
    userId: string,
    data: {
      age?: number | string;
      gender?: string;
      activityLevel?: string;
      goal?: string;
      height?: number | string;
      weight?: number | string;
      dietaryPreferences?: string[] | string;
      allergies?: string[] | string;
      budget?: number | string;
      country?: string;
      preferences?: string | null;
    },
  ) {
    const existingProfile = await this.profileService.getProfile(userId);
if (existingProfile) {
  return { alreadyCompleted: true };
}

    // Convert possible strings to numbers
    const age = data.age !== undefined ? Number(data.age) : null;
    const height = data.height !== undefined ? Number(data.height) : null;
    const weight = data.weight !== undefined ? Number(data.weight) : null;
    const budget = data.budget !== undefined ? Number(data.budget) : null;

    // Helper: ALWAYS convert value → array
    const toArray = (value: any) => {
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
    };

    const onboarding = await this.prisma.onboarding.upsert({
      where: { userId },

      create: {
        userId,
        age,
        gender: data.gender,
        activityLevel: data.activityLevel,
        goal: data.goal,
        height,
        weight,
        dietaryPreferences: toArray(data.dietaryPreferences),
        allergies: toArray(data.allergies),
        budget,
        country: data.country,
        preferences: data.preferences,
      },

      update: {
        age,
        gender: data.gender,
        activityLevel: data.activityLevel,
        goal: data.goal,
        height,
        weight,
        dietaryPreferences: toArray(data.dietaryPreferences),  // ✅ FIXED
        allergies: toArray(data.allergies),                     // ✅ FIXED
        budget,
        country: data.country,
        preferences: data.preferences,
      },
    });
    await this.profileService.upsertProfileFromOnboarding(userId);
await this.mealwiseService.startPlan(userId);

return { onboardingCompleted: true };

  }
}
