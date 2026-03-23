import { createBaseScenario } from "../scenario.base";
import { MealWiseScenarioInput } from "../scenario.types";

export const AthleteCutCase: MealWiseScenarioInput =
  createBaseScenario({
    id: "athlete_cut",
    label: "Athlete Cut (High Protein, Calorie Deficit)",

    household: {
      size: 1,
    },

    budget: {
      weeklyAmount: 60,
    },

    health: {
      goal: "lose_weight",
    },

    diet: {
      type: "omnivore",
    },

    training: {
      sessionsPerWeek: 5,
      intensity: "high",
    },

    availability: {
      excludedFoods: ["pastries", "sugary snacks"],
    },

    week: {
      startDate: "2025-01-06",
    },
  });
