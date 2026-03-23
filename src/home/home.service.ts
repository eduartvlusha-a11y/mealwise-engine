import { Injectable } from '@nestjs/common';
import { OnboardingService } from '../onboarding/onboarding.service';
import { MealSuggestionsService } from '../meal-suggestions/meal-suggestions.service';


@Injectable()
export class HomeService {
  constructor(
  private readonly onboardingService: OnboardingService,
  private readonly mealSuggestions: MealSuggestionsService,
) {}

  async getHomeData(userId: string) {
    // STEP 1 — Fetch onboarding data (placeholder)
    const onboarding = await this.getOnboardingData(userId);

    // STEP 2 — Generate today's meals (placeholder)
    const meals = await this.getTodayMeals(
  userId,
  onboarding.user.caloriesTarget,
  onboarding.user.macros,
  onboarding.user.preferences ?? null
);



    return {
  needsOnboarding: false,
  hasPlan: true,
  planIsValid: true,

  user: onboarding.user,

  today: {
    date: new Date().toISOString().split('T')[0],
    meals,
  },

  weekPlan: {
    days: [
      {
        date: new Date().toISOString().split('T')[0],
        meals,
      },
    ],
  },

  metrics: {
    dailyCaloriesTarget: onboarding.user.caloriesTarget,
    maintenanceCalories: onboarding.user.caloriesTarget,
    weeklyBudget: null,
  },
};

  }

  // --------------------------
  // PLACEHOLDER METHODS
  // These will be replaced step-by-step
  // --------------------------

  private async getOnboardingData(userId: string) {
  const onboarding = await this.onboardingService.getOnboarding(userId);

  if (!onboarding) {
    return {
      user: {
        id: userId,
        goal: null,
        caloriesTarget: 0,
        macros: { protein: 0, carbs: 0, fats: 0 },
        preferences: onboarding?.preferences ?? null,
      },
    };
  }

  const caloriesTarget = this.calculateCalories(onboarding);

  const macros = {
    protein: Math.round(caloriesTarget * 0.30 / 4),
    carbs: Math.round(caloriesTarget * 0.40 / 4),
    fats: Math.round(caloriesTarget * 0.30 / 9),
  };

  return {
    user: {
      id: onboarding.userId,
      goal: onboarding.goal,
      caloriesTarget,
      macros,
    },
  };
  
}
private calculateCalories(onboarding: any) {
  if (!onboarding.height || !onboarding.weight || !onboarding.age) {
    return 2000; // fallback for now
  }

  let bmr =
    10 * onboarding.weight +
    6.25 * onboarding.height -
    5 * onboarding.age;

  if (onboarding.gender === 'male') bmr += 5;
  else bmr -= 161;

  const activityMap: any = {
    low: 1.2,
    medium: 1.55,
    high: 1.75,
  };

  const tdee = bmr * (activityMap[onboarding.activityLevel] || 1.2);

  if (onboarding.goal === 'lose_weight') return Math.round(tdee - 300);
  if (onboarding.goal === 'gain_weight') return Math.round(tdee + 300);

  return Math.round(tdee);
}


  private async getTodayMeals(userId: string, caloriesTarget: number, macros: any, preferences?: string | null) {

  console.log('MEAL ENGINE INPUT:', {
  userId,
  caloriesTarget,
  macros,
  preferences,
});

const dailyPlan = await this.mealSuggestions.generateDailySuggestions({
  userId,
  caloriesTarget,
  macrosTarget: macros,
  preferences,
});

console.log('MEAL ENGINE OUTPUT:', dailyPlan);


  return dailyPlan.meals; // meals array is inside DailyMealPlan
}

}
