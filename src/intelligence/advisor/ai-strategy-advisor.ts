// src/intelligence/advisor/ai-strategy-advisor.ts

import { AiClient } from '../../ai/ai.client';

export type AIStrategyAdvisorInput = {
  // deterministic truth
  goal?: string | null;

  dailyCaloriesTarget?: number | null;
  dailyProteinTarget?: number | null;
  weeklyCaloriesTarget?: number | null;

  // chosen strategy (deterministic)
  mealCountHint?: number | null; // meals/day
  macroFocus?: string | null;
  foodStrategy?: string | null;

  // constraints
  weeklyBudget?: number | null;
  currency?: string | null;
  dietType?: string | null;
  allergies?: string[] | null;

  // feasibility signals
  estimatedWeeklyCost?: number | null;
  substitutionsCount?: number | null;
  riskFlags?: string[] | null;
  conflicts?: string[] | null;
};

export type AIStrategyAdvisorOutput = {
  summary: string;
};

function safe(v: any): string {
  if (v === null || v === undefined) return '—';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
  return String(v);
}

/**
 * IMPORTANT RULES:
 * - Explain-only. No decisions.
 * - No number invention.
 * - No changing targets or meals.
 * - Use deterministic facts provided.
 */
export async function buildAIStrategyAdvisor(
  ai: AiClient,
  input: AIStrategyAdvisorInput,
): Promise<AIStrategyAdvisorOutput> {
  const prompt = `
You are an AI Strategy Advisor for a nutrition execution system.

STRICT RULES:
- You MUST NOT invent numbers.
- You MUST NOT suggest changing targets.
- You MUST NOT pick meals or groceries.
- You ONLY explain what will happen and why, based on provided facts.
- Keep it concise, factual, and non-motivational.

FACTS (deterministic, do not alter):
Goal: ${safe(input.goal)}
Daily Calories Target: ${safe(input.dailyCaloriesTarget)} kcal
Daily Protein Target: ${safe(input.dailyProteinTarget)} g
Weekly Calories Target: ${safe(input.weeklyCaloriesTarget)} kcal
Meal Structure: ${safe(input.mealCountHint)} meals/day
Macro Focus: ${safe(input.macroFocus)}
Food Strategy: ${safe(input.foodStrategy)}

Constraints:
Weekly Budget: ${safe(input.weeklyBudget)} ${safe(input.currency)}
Diet Type: ${safe(input.dietType)}
Allergies: ${safe(input.allergies)}

Feasibility Signals:
Estimated Weekly Cost: ${safe(input.estimatedWeeklyCost)} ${safe(input.currency)}
Substitutions Applied: ${safe(input.substitutionsCount)}
Risk Flags: ${safe(input.riskFlags)}
Conflicts: ${safe(input.conflicts)}

TASK:
Write a short pre-plan explanation (3–5 sentences) that:
1) Explains what the system will prioritize.
2) Explains likely trade-offs due to constraints.
3) Sets expectations before the plan starts.

Do not mention “AI”. Do not mention internal rules. Do not use hype.
`;

  const text = await ai.chat([
    { role: 'user', content: prompt },
  ]);

  return {
    summary: (text || '').trim(),
  };
}
