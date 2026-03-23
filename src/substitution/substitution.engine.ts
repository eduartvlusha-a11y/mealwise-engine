export type SubstitutionDecision = {
  shouldSubstitute: boolean;
  originalItem: string;
  substitutedItem?: string;
  reason?: 'BUDGET' | 'AVAILABILITY' | 'CONSTRAINT';
  explanation?: string;
};

type SubstitutionRuleContext = {
  budgetStatus: 'WITHIN' | 'OVER';
  diet?: string;
  allergies?: string[];
};

const CATEGORY_FALLBACKS: Record<string, string[]> = {
  protein: ['eggs', 'lentils', 'tofu'],
  carb: ['rice', 'potatoes', 'pasta'],
  fat: ['olive oil', 'sunflower oil'],
};

export function decideSubstitution(params: {
  itemName: string;
  category: 'protein' | 'carb' | 'fat' | 'other';
  context: SubstitutionRuleContext;
}): SubstitutionDecision {
  const { itemName, category, context } = params;

  // Rule 1: If budget is fine → no substitution
  if (context.budgetStatus === 'WITHIN') {
    return {
      shouldSubstitute: false,
      originalItem: itemName,
    };
  }

  // Rule 2: If over budget → try deterministic fallback by category
  const fallbacks = CATEGORY_FALLBACKS[category] || [];

  if (fallbacks.length === 0) {
    return {
      shouldSubstitute: false,
      originalItem: itemName,
    };
  }

  const substitute = fallbacks[0]; // deterministic choice

  // Rule 3: Allergy / diet guard (simple placeholder)
  if (context.allergies?.includes(substitute)) {
    return {
      shouldSubstitute: false,
      originalItem: itemName,
    };
  }

  return {
    shouldSubstitute: true,
    originalItem: itemName,
    substitutedItem: substitute,
    reason: 'BUDGET',
    explanation: `${itemName} was replaced with ${substitute} to reduce weekly cost.`,
  };
}
