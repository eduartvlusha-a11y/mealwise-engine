import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { MealwiseService } from '../mealwise/mealwise.service';

@Controller('home')
@UseGuards(JwtAuthGuard)
export class HomeController {
  constructor(private readonly mealwiseService: MealwiseService) {}

  @Get()
async getHome(@Req() req: any) {
  const userId = req.user?.sub ?? req.user?.id;

  const result = await this.mealwiseService.buildFullWeekSummary({
    userId,
    currency: 'EUR',
    pricingMode: 'auto',
    countryCode: 'EU',
  });
  // 🔥 PROTEIN FIRST SYSTEM
const proteinToday = result.protein?.today ?? 0;
const proteinTarget = result.protein?.target ?? 0;

  // 🔥 DAILY DECISION SCORE (SINGLE NUMBER)
const decisionScore = result.decisionScore?.score ?? 0;


  /// 🔥 FIND TODAY BY DATE (NOT INDEX)
const todayISO = new Date().toISOString().split('T')[0];

const todayDay = (result.weekPlan?.days || []).find(
  (d: any) => d.date === todayISO,
);

const todayPlan = todayDay?.plan;

  // 🔥 ENSURE MEAL CALORIES ARE COMPUTED (SAFE FALLBACK)
for (const day of result.weekPlan?.days || []) {
  for (const meal of day?.plan?.meals || []) {
    if (meal.calories == null) {
      const protein = meal.protein ?? 0;
      const carbs = meal.carbs ?? 0;
      const fats = meal.fats ?? 0;

      meal.calories = protein * 4 + carbs * 4 + fats * 9;
    }
  }
}
  

  // 🔥 AGGREGATE TODAY CALORIES
const todayCalories = (todayPlan?.meals || []).reduce(
  (sum: number, meal: any) => sum + (meal.calories ?? 0),
  0,
);

// 🔥 AGGREGATE WEEKLY CALORIES
const weeklyCalories = (result.weekPlan?.days || []).reduce(
  (weekSum: number, day: any) =>
    weekSum +
    (day?.plan?.meals || []).reduce(
      (daySum: number, meal: any) => daySum + (meal.calories ?? 0),
      0,
    ),
  0,
);


  return {
    decisionScore,
    protein: {
    today: proteinToday,
    target: proteinTarget,
  },
    today: {
  meals: todayPlan?.meals ?? [],
  calories: todayCalories,
  groceryPricing: {
    currency: result.pricing?.currency ?? 'EUR',
  },
},

weekly: {
  totalCalories: weeklyCalories,
  totalSpent: result.pricing?.totalCost ?? 0,
},


    insights: {
      health:
        result.intelligence?.healthInsight ??
        'Focus on protein and consistency',

      budget:
        result.intelligence?.budgetInsight ??
        'You are within budget',
    },
  };
}


}
