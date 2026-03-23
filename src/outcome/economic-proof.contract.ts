export interface EconomicProof {
  baseline: {
    estimatedWeeklyCost: number;
    explanation: string;
  };

  optimized: {
    estimatedWeeklyCost: number;
    explanation: string;
  };

  delta: {
    savingsAmount: number;
    savingsPercentage: number;
    explanation: string;
  };
}
