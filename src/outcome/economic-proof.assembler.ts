import { EconomicProof } from './economic-proof.contract';
import {
  BaselineCostResult,
} from './baseline-cost.estimator';
import {
  OptimizedCostResult,
} from './optimized-cost.estimator';

export function assembleEconomicProof(
  baseline: BaselineCostResult,
  optimized: OptimizedCostResult,
): EconomicProof {
  const savingsAmount =
    Math.round((baseline.estimatedWeeklyCost - optimized.estimatedWeeklyCost) * 100) / 100;

  const savingsPercentage =
    baseline.estimatedWeeklyCost > 0
      ? Math.round((savingsAmount / baseline.estimatedWeeklyCost) * 10000) / 100
      : 0;

  return {
    baseline: {
      estimatedWeeklyCost: baseline.estimatedWeeklyCost,
      explanation: baseline.explanation,
    },

    optimized: {
      estimatedWeeklyCost: optimized.estimatedWeeklyCost,
      explanation: optimized.explanation,
    },

    delta: {
      savingsAmount,
      savingsPercentage,
      explanation:
        savingsAmount > 0
          ? `Optimizations reduced weekly cost by €${savingsAmount} (${savingsPercentage}%).`
          : 'No cost savings were achieved compared to baseline.',
    },
  };
}
