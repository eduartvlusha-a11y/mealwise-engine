import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NutritionTable } from './nutrition.table';

@Injectable()
export class DailyNutritionEngine {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate daily nutrition for a specific user + date.
   * This engine:
   * - computes metabolic profile (BMR, TDEE, targets)
   * - loads PriceHistory entries
   * - converts grams → macros
   * - builds the official Daily Block
   */
  async calculate(userId: string, date: string) {
    console.log('🔥 DAILY NUTRITION CALCULATE INPUT', { userId, date });

    // Helper: safe empty daily block (no crash, used as fallback)
    const emptyBlock = () => ({
      date,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      dailyCalorieTarget: 0,
      difference: 0,
      direction: 'neutral' as const,
      foods: [] as Array<{
        name: string;
        grams: number;
        cost: number;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      }>,
      metabolic: {
        BMR: 0,
        TDEE: 0,
        proteinTarget: 0,
        carbTarget: 0,
        fatTarget: 0,
      },
    });

    // ---------------------------------------------------------
    // 1) Load onboarding profile
    // ---------------------------------------------------------
    const onboarding = await this.prisma.onboarding.findUnique({
      where: { userId },
    });

    // If no onboarding at all → return safe empty block
    if (!onboarding) {
      return emptyBlock();
    }

    const { weight, height, age, gender, goal } = onboarding;

    // If critical fields missing → also fallback
    if (weight == null || height == null || age == null) {
      return emptyBlock();
    }

    const genderNorm = (gender ?? 'male').toLowerCase();

    // ---------------------------------------------------------
    // 2) Metabolic Profile (BMR + TDEE + Goal modifier)
    // ---------------------------------------------------------

    // Activity factor mapping (string → number)
    let activityFactor = 1.37; // default: light/moderate
    const level = onboarding.activityLevel?.toLowerCase();
    if (level) {
      if (level.includes('sedentary')) activityFactor = 1.2;
      else if (level.includes('light')) activityFactor = 1.375;
      else if (level.includes('moderate')) activityFactor = 1.55;
      else if (level.includes('active')) activityFactor = 1.725;
      else if (level.includes('very')) activityFactor = 1.9;
    }

    // BMR — Mifflin–St Jeor
    const BMR =
      genderNorm === 'male'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const TDEE = BMR * activityFactor;

    // Goal modifier
    let targetCalories = TDEE;
    if (goal === 'lose') targetCalories *= 0.85;
    if (goal === 'gain') targetCalories *= 1.1;
    targetCalories = Math.round(targetCalories);

    // ---------------------------------------------------------
    // 3) Macro Targets (Protein, Carbs, Fat)
    // ---------------------------------------------------------
    const proteinTarget = Math.round(weight * 1.8); // 1.8 g/kg
    const fatTarget = Math.round((targetCalories * 0.3) / 9); // 30% from fat
    const carbTarget = Math.round(
      (targetCalories - (proteinTarget * 4 + fatTarget * 9)) / 4,
    );

    // ---------------------------------------------------------
   // ---------------------------------------------------------
// 4) Load today's foods from FoodLog (AUTHORITATIVE)
// ---------------------------------------------------------
const dayStart = new Date(date);
dayStart.setHours(0, 0, 0, 0);

const dayEnd = new Date(date);
dayEnd.setHours(23, 59, 59, 999);

const logs = await this.prisma.foodLog.findMany({
  where: {
    userId,
    date: {
      gte: dayStart,
      lte: dayEnd,
    },
  },
});

let totalCalories = 0;
let totalProtein = 0;
let totalCarbs = 0;
let totalFat = 0;

const foods: Array<{
  name: string;
  grams: number;
  cost: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}> = [];

for (const log of logs) {
  totalCalories += log.calories;
  totalProtein += log.protein;
  totalCarbs += log.carbs;
  totalFat += log.fat;

  foods.push({
    name: log.name,
    grams: log.grams,
    cost: 0,
    calories: log.calories,
    protein: log.protein,
    carbs: log.carbs,
    fat: log.fat,
  });
}


    // ---------------------------------------------------------
    // 6) Daily deficit/surplus
    // ---------------------------------------------------------
    const difference = Math.round(totalCalories - targetCalories);
    const direction =
      difference < 0 ? 'deficit' : difference > 0 ? 'surplus' : 'neutral';

    // ---------------------------------------------------------
    // 7) Final Official Daily Block
    // ---------------------------------------------------------

  // ---------------------------------------------------------
// 7.5) SAVE DAILY NUTRITION TO DATABASE (REQUIRED)
// ---------------------------------------------------------

    return {
      date,
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat),

      dailyCalorieTarget: targetCalories,
      difference,
      direction,

      foods,
      metabolic: {
        BMR: Math.round(BMR),
        TDEE: Math.round(TDEE),
        proteinTarget,
        carbTarget,
        fatTarget,
      },
    };
  }
}
