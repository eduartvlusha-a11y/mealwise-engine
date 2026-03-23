import { Injectable } from '@nestjs/common';
import { DailyMealPlan } from '../meal-suggestions/meal-rules.engine';
import { MealTemplate, MEAL_TEMPLATES } from '../meal-suggestions/meal-templates.table';
import { IngredientTypeService } from '../common/services/ingredient-type.service';
import { IngredientDisplayService } from '../common/services/ingredient-display.service';


export interface GroceryIngredientItem {
  name: string;
  grams: number;        // always metric
  meal: string;
}

export interface ConsolidatedIngredient {
  name: string;
  ingredientType: string;
  internal: {
    grams: number;
    milliliters: number;
    count: number;
  };
}

@Injectable()
export class GroceryFromMealsEngine {
  constructor(
    private readonly ingredientTypeService: IngredientTypeService,
    private readonly ingredientDisplayService: IngredientDisplayService,
  ) {}

  // Extract ingredients from a single daily plan
  extractDaily(plan: DailyMealPlan | { meals?: any[] }) {
  const ingredients: GroceryIngredientItem[] = [];

  const meals = (plan as any)?.meals ?? [];

  for (const meal of meals) {

      const template: MealTemplate | undefined = MEAL_TEMPLATES.find(
        (t) => t.id === meal.templateId,
      );

      if (!template) continue;

      const mealGrams = Number(meal.grams) || template.defaultGrams;
const baseGrams = Number(template.defaultGrams) || 1;
const multiplier = mealGrams / baseGrams;


      for (const ing of template.ingredients) {
  const type = this.ingredientTypeService.getType(ing.name);
  console.log('[GROCERY TYPE]', ing.name, '=>', type);


  // fallback grams for count-based items (eggs, apples, etc.)
  const baseGrams =
    typeof ing.grams === 'number' && ing.grams > 0
      ? ing.grams
      : type === 'count'
        ? 60 // default per-piece weight (egg/apple baseline)
        : 0;

  ingredients.push({
    name: ing.name,
    grams: baseGrams * multiplier,
    meal: meal.category,
  });
}

    }

    const consolidated = this.consolidate(ingredients);

    return {
  date: (plan as any)?.date ?? null,
  ingredients,
  consolidated,
};

  }

  // Extract ingredients from entire week
  extractWeekly(weeklyPlan: {
    weekStart: string;
    weekEnd: string;
    days: { date: string; plan: DailyMealPlan }[];
  }) {
    const allIngredients: GroceryIngredientItem[] = [];
    

    for (const day of weeklyPlan.days) {
  const daily = this.extractDaily((day as any).plan ?? day);

      allIngredients.push(...daily.ingredients);
    }

    const consolidated = this.consolidate(allIngredients);

    return {
      weekStart: weeklyPlan.weekStart,
      weekEnd: weeklyPlan.weekEnd,
      items: consolidated,
    };
  }

  // Consolidate by ingredient
  private consolidate(items: GroceryIngredientItem[]): ConsolidatedIngredient[] {
    const map = new Map<
      string,
      { grams: number; milliliters: number; count: number; ingredientType: string }
    >();

    for (const item of items) {
      const type = this.ingredientTypeService.getType(item.name);
      const key = item.name.toLowerCase().trim();

      if (!map.has(key)) {
  map.set(key, {
    grams: type === 'liquid' ? 0 : item.grams,

    milliliters: type === 'liquid' ? item.grams : 0,
    count: type === 'count' ? Math.round(item.grams / 60) : 0, // 1 egg ≈ 60g
    ingredientType: type,
  });
}

 else {
        const existing = map.get(key)!;
        if (type === 'liquid') {
  existing.milliliters += item.grams;
} else if (type === 'count') {
  existing.count += Math.round(item.grams / 60);
} else {
  existing.grams += item.grams;
}



      }
    }

    return Array.from(map.entries()).map(([name, value]) => {
      const lower = name.toLowerCase();

// Average grams per piece (deterministic, no AI)
const AVG_PIECE_GRAMS: Record<string, number> = {
  egg: 60,
  eggs: 60,
  banana: 120,
  apple: 180,
  tomato: 100,
};

const avgPiece = Object.entries(AVG_PIECE_GRAMS).find(
  ([key]) => lower.includes(key),
)?.[1];

const count =
  value.ingredientType === 'count' && avgPiece
    ? Math.round(value.grams / avgPiece)
    : 0;

const grams = Math.round(value.grams);


  const ingredient = {
    name,
    ingredientType: value.ingredientType,
    internal: {
  grams,
  milliliters: Math.round(value.milliliters),
  count,
},

  };

  return {
    ...ingredient,
    display: this.ingredientDisplayService.toDisplay(ingredient),
  };
});

  }
}
