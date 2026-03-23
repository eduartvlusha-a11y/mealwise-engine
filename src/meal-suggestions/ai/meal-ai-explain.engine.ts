// AI Explain Engine v1
// 🔒 Explain-only layer
// - NO authority over calories, budget, rotation, or selection
// - Produces transparent reasoning for UI / logs

import type { MealTemplate } from '../meal-templates.table';

export type AIExplainInput = {
  selectedMeals: MealTemplate[];
  context: {
    calorieTarget: number;
    weeklyBudget?: number;
    diet?: string | null;
    rotationApplied?: boolean;
    budgetLevel?: 'low' | 'medium' | 'high';
    estimatedWeeklyCost?: number;
    budgetDelta?: number;
  };
};

export type AIExplainResult = {
  summary: string;
  perMeal: {
    templateId: string;
    explanation: string;
  }[];
};


export function explainMealSelectionV1(
  input: AIExplainInput
): AIExplainResult {
  const { selectedMeals, context } = input;

  const reasons: string[] = [];

  if (context.diet) {
    reasons.push(`diet preference (${context.diet})`);
  }

  if (context.rotationApplied) {
    reasons.push('meal rotation (avoid repeats)');
  }

  if (context.weeklyBudget) {
    reasons.push('weekly budget consideration');
  }

  const summary =
    reasons.length > 0
      ? `Meals selected based on ${reasons.join(', ')}.`
      : 'Meals selected based on your nutrition targets.';

  const perMeal = selectedMeals.map((m) => {
    let explanation = '';

// calorie logic
if (m.calorieClass === 'low') {
  explanation = 'Lower-calorie meal to keep today’s intake balanced.';
} else if (m.calorieClass === 'high') {
  explanation = 'Higher-calorie meal to support energy needs.';
}

// protein logic (FIXED TYPES)
if (m.proteinClass === 'lean') {
  explanation = 'Lean-protein meal to support satiety and muscle.';
}

// budget logic
if (m.costEfficiency === 'high') {
  explanation = 'Cost-efficient meal selected to stay within your budget.';
}

// final fallback (still REAL)
if (!explanation) {
  explanation = `Selected ${m.category} meal to match today’s nutrition targets.`;
}

return {
  templateId: m.id,
  explanation,
};


return {
  templateId: m.id,
  explanation,
};


  });

  return {
    summary,
    perMeal,
  };
}
