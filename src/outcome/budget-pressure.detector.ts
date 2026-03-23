export type BudgetPressureResult = {
  weeklyBudget: number;
  estimatedCost: number;
  status: 'WITHIN' | 'OVER';
  delta: number; // estimatedCost - weeklyBudget
};

export function detectBudgetPressure(params: {
  weeklyBudget: number;
  estimatedCost: number;
}): BudgetPressureResult {
  const { weeklyBudget, estimatedCost } = params;

  const delta = estimatedCost - weeklyBudget;

  return {
    weeklyBudget,
    estimatedCost,
    status: delta <= 0 ? 'WITHIN' : 'OVER',
    delta,
  };
}
