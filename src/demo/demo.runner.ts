import {
  BASELINE_PRICING,
  OPTIMIZED_PRICING,
  SUBSTITUTIONS,
  EMPTY_HISTORY,
  DEMO_USER_ID,
} from './demo-input.fixture';

import { buildEconomicProofFromPricing } from '../outcome/pricing-cost.pipeline';
import { computeSubstitutionCostDeltas } from '../outcome/substitution-cost-delta';
import { assembleEconomicImpactSummary } from '../outcome/economic-impact.summary';
import { buildWeeklyOutcomeSummary } from '../outcome/weekly-outcome.builder';
import { appendWeeklyOutcome } from '../outcome/outcome-history.assembler';



function runDemo() {
  // 1️⃣ Economic proof from real pricing
  const proof = buildEconomicProofFromPricing(
    BASELINE_PRICING,
    OPTIMIZED_PRICING,
  );

  // 2️⃣ € deltas per substitution
  const substitutionDeltas = computeSubstitutionCostDeltas({
    baselinePricing: BASELINE_PRICING,
    optimizedPricing: OPTIMIZED_PRICING,
    substitutions: SUBSTITUTIONS,
  });

  // 3️⃣ Combine into one economic impact
  const economicImpact = assembleEconomicImpactSummary({
    proof,
    substitutions: substitutionDeltas,
  });

  // 4️⃣ Build weekly outcome (numeric, not economic object)
  const weeklyOutcome = buildWeeklyOutcomeSummary({
    weekStart: '2025-01-01',
    weekEnd: '2025-01-07',
    weeklyBudget: 50,
    estimatedCost: OPTIMIZED_PRICING.totalCost,
    plannedMeals: 21,
    followedMeals: 21,
    substitutionReasons: SUBSTITUTIONS.map((s) => s.explanation),
  });

  // 5️⃣ Append to history + compute trend
  const { history, trend } = appendWeeklyOutcome(EMPTY_HISTORY, {
    userId: DEMO_USER_ID,
    weekStart: '2025-01-01',
    weekEnd: '2025-01-07',
    outcome: weeklyOutcome,
    economic: economicImpact,
    createdAt: new Date().toISOString(),
  });

  // 6️⃣ Print proof
  console.log('=== MEALWISE DEMO RESULT ===');
  console.log(
    JSON.stringify(
      { weeklyOutcome, economicImpact, history, trend },
      null,
      2,
    ),
  );
}

runDemo();
