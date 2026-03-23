import { EconomicProof } from './economic-proof.contract';
import {
  SubstitutionCostDeltaResult,
} from './substitution-cost-delta';

export interface EconomicImpactSummary {
  proof: EconomicProof;
  substitutions: SubstitutionCostDeltaResult;
  netSavings: number;
  explanation: string;
}

export function assembleEconomicImpactSummary(params: {
  proof: EconomicProof;
  substitutions: SubstitutionCostDeltaResult;
}): EconomicImpactSummary {
  const { proof, substitutions } = params;

  const netSavings =
    Math.round(
      (proof.delta.savingsAmount + substitutions.totalDelta) * 100,
    ) / 100;

  const explanation =
    netSavings > 0
      ? `Weekly plan reduced total cost by €${netSavings}.`
      : netSavings < 0
      ? `Weekly plan increased total cost by €${Math.abs(netSavings)}.`
      : 'Weekly plan had no net cost impact.';

  return {
    proof,
    substitutions,
    netSavings,
    explanation,
  };
}
