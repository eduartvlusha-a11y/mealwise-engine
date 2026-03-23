export const MealwiseSummaryExample = {
  weekPlan: {
    weekStart: "2025-11-30",
    weekEnd: "2025-12-07",
    totalCaloriesTarget: 19313,
    totalCaloriesPlanned: 19320,
    avgDailyCaloriesTarget: 2759,
    avgDailyCaloriesPlanned: 2760,
    macrosTargetWeekly: {
      protein: 1449,
      carbs: 1932,
      fats: 644,
    },
    macrosPlannedWeekly: {
      protein: 1043,
      carbs: 2072,
      fats: 637,
    },
    days: [
      {
        date: "2025-11-30",
        plan: {
          totalCaloriesTarget: 2759,
          totalCaloriesPlanned: 2760,
          macrosTarget: { protein: 207, carbs: 276, fats: 92 },
          macrosPlanned: { protein: 149, carbs: 296, fats: 91 },
          meals: [
            {
              templateId: "bf_oats_banana",
              name: "Oatmeal with banana and almonds",
              category: "breakfast",
              grams: 644,
              calories: 828,
              protein: 28,
              carbs: 110,
              fats: 28,
            },
          ],
        },
      },
    ],
  },

  grocery: {
    weekStart: "2025-11-30",
    weekEnd: "2025-12-07",
    items: [
      {
        name: "rolled oats",
        type: "solid",
        primary: { value: 1.03, unit: "kg", text: "1.03 kg" },
      },
    ],
  },

  pricing: {
    currency: "USD",
    targetCurrency: "USD",
    mode: "auto",
    totalCost: 47.11,
    items: [
      { name: "rolled oats", pricePerUnit: 3.45, estimatedCost: 3.55 },
    ],
  },

  intelligence: {
    weekStart: "2025-11-29",
    weekEnd: "2025-12-05",
    weeklyDifference: -9591,
    weeklyDirection: "deficit",
    totalSpent: 59.39,
    topIngredients: [{ name: "salmon", totalCost: 21.6 }],
  },
};
