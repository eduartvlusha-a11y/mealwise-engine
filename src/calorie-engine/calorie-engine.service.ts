import { Injectable } from '@nestjs/common';
import { OnboardingService } from '../onboarding/onboarding.service';

@Injectable()
export class CalorieEngineService {
  constructor(
    private readonly onboardingService: OnboardingService,
  ) {}

  async calculateDailyCalories(userId: string) {
    const data = await this.onboardingService.getOnboarding(userId);

    if (!data) {
      return { error: 'No onboarding data found for this user.' };
    }

    const {
      age,
      gender,
      height,
      weight,
      activityLevel,
      goal,
    } = data;

    // Basic validation
    if (!height || !weight) {
      return { error: 'Height and weight are required to calculate calories.' };
    }

    if (!age) {
      return { error: 'Age is required to calculate calories.' };
    }

    if (!gender) {
      return { error: 'Gender is required to calculate calories.' };
    }

    // Default to moderate if not set
    const lvl = activityLevel ?? 'moderate';

    // Mifflin-St Jeor BMR
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // Activity multiplier
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const multiplier = activityMultipliers[lvl] ?? 1.55;
    let calories = bmr * multiplier;

    // Goal adjustments
    if (goal === 'weight_loss') calories -= 500;
    if (goal === 'weight_gain') calories += 300;

    return {
      bmr: Math.round(bmr),
      dailyCalories: Math.round(calories),
      goal,
      height,
      weight,
      age,
      gender,
      activityLevel: lvl,
    };
  }
}
