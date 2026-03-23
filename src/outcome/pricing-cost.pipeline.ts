import { GroceryPriceResult } from '../grocery/pricing/grocery-pricing.service';
import {
  estimateBaselineWeeklyCost,
} from './baseline-cost.estimator';
import {
  estimateOptimizedWeeklyCost,
} from './optimized-cost.estimator';
import {
  adaptPricedItemsForCost,
} from './priced-items.adapter';
import { EconomicProof } from './economic-proof.contract';
import {
  assembleEconomicProof,
} from './economic-proof.assembler';

export function buildEconomicProofFromPricing(
  baselinePricing: GroceryPriceResult,
  optimizedPricing: GroceryPriceResult,
): EconomicProof {
  const baselineItems = adaptPricedItemsForCost(baselinePricing);
  const optimizedItems = adaptPricedItemsForCost(optimizedPricing);

  const baselineCost = estimateBaselineWeeklyCost({
    groceryItems: baselineItems,
  });

  const optimizedCost = estimateOptimizedWeeklyCost({
    groceryItems: optimizedItems,
  });

  return assembleEconomicProof(baselineCost, optimizedCost);
}
