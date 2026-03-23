export interface OptimizedCostInput {
  groceryItems: {
    name: string;
    estimatedUnitCost: number;
    quantity: number;
  }[];
}

export interface OptimizedCostResult {
  estimatedWeeklyCost: number;
  explanation: string;
}

export function estimateOptimizedWeeklyCost(
  input: OptimizedCostInput,
): OptimizedCostResult {
  const total = input.groceryItems.reduce((sum, item) => {
    return sum + item.estimatedUnitCost * item.quantity;
  }, 0);

  return {
    estimatedWeeklyCost: Math.round(total * 100) / 100,
    explanation:
      'Optimized cost calculated after applying substitutions.',
  };
}
