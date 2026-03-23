// Rotation Engine v1
// Deterministic, safe, no AI, no macros touched

import type { MealTemplate } from '../meal-templates.table';

export type RotationInput = {
  candidates: MealTemplate[];
  lastWeekMealIds?: string[];
};

export type RotationResult = {
  rotated: MealTemplate[];
  removedCount: number;
};

export function applyRotationV1(
  input: RotationInput
): RotationResult {
  const { candidates, lastWeekMealIds = [] } = input;

  if (!candidates || candidates.length === 0) {
    return { rotated: [], removedCount: 0 };
  }

  const lastWeek = new Set(lastWeekMealIds);

  const rotated = candidates.filter(
    (meal) => !lastWeek.has(meal.id)
  );

  return {
    rotated: rotated.length > 0 ? rotated : candidates,
    removedCount: candidates.length - rotated.length,
  };
}
