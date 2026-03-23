import { Injectable } from '@nestjs/common';
import {
  DailyMealPlan,
  DailyMacrosTarget,
  MealRulesEngine,
} from './meal-rules.engine';
import { MealAiEngine } from './meal-ai.engine';

@Injectable()
export class MealSuggestionsService {
  constructor(
    private readonly mealRules: MealRulesEngine,
    private readonly mealAi: MealAiEngine,
  ) {}

  /**
   * Core MealWise daily suggestion pipeline:
   * - Input: caloriesTarget + macrosTarget (from BMR/TDEE engine)
   * - Output: structured meals ready for grocery + pricing
   */
  async generateDailySuggestions(input: {
    userId: string;
    date?: string;
    caloriesTarget: number;
    macrosTarget: DailyMacrosTarget;
    preferences?: string | null;
    rotationIndex?: number;
    avoidTemplateIds?: string[];
    usedLunchTemplateIds?: Record<string, number>;
    allergies?: string[];

  }): Promise<DailyMealPlan> {
    const date =
      input.date ?? new Date().toISOString().slice(0, 10);

    const basePlan = this.mealRules.buildDailyPlan({
      date,
      caloriesTarget: input.caloriesTarget,
      macrosTarget: input.macrosTarget,
      avoidTemplateIds: input.avoidTemplateIds,
      preferences: input.preferences,
      allergies: input.allergies,
      rotationIndex: input.rotationIndex,

    });

    const enhanced = await this.mealAi.enhanceDailyPlan(basePlan, {
      userId: input.userId,
      preferences: input.preferences,
    });

    return enhanced;
  }
}
