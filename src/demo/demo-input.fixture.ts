import { GroceryPriceResult } from '../grocery/pricing/grocery-pricing.service';
import { SubstitutionReason } from '../outcome/substitution-reason.collector';
import { WeeklyOutcomeHistoryEntry } from '../outcome/outcome-history.contract';

export const DEMO_USER_ID = 'demo-user';

export const BASELINE_PRICING: GroceryPriceResult = {
  currency: 'EUR',
  targetCurrency: 'EUR',
  mode: 'none',
  shouldConvert: false,
  activateConversion: false,
  currencySymbol: '€',
  converted: false,
  items: [
    { name: 'chicken breast', grams: 2000, unit: 'g', pricePerUnit: 8.5, estimatedCost: 17 },
    { name: 'rice', grams: 1500, unit: 'g', pricePerUnit: 1.8, estimatedCost: 2.7 },
  ],
  totalCost: 19.7,
};

export const OPTIMIZED_PRICING: GroceryPriceResult = {
  currency: 'EUR',
  targetCurrency: 'EUR',
  mode: 'none',
  shouldConvert: false,
  activateConversion: false,
  currencySymbol: '€',
  converted: false,
  items: [
    { name: 'eggs', grams: 24, unit: 'pcs', pricePerUnit: 0.25, estimatedCost: 6 },
    { name: 'rice', grams: 1500, unit: 'g', pricePerUnit: 1.8, estimatedCost: 2.7 },
  ],
  totalCost: 8.7,
};

export const SUBSTITUTIONS: SubstitutionReason[] = [
  {
    originalItem: 'chicken breast',
    substitutedItem: 'eggs',
    reason: 'BUDGET',
    explanation: 'Eggs provide cheaper protein while respecting macros.',
  },
];

export const EMPTY_HISTORY: WeeklyOutcomeHistoryEntry[] = [];
