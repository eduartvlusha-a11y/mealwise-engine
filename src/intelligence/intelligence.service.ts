import { Injectable, Logger } from '@nestjs/common';

import { DailyNutritionEngine } from './daily-nutrition.engine';
import { WeeklyAnalyticsEngine } from './weekly-analytics.engine';
import { GroceryService } from '../grocery/grocery.service';
import { AiClient } from '../ai/ai.client';

import {
  DailyIntelligence,
  WeeklyIntelligence,
  CombinedIntelligence,
  DailyNutritionSummary,
  DailyGrocerySummary,
  WeeklyNutritionSummary,
  WeeklyGrocerySummary,
  IngredientSpend,
} from './intelligence.types';

@Injectable()
export class IntelligenceService {
  private readonly logger = new Logger(IntelligenceService.name);

  constructor(
    private readonly dailyNutritionEngine: DailyNutritionEngine,
    private readonly weeklyAnalyticsEngine: WeeklyAnalyticsEngine,
    private readonly groceryService: GroceryService,
    private readonly ai: AiClient, // ✅ OpenAI runtime output
  ) {}

  // ---------------------------
  // DAILY INTELLIGENCE
  // ---------------------------
  async getDailyIntelligence(
    userId: string,
    date?: string,
  ): Promise<DailyIntelligence> {
    const targetDate = date ?? new Date().toISOString().slice(0, 10);

    const dailyBlock: any = await this.dailyNutritionEngine.calculate(
      userId,
      targetDate,
    );

    const nutrition: DailyNutritionSummary = {
      date: dailyBlock.date,

      caloriesTarget: dailyBlock.dailyCalorieTarget,
      caloriesEaten: dailyBlock.calories,
      caloriesDifference: dailyBlock.difference,
      direction: dailyBlock.direction,

      macrosTarget: {
        protein: dailyBlock.metabolic.proteinTarget,
        carbs: dailyBlock.metabolic.carbTarget,
        fats: dailyBlock.metabolic.fatTarget,
      },

      macrosEaten: {
        protein: dailyBlock.protein,
        carbs: dailyBlock.carbs,
        fats: dailyBlock.fat,
      },

      foods: (dailyBlock.foods || []).map((f: any) => ({
        name: f.name,
        grams: f.grams,
        unit: 'g',
      })),

      metabolicInfo: {
        bmr: dailyBlock.metabolic.BMR,
        tdee: dailyBlock.metabolic.TDEE,
        goal:
          dailyBlock.difference < 0
            ? 'lose'
            : dailyBlock.difference > 0
            ? 'gain'
            : 'maintain',
      },
    };

    const grocery: DailyGrocerySummary | null = null;

    const totalSpent = 0;
    const currency = 'EUR';
    const topIngredients: IngredientSpend[] = [];

    // ✅ REAL AI — NO STATIC FALLBACK TEXT
    const aiSavingsTip = await this.buildDailySavingsTip({
      nutrition,
      grocery,
      totalSpent,
      currency,
    });

    return {
      date: targetDate,
      nutrition,
      grocery,
      pricing: {
        totalSpent,
        currency,
        topIngredients,
      },
      aiSavingsTip,
    };
  }

  // ---------------------------
  // WEEKLY INTELLIGENCE
  // ---------------------------
  async getWeeklyIntelligence(
    userId: string,
    weekStart?: string,
    weekEnd?: string,
  ): Promise<WeeklyIntelligence> {
    const { start, end } = this.resolveWeekRange(weekStart, weekEnd);

    const weeklyBlock: any = await this.weeklyAnalyticsEngine.analyzeWeek(userId);

    const weeklyCalories = weeklyBlock.weeklyCalories ?? 0;
    const weeklyCalorieTarget = weeklyBlock.weeklyCalorieTarget ?? 0;
    const weeklyDifference = weeklyBlock.weeklyDifference ?? 0;
    const weeklyDirection = weeklyBlock.weeklyDirection ?? 'neutral';
    const currency = weeklyBlock.currency ?? 'EUR';
    const totalSpent = weeklyBlock.totalSpent ?? 0;
    const projectedMonthlyRounded =
      weeklyBlock.projectedMonthlyRounded ?? totalSpent * 4;

    const dailyArray = (weeklyBlock.daily || []) as any[];

    const nutrition: WeeklyNutritionSummary = {
      weekStart: weeklyBlock.weekStart,
      weekEnd: weeklyBlock.weekEnd,

      totalCalories: Math.round(weeklyCalories),
      totalTargetCalories: Math.round(weeklyCalorieTarget),
      totalDifference: weeklyDifference,
      direction: weeklyDirection,

      weeklyMetabolicProjection: {
        avgDailyDeficitOrSurplus:
          Math.round((weeklyDifference / 7) * 100) / 100,
        projectedWeightChangeKg:
          Math.round((weeklyDifference / 7700) * 1000) / 1000,
      },

      topIngredients: (weeklyBlock.topIngredients || []).map((ti: any) => ({
        name: ti.name,
        totalSpent: ti.totalCost,
        currency,
      })),

      trends: {
        calories: dailyArray.map((d) => ({
          date: d.date,
          eaten: d.calories,
          target: d.dailyCalorieTarget,
        })),
        protein: dailyArray.map((d) => ({
          date: d.date,
          grams: d.protein,
        })),
        carbs: dailyArray.map((d) => ({
          date: d.date,
          grams: d.carbs,
        })),
        fats: dailyArray.map((d) => ({
          date: d.date,
          grams: d.fat,
        })),
      },

      reportSummary:
        'Weekly nutrition summary generated from calorie and macro trends (v1 placeholder).',
    };

    const grocery: WeeklyGrocerySummary = {
      weekStart: weeklyBlock.weekStart,
      weekEnd: weeklyBlock.weekEnd,
      totalSpent,
      currency,

      daily: dailyArray.map((d) => ({
        date: d.date,
        spent: d.spent,
      })),

      topIngredients: (weeklyBlock.topIngredients || []).map((ti: any) => ({
        name: ti.name,
        totalSpent: ti.totalCost,
        currency,
      })),

      monthlyProjection: {
        estimatedMonthlySpend: projectedMonthlyRounded,
        currency,
      },

      trends: {
        dailySpend: dailyArray.map((d) => ({
          date: d.date,
          spent: d.spent,
        })),
      },
    };

    const topIngredients: IngredientSpend[] = grocery.topIngredients;

    // ✅ REAL AI — NO STATIC FALLBACK TEXT
    const aiSavingsTip = await this.buildWeeklySavingsTip({
      nutrition,
      grocery,
      totalSpent,
      currency,
    });

    return {
      weekStart: start,
      weekEnd: end,
      nutrition,
      grocery,
      pricing: {
        totalSpent,
        currency,
        topIngredients,
        monthlyProjection: {
          estimatedMonthlySpend: projectedMonthlyRounded,
          currency,
        },
      },
      aiSavingsTip,
    };
  }

