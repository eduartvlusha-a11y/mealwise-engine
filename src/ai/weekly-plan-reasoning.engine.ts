// src/ai/weekly-plan-reasoning.engine.ts
// 🔒 Explain-only AI layer (OpenAI)
// - Uses ONLY frozen deterministic snapshot input
// - Produces reasoning text (no decisions, no numbers invented)

import { AiClient } from './ai.client';

export type WeeklyPlanReasoningSnapshot = {
  tdee: number;
  calorieTarget: number;
  proteinTarget: number;
  calorieDeficitPercent: number;
  weeklyBudget: number;
  plannedSpend: number;
  budgetPressureIndex: number;
  diet: string;
  ingredientReuseRate: number;
  mealCount: number;
  riskLevel: 'low' | 'medium' | 'high';
  planFrozen: true;
};

export type WeeklyPlanReasoningOutput = {
  reasoningText: string;
};

/**
 * buildWeeklyPlanReasoning()
 * Buyer-grade reasoning output.
 *
 * IMPORTANT:
 * - This function MUST NOT calculate or modify numbers.
 * - It MUST NOT suggest changing targets or auto-regeneration.
 * - It MUST NOT output medical advice.
 */
export async function buildWeeklyPlanReasoning(
  ai: AiClient,
  snapshot: WeeklyPlanReasoningSnapshot,
): Promise<WeeklyPlanReasoningOutput> {
  const system = `You are MealWise AI.

Rules (non-negotiable):
- You DO NOT calculate, modify, or invent numbers.
- All numbers provided are final and frozen.
- You DO NOT suggest changing calorie targets, macro targets, budget, or regenerating automatically.
- You DO NOT give medical advice.

Your job:
- Explain WHY the plan looks the way it does based on the snapshot.
- Explain trade-offs and constraints.
- Identify fragility/risks (adherence, budget brittleness) without proposing new numbers.
- Clarify what kinds of user changes would invalidate the plan (profile/budget/diet/constraints) and require manual regeneration.

Style:
- Direct, factual, non-motivational.
- No hype.
- No bullet spam.
- No tables.
`;

  const user = `Frozen weekly plan snapshot (JSON):\n${JSON.stringify(snapshot, null, 2)}\n\nWrite a concise explanation with these sections (use short headings):\n\n1) Why this plan was selected\n2) What was prioritized\n3) What was sacrificed\n4) Where this plan is fragile\n5) What changes invalidate this plan (manual regenerate required)\n\nConstraints:\n- Do not invent any additional facts not present in the snapshot.\n- Do not repeat numbers more than necessary.\n- Do not propose alternative plans, foods, or new targets.`;

  const text = await ai.chat([
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]);

  return {
    reasoningText: (text || '').trim(),
  };
}
