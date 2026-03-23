import { Controller, Get, Req } from '@nestjs/common';
import { MealSuggestionsService } from './meal-suggestions.service';
import { PrismaService } from '../prisma/prisma.service';
import { WeeklyPlanEngine } from './weekly-plan.engine';
import { GroceryFromMealsEngine } from '../grocery/grocery-from-meals.engine';



@Controller('meal-suggestions')
export class MealSuggestionsController {
  constructor(
  private readonly mealSuggestions: MealSuggestionsService,
  private readonly prisma: PrismaService,
  private readonly weeklyPlanEngine: WeeklyPlanEngine,
  
) {}


  @Get('today')
  async getToday(@Req() req: any) {
    const userId = req.user.userId;

    // Load onboarding (for calories + macros)
    const onboarding = await this.prisma.onboarding.findUnique({
      where: { userId },
    });

    if (!onboarding) {
      return { error: 'Onboarding not completed' };
    }

    const {
      weight,
      height,
      age,
      gender,
      goal,
      activityLevel,
    } = onboarding;

    const genderNorm = gender?.toLowerCase() ?? 'male';

    // BMR
    const BMR =
      genderNorm === 'male'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const activity = Number(activityLevel) || 1.37;
    const TDEE = BMR * activity;

    // Goal modifier
    let caloriesTarget = TDEE;
    if (goal === 'lose') caloriesTarget *= 0.85;
    if (goal === 'gain') caloriesTarget *= 1.1;

    caloriesTarget = Math.round(caloriesTarget);

    // Macros target
    const proteinTarget = Math.round(weight * 2); // REAL RULE
    const fatTarget = Math.round((caloriesTarget * 0.30) / 9);
    const carbTarget = Math.round(
      (caloriesTarget - (proteinTarget * 4 + fatTarget * 9)) / 4,
    );

    return this.mealSuggestions.generateDailySuggestions({
      userId,
      caloriesTarget,
      macrosTarget: {
        protein: proteinTarget,
        carbs: carbTarget,
        fats: fatTarget,
      },
      preferences: onboarding.preferences,
    });
  }

    @Get('week')
  async getWeek(@Req() req: any) {
    const userId = req.user.userId;

    // Load onboarding → needed for calories + macros
    const onboarding = await this.prisma.onboarding.findUnique({
      where: { userId },
    });

    if (!onboarding) {
      return { error: 'Onboarding not completed' };
    }

    const {
      weight,
      height,
      age,
      gender,
      goal,
      activityLevel,
      preferences,
    } = onboarding;

    const genderNorm = gender?.toLowerCase() ?? 'male';

    // Daily calculation based on MealWise metabolic rules
    const BMR =
      genderNorm === 'male'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const activity = Number(activityLevel) || 1.37;
    const TDEE = BMR * activity;

    let caloriesTarget = TDEE;
    if (goal === 'lose') caloriesTarget *= 0.85;
    if (goal === 'gain') caloriesTarget *= 1.1;
    caloriesTarget = Math.round(caloriesTarget);

    // Macro targets
    const proteinTarget = Math.round(weight * 2);
    const fatTarget = Math.round((caloriesTarget * 0.30) / 9);
    const carbTarget = Math.round(
      (caloriesTarget - (proteinTarget * 4 + fatTarget * 9)) / 4,
    );

    // NOW call the weekly engine
    return this.weeklyPlanEngine.generateWeeklyPlan({
      userId,
      caloriesTarget,
      macrosTarget: {
        protein: proteinTarget,
        carbs: carbTarget,
        fats: fatTarget,
      },
      preferences,
    });
  }

  @Get('week-grocery')
async getWeekGrocery(@Req() req: any) {
  const userId = req.user.userId;

  // Load onboarding for calories/macros
  const onboarding = await this.prisma.onboarding.findUnique({
    where: { userId },
  });

  if (!onboarding) {
  return {
    items: [],
    currency: "EUR"
  };
}


  const {
    weight,
    height,
    age,
    gender,
    goal,
    activityLevel,
    preferences,
  } = onboarding;

  const genderNorm = gender?.toLowerCase() ?? 'male';

  // BMR
  const BMR =
    genderNorm === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const activity = Number(activityLevel) || 1.37;
  const TDEE = BMR * activity;

  let caloriesTarget = TDEE;
  if (goal === 'lose') caloriesTarget *= 0.85;
  if (goal === 'gain') caloriesTarget *= 1.1;

  caloriesTarget = Math.round(caloriesTarget);

  const proteinTarget = Math.round(weight * 2);
  const fatTarget = Math.round((caloriesTarget * 0.30) / 9);
  const carbTarget = Math.round(
    (caloriesTarget - (proteinTarget * 4 + fatTarget * 9)) / 4,
  );

  // 1️⃣ Generate weekly meal plan
  const weekPlan = await this.weeklyPlanEngine.generateWeeklyPlan({
    userId,
    caloriesTarget,
    macrosTarget: {
      protein: proteinTarget,
      carbs: carbTarget,
      fats: fatTarget,
    },
    preferences,
  });

  // 🚨 Grocery extraction moved to GroceryService
  return {
    weekPlan,
    grocery: 'Grocery extraction relocated to GroceryService',
  };
}

}
