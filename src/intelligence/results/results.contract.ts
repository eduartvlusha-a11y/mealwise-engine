// src/intelligence/results/results.contract.ts
export interface MealwiseResults {
  metrics: {
    bmr: number;
    tdee: number;
    dailyCaloriesTarget: number;
    dailyProteinTarget: number;
    weeklyCaloriesTarget: number;
    weeklyBudget: number;
    mealCountHint: 3 | 4 | 5;
    riskFlags: string[];
  };

  strategy: {
    mealStructure: 3 | 4 | 5;
    macroEmphasis: 'protein' | 'volume' | 'balanced';
    macroFocus: string;
    foodStrategy: 'budget_simple' | 'balanced_variety' | 'performance';
    conflicts: string[];
  };

  reasoning: string[]; // visible reasoning
    aiStrategyAdvisor?: {
    title: string;
    summary: string;
    bullets: string[];
  };

}

