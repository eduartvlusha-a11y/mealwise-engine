import { createBaseScenario } from "../scenario.base";
import { MealWiseScenarioInput } from "../scenario.types";

export const LowBudgetSingleCase: MealWiseScenarioInput =
  createBaseScenario({
    id: "low_budget_single",
    label: "Low Budget Single (Survival Mode)",

    household: {
      size: 1,
    },

    budget: {
      weeklyAmount: 25,
    },

    health: {
      goal: "maintain",
    },

    diet: {
      type: "omnivore",
    },

    availability: {
      excludedFoods: ["salmon", "avocado", "berries"],
    },

    week: {
      startDate: "2025-01-06",
    },
  });
