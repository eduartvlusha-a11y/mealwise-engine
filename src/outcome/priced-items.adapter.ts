import { GroceryPriceResult } from '../grocery/pricing/grocery-pricing.service';

export interface PricedCostItem {
  name: string;
  estimatedUnitCost: number;
  quantity: number;
}

export function adaptPricedItemsForCost(
  pricingResult: GroceryPriceResult,
): PricedCostItem[] {
  return pricingResult.items.map((item) => {
    let quantity = 0;

    // 🔒 Normalize quantities for cost estimators
    if (item.unit === 'g' || item.unit === 'gram' || item.unit === 'grams') {
      quantity = item.grams / 1000; // grams → kg
    } else if (item.unit === 'kg') {
      quantity = item.grams; // already kg
    } else if (item.unit === 'pcs') {
      quantity = item.grams; // pcs stay pcs
    } else {
      quantity = item.grams; // fallback (safe)
    }

    return {
      name: item.name,
      estimatedUnitCost: item.pricePerUnit,
      quantity,
    };
  });
}