  // ---------------------------
  // COMBINED
  // ---------------------------
  async getCombinedIntelligence(userId: string): Promise<CombinedIntelligence> {
    const today = await this.getDailyIntelligence(userId);
    const { start, end } = this.resolveWeekRange();
    const currentWeek = await this.getWeeklyIntelligence(userId, start, end);

    return {
      userId,
      today,
      currentWeek,
    };
  }

  // ---------------------------
  // HELPERS
  // ---------------------------
  private resolveWeekRange(
    weekStart?: string,
    weekEnd?: string,
  ): { start: string; end: string } {
    if (weekStart && weekEnd) return { start: weekStart, end: weekEnd };

    const now = new Date();
    const day = now.getDay(); // 0 = Sun
    const diffToMonday = (day === 0 ? -6 : 1) - day;

    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      start: monday.toISOString().slice(0, 10),
      end: sunday.toISOString().slice(0, 10),
    };
  }

  /**
   * ✅ OpenAI-only daily tip (no static fallback text).
   * If OpenAI fails, return empty string (frontend can show retry).
   */
  private async buildDailySavingsTip(input: {
    nutrition: DailyNutritionSummary | null;
    grocery: DailyGrocerySummary | null;
    totalSpent: number;
    currency: string;
  }): Promise<string> {
    try {
      const prompt = `You are MealWise AI. You do NOT calculate or invent numbers.
You provide a single short tip (1-2 sentences) about saving money while respecting the user's nutrition direction.
No motivation. No medical advice. No meal plans. No lists.

Context JSON:
${JSON.stringify(
  {
    direction: input.nutrition?.direction ?? 'neutral',
    caloriesTarget: input.nutrition?.caloriesTarget ?? null,
    caloriesEaten: input.nutrition?.caloriesEaten ?? null,
    proteinEaten: input.nutrition?.macrosEaten?.protein ?? null,
    currency: input.currency,
    totalSpent: input.totalSpent,
  },
  null,
  2,
)}`;

      const text = await this.ai.chat(prompt);
      return (text || '').trim();
    } catch (e: any) {
      this.logger.warn(
        `Daily AI tip failed: ${e?.message ?? 'unknown error'}`,
      );
      return '';
    }
  }

  /**
   * ✅ OpenAI-only weekly tip (no static fallback text).
   * If OpenAI fails, return empty string (frontend can show retry).
   */
  private async buildWeeklySavingsTip(input: {
    nutrition: WeeklyNutritionSummary | null;
    grocery: WeeklyGrocerySummary | null;
    totalSpent: number;
    currency: string;
  }): Promise<string> {
    try {
      const prompt = `You are MealWise AI. You do NOT calculate or invent numbers.
You provide a single short tip (1-2 sentences) about saving money this week given the grocery spend pattern.
No motivation. No medical advice. No meal plans. No lists.

Context JSON:
${JSON.stringify(
  {
    weekStart: input.nutrition?.weekStart ?? null,
    weekEnd: input.nutrition?.weekEnd ?? null,
    weeklyDirection: input.nutrition?.direction ?? 'neutral',
    totalSpent: input.totalSpent,
    currency: input.currency,
    topIngredients: (input.grocery?.topIngredients ?? []).slice(0, 5),
    estimatedMonthlySpend:
      input.grocery?.monthlyProjection?.estimatedMonthlySpend ?? null,
  },
  null,
  2,
)}`;

      const text = await this.ai.chat(prompt);
      return (text || '').trim();
    } catch (e: any) {
      this.logger.warn(
        `Weekly AI tip failed: ${e?.message ?? 'unknown error'}`,
      );
      return '';
    }
  }
}
