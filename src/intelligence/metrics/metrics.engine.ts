// src/intelligence/metrics/metrics.engine.ts

/**
 * CORE METRICS ENGINE
 * -------------------
 * Deterministic, non-AI, single source of truth.
 * - No DB
 * - No HTTP
 * - No side effects
 * - Same input => same output
 *
 * AI is NOT allowed here.
 */

export type Gender = 'male' | 'female';
export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export type Goal = 'lose' | 'maintain' | 'gain';

export type BodyType = 'slim' | 'average' | 'athletic' | 'heavy';

export type Diet =
  | 'none'
  | 'vegetarian'
  | 'vegan'
  | 'keto'
  | 'paleo'
  | 'high_protein';

export type Currency = 'EUR' | 'USD' | 'GBP' | 'AUD' | 'CAD';

export interface MetricsInput {
  // Body
  heightCm: number;
  weightKg: number;
  age: number;
  gender: Gender;

  // Lifestyle
  activityLevel: ActivityLevel;
  trainsRegularly: boolean;
  bodyType: BodyType;

  // Goal
  goal: Goal;

  // Constraints
  diet: Diet;
  allergies: string[];

  // Budget
  weeklyBudget: number;
  currency: Currency;
}

export type RiskFlag =
  | 'AGGRESSIVE_DEFICIT'
  | 'LOW_BUDGET'
  | 'HIGH_TRAINING_STRESS'
  | 'LOW_PROTEIN_RISK';

export interface MetricsOutput {
  // Core truth
  bmr: number; // kcal/day
  tdee: number; // kcal/day

  // Targets
  dailyCaloriesTarget: number; // kcal/day
  dailyProteinTarget: number; // grams/day

  // Weekly
  weeklyCaloriesTarget: number; // kcal/week
  weeklyBudget: number;

  // Derived hints (NON-AI)
  mealCountHint: 3 | 4 | 5;
  riskFlags: RiskFlag[];
}

/**
 * MAIN ENTRY POINT
 * ----------------
 * Deterministic metrics computation.
 * AI must NEVER modify these results.
 */
export function computeMetrics(input: MetricsInput): MetricsOutput {
  const { heightCm, weightKg, age, gender } = input;

  // --- BMR (Mifflin–St Jeor) ---
  const bmr =
    gender === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

    // --- Activity multiplier ---
  const activityMultiplierMap: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee =
    Math.round(bmr * activityMultiplierMap[input.activityLevel]);

    // --- Calorie target based on goal ---
  let dailyCaloriesTarget: number;

  switch (input.goal) {
    case 'lose':
      dailyCaloriesTarget = Math.round(tdee * 0.8); // ~20% deficit
      break;

    case 'gain':
      dailyCaloriesTarget = Math.round(tdee * 1.1); // ~10% surplus
      break;

    case 'maintain':
    default:
      dailyCaloriesTarget = tdee;
      break;
  }

    // --- Protein target (grams/day) ---
  let proteinFactor: number;

  if (input.trainsRegularly) {
    proteinFactor = input.goal === 'lose' ? 2.2 : 2.0;
  } else {
    proteinFactor = input.goal === 'lose' ? 1.8 : 1.6;
  }

  const dailyProteinTarget = Math.round(
    input.weightKg * proteinFactor
  );

    // --- Weekly calories ---
  const weeklyCaloriesTarget = dailyCaloriesTarget * 7;

  const weeklyBudget = input.weeklyBudget;
    // --- Meal count hint (structural, non-AI) ---
  let mealCountHint: 3 | 4 | 5 = 3;

  if (input.trainsRegularly || input.activityLevel === 'very_active') {
    mealCountHint = 4;
  }

  if (input.goal === 'gain') {
    mealCountHint = 5;
  }

    // --- Risk flags (factual, non-AI) ---
  const riskFlags: RiskFlag[] = [];

  // Aggressive deficit warning
  if (input.goal === 'lose' && dailyCaloriesTarget < tdee * 0.75) {
    riskFlags.push('AGGRESSIVE_DEFICIT');
  }

  // Low budget warning (very rough heuristic for now)
  if (input.weeklyBudget < 40) {
    riskFlags.push('LOW_BUDGET');
  }

  // High training stress
  if (input.trainsRegularly && input.activityLevel === 'very_active') {
    riskFlags.push('HIGH_TRAINING_STRESS');
  }


  return {
    bmr: Math.round(bmr),
    tdee,
    dailyCaloriesTarget,
    dailyProteinTarget,
    weeklyCaloriesTarget,
    weeklyBudget,
    mealCountHint,
    riskFlags,
  };
}

