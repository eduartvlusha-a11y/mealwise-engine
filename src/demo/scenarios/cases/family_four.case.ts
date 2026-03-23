import { createBaseScenario } from "../scenario.base";
import { MealWiseScenarioInput } from "../scenario.types";

export const FamilyOfFourCase: MealWiseScenarioInput =
  createBaseScenario({
    id: "family_of_four",
    label: "Family of Four (Budget Stretch)",

    household: {
      size: 4,
    },

    budget: {
      weeklyAmount: 80,
    },

    health: {
      goal: "maintain",
    },

    diet: {
      type: "omnivore",
    },

    availability: {
      excludedFoods: ["salmon", "avocado"],
    },

    week: {
      startDate: "2025-01-06",
    },
  });
