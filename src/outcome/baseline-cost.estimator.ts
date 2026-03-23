export interface BaselineCostInput {
  groceryItems: {
    name: string;
    estimatedUnitCost: number;
    quantity: number;
  }[];
}

export interface BaselineCostResult {
  estimatedWeeklyCost: number;
  explanation: string;
}

export function estimateBaselineWeeklyCost(
  input: BaselineCostInput,
): BaselineCostResult {
  const total = input.groceryItems.reduce((sum, item) => {
    return sum + item.estimatedUnitCost * item.quantity;
  }, 0);

  return {
    estimatedWeeklyCost: Math.round(total * 100) / 100,
    explanation:
      'Baseline cost calculated without substitutions or optimizations.',
  };
}
