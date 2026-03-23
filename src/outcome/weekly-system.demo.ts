import { detectBudgetPressure } from '../outcome/budget-pressure.detector';
import { processSubstitutions } from '../substitution/substitution.batch.processor';
import { assembleWeeklyOutcome } from '../outcome/weekly-outcome.assembler';

export function runWeeklySystemDemo() {
  // --- MOCK INPUTS (buyer-readable) ---
  const weekStart = '2025-01-01';
  const weekEnd = '2025-01-07';

  const weeklyBudget = 80;
  const estimatedCost = 92;

  const plannedMeals = 21;

  const groceryItems = [
    { name: 'chicken breast', category: 'protein' as const },
    { name: 'salmon', category: 'protein' as const },
    { name: 'rice', category: 'carb' as const },
  ];

  // --- SYSTEM EXECUTION ---
  const budgetResult = detectBudgetPressure({
    weeklyBudget,
    estimatedCost,
  });

  const substitutionReasons = processSubstitutions({
    items: groceryItems,
    context: {
      budgetStatus: budgetResult.status,
    },
  });

  const outcome = assembleWeeklyOutcome({
    weekStart,
    weekEnd,
    budgetResult,
    plannedMeals,
    substitutionExplanations: substitutionReasons.map(r => r.explanation),
  });

  return outcome;
}
