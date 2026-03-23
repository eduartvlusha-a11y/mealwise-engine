import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlannerService } from '../planner/planner.service';
import { GenerateGroceryDto } from './dtos/generate-grocery.dto';
import { GroceryOptimizationService } from '../grocery-optimization/grocery-optimization.service';
import { AiService } from '../ai/ai.service';
import { GroceryFromMealsEngine } from './grocery-from-meals.engine';
import { IngredientDisplayService } from '../common/services/ingredient-display.service';
import { GroceryPricingService } from './pricing/grocery-pricing.service';
import { ProfileService } from '../profile/profile.service';



@Injectable()
export class GroceryService {
    // ----------------------------------------------------
  // PHASE 9.3.1 — Weekly grocery snapshot (freeze input)
  // ----------------------------------------------------
  private weeklyGrocerySnapshots: Record<string, any> = {};

  constructor(
    private readonly prisma: PrismaService,
    private readonly plannerService: PlannerService,
    private readonly optimizationService: GroceryOptimizationService,
    private readonly aiService: AiService,
    private readonly groceryEngine: GroceryFromMealsEngine,
    private readonly ingredientDisplay: IngredientDisplayService,
    private readonly pricingService: GroceryPricingService,
    private readonly profileService: ProfileService,
  ) {}

  // 🔴 OLD SYSTEM — still here but UNUSED
  private async extractIngredientsFromMeal(mealName: string) {
    const template = this.aiService.loadPrompt('meal_to_ingredients.prompt.txt');
    const prompt = [
      {
        role: 'user',
        content: template.replace('{{meal}}', mealName),
      },
    ];

    const result = await this.aiService.runJsonPrompt(prompt);
    if (!result || !result.ingredients) return [];
    return result.ingredients;
  }

  private async extractIngredientsForDay(day: any) {
    const allIngredients: any[] = [];
    for (const meal of day.meals) {
      const ing = await this.extractIngredientsFromMeal(meal.name);
      allIngredients.push({ meal: meal.name, ingredients: ing });
    }
    return allIngredients;
  }

  private async extractIngredientsForWeek(weeklyPlan: any) {
    const weekIngredients: any[] = [];
    for (const day of weeklyPlan.days) {
      const extracted = await this.extractIngredientsForDay(day);
      weekIngredients.push({ day: day.day, meals: extracted });
    }
    return weekIngredients;
  }

  private consolidateIngredients(weeklyExtracted: any[]) {
    const map = new Map<
      string,
      { name: string; grams: number; unit: string }
    >();

    for (const day of weeklyExtracted) {
      for (const meal of day.meals) {
        for (const ing of meal.ingredients) {
          const key = ing.name.toLowerCase();
          if (!map.has(key)) {
            map.set(key, {
              name: ing.name,
              grams: ing.grams,
              unit: ing.unit || 'g',
            });
          } else {
            const existing = map.get(key)!;
            existing.grams += ing.grams;
            map.set(key, existing);
          }
        }
      }
    }
    return Array.from(map.values());
  }

