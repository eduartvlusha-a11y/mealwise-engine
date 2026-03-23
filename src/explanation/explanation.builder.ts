// src/explanation/explanation.builder.ts

export type BudgetPressureLevel = 'low' | 'medium' | 'high';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface ExplanationPayload {
  strategy: {
    maintenanceCalories: number;
    dailyCaloriesTarget: number;
    calorieDeficit: number;
    calorieDeficitPercent: number;

    weeklyBudget: number;
    budgetPressureIndex: number;
    budgetPressureLevel: BudgetPressureLevel;

    proteinTarget: number;
    proteinPrioritized: boolean;
  };

  mealsToGroceries: {
    totalMeals: number;
    uniqueIngredients: number;
    reusedIngredients: number;
    averageReuseCount: number;
  };

  budget: {
  plannedCost: number;
  weeklyBudget: number;
  budgetUsedPercent: number;
  remainingBudget: number;
  estimatedWaste: number;

  tradeoffs: {
    reducedVariety: boolean;
    excludedHighCostItems: boolean;
    reuseStrategyApplied: boolean;
  };
};


  risk: {
  level: RiskLevel;
  message: string;
};

}

export class ExplanationBuilder {
  static build(input: {
    metrics: {
      maintenanceCalories: number;
      dailyCaloriesTarget: number;
      dailyProteinTarget: number;
      weeklyCaloriesTarget: number;
      weeklyBudget: number;
    };

    meals: Array<{
      ingredients: Array<{
        name: string;
      }>;
    }>;

    groceryPricing: {
      plannedCost: number;
      estimatedWaste: number;
    };

    userWeightKg: number;
  }): ExplanationPayload {
    // -----------------------------
    // STRATEGY
    // -----------------------------
    const calorieDeficit =
      input.metrics.maintenanceCalories -
      input.metrics.dailyCaloriesTarget;

    const calorieDeficitPercent =
      (calorieDeficit / input.metrics.maintenanceCalories) * 100;

    const budgetPressureIndex =
      input.metrics.weeklyCaloriesTarget /
      input.metrics.weeklyBudget;

    let budgetPressureLevel: BudgetPressureLevel = 'low';
    if (budgetPressureIndex > 90) budgetPressureLevel = 'high';
    else if (budgetPressureIndex >= 70) budgetPressureLevel = 'medium';

    const proteinPrioritized =
      input.metrics.dailyProteinTarget >= input.userWeightKg * 1.6;

    // -----------------------------
    // MEALS → GROCERIES
    // -----------------------------
    const ingredientUsage = new Map<string, number>();
    let totalMeals = 0;

    for (const meal of input.meals) {
      totalMeals++;
      for (const ing of meal.ingredients) {
        ingredientUsage.set(
          ing.name,
          (ingredientUsage.get(ing.name) ?? 0) + 1,
        );
      }
    }

    const uniqueIngredients = ingredientUsage.size;
    const reusedIngredients = [...ingredientUsage.values()].filter(
      (count) => count > 1,
    ).length;

    const totalIngredientUses = [...ingredientUsage.values()].reduce(
      (a, b) => a + b,
      0,
    );

    const averageReuseCount =
      uniqueIngredients > 0
        ? totalIngredientUses / uniqueIngredients
        : 0;

    // -----------------------------
    // BUDGET
    // -----------------------------
    const plannedCost = input.groceryPricing.plannedCost;
    const weeklyBudget = input.metrics.weeklyBudget;

    const budgetUsedPercent = (plannedCost / weeklyBudget) * 100;
    const remainingBudget = weeklyBudget - plannedCost;
    const reducedVariety = averageReuseCount < 2.2;
const excludedHighCostItems = budgetPressureLevel !== 'low';
const reuseStrategyApplied = averageReuseCount >= 2;


    // -----------------------------
    // RISK
    // -----------------------------
    let risk: RiskLevel = 'low';
let riskMessage =
  'This plan is conservative and easy to sustain over time.';

if (
  budgetPressureLevel === 'high' ||
  averageReuseCount < 1.8 ||
  input.groceryPricing.estimatedWaste / weeklyBudget > 0.12
) {
  risk = 'high';
  riskMessage =
    'This plan is aggressive and requires strict consistency. Missing meals or budget deviations may impact results.';
} else if (
  budgetPressureLevel === 'medium' ||
  averageReuseCount < 2.2 ||
  input.groceryPricing.estimatedWaste / weeklyBudget > 0.07
) {
  risk = 'medium';
  riskMessage =
    'This plan balances results and sustainability but still requires discipline.';
}


    if (risk === 'high') {
  riskMessage =
    'This plan is aggressive and requires consistency. Missing meals or budget deviations may impact results.';
} else if (risk === 'medium') {
  riskMessage =
    'This plan balances results and sustainability with moderate discipline.';
}


    return {
      strategy: {
        maintenanceCalories: input.metrics.maintenanceCalories,
        dailyCaloriesTarget: input.metrics.dailyCaloriesTarget,
        calorieDeficit,
        calorieDeficitPercent,
        weeklyBudget,
        budgetPressureIndex,
        budgetPressureLevel,
        proteinTarget: input.metrics.dailyProteinTarget,
        proteinPrioritized,
      },

      mealsToGroceries: {
        totalMeals,
        uniqueIngredients,
        reusedIngredients,
        averageReuseCount,
      },

      budget: {
  plannedCost,
  weeklyBudget,
  budgetUsedPercent,
  remainingBudget,
  estimatedWaste: input.groceryPricing.estimatedWaste,

  tradeoffs: {
    reducedVariety,
    excludedHighCostItems,
    reuseStrategyApplied,
  },
},


      risk: {
  level: risk,
  message: riskMessage,
},

    };
  }
}
