// src/intelligence/intelligence.types.ts

export interface IngredientSpend {
  name: string;
  totalSpent: number;
  currency: string;
  timesUsed?: number;
}

export interface DailyNutritionSummary {
  date: string;

  caloriesTarget: number;
  caloriesEaten: number;
  caloriesDifference: number;
  direction: 'deficit' | 'surplus' | 'neutral';

  macrosTarget: {
    protein: number;
    carbs: number;
    fats: number;
  };

  macrosEaten: {
    protein: number;
    carbs: number;
    fats: number;
  };

  foods: Array<{
    name: string;
    grams: number;
    unit: string;
  }>;

  metabolicInfo: {
    bmr: number;
    tdee: number;
    goal: 'lose' | 'maintain' | 'gain';
  };
}

export interface DailyGrocerySummary {
  date: string;
  totalSpent: number;
  currency: string;
  items: Array<{
    name: string;
    grams: number;
    unit: string;
    pricePerUnit: number;
    estimatedCost: number;
  }>;
}

export interface WeeklyNutritionSummary {
  weekStart: string;
  weekEnd: string;

  totalCalories: number;
  totalTargetCalories: number;
  totalDifference: number;
  direction: 'deficit' | 'surplus' | 'neutral';

  weeklyMetabolicProjection: {
    projectedWeightChangeKg: number;
    avgDailyDeficitOrSurplus: number;
  };

  topIngredients: IngredientSpend[];

  trends: {
    calories: Array<{ date: string; eaten: number; target: number }>;
    protein: Array<{ date: string; grams: number }>;
    carbs: Array<{ date: string; grams: number }>;
    fats: Array<{ date: string; grams: number }>;
  };

  reportSummary: string; // human readable weekly nutrition report
}

export interface WeeklyGrocerySummary {
  weekStart: string;
  weekEnd: string;
  totalSpent: number;
  currency: string;

  daily: Array<{
    date: string;
    spent: number;
  }>;

  topIngredients: IngredientSpend[];

  monthlyProjection: {
    estimatedMonthlySpend: number;
    currency: string;
  };

  trends: {
    dailySpend: Array<{ date: string; spent: number }>;
  };
}

export interface DailyIntelligence {
  date: string;
  nutrition: DailyNutritionSummary | null;
  grocery: DailyGrocerySummary | null;

  pricing: {
    totalSpent: number;
    currency: string;
    topIngredients: IngredientSpend[];
  };

  aiSavingsTip: string;
}

export interface WeeklyIntelligence {
  weekStart: string;
  weekEnd: string;

  nutrition: WeeklyNutritionSummary | null;
  grocery: WeeklyGrocerySummary | null;

  pricing: {
    totalSpent: number;
    currency: string;
    topIngredients: IngredientSpend[];
    monthlyProjection: {
      estimatedMonthlySpend: number;
      currency: string;
    };
  };

  aiSavingsTip: string;
}

export interface CombinedIntelligence {
  userId: string;
  today: DailyIntelligence;
  currentWeek: WeeklyIntelligence;
}
