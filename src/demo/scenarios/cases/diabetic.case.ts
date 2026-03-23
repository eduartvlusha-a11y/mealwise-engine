import { createBaseScenario } from "../scenario.base";
import { MealWiseScenarioInput } from "../scenario.types";

export const DiabeticCase: MealWiseScenarioInput =
  createBaseScenario({
    id: "diabetic_control",
    label: "Diabetic Control (Low Sugar, Stable Energy)",

    household: {
      size: 1,
    },

    budget: {
      weeklyAmount: 50,
    },

    health: {
      goal: "maintain",
      conditions: ["diabetes"],
    },

    diet: {
      type: "diabetic",
    },

    availability: {
      excludedFoods: [
        "white bread",
        "sugary drinks",
        "desserts",
        "refined pastries",
      ],
    },

    week: {
      startDate: "2025-01-06",
    },
  });