  // ✅ REAL MEALWISE ENGINE OUTPUT
  async generate(userId: string, dto: GenerateGroceryDto) {
     return this.getWeekly(userId);

  }

  
  async getWeekly(userId: string) {
    console.log('🥦 GROCERY getWeekly HIT', { userId });

  const activePlan = await this.prisma.userPlan.findFirst({
    where: { userId, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });
  console.log('[STEP1] ACTIVE_PLAN_CHECK', {
  hasActivePlan: !!activePlan,
  id: activePlan?.id,
  status: activePlan?.status,
  hasPlanJson: !!activePlan?.planJson,
});
console.log(
  '🥦 INGREDIENT CHECK (first meal)',
  JSON.stringify(
    ((activePlan?.planJson as any)?.days?.[0]?.meals?.[0]?.ingredients),
    null,
    2,
  ),
);



  if (!activePlan || !activePlan.planJson) {
    return { weekStart: null, weekEnd: null, items: [] };
  }

  const latestPlan = activePlan.planJson as any;
  console.log('🚨 PLAN SHAPE KEYS', Object.keys(latestPlan));
console.log('🚨 DAYS IS ARRAY?', Array.isArray(latestPlan.days));
console.log('🚨 DAYS TYPE', typeof latestPlan.days);
console.log('🚨 FIRST DAY RAW', JSON.stringify(latestPlan.days?.[0], null, 2));

  // 🔒 NORMALIZE DAYS — CRITICAL
if (Array.isArray(latestPlan.days)) {
  latestPlan.days = latestPlan.days.map((day: any) => {
    const meals = Array.isArray(day.meals)
      ? day.meals
      : Array.isArray(day.plan?.meals)
      ? day.plan.meals
      : [];

    return {
      ...day,
      meals,            // canonical
      plan: { meals },  // backward compatibility
    };
  });
}

  const weekKey = activePlan.id;



  if (!Array.isArray(latestPlan.days) || latestPlan.days.length === 0) {
    return { weekStart: null, weekEnd: null, items: [] };
  }

  const snapshotKey = `${userId}:${weekKey}`;

  const memory = this.weeklyGrocerySnapshots[snapshotKey];
  if (memory) return memory;

  // 🔴 TEMP DISABLED — snapshot causes empty grocery
// const dbSnapshot = await this.prisma.weeklyGrocerySnapshot.findFirst({
//   where: { userId, weekKey },
//   orderBy: { createdAt: 'desc' },
// });

// if (dbSnapshot) {
//   this.weeklyGrocerySnapshots[snapshotKey] = dbSnapshot.snapshot;
//   return dbSnapshot.snapshot as any;
// }


  // 🧪 TEMP STEP — RAW INGREDIENT EXTRACTION (DEBUG ONLY)
const rawItemsMap = new Map<string, { name: string; grams: number; unit: string }>();

for (const day of latestPlan.days) {
  for (const meal of day.meals ?? []) {
    for (const ing of meal.ingredients ?? []) {
      const key = ing.name.toLowerCase();

      if (!rawItemsMap.has(key)) {
        rawItemsMap.set(key, {
          name: ing.name,
          grams: ing.grams ?? 0,
          unit: ing.unit ?? 'g',
        });
      } else {
        rawItemsMap.get(key)!.grams += ing.grams ?? 0;
      }
    }
  }
}

const engineResult = {
  weekStart: latestPlan.weekStart ?? null,
  weekEnd: latestPlan.weekEnd ?? null,
  items: Array.from(rawItemsMap.values()),
};

console.log('🥦 RAW INGREDIENTS COUNT', engineResult.items.length);


  // 1️⃣ Load profile (already correct)
const profile = await this.profileService.getProfile(userId);

// 2️⃣ Call pricing service with CORRECT input shape
const priced = await this.pricingService.calculatePrices(
  engineResult.items.map((i: any) => ({
    name: i.name,
    grams: i.grams ?? i.total ?? i.amount ?? 0,
    unit: 'g',
  })),
  userId,
  profile?.country ?? 'AL',
  'EUR',
  'EUR',
  weekKey,
);

// 3️⃣ Freeze grocery snapshot with CORRECT priced item shape
const frozen = {
  weekStart: engineResult.weekStart,
  weekEnd: engineResult.weekEnd,
  items: priced.items.map((item: any) => ({
    name: item.name,
    grams: item.grams,
    unit: item.unit,
    estimatedCost: item.estimatedCost ?? 0,
    pricePerUnit: item.pricePerUnit ?? null,
    priceSource: item.priceSource ?? 'unknown',
  })),
};

  this.weeklyGrocerySnapshots[snapshotKey] = frozen;

  await this.prisma.weeklyGrocerySnapshot.create({
    data: {
      userId,
      weekKey,
      snapshot: frozen as any,
    },
  });

  


return {
  items: frozen.items,
  totalCost: frozen.items.reduce(
    (sum: number, i: any) =>
      sum + (i.estimatedCost ?? 0),
    0,
  ),
  currencySymbol: '€',
  weeklyBudget: profile?.weeklyBudget ?? null,
};




}



  // ✅ ENGINE MAPPED TO YOUR REAL DATA STRUCTURE
  private extractWeeklyWithEngine(latestPlan: any) {
  const rawDays = Array.isArray(latestPlan?.days)
    ? latestPlan.days
    : [];

  return this.groceryEngine.extractWeekly({
    weekStart: latestPlan.weekStart ?? null,
    weekEnd: latestPlan.weekEnd ?? null,
    days: rawDays.map((day: any, index: number) => ({
  date: day.date ?? `day-${index + 1}`,
  plan: {
    meals: JSON.parse(
      JSON.stringify(
        day.meals ??
        day.plan?.meals ??
        []
      )
    ),
  },
})),

  });
}


}
