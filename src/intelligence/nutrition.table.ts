export const NutritionTable: Record<
  string,
  { calories: number; protein: number; carbs: number; fat: number }
> = {
  // PRIMARY PROTEINS
  "chicken breast": { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  "turkey breast": { calories: 135, protein: 29, carbs: 0, fat: 1 },
  "white fish": { calories: 96, protein: 21, carbs: 0, fat: 1 },
  "salmon": { calories: 208, protein: 20, carbs: 0, fat: 13 },
  "eggs": { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  "greek yogurt": { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  "cottage cheese": { calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  "tuna": { calories: 132, protein: 29, carbs: 0, fat: 1 },
  "shrimp": { calories: 99, protein: 24, carbs: 0.2, fat: 0.3 },
  "tofu": { calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },
  "tempeh": { calories: 193, protein: 20, carbs: 7.6, fat: 11 },

  // SECONDARY PROTEINS (plant)
  "lentils": { calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  "beans": { calories: 140, protein: 9, carbs: 25, fat: 0.5 },
  "legumes": { calories: 139, protein: 9, carbs: 23, fat: 0.8 },
  "cheese": { calories: 402, protein: 25, carbs: 1.3, fat: 33 },

  // CARBS
  "rice": { calories: 130, protein: 2.4, carbs: 28, fat: 0.3 },
  "potatoes": { calories: 87, protein: 2, carbs: 20, fat: 0.1 },
  "oats": { calories: 389, protein: 17, carbs: 66, fat: 7 },
  "pasta": { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
  "bread": { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
  "quinoa": { calories: 120, protein: 4.4, carbs: 21, fat: 1.9 },

  // FATS
  "olive oil": { calories: 884, protein: 0, carbs: 0, fat: 100 },
  "avocado": { calories: 160, protein: 2, carbs: 9, fat: 15 },
  "nuts": { calories: 607, protein: 20, carbs: 21, fat: 54 },
  "seeds": { calories: 559, protein: 18, carbs: 28, fat: 49 },
  "butter": { calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },

  // VEGETABLES
  "broccoli": { calories: 34, protein: 3, carbs: 7, fat: 0.4 },
  "spinach": { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  "lettuce": { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
  "peppers": { calories: 31, protein: 1, carbs: 6, fat: 0.3 },
  "tomatoes": { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  "cucumbers": { calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },

  // FRUITS
  "banana": { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  "apple": { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  "berries": { calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  "orange": { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 }
};
