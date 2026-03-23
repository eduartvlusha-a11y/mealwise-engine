import { Injectable } from '@nestjs/common';
import { DailyMealPlan } from './meal-rules.engine';

/**
 * v1 — no external AI client yet.
 * Later we will inject AiService and let it:
 * - rename meals
 * - vary ingredients
 * - regionalize recipes
 * while respecting macros + calories.
 */
@Injectable()
export class MealAiEngine {
  async enhanceDailyPlan(
    plan: DailyMealPlan,
    _context: {
      userId: string;
      preferences?: string | null;
    },
  ): Promise<DailyMealPlan> {
    return plan;
  }
}
