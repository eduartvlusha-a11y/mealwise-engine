// src/intelligence/decision/decision.engine.ts

import { MetricsOutput, MetricsInput } from '../metrics/metrics.engine';


export type MealStructure = 3 | 4 | 5;

export interface DecisionStrategy {
  mealStructure: MealStructure;
  macroEmphasis: 'protein' | 'volume' | 'balanced';
  foodStrategy: 'budget_simple' | 'balanced_variety' | 'performance';
  conflicts: string[];
  reasoning: string[];
  macroFocus: string;
}

/**
 * RULE-BASED DECISION ENGINE
 * -------------------------
 * Deterministic, explainable, safe.
 * AI will enhance this later — NOT replace it.
 */
export function decideStrategy(
  profile: MetricsInput,
  metrics: MetricsOutput
): DecisionStrategy {

  const reasoning: string[] = [];
  const conflicts: string[] = [];

  // ----------------------------------
  // 1️⃣ MEAL STRUCTURE
  // ----------------------------------
  let mealStructure: MealStructure = 3;

  if (profile.trainsRegularly || profile.activityLevel === 'very_active') {

    mealStructure = 4;
    reasoning.push(
      'You train regularly, so meals are spread to support recovery.'
    );
  }

  if (profile.goal === 'lose' && profile.bodyType === 'heavy') {

    mealStructure = 4;
    reasoning.push(
      'Higher meal frequency helps manage hunger during fat loss.'
    );
  }

  // ----------------------------------
  // 2️⃣ MACRO EMPHASIS
  // ----------------------------------
  let macroEmphasis: 'protein' | 'volume' | 'balanced' = 'balanced';



  // ----------------------------------



  if (profile.goal === 'lose') {

    macroEmphasis = 'protein';
    reasoning.push(
      'Protein is prioritized to preserve muscle during fat loss.'
    );
  }

  if (profile.bodyType === 'slim' && profile.goal === 'gain') {

    macroEmphasis = 'balanced';
    reasoning.push(
      'Balanced macros support gradual weight gain.'
    );
  }

  // ----------------------------------
  // 3️⃣ FOOD STRATEGY
  // ----------------------------------
  // ----------------------------------
// MACRO FOCUS (USER-FACING)
// ----------------------------------
let macroFocus = 'balanced nutrition';

if (macroEmphasis === 'protein') {
  macroFocus = 'higher protein intake';
}


  let foodStrategy: DecisionStrategy['foodStrategy'] = 'balanced_variety';

  if (metrics.riskFlags.includes('LOW_BUDGET')) {
    foodStrategy = 'budget_simple';
    conflicts.push(
      'Your budget is tight for diverse meals.'
    );
    reasoning.push(
      'Simpler, repetitive foods are chosen to stay within budget.'
    );
  }

  if (profile.trainsRegularly && !metrics.riskFlags.includes('LOW_BUDGET')) {

    foodStrategy = 'performance';
    reasoning.push(
      'Food choices support training performance and recovery.'
    );
  }

  // ----------------------------------
  // 4️⃣ RISK FLAGS → USER CONFLICTS
  // ----------------------------------
  if (metrics.riskFlags.includes('AGGRESSIVE_DEFICIT')) {
    conflicts.push(
      'Your calorie target is aggressive relative to your activity level.'
    );
  }

  // ----------------------------------
  // 5️⃣ FINAL SUMMARY
  // ----------------------------------
  reasoning.unshift(
    'Strategy is based on your body data, goal, activity, and budget.'
  );

  return {
    mealStructure,
    macroEmphasis,
    macroFocus,
    foodStrategy,
    conflicts,
    reasoning,
  };
}
 export function buildReasoning(input: {
  metrics: {
    goal: string;
    bodyType: string;
    trainsRegularly: boolean;
    weeklyBudget: number;
    riskFlags: string[];
  };
  strategy: {
    mealStructure: string;
    macroFocus: string;
    foodStrategy: string;
  };
}): string[] {
  const reasons: string[] = [];

  // Goal-based
  if (input.metrics.goal === 'lose') {
    reasons.push(
      'Your plan is optimized for fat loss while preserving muscle.',
    );
  }

  if (input.metrics.goal === 'gain') {
    reasons.push(
      'Your plan prioritizes consistent energy surplus for muscle gain.',
    );
  }

  // Training signal
  if (input.metrics.trainsRegularly) {
    reasons.push(
      'Because you train regularly, protein intake is prioritized.',
    );
  }

  // Body type
  if (input.metrics.bodyType === 'heavy') {
    reasons.push(
      'Meals are volume-focused to help manage hunger.',
    );
  }

  // Budget pressure
  if (input.metrics.riskFlags.includes('LOW_BUDGET')) {
    reasons.push(
      'Your budget is tight, so meals favor repetition and cost efficiency.',
    );
  }

  // Strategy explanation
  reasons.push(
    `Meal structure chosen: ${input.strategy.mealStructure.replace('_', ' ')}.`,
  );
  reasons.push(
    `Macro focus: ${input.strategy.macroFocus}.`,
  );
  reasons.push(
    `Food strategy: ${input.strategy.foodStrategy}.`,
  );

  return reasons;
}
