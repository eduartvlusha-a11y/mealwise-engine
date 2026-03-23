// Budget Engine v1
// Deterministic, additive, NO calorie or macro changes

import type { MealTemplate } from '../meal-templates.table';

export type BudgetLevel = 'low' | 'medium' | 'high';

export type BudgetInput = {
  candidates: MealTemplate[];
  weeklyBudget?: number; // optional, numeric, same currency everywhere
};

export type BudgetResult = {
  budgeted: MealTemplate[];
  appliedLevel: BudgetLevel;

  // v2 additions (read-only)
  estimatedWeeklyCost: number;
  budgetDelta: number; // negative = under budget, positive = over
};


// Simple heuristic based on costEfficiency tags
export function applyBudgetV1(input: BudgetInput): BudgetResult {
      const computeCost = (meals: MealTemplate[]) =>
    meals.reduce((sum, m) => {
      const cost =
        m.costEfficiency === 'high' ? 3 :
        m.costEfficiency === 'medium' ? 5 : 7;
      return sum + cost;
    }, 0);

  const { candidates, weeklyBudget } = input;

  if (!candidates || candidates.length === 0) {
    return {
  budgeted: [],
  appliedLevel: 'medium',
  estimatedWeeklyCost: 0,
  budgetDelta: weeklyBudget ? -weeklyBudget : 0,
};

  }

  // If no budget provided → neutral behavior
  if (!weeklyBudget) {
    const cost = computeCost(candidates);

return {
  budgeted: candidates,
  appliedLevel: 'medium',
  estimatedWeeklyCost: cost,
  budgetDelta: weeklyBudget ? cost - weeklyBudget : 0,
};

  }

  let level: BudgetLevel = 'medium';

  if (weeklyBudget < 40) level = 'low';
  else if (weeklyBudget > 90) level = 'high';

  let budgeted = candidates;

  if (level === 'low') {
    budgeted = candidates.filter((m) => m.costEfficiency === 'high');
  }

  if (level === 'high') {
    // allow everything, but keep order
    budgeted = candidates;
  }

  // medium → slight preference, no hard filter
  if (level === 'medium') {
    budgeted = [...candidates].sort((a, b) => {
      const rank = (c: MealTemplate['costEfficiency']) =>
        c === 'high' ? 3 : c === 'medium' ? 2 : 1;
      return rank(b.costEfficiency) - rank(a.costEfficiency);
    });
  }

  // Safety fallback
  if (!budgeted.length) {
    budgeted = candidates;
  }

  const estimatedWeeklyCost =
  budgeted.reduce((sum, m) => {
    // rough heuristic: costEfficiency → numeric weight
    const cost =
      m.costEfficiency === 'high' ? 3 :
      m.costEfficiency === 'medium' ? 5 : 7;

    return sum + cost;
  }, 0);

const budgetDelta =
  weeklyBudget != null ? estimatedWeeklyCost - weeklyBudget : 0;

return {
  budgeted,
  appliedLevel: level,
  estimatedWeeklyCost,
  budgetDelta,
};

}
