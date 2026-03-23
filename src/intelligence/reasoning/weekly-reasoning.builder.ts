export interface WeeklyReasoningInput {
  weekStart: string;
  weekEnd: string;
  fallbackSignals: {
    date: string;
    category: string;
    reason: string;
  }[];
  metrics: {
    weeklyCaloriesTarget: number;
    dailyCaloriesTarget: number;
    weeklyBudget?: number;
  };
}

export interface WeeklyReasoningOutput {
  summary: string;
  details: string[];
}

export function buildWeeklyReasoning(
  input: WeeklyReasoningInput,
): WeeklyReasoningOutput {
  const { fallbackSignals } = input;

  // Default: no issues
  if (!fallbackSignals || fallbackSignals.length === 0) {
    return {
      summary: 'Your weekly plan meets all constraints without compromises.',
      details: [],
    };
  }

  // Group by category
  const byCategory: Record<string, number> = {};
  for (const f of fallbackSignals) {
    byCategory[f.category] = (byCategory[f.category] ?? 0) + 1;
  }

  const details = Object.entries(byCategory).map(
    ([category, count]) =>
      `${category}: limited variety on ${count} day${count > 1 ? 's' : ''}.`,
  );

  return {
    summary:
      'Your weekly plan required small compromises to respect your goals and constraints.',
    details,
  };
}
