import { Injectable } from '@nestjs/common';
import {
  DailyMealPlan,
  DailyMacrosTarget,
} from './meal-rules.engine';
import { MealSuggestionsService } from './meal-suggestions.service';
import { DailyNutritionEngine } from '../intelligence/daily-nutrition.engine';
import { WeeklyAnalyticsEngine } from '../intelligence/weekly-analytics.engine';



export interface WeeklyMealPlanDay {
  date: string;
  plan: DailyMealPlan;
}

export interface WeeklyMealPlan {
  weekStart: string;
  weekEnd: string;
  totalCaloriesTarget: number;
  totalCaloriesPlanned: number;
  avgDailyCaloriesTarget: number;
  avgDailyCaloriesPlanned: number;
  macrosTargetWeekly: DailyMacrosTarget;
  macrosPlannedWeekly: DailyMacrosTarget;
  days: WeeklyMealPlanDay[];
  isValid?: boolean;

    //  Observability only — no behavioral impact
  fallbackFlags?: {
    date: string;
    category: string;
    reason: string;
  }[];

}

/**
 * Weekly Plan Engine v1
 *
 * - 7 days
 * - same daily targets (BMR/TDEE/goal-based)
 * - uses MealSuggestionsService for each day
 * - builds weekly summary on top
 */
@Injectable()
export class WeeklyPlanEngine {
  constructor(
    private readonly mealSuggestions: MealSuggestionsService,
    private readonly dailyNutritionEngine: DailyNutritionEngine,
    private readonly weeklyAnalyticsEngine: WeeklyAnalyticsEngine,
  ) {}

  async generateWeeklyPlan(input: {
    userId: string;
    weekStart?: string; // YYYY-MM-DD, optional
    caloriesTarget: number;
    macrosTarget: DailyMacrosTarget;
    preferences?: string | null;
    rotationIndex?: number;
  }): Promise<WeeklyMealPlan> {
    const { userId, caloriesTarget, macrosTarget, preferences } = input;
    console.log('🚨 WEEKLY ENGINE HIT — DIET:', preferences);


    // 1) Resolve week range (Mon–Sun)
    const { startDate, endDate } = this.resolveWeekRange(
      input.weekStart,
    );

    const days: WeeklyMealPlanDay[] = [];

    let totalCaloriesTarget = 0;
    let totalCaloriesPlanned = 0;
    // 🔒 HARD weekly memory — no template repeats across the week
const usedTemplateIds = new Set<string>();


    const macrosTargetWeekly: DailyMacrosTarget = {
      protein: 0,
      carbs: 0,
      fats: 0,
    };

    const macrosPlannedWeekly: DailyMacrosTarget = {
      protein: 0,
      carbs: 0,
      fats: 0,
    };
    
const weeklyFallbackFlags: {
  date: string;
  category: string;
  reason: string;
}[] = [];


let yesterdayTemplateIds: string[] = [];

    // 2) Generate plan for each of 7 days
  const usedLunchTemplateIds: Record<string, number> = {};

    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);

    

const yesterdayMeals =
  i > 0 ? (days[i - 1] as any)?.plan?.meals ?? [] : [];

let yesterdayTemplateIds = (yesterdayMeals as any[]).map(
  (m: any) => m.templateId,
);

      const plan = await this.mealSuggestions.generateDailySuggestions(
        {
          userId,
          date: dateStr,
          caloriesTarget,
          macrosTarget,
          preferences,
          rotationIndex: (input.rotationIndex ?? 0) + i,


          avoidTemplateIds: Array.from(
  new Set([
    ...yesterdayTemplateIds,
    ...usedTemplateIds,
  ]),
),

          usedLunchTemplateIds,
        },
      );

      // 🟡 Track lunch usage for weekly soft rotation
const lunch = plan.meals.find((m) => m.category === 'lunch');

if (lunch) {
  usedLunchTemplateIds[lunch.templateId] =
    (usedLunchTemplateIds[lunch.templateId] ?? 0) + 1;
}


      const nutrition = await this.dailyNutritionEngine.calculate(
  userId,
  dateStr,
);
console.log('🧪 DAILY NUTRITION RESULT', dateStr, nutrition);
// ✅ calories
plan.totalCaloriesPlanned = nutrition.calories;
plan.totalCaloriesTarget = nutrition.dailyCalorieTarget;

// ✅ macros actually produced
plan.macrosPlanned = {
  protein: nutrition.protein,
  carbs: nutrition.carbs,
  fats: nutrition.fat, // 🔥 singular
};

// ✅ macro targets NOT available yet → keep existing (or zero)
plan.macrosTarget = plan.macrosTarget;



     days.push({
  date: dateStr,
  plan,
});

// 🧪 Collect fallback flags (if any)
if (plan.fallbackFlags?.length) {
  for (const flag of plan.fallbackFlags) {
    weeklyFallbackFlags.push({
      date: dateStr,
      category: flag.category,
      reason: flag.reason,
    });
  }
}


// 🔒 HARD weekly memory — lock ALL templates used today
for (const meal of plan.meals) {
  if (meal.templateId) {
    usedTemplateIds.add(meal.templateId);
  }

  // 🟡 Keep existing soft lunch rotation
  if (meal.category === 'lunch') {
    usedLunchTemplateIds[meal.templateId] =
      (usedLunchTemplateIds[meal.templateId] ?? 0) + 1;
  }
}


      yesterdayTemplateIds = plan.meals.map((m) => m.templateId);


      totalCaloriesTarget += plan.totalCaloriesTarget;
      totalCaloriesPlanned += plan.totalCaloriesPlanned;

      macrosTargetWeekly.protein += plan.macrosTarget.protein;
      macrosTargetWeekly.carbs += plan.macrosTarget.carbs;
      macrosTargetWeekly.fats += plan.macrosTarget.fats;

      macrosPlannedWeekly.protein += plan.macrosPlanned.protein;
      macrosPlannedWeekly.carbs += plan.macrosPlanned.carbs;
      macrosPlannedWeekly.fats += plan.macrosPlanned.fats;
    }

    const avgDailyCaloriesTarget = Math.round(
      totalCaloriesTarget / 7,
    );
    const avgDailyCaloriesPlanned = Math.round(
      totalCaloriesPlanned / 7,
    );

    const weekStartStr = startDate.toISOString().slice(0, 10);
    const weekEndStr = endDate.toISOString().slice(0, 10);

    return {
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      totalCaloriesTarget,
      totalCaloriesPlanned,
      avgDailyCaloriesTarget,
      avgDailyCaloriesPlanned,
      macrosTargetWeekly,
      macrosPlannedWeekly,
      days,
      fallbackFlags: weeklyFallbackFlags,

    };
  }

  /**
   * Resolve week start/end:
   * - If weekStart provided: use that as start, +6 days as end
   * - If not: current week Monday → Sunday
   */
  private resolveWeekRange(weekStart?: string): {
    startDate: Date;
    endDate: Date;
  } {
    if (weekStart) {
      const start = new Date(weekStart);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { startDate: start, endDate: end };
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const day = now.getDay(); // Sun=0, Mon=1...

    const diffToMonday = (day === 0 ? -6 : 1) - day;

    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return {
      startDate: monday,
      endDate: sunday,
    };
  }
}
