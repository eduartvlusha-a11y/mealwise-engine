import { buildWeeklyOutcomeSummary } from './weekly-outcome.builder';
import { BudgetPressureResult } from './budget-pressure.detector';

export function assembleWeeklyOutcome(params: {
  weekStart: string;
  weekEnd: string;

  budgetResult: BudgetPressureResult;

  plannedMeals: number;
  followedMeals?: number;

  substitutionExplanations?: string[];
}) {
  const {
    weekStart,
    weekEnd,
    budgetResult,
    plannedMeals,
    followedMeals,
    substitutionExplanations = [],
  } = params;

  return buildWeeklyOutcomeSummary({
    weekStart,
    weekEnd,
    weeklyBudget: budgetResult.weeklyBudget,
    estimatedCost: budgetResult.estimatedCost,
    plannedMeals,
    followedMeals,
    substitutionReasons: substitutionExplanations,
  });
}
