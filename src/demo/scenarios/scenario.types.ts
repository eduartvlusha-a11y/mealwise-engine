export type MealWiseScenarioInput = {
  id: string;
  label: string;

  market: {
    country: string;
    currency: string;
  };

  household: {
    size: number;
  };

  budget: {
    weeklyAmount: number;
  };

  health: {
    goal: "lose_weight" | "maintain" | "gain_weight";
    conditions?: string[];
  };

  diet: {
    type: string;
    allergies?: string[];
  };

  availability: {
    excludedFoods?: string[];
    preferredStores?: string[];
  };

  training?: {
    sessionsPerWeek: number;
    intensity: "low" | "medium" | "high";
  };

  week: {
    startDate: string;
  };
};
