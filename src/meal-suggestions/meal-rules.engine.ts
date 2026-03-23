import { Injectable } from '@nestjs/common';
import {
  MEAL_TEMPLATES,
  MealTemplate,
  MealCategory,
  strictDietFilter,
} from './meal-templates.table';

import { applyRotationV1 } from './rotation/meal-rotation.engine';
import { applyBudgetV1 } from './budget/meal-budget.engine';
import { explainMealSelectionV1 } from './ai/meal-ai-explain.engine';



export interface DailyMacrosTarget {
  protein: number;
  carbs: number;
  fats: number;
}

export interface DailyMealItem {
  templateId: string;
  name: string;
  category: MealCategory;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface DailyMealPlan {
  date: string;
  totalCaloriesTarget: number;
  totalCaloriesPlanned: number;
  macrosTarget: DailyMacrosTarget;
  macrosPlanned: DailyMacrosTarget;
  meals: DailyMealItem[];
  fallbackFlags?: {
    category: MealCategory;
    reason: string;
  }[];
    explanation?: any;

}


/**
 * Pure rule engine.
 * No AI. No DB. No HTTP.
 * It just uses MEAL_TEMPLATES and math.
 */
@Injectable()
export class MealRulesEngine {
  

  /**
   * v1 logic:
   * - 3 meals + 1 snack
   * - 30% breakfast, 35% lunch, 25% dinner, 10% snack
   * - Choose cost-efficient templates by category
   */
  buildDailyPlan(input: {
    date: string;
    caloriesTarget: number;
    macrosTarget: DailyMacrosTarget;
    avoidTemplateIds?: string[];
    usedLunchTemplateIds?: Record<string, number>;
    preferences?: string | null;
    allergies?: string[];
    rotationIndex?: number;
    weeklyBudget?: number;


  }): DailyMealPlan {
    const { date, caloriesTarget, macrosTarget, avoidTemplateIds } = input;
    const rotationIndex = input.rotationIndex ?? 0;



    const mealSplits = {
      breakfast: 0.3,
      lunch: 0.35,
      dinner: 0.25,
      snack: 0.1,
    };

    const chosen: DailyMealItem[] = [];
    let estimatedWeeklyCost: number | undefined;
    let budgetDelta: number | undefined;


    const fallbackFlags: {
  category: MealCategory;
  reason: string;
}[] = [];

    

    const pickTemplate = (
  category: MealCategory,
  preferences?: string | null,
  inputAllergies?: string[],
): MealTemplate => {


    const rawCandidates = MEAL_TEMPLATES.filter(
    (t) => t.category === category,
  );

  // 🔒 HARD diet filter (never return non-diet meals)
  const dietCandidates = preferences
    ? strictDietFilter(rawCandidates, preferences as any)
    : rawCandidates;

  // If user asked for a diet and we have zero templates for it → hard fail (truth)
  if (preferences && dietCandidates.length === 0) {
    throw new Error(
      `No templates available for diet "${preferences}" in category "${category}". Add templates or loosen diet.`
    );
  }

  const candidates = dietCandidates;

  const rotationResult = applyRotationV1({
  candidates,
  lastWeekMealIds: avoidTemplateIds,
});

const rotatedCandidates = rotationResult.rotated;

const budgetResult = applyBudgetV1({
  candidates: rotatedCandidates,
  weeklyBudget: input.weeklyBudget,

});

const budgetedCandidates = budgetResult.budgeted;

estimatedWeeklyCost = budgetResult.estimatedWeeklyCost;
budgetDelta = budgetResult.budgetDelta;



if (rotationResult.removedCount > 0) {
  console.log(
    `[Rotation] ${category}: removed ${rotationResult.removedCount} templates`
  );
}


  
  let filtered = budgetedCandidates;

  const preferenceScores = new Map<string, number>();
  for (const t of candidates) {
  preferenceScores.set(t.id, 0);
}

// 🟡 Soft weekly lunch rotation penalty
if (category === 'lunch' && input.usedLunchTemplateIds) {
  for (const [id, count] of Object.entries(input.usedLunchTemplateIds)) {
    if (preferenceScores.has(id)) {
      preferenceScores.set(
        id,
        (preferenceScores.get(id) ?? 0) - count * 3,
      );
    }
  }
}

// 🔒 HARD 1-DAY ROTATION (category-level)
if (category === 'lunch' && avoidTemplateIds && avoidTemplateIds.length) {
  const withoutYesterday = filtered.filter(
    (t) => !avoidTemplateIds.includes(t.id),
  );

  // only enforce if we still have options
  if (withoutYesterday.length > 0) {
    filtered = withoutYesterday;
  }
}


  // 🚫 Allergy exclusion (ingredient-level)
if (inputAllergies && inputAllergies.length) {
  const allergies = inputAllergies.map((a) => a.trim().toLowerCase());

  const allergyFiltered = filtered.filter((t) =>
    !t.ingredients?.some((ing) =>
      allergies.includes(ing.name.toLowerCase()),
    ),
  );

  // ✅ HARD FAIL on allergies
if (!allergyFiltered.length) {
  throw new Error(
    `No safe meals available for category "${category}" given allergies: ${inputAllergies.join(', ')}`
  );
}

filtered = allergyFiltered;

}

if (preferences) {
  const prefs = preferences.split(',').map((p) => p.trim().toLowerCase());

  filtered = filtered.filter((t) =>
    prefs.every((p) => t.tags.map((x) => x.toLowerCase()).includes(p)),
  );
}

// fallback if filtering removed everything
if (!filtered.length) {
  filtered = candidates;
}

  if (!candidates.length) return MEAL_TEMPLATES[0];

  

  let pool = filtered.length ? filtered : candidates;

// 🔁 HARD exclude yesterday's template if alternatives exist
if (avoidTemplateIds && avoidTemplateIds.length && pool.length > 1) {
  pool = pool.filter((t) => !avoidTemplateIds.includes(t.id));
}

  


  // Prefer cost-efficient meals, but allow variation
  const sorted = [...pool].sort((a, b) => {
  const scoreA = preferenceScores.get(a.id) ?? 0;
  const scoreB = preferenceScores.get(b.id) ?? 0;

  if (scoreA !== scoreB) {
    return scoreB - scoreA; // higher score first
  }

  // fallback: cost efficiency
  const rank = (c: MealTemplate['costEfficiency']) =>
    c === 'high' ? 3 : c === 'medium' ? 2 : 1;

  return rank(b.costEfficiency) - rank(a.costEfficiency);
});


  // 🔁 REAL regeneration: rotate pool based on rotationIndex
if (sorted.length === 0) return candidates[0];

const rotatedIndex =
  Math.abs(rotationIndex + Math.floor(Math.random() * sorted.length)) %
  sorted.length;

return sorted[rotatedIndex];


};


    const addMeal = (category: MealCategory, share: number) => {
      const mealCaloriesTarget = caloriesTarget * share;
      const template = pickTemplate(category, input.preferences, input.allergies);
      

      if (!template) {
  fallbackFlags.push({
    category,
    reason: 'NO_TEMPLATE_AVAILABLE',
  });
  return;
}






      // scale grams linearly based on calories ratio
      const ratio = mealCaloriesTarget / template.calories;
      const grams = Math.round(template.defaultGrams * ratio);

      const calories = Math.round(template.calories * ratio);
      const protein = Math.round(template.protein * ratio);
      const carbs = Math.round(template.carbs * ratio);
      const fats = Math.round(template.fats * ratio);

      chosen.push({
        templateId: template.id,
        name: template.name,
        category: template.category,
        grams,
        calories,
        protein,
        carbs,
        fats,
      });
    };

    addMeal('breakfast', mealSplits.breakfast);
    addMeal('lunch', mealSplits.lunch);
    addMeal('dinner', mealSplits.dinner);
    addMeal('snack', mealSplits.snack);

    const totalCaloriesPlanned = chosen.reduce(
      (sum, m) => sum + m.calories,
      0,
    );

    const macrosPlanned: DailyMacrosTarget = chosen.reduce(
      (acc, m) => ({
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fats: acc.fats + m.fats,
      }),
      { protein: 0, carbs: 0, fats: 0 },
    );

  const aiExplanation = explainMealSelectionV1({
  selectedMeals: chosen.map((m) => {
    return MEAL_TEMPLATES.find((t) => t.id === m.templateId)!;
  }),
  context: {
    calorieTarget: caloriesTarget,
    weeklyBudget: input.weeklyBudget,
    diet: input.preferences ?? null,
    rotationApplied: true,

    // NEW (Budget v2)
    estimatedWeeklyCost,
    budgetDelta,

  },
});


return {
  date,
  totalCaloriesTarget: Math.round(caloriesTarget),
  totalCaloriesPlanned,
  macrosTarget,
  macrosPlanned,
  meals: chosen,
  fallbackFlags,
  explanation: aiExplanation,
};


  }
}
