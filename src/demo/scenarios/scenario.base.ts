import { MealWiseScenarioInput } from "./scenario.types";

export function createBaseScenario(
  override: Partial<MealWiseScenarioInput>
): MealWiseScenarioInput {
  return {
    id: "base",
    label: "Base Scenario",

    market: {
      country: "AL",
      currency: "EUR",
    },

    household: {
      size: 1,
    },

    budget: {
      weeklyAmount: 50,
    },

    health: {
      goal: "maintain",
    },

    diet: {
      type: "omnivore",
    },

    availability: {},

    week: {
      startDate: "2025-01-06",
    },

    ...override,
  };
}
