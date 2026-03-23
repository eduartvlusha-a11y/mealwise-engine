import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeneratePlanDto } from './dtos/generate-plan.dto';

import {
  MEAL_TEMPLATES,
  MealTemplate,
  strictDietFilter,
} from '../meal-suggestions/meal-templates.table';


import { WeeklyPlanEngine } from '../meal-suggestions/weekly-plan.engine';
import { DailyMacrosTarget } from '../meal-suggestions/meal-rules.engine';


@Injectable()
export class PlannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly weeklyPlanEngine: WeeklyPlanEngine,
  ) {}

  // ------------------------------------------------------------
  // Fetch "onboarding" / profile data directly from DB
  // (we keep it loose-typed as any to avoid TS hell)
  // ------------------------------------------------------------
  private async getOnboardingFromDB(userId: string): Promise<any> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  // ------------------------------------------------------------
  // MAIN ENTRY — generates a 7-day or X-day meal plan
  // ------------------------------------------------------------
  async generatePlan(userId: string, dto: GeneratePlanDto) {
    const onboarding = await this.getOnboardingFromDB(userId);

    if (!onboarding) {
      return { error: 'No onboarding data found for this user.' };
    }

    const days = dto.days ?? 7;

    // Extract user profile data (loose typing to avoid TS noise)
    const {
      age,
      gender,
      height,
      weight,
      activityLevel,
      goal,
      dietaryPreferences,
      allergies,
      budget,
      country,
    } = onboarding as any;
    // 🔒 Normalize diet — SINGLE SOURCE OF TRUTH
const diet =
  Array.isArray(dietaryPreferences) && dietaryPreferences.length > 0
    ? dietaryPreferences[0]
    : dietaryPreferences;


    console.log('🧪 GENERATE PLAN — DIET FROM DB:', dietaryPreferences);

if (!dietaryPreferences) {
  return { error: 'Dietary preference is required to generate a meal plan.' };
}



    if (!age || !gender || !height || !weight) {
      return {
        error: 'Age, gender, height, and weight are required to generate a plan.',
      };
    }

    // --- REAL CALORIE CALCULATION (BMR + TDEE) ---
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    if (gender === 'male') bmr += 5;
    else bmr -= 161;

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const multiplier = activityMultipliers[activityLevel ?? 'moderate'] ?? 1.55;

    let dailyCalories = Math.round(bmr * multiplier);
    if (goal === 'weight_loss') dailyCalories -= 500;
    if (goal === 'weight_gain') dailyCalories += 300;

    // --- GENERATE REAL MEALWISE PLAN (v1) ---
    const weeklyPlan = this.buildWeeklyPlan({
  days,
  dailyCalories,
  goal,
  dietaryPreferences: diet,
});




    // SAVE TO DB
    const plan = await this.prisma.mealPlan.create({
      data: {
        userId,
        meals: {
          dailyCalories,
          goal,
          activityLevel,
          dietaryPreferences,
          allergies,
          budget,
          country,
          totalDays: days,
          days: weeklyPlan,
        },
      },
    });

    return plan;
  }

  // ------------------------------------------------------------
  // REAL MEALWISE PLAN BUILDER
  // ------------------------------------------------------------
  private buildWeeklyPlan(params: {
  days: number;
  dailyCalories: number;
  goal: 'lose' | 'maintain' | 'gain';
  dietaryPreferences: string;
})
 {

    const { days, dailyCalories } = params;

    const ratios = {
      breakfast: 0.25,
      lunch: 0.35,
      dinner: 0.3,
      snack: 0.1,
    };

    const week: any[] = [];

    for (let i = 0; i < days; i++) {
      const dayMeals = [];

      for (const category of ['breakfast', 'lunch', 'dinner', 'snack']) {
        const template = this.pickTemplate(
  category,
  params.goal,
  params.dietaryPreferences,
);


        if (!template) continue;

        // For now use default grams (MealWise v1)
        const grams = Math.round(template.defaultGrams);

        dayMeals.push({
          templateId: template.id,
          grams,
          category,
        });
      }

      week.push({
        day: i + 1,
        totalCalories: dailyCalories,
        meals: dayMeals,
      });
    }

    return week;
  }

    // ------------------------------------------------------------
  // Resolve allowed calorie classes based on user goal
  // (Used later by template selection — NOT ACTIVE YET)
  // ------------------------------------------------------------
  private getAllowedCalorieClasses(
    goal: 'lose' | 'maintain' | 'gain'
  ): Array<'low' | 'medium' | 'high'> {
    switch (goal) {
      case 'lose':
        return ['low', 'medium'];
      case 'gain':
        return ['medium', 'high'];
      case 'maintain':
      default:
        return ['medium'];
    }
  }

  // ------------------------------------------------------------
  // Pick a template based on meal category
  // ------------------------------------------------------------
  private pickTemplate(
  category: string,
  goal: 'lose' | 'maintain' | 'gain',
  diet?: string
): MealTemplate | undefined {


  const allowedClasses = this.getAllowedCalorieClasses(goal);

const dietFiltered = strictDietFilter(
  MEAL_TEMPLATES,
  diet as any,
);

const candidates = dietFiltered.filter(
  (t) =>
    t.category === category &&
    allowedClasses.includes(t.calorieClass)
);


if (candidates.length === 0) return undefined;

return candidates[Math.floor(Math.random() * candidates.length)];

}


  // ------------------------------------------------------------
  // GET LATEST WEEK PLAN
  // ------------------------------------------------------------
  async getLatestPlan(userId: string) {
    return this.prisma.mealPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ------------------------------------------------------------
// READ-ONLY Weekly Plan Provider (DO NOT REGENERATE)
// ------------------------------------------------------------
async getWeeklyPlan(userId: string) {
  return this.prisma.mealPlan.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}


  // ------------------------------------------------------------
// NEW (Ultra) — Weekly plan from deterministic inputs
// This does NOT recompute BMR/TDEE. It receives truth targets.
// Safe additive method. Nothing else uses it yet.
// ------------------------------------------------------------
async getWeeklyPlanFromTargets(input: {
  userId: string;
  weekStart?: string;
  caloriesTarget: number;
  macrosTarget: DailyMacrosTarget;
  preferences?: string | null;
  rotationIndex?: number;
  // Future-proof (ignored for now until engine uses it)
  strategy?: any;
  constraints?: any;
}) {
  // NOTE: we intentionally keep this "any" to avoid TS excess-property fights
  // and to allow strategy/constraints to flow through later.
  const weeklyInput: any = {
    userId: input.userId,
    weekStart: input.weekStart, // undefined allowed (engine resolves)
    caloriesTarget: input.caloriesTarget,
    macrosTarget: input.macrosTarget,
    preferences: input.preferences ?? null,
    rotationIndex: input.rotationIndex ?? 0,


    // Future-proof fields (engine can ignore for now)
    strategy: input.strategy,
    constraints: input.constraints,
  };

  return this.weeklyPlanEngine.generateWeeklyPlan(weeklyInput);
}

}
