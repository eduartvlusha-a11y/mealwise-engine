import { GroceryPriceResult } from '../grocery/pricing/grocery-pricing.service';
import { SubstitutionReason } from './substitution-reason.collector';

export type SubstitutionCostDelta = {
  originalItem: string;
  substitutedItem: string;
  baselineCost: number;
  optimizedCost: number;
  delta: number; // baselineCost - optimizedCost
  explanation: string;
};

export type SubstitutionCostDeltaResult = {
  items: SubstitutionCostDelta[];
  totalDelta: number;
  currency: string;
};

function findEstimatedCost(pricing: GroceryPriceResult, name: string): number {
  const key = name.toLowerCase().trim();
  const match = pricing.items.find((i) => i.name.toLowerCase().trim() === key);
  if (!match) return 0;
  return typeof match.estimatedCost === 'number' ? match.estimatedCost : 0;
}

export function computeSubstitutionCostDeltas(params: {
  baselinePricing: GroceryPriceResult;
  optimizedPricing: GroceryPriceResult;
  substitutions: SubstitutionReason[];
}): SubstitutionCostDeltaResult {
  const { baselinePricing, optimizedPricing, substitutions } = params;

  const currency = optimizedPricing.targetCurrency || optimizedPricing.currency;

  const items: SubstitutionCostDelta[] = substitutions.map((s) => {
    const baselineCost = findEstimatedCost(baselinePricing, s.originalItem);
    const optimizedCost = findEstimatedCost(optimizedPricing, s.substitutedItem);

    const delta = Math.round((baselineCost - optimizedCost) * 100) / 100;

    const explanation =
      baselineCost === 0 && optimizedCost === 0
        ? `No pricing data found for ${s.originalItem} or ${s.substitutedItem}; delta assumed €0.`
        : delta > 0
        ? `Replacing ${s.originalItem} with ${s.substitutedItem} reduced cost by €${delta}.`
        : delta < 0
        ? `Replacing ${s.originalItem} with ${s.substitutedItem} increased cost by €${Math.abs(delta)}.`
        : `Replacing ${s.originalItem} with ${s.substitutedItem} had no cost impact.`;

    return {
      originalItem: s.originalItem,
      substitutedItem: s.substitutedItem,
      baselineCost,
      optimizedCost,
      delta,
      explanation,
    };
  });

  const totalDelta = Math.round(items.reduce((sum, i) => sum + i.delta, 0) * 100) / 100;

  return {
    items,
    totalDelta,
    currency,
  };
}
