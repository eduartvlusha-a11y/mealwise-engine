type WeeklyOutcomeSummary = {
  weekStart: string;
  weekEnd: string;

  budget: {
    target: number;
    estimatedCost: number;
    status: 'WITHIN' | 'OVER';
    delta: number;
  };

  adherence: {
    plannedMeals: number;
    followedMeals: number;
    adherenceRate: number;
  };

  substitutions: {
    count: number;
    reasons: string[];
  };

  summary: {
    verdict: 'SUCCESS' | 'PARTIAL' | 'FAILED';
    explanation: string;
  };
};

export function buildWeeklyOutcomeSummary(params: {
  weekStart: string;
  weekEnd: string;
  weeklyBudget: number;
  estimatedCost: number;
  plannedMeals: number;
  followedMeals?: number; // optional for now
  substitutionReasons?: string[];
}): WeeklyOutcomeSummary {
  const {
    weekStart,
    weekEnd,
    weeklyBudget,
    estimatedCost,
    plannedMeals,
    followedMeals = plannedMeals, // temporary assumption
    substitutionReasons = [],
  } = params;

  const delta = estimatedCost - weeklyBudget;
  const status = delta <= 0 ? 'WITHIN' : 'OVER';

  const adherenceRate =
    plannedMeals === 0 ? 0 : followedMeals / plannedMeals;

  let verdict: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  if (status === 'WITHIN' && adherenceRate >= 0.8) verdict = 'SUCCESS';
  else if (status === 'OVER' && adherenceRate >= 0.5) verdict = 'PARTIAL';
  else verdict = 'FAILED';

  const explanationParts: string[] = [];

  explanationParts.push(
    status === 'WITHIN'
      ? `The weekly plan stayed within the budget.`
      : `The weekly plan exceeded the budget.`,
  );

  explanationParts.push(
    `Estimated spend was €${estimatedCost} against a €${weeklyBudget} target.`,
  );

  if (substitutionReasons.length > 0) {
    explanationParts.push(
      `${substitutionReasons.length} substitutions were applied due to cost or availability.`,
    );
  }

  return {
    weekStart,
    weekEnd,
    budget: {
      target: weeklyBudget,
      estimatedCost,
      status,
      delta,
    },
    adherence: {
      plannedMeals,
      followedMeals,
      adherenceRate,
    },
    substitutions: {
      count: substitutionReasons.length,
      reasons: substitutionReasons,
    },
    summary: {
      verdict,
      explanation: explanationParts.join(' '),
    },
  };
}
