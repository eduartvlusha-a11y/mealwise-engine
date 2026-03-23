export type MealCategory =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack';

export type ProteinClass = 'lean' | 'moderate' | 'high-fat' | 'plant';

export type Diet =
  | 'omnivore'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'keto'
  | 'low-carb'
  | 'mediterranean'
  | 'high-protein';


export interface MealIngredientTemplate {
  name: string;    // ingredient name used for grocery + pricing
  grams: number;   // grams in the default portion
}

export interface MealTemplate {
  id: string;
  name: string;
  category: MealCategory;
    diet: Diet;

  calorieClass: 'low' | 'medium' | 'high';
  defaultGrams: number; // total meal weight
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  proteinClass: ProteinClass;
  costEfficiency: 'low' | 'medium' | 'high'; // high = cheap per protein
  tags: string[];
  ingredients: MealIngredientTemplate[];
}


/**
 * v1 — realistic base templates.
 * Macros are for the full meal.
 * Ingredients are approximate but consistent for grocery extraction.
 */


export const MEAL_TEMPLATES: MealTemplate[] = [

{
    id: 'bf_oats_banana',
    name: 'Oatmeal with banana and almonds',
    category: 'breakfast',
    diet: 'vegan',
    defaultGrams: 350,
    calories: 450,
    calorieClass: 'medium',
    protein: 15,
    carbs: 65,
    fats: 14,
    proteinClass: 'plant',
    costEfficiency: 'high',
    tags: ['fiber', 'budget'],
    ingredients: [
      { name: 'oats', grams: 80 },
      { name: 'banana', grams: 120 },
      { name: 'almonds', grams: 20 },
      { name: 'milk', grams: 150 },
    ],
  },

{
    id: 'bf_eggs_toast',
    name: 'Eggs with toast',
    diet: 'vegetarian',
    category: 'breakfast',
    defaultGrams: 300,
    calories: 420,
    calorieClass: 'medium',
    protein: 24,
    carbs: 28,
    fats: 22,
    proteinClass: 'moderate',
    costEfficiency: 'high',
    tags: ['protein', 'quick'],
    ingredients: [
      { name: 'eggs', grams: 120 },
      { name: 'bread', grams: 80 },
      { name: 'olive oil', grams: 10 },
    ],
  },

{
    id: 'bf_cottage_cheese_bowl',
    name: 'Cottage cheese bowl',
    category: 'breakfast',
    diet: 'vegetarian',
    defaultGrams: 300,
    calories: 380,
    calorieClass: 'low',
    protein: 30,
    carbs: 18,
    fats: 14,
    proteinClass: 'lean',
    costEfficiency: 'high',
    tags: ['high-protein'],
    ingredients: [
      { name: 'cottage cheese', grams: 200 },
      { name: 'tomato', grams: 100 },
    ],
  },

{
    id: 'bf_egg_potato_skillet',
    name: 'Egg potato skillet',
    category: 'breakfast',
    diet: 'vegetarian',
    defaultGrams: 380,
    calories: 520,
    calorieClass: 'medium',
    protein: 26,
    carbs: 48,
    fats: 24,
    proteinClass: 'moderate',
    costEfficiency: 'high',
    tags: ['hot', 'budget'],
    ingredients: [
      { name: 'eggs', grams: 120 },
      { name: 'potatoes', grams: 200 },
      { name: 'olive oil', grams: 10 },
      { name: 'onion', grams: 50 },
    ],
  },

  {
  id: 'bf_protein_oatmeal',
  name: 'Protein Oatmeal',
  category: 'breakfast',
  diet: 'high-protein',
  calorieClass: 'medium',
  defaultGrams: 420,
  calories: 520,
  protein: 32,
  carbs: 58,
  fats: 14,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['gym'],
  ingredients: [
    { name: 'oats', grams: 80 },
    { name: 'protein powder', grams: 30 },
    { name: 'milk', grams: 200 }
  ]
},

{
  id: 'bf_avocado_toast_eggs',
  name: 'Avocado Toast with Eggs',
  category: 'breakfast',
  diet: 'vegetarian',
  calorieClass: 'medium',
  defaultGrams: 360,
  calories: 540,
  protein: 22,
  carbs: 42,
  fats: 32,
  proteinClass: 'high-fat',
  costEfficiency: 'medium',
  tags: ['classic'],
  ingredients: [
    { name: 'bread', grams: 80 },
    { name: 'avocado', grams: 100 },
    { name: 'eggs', grams: 140 }
  ]
},

{
  id: 'bf_eggwhite_scramble',
  name: 'Egg White Scramble',
  category: 'breakfast',
  diet: 'high-protein',
  calorieClass: 'low',
  defaultGrams: 300,
  calories: 280,
  protein: 36,
  carbs: 8,
  fats: 6,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['cutting'],
  ingredients: [
    { name: 'egg whites', grams: 260 },
    { name: 'vegetables', grams: 40 }
  ]
},

{
  id: 'bf_yogurt_granola_bowl',
  name: 'Yogurt Granola Bowl',
  category: 'breakfast',
  diet: 'vegetarian',
  calorieClass: 'medium',
  defaultGrams: 380,
  calories: 480,
  protein: 20,
  carbs: 54,
  fats: 18,
  proteinClass: 'moderate',
  costEfficiency: 'high',
  tags: ['quick'],
  ingredients: [
    { name: 'yogurt', grams: 200 },
    { name: 'granola', grams: 80 },
    { name: 'berries', grams: 100 }
  ]
},

{
  id: 'bf_green_smoothie',
  name: 'Green Smoothie',
  category: 'breakfast',
  diet: 'vegan',
  calorieClass: 'low',
  defaultGrams: 400,
  calories: 300,
  protein: 12,
  carbs: 46,
  fats: 8,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['detox'],
  ingredients: [
    { name: 'spinach', grams: 80 },
    { name: 'banana', grams: 120 },
    { name: 'plant milk', grams: 200 }
  ]
},

{
  id: 'bf_chia_pudding',
  name: 'Chia Pudding',
  category: 'breakfast',
  diet: 'vegan',
  calorieClass: 'medium',
  defaultGrams: 300,
  calories: 420,
  protein: 14,
  carbs: 36,
  fats: 26,
  proteinClass: 'high-fat',
  costEfficiency: 'medium',
  tags: ['prep'],
  ingredients: [
    { name: 'chia seeds', grams: 60 },
    { name: 'plant milk', grams: 240 }
  ]
},

{
  id: 'bf_cottage_cheese_bowl_v2',
  name: 'Cottage Cheese Bowl',
  category: 'breakfast',
  diet: 'vegetarian',
  calorieClass: 'low',
  defaultGrams: 300,
  calories: 260,
  protein: 32,
  carbs: 10,
  fats: 6,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['protein'],
  ingredients: [
    { name: 'cottage cheese', grams: 260 },
    { name: 'berries', grams: 40 }
  ]
},

{
  id: 'bf_keto_bacon_eggs',
  name: 'Keto Bacon & Eggs',
  category: 'breakfast',
  diet: 'keto',
  calorieClass: 'medium',
  defaultGrams: 340,
  calories: 580,
  protein: 28,
  carbs: 4,
  fats: 48,
  proteinClass: 'high-fat',
  costEfficiency: 'medium',
  tags: ['keto'],
  ingredients: [
    { name: 'eggs', grams: 160 },
    { name: 'bacon', grams: 120 }
  ]
},

{
  id: 'bf_smoked_salmon_toast',
  name: 'Smoked Salmon Toast',
  category: 'breakfast',
  diet: 'pescatarian',
  calorieClass: 'medium',
  defaultGrams: 360,
  calories: 520,
  protein: 30,
  carbs: 36,
  fats: 28,
  proteinClass: 'high-fat',
  costEfficiency: 'medium',
  tags: ['mediterranean'],
  ingredients: [
    { name: 'salmon', grams: 140 },
    { name: 'bread', grams: 80 },
    { name: 'cream cheese', grams: 60 }
  ]
},

{
  id: 'bf_pb_banana_toast',
  name: 'Peanut Butter Banana Toast',
  category: 'breakfast',
  diet: 'vegetarian',
  calorieClass: 'medium',
  defaultGrams: 340,
  calories: 540,
  protein: 18,
  carbs: 56,
  fats: 28,
  proteinClass: 'moderate',
  costEfficiency: 'high',
  tags: ['energy'],
  ingredients: [
    { name: 'bread', grams: 80 },
    { name: 'peanut butter', grams: 50 },
    { name: 'banana', grams: 120 }
  ]
},

{
  id: 'bf_sweet_potato_eggs',
  name: 'Sweet Potato & Eggs',
  category: 'breakfast',
  diet: 'omnivore',
  calorieClass: 'medium',
  defaultGrams: 420,
  calories: 500,
  protein: 26,
  carbs: 44,
  fats: 24,
  proteinClass: 'moderate',
  costEfficiency: 'high',
  tags: ['balanced'],
  ingredients: [
    { name: 'sweet potato', grams: 220 },
    { name: 'eggs', grams: 160 }
  ]
},

{
  id: 'bf_mushroom_omelette',
  name: 'Mushroom Omelette',
  category: 'breakfast',
  diet: 'vegetarian',
  calorieClass: 'medium',
  defaultGrams: 340,
  calories: 420,
  protein: 28,
  carbs: 10,
  fats: 28,
  proteinClass: 'moderate',
  costEfficiency: 'high',
  tags: ['classic'],
  ingredients: [
    { name: 'eggs', grams: 180 },
    { name: 'mushrooms', grams: 120 }
  ]
},

{
  id: 'bf_breakfast_wrap',
  name: 'Breakfast Wrap',
  category: 'breakfast',
  diet: 'omnivore',
  calorieClass: 'medium',
  defaultGrams: 420,
  calories: 600,
  protein: 32,
  carbs: 54,
  fats: 28,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['on-the-go'],
  ingredients: [
    { name: 'wrap', grams: 100 },
    { name: 'eggs', grams: 140 },
    { name: 'cheese', grams: 80 }
  ]
},

{
    id: 'bf_breakfast_wrap_v2',
    name: 'Breakfast wrap',
    category: 'breakfast',
    diet: 'vegetarian',
    defaultGrams: 350,
    calories: 540,
    calorieClass: 'medium',
    protein: 30,
    carbs: 55,
    fats: 20,
    proteinClass: 'moderate',
    costEfficiency: 'medium',
    tags: ['on-the-go'],
    ingredients: [
      { name: 'tortilla', grams: 80 },
      { name: 'eggs', grams: 120 },
      { name: 'cheese', grams: 30 },
      { name: 'tomato', grams: 80 },
    ],
  },

{
    id: 'bf_yogurt_fruit_nuts',
    name: 'Yogurt with fruit and nuts',
    category: 'breakfast',
    diet: 'vegan',
    defaultGrams: 320,
    calories: 460,
    calorieClass: 'medium',
    protein: 22,
    carbs: 40,
    fats: 20,
    proteinClass: 'moderate',
    costEfficiency: 'medium',
    tags: ['quick'],
    ingredients: [
      { name: 'greek yogurt', grams: 200 },
      { name: 'berries', grams: 80 },
      { name: 'nuts', grams: 30 },
    ],
  },

{
    id: 'bf_yogurt_honey',
    name: 'Yogurt with honey',
    category: 'breakfast',
    diet: 'vegetarian',
    defaultGrams: 260,
    calories: 360,
    calorieClass: 'low',
    protein: 20,
    carbs: 42,
    fats: 6,
    proteinClass: 'lean',
    costEfficiency: 'high',
    tags: ['quick', 'budget'],
    ingredients: [
      { name: 'greek yogurt', grams: 200 },
      { name: 'honey', grams: 20 },
    ],
  },

{
    id: 'bf_omelette_veg',
    name: 'Vegetable omelette',
    category: 'breakfast',
    diet: 'vegetarian',
    defaultGrams: 350,
    calories: 430,
    calorieClass: 'medium',
    protein: 26,
    carbs: 16,
    fats: 28,
    proteinClass: 'moderate',
    costEfficiency: 'high',
    tags: ['vegetarian'],
    ingredients: [
      { name: 'eggs', grams: 150 },
      { name: 'spinach', grams: 80 },
      { name: 'tomato', grams: 80 },
      { name: 'olive oil', grams: 10 },
    ],
  },

{
    id: 'bf_peanut_toast',
    name: 'Peanut butter toast',
    category: 'breakfast',
    diet: 'vegan',
    defaultGrams: 260,
    calories: 460,
    calorieClass: 'medium',
    protein: 18,
    carbs: 38,
    fats: 24,
    proteinClass: 'plant',
    costEfficiency: 'high',
    tags: ['budget'],
    ingredients: [
      { name: 'bread', grams: 80 },
      { name: 'peanut butter', grams: 40 },
    ],
  },

{
    id: 'bf_oats_yogurt_fruit',
    name: 'Oats with yogurt and fruit',
    category: 'breakfast',
    diet: 'mediterranean',
    defaultGrams: 380,
    calories: 480,
    calorieClass: 'medium',
    protein: 22,
    carbs: 70,
    fats: 10,
    proteinClass: 'moderate',
    costEfficiency: 'high',
    tags: ['fiber'],
    ingredients: [
      { name: 'oats', grams: 70 },
      { name: 'greek yogurt', grams: 180 },
      { name: 'banana', grams: 120 },
    ],
  },

{
    id: 'ln_chicken_rice',
    name: 'Chicken with rice',
    category: 'lunch',
    diet: 'omnivore',
    defaultGrams: 520,
    calories: 650,
    calorieClass: 'medium',
    protein: 45,
    carbs: 72,
    fats: 14,
    proteinClass: 'lean',
    costEfficiency: 'high',
    tags: ['classic', 'budget'],
    ingredients: [
      { name: 'chicken', grams: 180 },
      { name: 'rice', grams: 140 },
      { name: 'olive oil', grams: 10 },
    ],
  },

{
    id: 'ln_beef_potatoes',
    name: 'Beef with potatoes',
    category: 'lunch',
    diet: 'omnivore',
    defaultGrams: 560,
    calories: 780,
    calorieClass: 'high',
    protein: 42,
    carbs: 55,
    fats: 32,
    proteinClass: 'moderate',
    costEfficiency: 'medium',
    tags: ['hearty'],
    ingredients: [
      { name: 'beef', grams: 200 },
      { name: 'potatoes', grams: 220 },
      { name: 'olive oil', grams: 15 },
    ],
  },

{
    id: 'ln_lentil_stew',
    name: 'Lentil stew',
    category: 'lunch',
    diet: 'vegan',
    defaultGrams: 500,
    calories: 520,
    calorieClass: 'medium',
    protein: 28,
    carbs: 72,
    fats: 10,
    proteinClass: 'plant',
    costEfficiency: 'high',
    tags: ['vegan', 'budget'],
    ingredients: [
      { name: 'lentils', grams: 180 },
      { name: 'onion', grams: 60 },
      { name: 'carrot', grams: 80 },
      { name: 'olive oil', grams: 10 },
    ],
  },

  {
  id: 'ln_chicken_quinoa_bowl',
  name: 'Chicken Quinoa Bowl',
  category: 'lunch',
  diet: 'omnivore',
  calorieClass: 'medium',
  defaultGrams: 480,
  calories: 560,
  protein: 38,
  carbs: 48,
  fats: 18,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['balanced'],
  ingredients: [
    { name: 'chicken breast', grams: 180 },
    { name: 'quinoa', grams: 140 },
    { name: 'vegetables', grams: 160 }
  ]
},

{
  id: 'ln_turkey_rice_plate',
  name: 'Turkey & Rice Plate',
  category: 'lunch',
  diet: 'high-protein',
  calorieClass: 'medium',
  defaultGrams: 500,
  calories: 580,
  protein: 44,
  carbs: 42,
  fats: 14,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['gym'],
  ingredients: [
    { name: 'turkey breast', grams: 200 },
    { name: 'rice', grams: 150 },
    { name: 'vegetables', grams: 140 }
  ]
},

{
  id: 'ln_tuna_pasta_salad',
  name: 'Tuna Pasta Salad',
  category: 'lunch',
  diet: 'pescatarian',
  calorieClass: 'medium',
  defaultGrams: 520,
  calories: 600,
  protein: 36,
  carbs: 62,
  fats: 18,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['meal-prep'],
  ingredients: [
    { name: 'tuna', grams: 160 },
    { name: 'pasta', grams: 180 },
    { name: 'vegetables', grams: 160 }
  ]
},

{
  id: 'ln_med_chickpea_salad',
  name: 'Mediterranean Chickpea Salad',
  category: 'lunch',
  diet: 'mediterranean',
  calorieClass: 'medium',
  defaultGrams: 480,
  calories: 540,
  protein: 22,
  carbs: 64,
  fats: 20,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['fresh'],
  ingredients: [
    { name: 'chickpeas', grams: 220 },
    { name: 'vegetables', grams: 200 },
    { name: 'olive oil', grams: 15 }
  ]
},

{
  id: 'ln_veggie_burrito_bowl',
  name: 'Veggie Burrito Bowl',
  category: 'lunch',
  diet: 'vegan',
  calorieClass: 'medium',
  defaultGrams: 540,
  calories: 580,
  protein: 24,
  carbs: 78,
  fats: 18,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['plant-based'],
  ingredients: [
    { name: 'black beans', grams: 220 },
    { name: 'rice', grams: 180 },
    { name: 'vegetables', grams: 140 }
  ]
},

{
  id: 'ln_halloumi_wrap',
  name: 'Grilled Halloumi Wrap',
  category: 'lunch',
  diet: 'vegetarian',
  calorieClass: 'medium',
  defaultGrams: 460,
  calories: 620,
  protein: 28,
  carbs: 54,
  fats: 32,
  proteinClass: 'high-fat',
  costEfficiency: 'medium',
  tags: ['wrap'],
  ingredients: [
    { name: 'halloumi', grams: 160 },
    { name: 'wrap', grams: 100 },
    { name: 'vegetables', grams: 180 }
  ]
},

{
  id: 'ln_lowcarb_beef_salad',
  name: 'Low-Carb Beef Salad',
  category: 'lunch',
  diet: 'low-carb',
  calorieClass: 'medium',
  defaultGrams: 460,
  calories: 520,
  protein: 38,
  carbs: 14,
  fats: 26,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['low-carb'],
  ingredients: [
    { name: 'beef', grams: 180 },
    { name: 'greens', grams: 240 }
  ]
},

{
  id: 'ln_salmon_grain_bowl',
  name: 'Salmon Grain Bowl',
  category: 'lunch',
  diet: 'pescatarian',
  calorieClass: 'medium',
  defaultGrams: 500,
  calories: 620,
  protein: 36,
  carbs: 46,
  fats: 30,
  proteinClass: 'high-fat',
  costEfficiency: 'medium',
  tags: ['omega-3'],
  ingredients: [
    { name: 'salmon', grams: 180 },
    { name: 'grains', grams: 160 },
    { name: 'vegetables', grams: 160 }
  ]
},

{
  id: 'ln_keto_chicken_caesar',
  name: 'Keto Chicken Caesar (No Croutons)',
  category: 'lunch',
  diet: 'keto',
  calorieClass: 'medium',
  defaultGrams: 440,
  calories: 560,
  protein: 40,
  carbs: 10,
  fats: 36,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['keto'],
  ingredients: [
    { name: 'chicken breast', grams: 200 },
    { name: 'romaine', grams: 200 },
    { name: 'caesar dressing', grams: 30 }
  ]
},

{
  id: 'ln_lentil_veg_plate',
  name: 'Lentil Vegetable Plate',
  category: 'lunch',
  diet: 'vegan',
  calorieClass: 'medium',
  defaultGrams: 520,
  calories: 540,
  protein: 26,
  carbs: 70,
  fats: 14,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['batch-cook'],
  ingredients: [
    { name: 'lentils', grams: 220 },
    { name: 'vegetables', grams: 220 }
  ]
},

{
  id: 'ln_chicken_pesto_pasta',
  name: 'Chicken Pesto Pasta',
  category: 'lunch',
  diet: 'omnivore',
  calorieClass: 'medium',
  defaultGrams: 540,
  calories: 640,
  protein: 36,
  carbs: 68,
  fats: 22,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['comfort'],
  ingredients: [
    { name: 'chicken breast', grams: 160 },
    { name: 'pasta', grams: 200 },
    { name: 'pesto', grams: 30 }
  ]
},

{
  id: 'ln_beef_rice_bowl',
  name: 'Beef Rice Bowl',
  category: 'lunch',
  diet: 'omnivore',
  calorieClass: 'medium',
  defaultGrams: 520,
  calories: 660,
  protein: 38,
  carbs: 58,
  fats: 28,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['meal-prep'],
  ingredients: [
    { name: 'beef', grams: 180 },
    { name: 'rice', grams: 180 },
    { name: 'vegetables', grams: 160 }
  ]
},

{
  id: 'ln_shrimp_couscous_bowl',
  name: 'Shrimp Couscous Bowl',
  category: 'lunch',
  diet: 'pescatarian',
  calorieClass: 'medium',
  defaultGrams: 500,
  calories: 600,
  protein: 34,
  carbs: 62,
  fats: 18,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['mediterranean'],
  ingredients: [
    { name: 'shrimp', grams: 180 },
    { name: 'couscous', grams: 180 },
    { name: 'vegetables', grams: 140 }
  ]
},
{
  id: 'ln_med_tuna_plate',
  name: 'Mediterranean Tuna Plate',
  category: 'lunch',
  diet: 'mediterranean',
  calorieClass: 'medium',
  defaultGrams: 480,
  calories: 560,
  protein: 36,
  carbs: 32,
  fats: 26,
  proteinClass: 'moderate',
  costEfficiency: 'high',
  tags: ['fresh'],
  ingredients: [
    { name: 'tuna', grams: 180 },
    { name: 'vegetables', grams: 220 },
    { name: 'olive oil', grams: 15 }
  ]
},

{
  id: 'ln_spinach_feta_grain_bowl',
  name: 'Spinach Feta Grain Bowl',
  category: 'lunch',
  diet: 'vegetarian',
  calorieClass: 'medium',
  defaultGrams: 500,
  calories: 580,
  protein: 24,
  carbs: 64,
  fats: 26,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['balanced'],
  ingredients: [
    { name: 'grains', grams: 200 },
    { name: 'feta', grams: 80 },
    { name: 'spinach', grams: 160 }
  ]
},

{
  id: 'ln_veggie_pad_thai',
  name: 'Veggie Pad Thai',
  category: 'lunch',
  diet: 'vegan',
  calorieClass: 'medium',
  defaultGrams: 540,
  calories: 620,
  protein: 22,
  carbs: 78,
  fats: 22,
  proteinClass: 'plant',
  costEfficiency: 'medium',
  tags: ['asian'],
  ingredients: [
    { name: 'rice noodles', grams: 200 },
    { name: 'vegetables', grams: 220 },
    { name: 'peanuts', grams: 30 }
  ]
},

{
  id: 'ln_lowcarb_turkey_bowl',
  name: 'Low-Carb Turkey Bowl',
  category: 'lunch',
  diet: 'low-carb',
  calorieClass: 'medium',
  defaultGrams: 460,
  calories: 520,
  protein: 42,
  carbs: 14,
  fats: 22,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['low-carb'],
  ingredients: [
    { name: 'turkey breast', grams: 200 },
    { name: 'vegetables', grams: 240 }
  ]
},

{
  id: 'ln_highprotein_chicken_plate',
  name: 'High-Protein Chicken Plate',
  category: 'lunch',
  diet: 'high-protein',
  calorieClass: 'medium',
  defaultGrams: 480,
  calories: 560,
  protein: 46,
  carbs: 22,
  fats: 18,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['gym'],
  ingredients: [
    { name: 'chicken breast', grams: 220 },
    { name: 'vegetables', grams: 220 }
  ]
},

{
  id: 'ln_keto_beef_zoodle_bowl',
  name: 'Keto Beef Zoodle Bowl',
  category: 'lunch',
  diet: 'keto',
  calorieClass: 'medium',
  defaultGrams: 440,
  calories: 620,
  protein: 40,
  carbs: 8,
  fats: 44,
  proteinClass: 'high-fat',
  costEfficiency: 'medium',
  tags: ['keto'],
  ingredients: [
    { name: 'beef', grams: 200 },
    { name: 'zucchini noodles', grams: 220 }
  ]
},

{
  id: 'ln_white_bean_veg_bowl',
  name: 'White Bean Vegetable Bowl',
  category: 'lunch',
  diet: 'vegan',
  calorieClass: 'medium',
  defaultGrams: 520,
  calories: 560,
  protein: 24,
  carbs: 72,
  fats: 16,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['plant-based'],
  ingredients: [
    { name: 'white beans', grams: 240 },
    { name: 'vegetables', grams: 220 }
  ]
},

{
  id: 'ln_chicken_shawarma_bowl',
  name: 'Chicken Shawarma Bowl',
  category: 'lunch',
  diet: 'omnivore',
  calorieClass: 'medium',
  defaultGrams: 520,
  calories: 620,
  protein: 40,
  carbs: 48,
  fats: 22,
  proteinClass: 'moderate',
  costEfficiency: 'high',
  tags: ['middle-eastern'],
  ingredients: [
    { name: 'chicken breast', grams: 180 },
    { name: 'rice', grams: 160 },
    { name: 'vegetables', grams: 160 }
  ]
},

{
  id: 'ln_beef_burrito_bowl',
  name: 'Beef Burrito Bowl',
  category: 'lunch',
  diet: 'omnivore',
  calorieClass: 'medium',
  defaultGrams: 540,
  calories: 680,
  protein: 38,
  carbs: 62,
  fats: 28,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['mexican'],
  ingredients: [
    { name: 'beef', grams: 180 },
    { name: 'rice', grams: 180 },
    { name: 'beans', grams: 140 }
  ]
},

{
  id: 'ln_sardine_med_plate',
  name: 'Mediterranean Sardine Plate',
  category: 'lunch',
  diet: 'mediterranean',
  calorieClass: 'medium',
  defaultGrams: 480,
  calories: 600,
  protein: 34,
  carbs: 34,
  fats: 32,
  proteinClass: 'high-fat',
  costEfficiency: 'high',
  tags: ['omega-3'],
  ingredients: [
    { name: 'sardines', grams: 180 },
    { name: 'vegetables', grams: 220 },
    { name: 'olive oil', grams: 15 }
  ]
},

{
  id: 'ln_salmon_poke_bowl',
  name: 'Salmon Poke Bowl',
  category: 'lunch',
  diet: 'pescatarian',
  calorieClass: 'medium',
  defaultGrams: 520,
  calories: 640,
  protein: 36,
  carbs: 56,
  fats: 28,
  proteinClass: 'high-fat',
  costEfficiency: 'medium',
  tags: ['fresh'],
  ingredients: [
    { name: 'salmon', grams: 180 },
    { name: 'rice', grams: 180 },
    { name: 'vegetables', grams: 160 }
  ]
},

{
  id: 'ln_eggplant_lentil_plate',
  name: 'Eggplant Lentil Plate',
  category: 'lunch',
  diet: 'vegan',
  calorieClass: 'medium',
  defaultGrams: 520,
  calories: 560,
  protein: 24,
  carbs: 72,
  fats: 18,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['plant-based'],
  ingredients: [
    { name: 'lentils', grams: 220 },
    { name: 'eggplant', grams: 220 }
  ]
},

{
  id: 'ln_chickpea_spinach_curry',
  name: 'Chickpea Spinach Curry',
  category: 'lunch',
  diet: 'vegan',
  calorieClass: 'medium',
  defaultGrams: 540,
  calories: 580,
  protein: 26,
  carbs: 74,
  fats: 18,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['indian'],
  ingredients: [
    { name: 'chickpeas', grams: 240 },
    { name: 'spinach', grams: 140 },
    { name: 'tomato sauce', grams: 120 }
  ]
},

{
  id: 'ln_turkey_avocado_salad',
  name: 'Turkey Avocado Salad',
  category: 'lunch',
  diet: 'low-carb',
  calorieClass: 'medium',
  defaultGrams: 460,
  calories: 540,
  protein: 38,
  carbs: 12,
  fats: 32,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['low-carb'],
  ingredients: [
    { name: 'turkey breast', grams: 180 },
    { name: 'avocado', grams: 120 },
    { name: 'greens', grams: 160 }
  ]
},

{
  id: 'ln_highprotein_tuna_rice',
  name: 'High-Protein Tuna Rice',
  category: 'lunch',
  diet: 'high-protein',
  calorieClass: 'medium',
  defaultGrams: 500,
  calories: 600,
  protein: 46,
  carbs: 48,
  fats: 16,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['gym'],
  ingredients: [
    { name: 'tuna', grams: 200 },
    { name: 'rice', grams: 180 }
  ]
},

{
  id: 'ln_keto_salmon_spinach',
  name: 'Keto Salmon Spinach',
  category: 'lunch',
  diet: 'keto',
  calorieClass: 'medium',
  defaultGrams: 440,
  calories: 620,
  protein: 36,
  carbs: 8,
  fats: 46,
  proteinClass: 'high-fat',
  costEfficiency: 'medium',
  tags: ['keto'],
  ingredients: [
    { name: 'salmon', grams: 200 },
    { name: 'spinach', grams: 200 }
  ]
},

{
  id: 'ln_bean_veg_couscous',
  name: 'Bean & Vegetable Couscous',
  category: 'lunch',
  diet: 'vegetarian',
  calorieClass: 'medium',
  defaultGrams: 520,
  calories: 580,
  protein: 24,
  carbs: 74,
  fats: 18,
  proteinClass: 'moderate',
  costEfficiency: 'high',
  tags: ['balanced'],
  ingredients: [
    { name: 'beans', grams: 220 },
    { name: 'couscous', grams: 180 },
    { name: 'vegetables', grams: 120 }
  ]
},


{
    id: 'ln_tuna_pasta',
    name: 'Tuna pasta',
    category: 'lunch',
    diet: 'pescatarian',
    defaultGrams: 450,
    calories: 620,
    calorieClass: 'medium',
    protein: 42,
    carbs: 65,
    fats: 14,
    proteinClass: 'lean',
    costEfficiency: 'high',
    tags: ['quick'],
    ingredients: [
      { name: 'pasta', grams: 110 },
      { name: 'tuna', grams: 120 },
      { name: 'olive oil', grams: 10 },
      { name: 'tomato', grams: 80 },
    ],
  },

{
    id: 'ln_chicken_potatoes',
    name: 'Chicken with potatoes',
    category: 'lunch',
    diet: 'omnivore',
    defaultGrams: 600,
    calories: 720,
    calorieClass: 'high',
    protein: 46,
    carbs: 62,
    fats: 24,
    proteinClass: 'lean',
    costEfficiency: 'high',
    tags: ['classic'],
    ingredients: [
      { name: 'chicken', grams: 200 },
      { name: 'potatoes', grams: 250 },
      { name: 'olive oil', grams: 12 },
    ],
  },

{
    id: 'ln_veg_pasta',
    name: 'Vegetable pasta',
    category: 'lunch',
    diet: 'vegetarian',
    defaultGrams: 520,
    calories: 610,
    calorieClass: 'medium',
    protein: 18,
    carbs: 92,
    fats: 14,
    proteinClass: 'plant',
    costEfficiency: 'high',
    tags: ['vegetarian'],
    ingredients: [
      { name: 'pasta', grams: 130 },
      { name: 'vegetables', grams: 220 },
      { name: 'olive oil', grams: 10 },
    ],
  },

{
    id: 'ln_egg_rice_bowl',
    name: 'Egg rice bowl',
    category: 'lunch',
    diet: 'vegetarian',
    defaultGrams: 520,
    calories: 640,
    calorieClass: 'medium',
    protein: 26,
    carbs: 82,
    fats: 18,
    proteinClass: 'moderate',
    costEfficiency: 'high',
    tags: ['budget'],
    ingredients: [
      { name: 'eggs', grams: 150 },
      { name: 'rice', grams: 160 },
      { name: 'olive oil', grams: 10 },
    ],
  },

{
    id: 'ln_chicken_salad',
    name: 'Chicken salad',
    category: 'lunch',
    diet: 'omnivore',
    defaultGrams: 450,
    calories: 520,
    calorieClass: 'medium',
    protein: 40,
    carbs: 20,
    fats: 26,
    proteinClass: 'lean',
    costEfficiency: 'medium',
    tags: ['low-carb'],
    ingredients: [
      { name: 'chicken', grams: 170 },
      { name: 'lettuce', grams: 150 },
      { name: 'tomato', grams: 100 },
      { name: 'olive oil', grams: 12 },
    ],
  },

{
    id: 'ln_turkey_rice',
    name: 'Turkey with rice',
    category: 'lunch',
    diet: 'omnivore',
    defaultGrams: 520,
    calories: 660,
    calorieClass: 'medium',
    protein: 44,
    carbs: 72,
    fats: 14,
    proteinClass: 'lean',
    costEfficiency: 'high',
    tags: ['high-protein'],
    ingredients: [
      { name: 'turkey', grams: 180 },
      { name: 'rice', grams: 140 },
      { name: 'olive oil', grams: 10 },
    ],
  },

{
    id: 'dn_chicken_stir_fry',
    name: 'Chicken stir fry',
    category: 'dinner',
    diet: 'omnivore',
    defaultGrams: 500,
    calories: 560,
    calorieClass: 'medium',
    protein: 40,
    carbs: 35,
    fats: 22,
    proteinClass: 'lean',
    costEfficiency: 'high',
    tags: ['one-pan'],
    ingredients: [
      { name: 'chicken', grams: 180 },
      { name: 'vegetables', grams: 220 },
      { name: 'olive oil', grams: 12 },
    ],
  },

  {
  id: 'dn_lemon_chicken_greens',
  name: 'Lemon Chicken & Greens',
  category: 'dinner',
  diet: 'omnivore',
  calorieClass: 'medium',
  defaultGrams: 480,
  calories: 520,
  protein: 44,
  carbs: 22,
  fats: 18,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['light', 'balanced'],
  ingredients: [
    { name: 'chicken breast', grams: 200 },
    { name: 'leafy greens', grams: 220 },
    { name: 'lemon', grams: 20 }
  ]
},

{
  id: 'dn_beef_pepper_skillet',
  name: 'Beef & Pepper Skillet',
  category: 'dinner',
  diet: 'omnivore',
  calorieClass: 'medium',
  defaultGrams: 520,
  calories: 640,
  protein: 42,
  carbs: 26,
  fats: 32,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['hearty'],
  ingredients: [
    { name: 'beef strips', grams: 200 },
    { name: 'bell peppers', grams: 240 },
    { name: 'olive oil', grams: 15 }
  ]
},

{
  id: 'dn_shrimp_garlic_bowl',
  name: 'Shrimp Garlic Bowl',
  category: 'dinner',
  diet: 'pescatarian',
  calorieClass: 'medium',
  defaultGrams: 460,
  calories: 540,
  protein: 36,
  carbs: 34,
  fats: 22,
  proteinClass: 'lean',
  costEfficiency: 'medium',
  tags: ['quick'],
  ingredients: [
    { name: 'shrimp', grams: 200 },
    { name: 'rice', grams: 120 },
    { name: 'garlic', grams: 10 }
  ]
},

{
  id: 'dn_baked_cod_veg',
  name: 'Baked Cod & Vegetables',
  category: 'dinner',
  diet: 'pescatarian',
  calorieClass: 'medium',
  defaultGrams: 480,
  calories: 520,
  protein: 40,
  carbs: 28,
  fats: 18,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['light'],
  ingredients: [
    { name: 'cod fillet', grams: 200 },
    { name: 'vegetables', grams: 240 },
    { name: 'olive oil', grams: 12 }
  ]
},

{
  id: 'dn_veg_risotto',
  name: 'Vegetable Risotto',
  category: 'dinner',
  diet: 'vegetarian',
  calorieClass: 'medium',
  defaultGrams: 520,
  calories: 600,
  protein: 20,
  carbs: 78,
  fats: 18,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['comfort'],
  ingredients: [
    { name: 'rice', grams: 180 },
    { name: 'vegetables', grams: 220 },
    { name: 'parmesan', grams: 30 }
  ]
},

{
  id: 'dn_mushroom_omelette_plate',
  name: 'Mushroom Omelette Plate',
  category: 'dinner',
  diet: 'vegetarian',
  calorieClass: 'medium',
  defaultGrams: 420,
  calories: 520,
  protein: 30,
  carbs: 16,
  fats: 36,
  proteinClass: 'high-fat',
  costEfficiency: 'high',
  tags: ['quick'],
  ingredients: [
    { name: 'eggs', grams: 200 },
    { name: 'mushrooms', grams: 180 }
  ]
},

{
  id: 'dn_black_bean_chili',
  name: 'Black Bean Chili',
  category: 'dinner',
  diet: 'vegan',
  calorieClass: 'medium',
  defaultGrams: 540,
  calories: 540,
  protein: 24,
  carbs: 72,
  fats: 14,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['batch-cook'],
  ingredients: [
    { name: 'black beans', grams: 240 },
    { name: 'tomatoes', grams: 180 },
    { name: 'onion', grams: 80 }
  ]
},

{
  id: 'dn_zucchini_noodle_bowl',
  name: 'Zucchini Noodle Bowl',
  category: 'dinner',
  diet: 'low-carb',
  calorieClass: 'low',
  defaultGrams: 420,
  calories: 420,
  protein: 28,
  carbs: 18,
  fats: 24,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['low-carb'],
  ingredients: [
    { name: 'zucchini noodles', grams: 240 },
    { name: 'chicken breast', grams: 160 }
  ]
},

{
  id: 'dn_keto_beef_eggs',
  name: 'Keto Beef & Eggs',
  category: 'dinner',
  diet: 'keto',
  calorieClass: 'medium',
  defaultGrams: 460,
  calories: 650,
  protein: 40,
  carbs: 8,
  fats: 48,
  proteinClass: 'high-fat',
  costEfficiency: 'medium',
  tags: ['keto'],
  ingredients: [
    { name: 'beef', grams: 180 },
    { name: 'eggs', grams: 160 }
  ]
},

{
  id: 'dn_med_chickpea_bowl',
  name: 'Mediterranean Chickpea Bowl',
  category: 'dinner',
  diet: 'mediterranean',
  calorieClass: 'medium',
  defaultGrams: 500,
  calories: 560,
  protein: 22,
  carbs: 64,
  fats: 20,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['mediterranean'],
  ingredients: [
    { name: 'chickpeas', grams: 220 },
    { name: 'vegetables', grams: 200 },
    { name: 'olive oil', grams: 15 }
  ]
},

{
  id: 'dn_chicken_mushroom_skillet',
  name: 'Chicken & Mushroom Skillet',
  category: 'dinner',
  diet: 'omnivore',
  calorieClass: 'medium',
  defaultGrams: 500,
  calories: 560,
  protein: 42,
  carbs: 28,
  fats: 20,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['one-pan'],
  ingredients: [
    { name: 'chicken breast', grams: 200 },
    { name: 'mushrooms', grams: 220 },
    { name: 'olive oil', grams: 15 }
  ]
},

{
  id: 'dn_beef_tomato_stew',
  name: 'Beef Tomato Stew',
  category: 'dinner',
  diet: 'omnivore',
  calorieClass: 'medium',
  defaultGrams: 540,
  calories: 640,
  protein: 40,
  carbs: 32,
  fats: 30,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['slow-cook'],
  ingredients: [
    { name: 'beef chunks', grams: 200 },
    { name: 'tomatoes', grams: 200 },
    { name: 'onion', grams: 80 }
  ]
},

{
  id: 'dn_tuna_veg_bowl',
  name: 'Tuna Vegetable Bowl',
  category: 'dinner',
  diet: 'pescatarian',
  calorieClass: 'medium',
  defaultGrams: 460,
  calories: 520,
  protein: 38,
  carbs: 24,
  fats: 22,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['quick'],
  ingredients: [
    { name: 'tuna', grams: 180 },
    { name: 'vegetables', grams: 240 }
  ]
},

{
  id: 'dn_baked_trout_greens',
  name: 'Baked Trout & Greens',
  category: 'dinner',
  diet: 'pescatarian',
  calorieClass: 'medium',
  defaultGrams: 480,
  calories: 580,
  protein: 40,
  carbs: 20,
  fats: 30,
  proteinClass: 'high-fat',
  costEfficiency: 'medium',
  tags: ['omega-3'],
  ingredients: [
    { name: 'trout', grams: 200 },
    { name: 'greens', grams: 220 },
    { name: 'olive oil', grams: 15 }
  ]
},

{
  id: 'dn_eggplant_parmesan',
  name: 'Eggplant Parmesan',
  category: 'dinner',
  diet: 'vegetarian',
  calorieClass: 'medium',
  defaultGrams: 520,
  calories: 620,
  protein: 24,
  carbs: 68,
  fats: 28,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['comfort'],
  ingredients: [
    { name: 'eggplant', grams: 260 },
    { name: 'cheese', grams: 80 },
    { name: 'tomato sauce', grams: 120 }
  ]
},

{
  id: 'dn_spinach_ricotta_peppers',
  name: 'Spinach Ricotta Stuffed Peppers',
  category: 'dinner',
  diet: 'vegetarian',
  calorieClass: 'medium',
  defaultGrams: 480,
  calories: 540,
  protein: 28,
  carbs: 44,
  fats: 26,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['baked'],
  ingredients: [
    { name: 'bell peppers', grams: 240 },
    { name: 'ricotta', grams: 120 },
    { name: 'spinach', grams: 120 }
  ]
},

{
  id: 'dn_vegan_sweet_potato_bowl',
  name: 'Sweet Potato Vegan Bowl',
  category: 'dinner',
  diet: 'vegan',
  calorieClass: 'medium',
  defaultGrams: 520,
  calories: 560,
  protein: 22,
  carbs: 76,
  fats: 18,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['plant-based'],
  ingredients: [
    { name: 'sweet potato', grams: 260 },
    { name: 'chickpeas', grams: 180 },
    { name: 'olive oil', grams: 15 }
  ]
},

{
  id: 'dn_tofu_sesame_stir_fry',
  name: 'Tofu Sesame Stir Fry',
  category: 'dinner',
  diet: 'vegan',
  calorieClass: 'medium',
  defaultGrams: 500,
  calories: 540,
  protein: 30,
  carbs: 54,
  fats: 22,
  proteinClass: 'plant',
  costEfficiency: 'medium',
  tags: ['asian'],
  ingredients: [
    { name: 'tofu', grams: 220 },
    { name: 'vegetables', grams: 220 },
    { name: 'sesame oil', grams: 15 }
  ]
},

{
  id: 'dn_lowcarb_chicken_bowl',
  name: 'Low-Carb Chicken Bowl',
  category: 'dinner',
  diet: 'low-carb',
  calorieClass: 'medium',
  defaultGrams: 460,
  calories: 500,
  protein: 40,
  carbs: 16,
  fats: 20,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['low-carb'],
  ingredients: [
    { name: 'chicken breast', grams: 200 },
    { name: 'vegetables', grams: 240 }
  ]
},

{
  id: 'dn_highprotein_beef_plate',
  name: 'High-Protein Beef Plate',
  category: 'dinner',
  diet: 'high-protein',
  calorieClass: 'medium',
  defaultGrams: 480,
  calories: 620,
  protein: 48,
  carbs: 18,
  fats: 28,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['gym'],
  ingredients: [
    { name: 'lean beef', grams: 220 },
    { name: 'vegetables', grams: 220 }
  ]
},

  {
  id: 'dn_chicken_stir_fry_v2',
  name: 'Chicken Stir Fry',
  category: 'dinner',
  diet: 'omnivore',
  calorieClass: 'medium',
  defaultGrams: 480,
  calories: 540,
  protein: 42,
  carbs: 38,
  fats: 18,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['quick', 'balanced'],
  ingredients: [
    { name: 'chicken breast', grams: 180 },
    { name: 'mixed vegetables', grams: 220 },
    { name: 'soy sauce', grams: 15 }
  ]
},
{
  id: 'dn_beef_veg',
  name: 'Beef with Vegetables',
  category: 'dinner',
  diet: 'omnivore',
  calorieClass: 'medium',
  defaultGrams: 500,
  calories: 620,
  protein: 40,
  carbs: 28,
  fats: 30,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['hearty'],
  ingredients: [
    { name: 'beef', grams: 180 },
    { name: 'vegetables', grams: 250 },
    { name: 'olive oil', grams: 15 }
  ]
},
{
  id: 'dn_baked_salmon',
  name: 'Baked Salmon Plate',
  category: 'dinner',
  diet: 'pescatarian',
  calorieClass: 'medium',
  defaultGrams: 460,
  calories: 600,
  protein: 38,
  carbs: 18,
  fats: 34,
  proteinClass: 'high-fat',
  costEfficiency: 'medium',
  tags: ['omega-3'],
  ingredients: [
    { name: 'salmon', grams: 180 },
    { name: 'broccoli', grams: 200 },
    { name: 'olive oil', grams: 15 }
  ]
},

{
  id: 'dn_lentil_stew',
  name: 'Lentil Stew',
  category: 'dinner',
  diet: 'vegan',
  calorieClass: 'medium',
  defaultGrams: 520,
  calories: 520,
  protein: 26,
  carbs: 68,
  fats: 14,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['plant-based'],
  ingredients: [
    { name: 'lentils', grams: 220 },
    { name: 'carrots', grams: 120 },
    { name: 'onion', grams: 80 }
  ]
},

{
  id: 'dn_tofu_curry',
  name: 'Tofu Vegetable Curry',
  category: 'dinner',
  diet: 'vegan',
  calorieClass: 'medium',
  defaultGrams: 500,
  calories: 560,
  protein: 28,
  carbs: 54,
  fats: 22,
  proteinClass: 'plant',
  costEfficiency: 'medium',
  tags: ['comfort'],
  ingredients: [
    { name: 'tofu', grams: 200 },
    { name: 'vegetables', grams: 220 },
    { name: 'coconut milk', grams: 60 }
  ]
},

{
  id: 'dn_halloumi_plate',
  name: 'Grilled Halloumi Plate',
  category: 'dinner',
  diet: 'vegetarian',
  calorieClass: 'medium',
  defaultGrams: 450,
  calories: 620,
  protein: 32,
  carbs: 24,
  fats: 38,
  proteinClass: 'high-fat',
  costEfficiency: 'medium',
  tags: ['vegetarian'],
  ingredients: [
    { name: 'halloumi cheese', grams: 180 },
    { name: 'vegetables', grams: 200 },
    { name: 'olive oil', grams: 15 }
  ]
},

{
  id: 'dn_chickpea_spinach',
  name: 'Chickpea & Spinach Skillet',
  category: 'dinner',
  diet: 'vegan',
  calorieClass: 'medium',
  defaultGrams: 480,
  calories: 500,
  protein: 24,
  carbs: 62,
  fats: 16,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['quick'],
  ingredients: [
    { name: 'chickpeas', grams: 220 },
    { name: 'spinach', grams: 120 },
    { name: 'olive oil', grams: 15 }
  ]
},

{
  id: 'dn_turkey_protein',
  name: 'Turkey Protein Plate',
  category: 'dinner',
  diet: 'high-protein',
  calorieClass: 'medium',
  defaultGrams: 480,
  calories: 520,
  protein: 46,
  carbs: 20,
  fats: 16,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['gym'],
  ingredients: [
    { name: 'turkey breast', grams: 200 },
    { name: 'vegetables', grams: 220 }
  ]
},

{
  id: 'dn_keto_eggs_avocado',
  name: 'Keto Eggs & Avocado',
  category: 'dinner',
  diet: 'keto',
  calorieClass: 'medium',
  defaultGrams: 420,
  calories: 600,
  protein: 28,
  carbs: 10,
  fats: 46,
  proteinClass: 'high-fat',
  costEfficiency: 'high',
  tags: ['keto'],
  ingredients: [
    { name: 'eggs', grams: 180 },
    { name: 'avocado', grams: 120 }
  ]
},

{
  id: 'dn_med_fish_bowl',
  name: 'Mediterranean Fish Bowl',
  category: 'dinner',
  diet: 'mediterranean',
  calorieClass: 'medium',
  defaultGrams: 500,
  calories: 580,
  protein: 36,
  carbs: 34,
  fats: 26,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['mediterranean'],
  ingredients: [
    { name: 'white fish', grams: 180 },
    { name: 'grains', grams: 120 },
    { name: 'vegetables', grams: 180 },
    { name: 'olive oil', grams: 15 }
  ]
},


{
    id: 'dn_salmon_potatoes',
    name: 'Salmon with potatoes',
    category: 'dinner',
    diet: 'pescatarian',
    defaultGrams: 620,
    calories: 720,
    calorieClass: 'high',
    protein: 38,
    carbs: 40,
    fats: 36,
    proteinClass: 'high-fat',
    costEfficiency: 'medium',
    tags: ['omega3'],
    ingredients: [
      { name: 'salmon', grams: 180 },
      { name: 'potatoes', grams: 240 },
      { name: 'olive oil', grams: 12 },
    ],
  },

{
    id: 'dn_tofu_veg_bowl',
    name: 'Tofu veggie bowl',
    category: 'dinner',
    diet: 'vegan',
    defaultGrams: 560,
    calories: 600,
    calorieClass: 'medium',
    protein: 26,
    carbs: 58,
    fats: 22,
    proteinClass: 'plant',
    costEfficiency: 'high',
    tags: ['vegan', 'veggie'],
    ingredients: [
      { name: 'tofu', grams: 200 },
      { name: 'vegetables', grams: 260 },
      { name: 'olive oil', grams: 12 },
    ],
  },

{
    id: 'dn_beef_stew',
    name: 'Beef stew',
    category: 'dinner',
    diet: 'omnivore',
    defaultGrams: 650,
    calories: 780,
    calorieClass: 'high',
    protein: 44,
    carbs: 52,
    fats: 34,
    proteinClass: 'moderate',
    costEfficiency: 'medium',
    tags: ['hearty'],
    ingredients: [
      { name: 'beef', grams: 220 },
      { name: 'potatoes', grams: 200 },
      { name: 'carrot', grams: 90 },
      { name: 'olive oil', grams: 10 },
    ],
  },

{
    id: 'dn_chicken_pasta',
    name: 'Chicken pasta',
    category: 'dinner',
    diet: 'omnivore',
    defaultGrams: 620,
    calories: 740,
    calorieClass: 'high',
    protein: 44,
    carbs: 78,
    fats: 22,
    proteinClass: 'moderate',
    costEfficiency: 'medium',
    tags: ['comfort'],
    ingredients: [
      { name: 'chicken', grams: 170 },
      { name: 'pasta', grams: 140 },
      { name: 'olive oil', grams: 10 },
    ],
  },

{
    id: 'sn_cottage_cheese_fruit',
    name: 'Cottage cheese with fruit',
    category: 'snack',
    diet: 'vegetarian',
    defaultGrams: 240,
    calories: 220,
    calorieClass: 'medium',
    protein: 18,
    carbs: 20,
    fats: 8,
    proteinClass: 'lean',
    costEfficiency: 'high',
    tags: ['high-protein'],
    ingredients: [
      { name: 'cottage cheese', grams: 160 },
      { name: 'apple', grams: 120 },
    ],
  },

{
    id: 'sn_boiled_eggs',
    name: 'Boiled eggs',
    category: 'snack',
    diet: 'vegetarian',
    defaultGrams: 140,
    calories: 180,
    calorieClass: 'low',
    protein: 14,
    carbs: 2,
    fats: 12,
    proteinClass: 'lean',
    costEfficiency: 'high',
    tags: ['protein'],
    ingredients: [
      { name: 'eggs', grams: 120 },
    ],
  },

{
    id: 'sn_hummus_veggies',
    name: 'Hummus with veggies',
    category: 'snack',
    diet: 'vegetarian',
    defaultGrams: 260,
    calories: 240,
    calorieClass: 'medium',
    protein: 8,
    carbs: 26,
    fats: 12,
    proteinClass: 'plant',
    costEfficiency: 'high',
    tags: ['vegan', 'veggie'],
    ingredients: [
      { name: 'hummus', grams: 80 },
      { name: 'carrot', grams: 120 },
      { name: 'cucumber', grams: 120 },
    ],
  },

{
    id: 'sn_yogurt_plain',
    name: 'Plain yogurt',
    category: 'snack',
    diet: 'vegetarian',
    defaultGrams: 200,
    calories: 150,
    calorieClass: 'low',
    protein: 12,
    carbs: 10,
    fats: 6,
    proteinClass: 'moderate',
    costEfficiency: 'high',
    tags: ['quick'],
    ingredients: [
      { name: 'yogurt', grams: 200 },
    ],
  },

{
    id: 'sn_cheese_crackers',
    name: 'Cheese and crackers',
    category: 'snack',
    diet: 'vegetarian',
    defaultGrams: 180,
    calories: 320,
    calorieClass: 'medium',
    protein: 12,
    carbs: 26,
    fats: 20,
    proteinClass: 'moderate',
    costEfficiency: 'medium',
    tags: ['savory'],
    ingredients: [
      { name: 'cheese', grams: 50 },
      { name: 'crackers', grams: 50 },
    ],
  },

{
    id: 'sn_yogurt_nuts',
    name: 'Yogurt with nuts',
    category: 'snack',
    diet: 'vegetarian',
    defaultGrams: 220,
    calories: 280,
    calorieClass: 'medium',
    protein: 16,
    carbs: 16,
    fats: 18,
    proteinClass: 'moderate',
    costEfficiency: 'medium',
    tags: ['quick'],
    ingredients: [
      { name: 'yogurt', grams: 170 },
      { name: 'nuts', grams: 25 },
    ],
  },

{
    id: 'sn_apple_peanut',
    name: 'Apple with peanut butter',
    category: 'snack',
    diet: 'vegan',
    defaultGrams: 220,
    calories: 300,
    calorieClass: 'medium',
    protein: 8,
    carbs: 32,
    fats: 16,
    proteinClass: 'plant',
    costEfficiency: 'high',
    tags: ['budget'],
    ingredients: [
      { name: 'apple', grams: 150 },
      { name: 'peanut butter', grams: 20 },
    ],
  },

{
    id: 'sn_greek_yogurt_nuts',
    name: 'Greek yogurt with nuts',
    category: 'snack',
    diet: 'mediterranean',
    defaultGrams: 220,
    calories: 310,
    calorieClass: 'medium',
    protein: 18,
    carbs: 12,
    fats: 20,
    proteinClass: 'moderate',
    costEfficiency: 'medium',
    tags: ['high-protein'],
    ingredients: [
      { name: 'greek yogurt', grams: 170 },
      { name: 'nuts', grams: 25 },
    ],
  },

{
    id: 'sn_banana_peanut_butter',
    name: 'Banana with peanut butter',
    category: 'snack',
    diet: 'vegan',
    defaultGrams: 240,
    calories: 330,
    calorieClass: 'medium',
    protein: 8,
    carbs: 42,
    fats: 14,
    proteinClass: 'plant',
    costEfficiency: 'high',
    tags: ['budget'],
    ingredients: [
      { name: 'banana', grams: 140 },
      { name: 'peanut butter', grams: 20 },
    ],
  },
  
  {
  id: 'bf_cinnamon_apple_oats',
  name: 'Cinnamon Apple Oats',
  category: 'breakfast',
  diet: 'vegan',
  calorieClass: 'medium',
  defaultGrams: 420,
  calories: 500,
  protein: 14,
  carbs: 74,
  fats: 14,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['budget'],
  ingredients: [
    { name: 'oats', grams: 80 },
    { name: 'apple', grams: 140 },
    { name: 'cinnamon', grams: 4 }
  ]
},

{
  id: 'bf_spinach_egg_scramble',
  name: 'Spinach Egg Scramble',
  category: 'breakfast',
  diet: 'vegetarian',
  calorieClass: 'low',
  defaultGrams: 320,
  calories: 360,
  protein: 26,
  carbs: 8,
  fats: 22,
  proteinClass: 'moderate',
  costEfficiency: 'high',
  tags: ['quick'],
  ingredients: [
    { name: 'eggs', grams: 180 },
    { name: 'spinach', grams: 120 }
  ]
},

{
  id: 'bf_turkey_breakfast_sandwich',
  name: 'Turkey Breakfast Sandwich',
  category: 'breakfast',
  diet: 'omnivore',
  calorieClass: 'medium',
  defaultGrams: 380,
  calories: 520,
  protein: 32,
  carbs: 44,
  fats: 22,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['on-the-go'],
  ingredients: [
    { name: 'bread', grams: 90 },
    { name: 'turkey breast', grams: 140 },
    { name: 'eggs', grams: 120 }
  ]
},

{
  id: 'bf_berry_skyr_bowl',
  name: 'Berry Skyr Bowl',
  category: 'breakfast',
  diet: 'vegetarian',
  calorieClass: 'low',
  defaultGrams: 300,
  calories: 280,
  protein: 24,
  carbs: 24,
  fats: 4,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['protein'],
  ingredients: [
    { name: 'skyr', grams: 220 },
    { name: 'berries', grams: 80 }
  ]
},

{
  id: 'bf_avocado_tomato_toast',
  name: 'Avocado Tomato Toast',
  category: 'breakfast',
  diet: 'vegetarian',
  calorieClass: 'medium',
  defaultGrams: 340,
  calories: 480,
  protein: 14,
  carbs: 48,
  fats: 26,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['classic'],
  ingredients: [
    { name: 'bread', grams: 80 },
    { name: 'avocado', grams: 100 },
    { name: 'tomato', grams: 120 }
  ]
},
{
  id: 'bf_banana_peanut_smoothie',
  name: 'Banana Peanut Smoothie',
  category: 'breakfast',
  diet: 'vegetarian',
  calorieClass: 'medium',
  defaultGrams: 420,
  calories: 540,
  protein: 22,
  carbs: 56,
  fats: 26,
  proteinClass: 'moderate',
  costEfficiency: 'high',
  tags: ['budget'],
  ingredients: [
    { name: 'banana', grams: 140 },
    { name: 'peanut butter', grams: 40 },
    { name: 'milk', grams: 240 }
  ]
},


{
  id: 'bf_chia_pudding_v2',
  name: 'Chia pudding with berries',
  category: 'breakfast',
  diet: 'vegan',
  defaultGrams: 320,
  calories: 380,
  calorieClass: 'low',
  protein: 16,
  carbs: 40,
  fats: 14,
  proteinClass: 'plant',
  costEfficiency: 'medium',
  tags: ['vegan', 'fiber'],
  ingredients: [
    { name: 'chia seeds', grams: 35 },
    { name: 'soy milk', grams: 200 },
    { name: 'berries', grams: 80 },
    { name: 'honey', grams: 10 },
  ],
},

{
  id: 'bf_toast_ricotta_honey',
  name: 'Ricotta toast with honey',
  category: 'breakfast',
  diet: 'mediterranean',
  defaultGrams: 280,
  calories: 410,
  calorieClass: 'medium',
  protein: 20,
  carbs: 45,
  fats: 12,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['quick', 'vegetarian'],
  ingredients: [
    { name: 'bread', grams: 70 },
    { name: 'ricotta', grams: 120 },
    { name: 'honey', grams: 15 },
    { name: 'berries', grams: 50 },
  ],
},

{
  id: 'bf_overnight_oats_peanut',
  name: 'Overnight oats with peanut butter',
  category: 'breakfast',
  diet: 'vegan',
  defaultGrams: 360,
  calories: 520,
  calorieClass: 'medium',
  protein: 22,
  carbs: 58,
  fats: 18,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['mealprep', 'budget'],
  ingredients: [
    { name: 'oats', grams: 70 },
    { name: 'milk', grams: 200 },
    { name: 'peanut butter', grams: 20 },
    { name: 'banana', grams: 90 },
  ],
},

{
  id: 'bf_keto_eggs_spinach',
  name: 'Keto eggs with spinach and feta',
  category: 'breakfast',
  diet: 'keto',
  defaultGrams: 300,
  calories: 490,
  calorieClass: 'medium',
  protein: 30,
  carbs: 10,
  fats: 34,
  proteinClass: 'high-fat',
  costEfficiency: 'medium',
  tags: ['keto', 'low-carb'],
  ingredients: [
    { name: 'eggs', grams: 150 },
    { name: 'spinach', grams: 80 },
    { name: 'feta cheese', grams: 40 },
    { name: 'olive oil', grams: 10 },
  ],
},

{
  id: 'bf_smoothie_protein',
  name: 'Protein smoothie (banana, yogurt)',
  category: 'breakfast',
  diet: 'high-protein',
  defaultGrams: 450,
  calories: 470,
  calorieClass: 'medium',
  protein: 32,
  carbs: 55,
  fats: 12,
  proteinClass: 'lean',
  costEfficiency: 'medium',
  tags: ['gym', 'quick'],
  ingredients: [
    { name: 'banana', grams: 120 },
    { name: 'greek yogurt', grams: 200 },
    { name: 'milk', grams: 150 },
    { name: 'protein powder', grams: 25 },
  ],
},

{
  id: 'bf_tofu_scramble_toast',
  name: 'Tofu scramble with toast',
  category: 'breakfast',
  diet: 'omnivore',
  defaultGrams: 360,
  calories: 430,
  calorieClass: 'medium',
  protein: 24,
  carbs: 42,
  fats: 16,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['vegan', 'savory'],
  ingredients: [
    { name: 'tofu', grams: 180 },
    { name: 'bread', grams: 70 },
    { name: 'bell pepper', grams: 60 },
    { name: 'olive oil', grams: 10 },
  ],
},

{
  id: 'bf_porridge_dates',
  name: 'Oat porridge with dates and walnuts',
  category: 'breakfast',
  diet: 'vegetarian',
  defaultGrams: 360,
  calories: 540,
  calorieClass: 'medium',
  protein: 18,
  carbs: 72,
  fats: 18,
  proteinClass: 'plant',
  costEfficiency: 'medium',
  tags: ['energy'],
  ingredients: [
    { name: 'oats', grams: 80 },
    { name: 'dates', grams: 30 },
    { name: 'walnuts', grams: 20 },
    { name: 'milk', grams: 200 },
  ],
},

{
  id: 'bf_egg_white_oats',
  name: 'Egg-white oats bowl',
  category: 'breakfast',
  diet: 'keto',
  defaultGrams: 420,
  calories: 500,
  calorieClass: 'medium',
  protein: 35,
  carbs: 55,
  fats: 10,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['high_protein'],
  ingredients: [
    { name: 'oats', grams: 70 },
    { name: 'egg whites', grams: 200 },
    { name: 'banana', grams: 80 },
  ],
},

{
  id: 'bf_turkey_sandwich_morning',
  name: 'Turkey breakfast sandwich',
  category: 'breakfast',
  diet: 'omnivore',
  defaultGrams: 320,
  calories: 560,
  calorieClass: 'high',
  protein: 34,
  carbs: 40,
  fats: 26,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['savory'],
  ingredients: [
    { name: 'bread', grams: 80 },
    { name: 'turkey', grams: 90 },
    { name: 'cheese', grams: 25 },
    { name: 'eggs', grams: 60 },
  ],
},

{
  id: 'bf_muesli_yogurt',
  name: 'Muesli with yogurt and apple',
  category: 'breakfast',
  diet: 'vegetarian',
  defaultGrams: 360,
  calories: 460,
  calorieClass: 'medium',
  protein: 22,
  carbs: 62,
  fats: 12,
  proteinClass: 'moderate',
  costEfficiency: 'high',
  tags: ['fiber'],
  ingredients: [
    { name: 'muesli', grams: 70 },
    { name: 'greek yogurt', grams: 180 },
    { name: 'apple', grams: 120 },
  ],
},

{
  id: 'bf_omelette_mushrooms',
  name: 'Omelette with mushrooms',
  category: 'breakfast',
  diet: 'keto',
  defaultGrams: 300,
  calories: 420,
  calorieClass: 'medium',
  protein: 28,
  carbs: 10,
  fats: 28,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['vegetarian'],
  ingredients: [
    { name: 'eggs', grams: 150 },
    { name: 'mushrooms', grams: 120 },
    { name: 'olive oil', grams: 10 },
  ],
},

{
  id: 'bf_shakshuka',
  name: 'Shakshuka with eggs',
  category: 'breakfast',
  diet: 'vegetarian',
  defaultGrams: 420,
  calories: 520,
  calorieClass: 'medium',
  protein: 26,
  carbs: 40,
  fats: 26,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['mediterranean'],
  ingredients: [
    { name: 'eggs', grams: 120 },
    { name: 'tomato sauce', grams: 180 },
    { name: 'onion', grams: 50 },
    { name: 'olive oil', grams: 10 },
  ],
},

{
  id: 'bf_yogurt_granola',
  name: 'Yogurt with granola',
  category: 'breakfast',
  diet: 'mediterranean',
  defaultGrams: 320,
  calories: 510,
  calorieClass: 'medium',
  protein: 24,
  carbs: 60,
  fats: 16,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['quick'],
  ingredients: [
    { name: 'greek yogurt', grams: 200 },
    { name: 'granola', grams: 60 },
    { name: 'berries', grams: 60 },
  ],
},

{
  id: 'bf_hummus_toast',
  name: 'Hummus toast with cucumber',
  category: 'breakfast',
  diet: 'mediterranean',
  defaultGrams: 320,
  calories: 410,
  calorieClass: 'medium',
  protein: 16,
  carbs: 52,
  fats: 14,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['vegan', 'budget'],
  ingredients: [
    { name: 'bread', grams: 80 },
    { name: 'hummus', grams: 80 },
    { name: 'cucumber', grams: 120 },
  ],
},

{
  id: 'bf_tuna_omelette',
  name: 'Tuna omelette',
  category: 'breakfast',
  diet: 'pescatarian',
  defaultGrams: 320,
  calories: 510,
  calorieClass: 'medium',
  protein: 40,
  carbs: 8,
  fats: 28,
  proteinClass: 'lean',
  costEfficiency: 'medium',
  tags: ['high_protein'],
  ingredients: [
    { name: 'eggs', grams: 150 },
    { name: 'tuna', grams: 100 },
    { name: 'olive oil', grams: 10 },
  ],
},

{
  id: 'ln_quinoa_chickpea_salad',
  name: 'Quinoa chickpea salad',
  category: 'lunch',
  diet: 'vegetarian',
  defaultGrams: 520,
  calories: 610,
  calorieClass: 'medium',
  protein: 22,
  carbs: 82,
  fats: 18,
  proteinClass: 'plant',
  costEfficiency: 'medium',
  tags: ['vegan'],
  ingredients: [
    { name: 'quinoa', grams: 90 },
    { name: 'chickpeas', grams: 140 },
    { name: 'olive oil', grams: 12 },
    { name: 'tomato', grams: 80 },
  ],
},

{
  id: 'ln_turkey_bulgur_v2',
  name: 'Turkey with bulgur',
  category: 'lunch',
  diet: 'omnivore',
  defaultGrams: 520,
  calories: 640,
  calorieClass: 'medium',
  protein: 42,
  carbs: 62,
  fats: 16,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['high_protein'],
  ingredients: [
    { name: 'turkey', grams: 180 },
    { name: 'bulgur', grams: 110 },
    { name: 'olive oil', grams: 10 },
  ],
},

{
  id: 'ln_beans_rice_bowl',
  name: 'Beans and rice bowl',
  category: 'lunch',
  diet: 'vegetarian',
  defaultGrams: 520,
  calories: 670,
  calorieClass: 'medium',
  protein: 24,
  carbs: 96,
  fats: 14,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['vegan', 'budget'],
  ingredients: [
    { name: 'beans', grams: 180 },
    { name: 'rice', grams: 140 },
    { name: 'olive oil', grams: 10 },
  ],
},

{
  id: 'ln_greek_chicken_salad',
  name: 'Greek chicken salad',
  category: 'lunch',
  diet: 'mediterranean',
  defaultGrams: 480,
  calories: 520,
  calorieClass: 'medium',
  protein: 42,
  carbs: 22,
  fats: 22,
  proteinClass: 'lean',
  costEfficiency: 'medium',
  tags: ['low-carb'],
  ingredients: [
    { name: 'chicken', grams: 170 },
    { name: 'lettuce', grams: 120 },
    { name: 'tomato', grams: 80 },
    { name: 'feta cheese', grams: 30 },
    { name: 'olive oil', grams: 12 },
  ],
},

{
  id: 'ln_tofu_noodle_bowl',
  name: 'Tofu noodle bowl',
  category: 'lunch',
  diet: 'vegetarian',
  defaultGrams: 520,
  calories: 690,
  calorieClass: 'medium',
  protein: 28,
  carbs: 92,
  fats: 18,
  proteinClass: 'plant',
  costEfficiency: 'medium',
  tags: ['vegan'],
  ingredients: [
    { name: 'tofu', grams: 180 },
    { name: 'noodles', grams: 120 },
    { name: 'vegetables', grams: 160 },
    { name: 'oil', grams: 10 },
  ],
},

{
  id: 'dn_veggie_stir_fry_tofu',
  name: 'Tofu veggie stir-fry',
  category: 'dinner',
  diet: 'vegan',
  defaultGrams: 520,
  calories: 580,
  calorieClass: 'medium',
  protein: 28,
  carbs: 60,
  fats: 18,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['vegan', 'veggie'],
  ingredients: [
    { name: 'tofu', grams: 200 },
    { name: 'mixed vegetables', grams: 250 },
    { name: 'oil', grams: 12 },
  ],
},

{
  id: 'dn_veggie_curry_chickpea',
  name: 'Chickpea vegetable curry',
  category: 'dinner',
  diet: 'vegan',
  defaultGrams: 560,
  calories: 640,
  calorieClass: 'medium',
  protein: 20,
  carbs: 88,
  fats: 18,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['vegan', 'veggie'],
  ingredients: [
    { name: 'chickpeas', grams: 200 },
    { name: 'vegetables', grams: 250 },
    { name: 'coconut milk', grams: 80 },
  ],
},

{
  id: 'dn_veggie_chili',
  name: 'Vegetarian chili',
  category: 'dinner',
  diet: 'vegetarian',
  defaultGrams: 600,
  calories: 670,
  calorieClass: 'medium',
  protein: 24,
  carbs: 92,
  fats: 14,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['vegan', 'veggie'],
  ingredients: [
    { name: 'beans', grams: 220 },
    { name: 'tomato sauce', grams: 200 },
    { name: 'onion', grams: 70 },
    { name: 'oil', grams: 10 },
  ],
},

{
  id: 'sn_protein_shake',
  name: 'Protein shake',
  category: 'snack',
  diet: 'high-protein',
  defaultGrams: 300,
  calories: 220,
  calorieClass: 'medium',
  protein: 30,
  carbs: 12,
  fats: 6,
  proteinClass: 'lean',
  costEfficiency: 'medium',
  tags: ['high_protein'],
  ingredients: [
    { name: 'protein powder', grams: 30 },
    { name: 'milk', grams: 250 },
  ],
},

{
  id: 'sn_yogurt_honey_sn',
  name: 'Yogurt with honey',
  category: 'snack',
  diet: 'mediterranean',
  defaultGrams: 220,
  calories: 210,
  calorieClass: 'medium',
  protein: 16,
  carbs: 28,
  fats: 4,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['quick'],
  ingredients: [
    { name: 'greek yogurt', grams: 170 },
    { name: 'honey', grams: 20 },
  ],
},

{
  id: 'sn_hummus_carrots',
  name: 'Hummus and carrots',
  category: 'snack',
  diet: 'mediterranean',
  defaultGrams: 250,
  calories: 240,
  calorieClass: 'medium',
  protein: 8,
  carbs: 28,
  fats: 12,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['vegan', 'veggie'],
  ingredients: [
    { name: 'hummus', grams: 80 },
    { name: 'carrot', grams: 160 },
  ],
},

{
  id: 'ln_salmon_quinoa',
  name: 'Salmon with quinoa',
  category: 'lunch',
  diet: 'pescatarian',
  defaultGrams: 520,
  calories: 700,
  calorieClass: 'high',
  protein: 40,
  carbs: 58,
  fats: 30,
  proteinClass: 'high-fat',
  costEfficiency: 'medium',
  tags: ['omega3'],
  ingredients: [
    { name: 'salmon', grams: 180 },
    { name: 'quinoa', grams: 110 },
    { name: 'olive oil', grams: 10 },
  ],
},

{
  id: 'ln_chicken_wrap',
  name: 'Chicken wrap',
  category: 'lunch',
  diet: 'omnivore',
  defaultGrams: 480,
  calories: 640,
  calorieClass: 'medium',
  protein: 38,
  carbs: 62,
  fats: 18,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['on-the-go'],
  ingredients: [
    { name: 'tortilla', grams: 90 },
    { name: 'chicken', grams: 150 },
    { name: 'lettuce', grams: 80 },
    { name: 'yogurt sauce', grams: 40 },
  ],
},

{
  id: 'ln_beef_bulgur',
  name: 'Beef with bulgur',
  category: 'lunch',
  diet: 'omnivore',
  defaultGrams: 560,
  calories: 760,
  calorieClass: 'high',
  protein: 42,
  carbs: 68,
  fats: 28,
  proteinClass: 'moderate',
  costEfficiency: 'medium',
  tags: ['hearty'],
  ingredients: [
    { name: 'beef', grams: 200 },
    { name: 'bulgur', grams: 140 },
    { name: 'olive oil', grams: 12 },
  ],
},

{
  id: 'ln_tuna_salad',
  name: 'Tuna salad',
  category: 'lunch',
  diet: 'pescatarian',
  defaultGrams: 420,
  calories: 520,
  calorieClass: 'medium',
  protein: 36,
  carbs: 18,
  fats: 28,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['low-carb'],
  ingredients: [
    { name: 'tuna', grams: 150 },
    { name: 'lettuce', grams: 140 },
    { name: 'olive oil', grams: 14 },
  ],
},

{
  id: 'dn_chicken_curry',
  name: 'Chicken curry with rice',
  category: 'dinner',
  diet: 'omnivore',
  defaultGrams: 600,
  calories: 760,
  calorieClass: 'high',
  protein: 42,
  carbs: 74,
  fats: 26,
  proteinClass: 'moderate',
  costEfficiency: 'high',
  tags: ['comfort'],
  ingredients: [
    { name: 'chicken', grams: 180 },
    { name: 'rice', grams: 150 },
    { name: 'curry sauce', grams: 120 },
  ],
},

{
  id: 'dn_fish_veg_plate',
  name: 'White fish with vegetables',
  category: 'dinner',
  diet: 'pescatarian',
  defaultGrams: 520,
  calories: 480,
  calorieClass: 'medium',
  protein: 38,
  carbs: 28,
  fats: 18,
  proteinClass: 'lean',
  costEfficiency: 'medium',
  tags: ['light'],
  ingredients: [
    { name: 'white fish', grams: 200 },
    { name: 'vegetables', grams: 260 },
    { name: 'olive oil', grams: 10 },
  ],
},

{
  id: 'dn_turkey_meatballs',
  name: 'Turkey meatballs with mash',
  category: 'dinner',
  diet: 'omnivore',
  defaultGrams: 620,
  calories: 720,
  calorieClass: 'high',
  protein: 40,
  carbs: 58,
  fats: 28,
  proteinClass: 'moderate',
  costEfficiency: 'high',
  tags: ['classic'],
  ingredients: [
    { name: 'turkey', grams: 200 },
    { name: 'potatoes', grams: 240 },
    { name: 'olive oil', grams: 12 },
  ],
},

{
  id: 'dn_eggplant_pasta',
  name: 'Eggplant pasta',
  category: 'dinner',
  diet: 'vegetarian',
  defaultGrams: 580,
  calories: 680,
  calorieClass: 'medium',
  protein: 20,
  carbs: 96,
  fats: 20,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['vegetarian'],
  ingredients: [
    { name: 'pasta', grams: 140 },
    { name: 'eggplant', grams: 220 },
    { name: 'olive oil', grams: 14 },
  ],
},

{
  id: 'dn_lentil_bolognese',
  name: 'Lentil bolognese',
  category: 'dinner',
  diet: 'vegetarian',
  defaultGrams: 600,
  calories: 650,
  calorieClass: 'medium',
  protein: 26,
  carbs: 92,
  fats: 14,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['vegan'],
  ingredients: [
    { name: 'lentils', grams: 200 },
    { name: 'tomato sauce', grams: 200 },
    { name: 'pasta', grams: 120 },
  ],
},

{
  id: 'sn_protein_bar',
  name: 'Protein bar',
  category: 'snack',
  diet: 'high-protein',
  defaultGrams: 70,
  calories: 240,
  calorieClass: 'medium',
  protein: 20,
  carbs: 24,
  fats: 8,
  proteinClass: 'lean',
  costEfficiency: 'medium',
  tags: ['on-the-go'],
  ingredients: [
    { name: 'protein bar', grams: 70 },
  ],
},

{
  id: 'sn_mixed_nuts',
  name: 'Mixed nuts',
  category: 'snack',
  diet: 'vegan',
  defaultGrams: 50,
  calories: 290,
  calorieClass: 'high',
  protein: 10,
  carbs: 12,
  fats: 24,
  proteinClass: 'plant',
  costEfficiency: 'medium',
  tags: ['energy'],
  ingredients: [
    { name: 'mixed nuts', grams: 50 },
  ],
},

{
  id: 'sn_dark_chocolate',
  name: 'Dark chocolate',
  category: 'snack',
  diet: 'omnivore',
  defaultGrams: 40,
  calories: 220,
  calorieClass: 'medium',
  protein: 4,
  carbs: 18,
  fats: 16,
  proteinClass: 'plant',
  costEfficiency: 'low',
  tags: ['treat'],
  ingredients: [
    { name: 'dark chocolate', grams: 40 },
  ],
},

{
  id: 'sn_cottage_cheese_plain',
  name: 'Plain cottage cheese',
  category: 'snack',
  diet: 'high-protein',
  defaultGrams: 180,
  calories: 160,
  calorieClass: 'low',
  protein: 20,
  carbs: 6,
  fats: 4,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['high-protein'],
  ingredients: [
    { name: 'cottage cheese', grams: 180 },
  ],
},

{
  id: 'sn_apple_almonds',
  name: 'Apple & Almonds',
  category: 'snack',
  diet: 'vegan',
  calorieClass: 'low',
  defaultGrams: 180,
  calories: 240,
  protein: 6,
  carbs: 28,
  fats: 14,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['quick'],
  ingredients: [
    { name: 'apple', grams: 140 },
    { name: 'almonds', grams: 40 }
  ]
},

{
  id: 'sn_greek_yogurt_honey',
  name: 'Greek Yogurt & Honey',
  category: 'snack',
  diet: 'vegetarian',
  calorieClass: 'low',
  defaultGrams: 200,
  calories: 220,
  protein: 16,
  carbs: 24,
  fats: 6,
  proteinClass: 'moderate',
  costEfficiency: 'high',
  tags: ['protein'],
  ingredients: [
    { name: 'greek yogurt', grams: 180 },
    { name: 'honey', grams: 20 }
  ]
},

{
  id: 'sn_boiled_eggs_v2',
  name: 'Boiled Eggs',
  category: 'snack',
  diet: 'vegetarian',
  calorieClass: 'low',
  defaultGrams: 160,
  calories: 240,
  protein: 18,
  carbs: 2,
  fats: 18,
  proteinClass: 'high-fat',
  costEfficiency: 'high',
  tags: ['keto'],
  ingredients: [
    { name: 'eggs', grams: 160 }
  ]
},

{
  id: 'sn_tuna_can',
  name: 'Tuna Can',
  category: 'snack',
  diet: 'pescatarian',
  calorieClass: 'low',
  defaultGrams: 160,
  calories: 200,
  protein: 32,
  carbs: 0,
  fats: 4,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['high-protein'],
  ingredients: [
    { name: 'tuna', grams: 160 }
  ]
},

{
  id: 'sn_avocado_olive_oil',
  name: 'Avocado with Olive Oil',
  category: 'snack',
  diet: 'keto',
  calorieClass: 'medium',
  defaultGrams: 200,
  calories: 320,
  protein: 4,
  carbs: 12,
  fats: 28,
  proteinClass: 'high-fat',
  costEfficiency: 'medium',
  tags: ['keto'],
  ingredients: [
    { name: 'avocado', grams: 180 },
    { name: 'olive oil', grams: 10 }
  ]
},

{
  id: 'sn_peanut_butter_toast',
  name: 'Peanut Butter Toast',
  category: 'snack',
  diet: 'vegetarian',
  calorieClass: 'medium',
  defaultGrams: 160,
  calories: 360,
  protein: 12,
  carbs: 32,
  fats: 20,
  proteinClass: 'moderate',
  costEfficiency: 'high',
  tags: ['energy'],
  ingredients: [
    { name: 'bread', grams: 80 },
    { name: 'peanut butter', grams: 40 }
  ]
},

{
  id: 'sn_cheese_crackers_v2',
  name: 'Cheese & Crackers',
  category: 'snack',
  diet: 'vegetarian',
  calorieClass: 'medium',
  defaultGrams: 180,
  calories: 380,
  protein: 14,
  carbs: 28,
  fats: 26,
  proteinClass: 'high-fat',
  costEfficiency: 'medium',
  tags: ['comfort'],
  ingredients: [
    { name: 'cheese', grams: 80 },
    { name: 'crackers', grams: 100 }
  ]
},

{
  id: 'sn_banana_yogurt',
  name: 'Banana & Yogurt',
  category: 'snack',
  diet: 'vegetarian',
  calorieClass: 'low',
  defaultGrams: 220,
  calories: 240,
  protein: 10,
  carbs: 36,
  fats: 6,
  proteinClass: 'moderate',
  costEfficiency: 'high',
  tags: ['quick'],
  ingredients: [
    { name: 'banana', grams: 140 },
    { name: 'yogurt', grams: 80 }
  ]
},

{
  id: 'sn_protein_shake_v2',
  name: 'Protein Shake',
  category: 'snack',
  diet: 'high-protein',
  calorieClass: 'low',
  defaultGrams: 300,
  calories: 220,
  protein: 30,
  carbs: 10,
  fats: 4,
  proteinClass: 'lean',
  costEfficiency: 'high',
  tags: ['gym'],
  ingredients: [
    { name: 'protein powder', grams: 40 },
    { name: 'water', grams: 260 }
  ]
},

{
  id: 'sn_fruit_salad',
  name: 'Fruit Salad',
  category: 'snack',
  diet: 'vegan',
  calorieClass: 'low',
  defaultGrams: 240,
  calories: 220,
  protein: 4,
  carbs: 50,
  fats: 2,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['fresh'],
  ingredients: [
    { name: 'mixed fruit', grams: 240 }
  ]
},

{
  id: 'sn_carrot_hummus',
  name: 'Carrot & Hummus Cups',
  category: 'snack',
  diet: 'vegan',
  calorieClass: 'low',
  defaultGrams: 200,
  calories: 240,
  protein: 8,
  carbs: 28,
  fats: 12,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['plant-based'],
  ingredients: [
    { name: 'carrots', grams: 120 },
    { name: 'hummus', grams: 80 }
  ]
},

{
  id: 'sn_olives_feta',
  name: 'Olives & Feta',
  category: 'snack',
  diet: 'mediterranean',
  calorieClass: 'medium',
  defaultGrams: 180,
  calories: 340,
  protein: 10,
  carbs: 8,
  fats: 30,
  proteinClass: 'high-fat',
  costEfficiency: 'medium',
  tags: ['mediterranean'],
  ingredients: [
    { name: 'olives', grams: 120 },
    { name: 'feta', grams: 60 }
  ]
},


{
  id: 'sn_rice_cakes_peanut',
  name: 'Rice cakes with peanut butter',
  category: 'snack',
  diet: 'vegetarian',
  defaultGrams: 120,
  calories: 260,
  calorieClass: 'medium',
  protein: 8,
  carbs: 32,
  fats: 12,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['budget'],
  ingredients: [
    { name: 'rice cakes', grams: 40 },
    { name: 'peanut butter', grams: 20 },
  ],
},

{
  id: 'sn_fruit_salad_v2',
  name: 'Fruit salad',
  category: 'snack',
  diet: 'vegan',
  defaultGrams: 260,
  calories: 180,
  calorieClass: 'low',
  protein: 3,
  carbs: 42,
  fats: 1,
  proteinClass: 'plant',
  costEfficiency: 'high',
  tags: ['light'],
  ingredients: [
    { name: 'mixed fruit', grams: 260 },
  ],
},

];

export function strictDietFilter(
  templates: MealTemplate[],
  userDiet?: Diet,
): MealTemplate[] {
  if (!userDiet) return templates;

  return templates.filter(t => {
    // 🔒 HARD RULES
    if (userDiet === 'vegan') {
      return t.diet === 'vegan';
    }

    if (userDiet === 'vegetarian') {
      return t.diet === 'vegetarian' || t.diet === 'vegan';
    }

    if (userDiet === 'pescatarian') {
      return (
        t.diet === 'pescatarian' ||
        t.diet === 'vegetarian' ||
        t.diet === 'vegan'
      );
    }

    // Keto, low-carb, high-protein, omnivore → exact match
    return t.diet === userDiet;
  });
}


